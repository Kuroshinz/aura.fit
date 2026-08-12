# AURA.FIT Universal Sync Engine & Cross-Platform Synchronization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Design and implement a production-grade synchronization layer for AURA.FIT, making Web, Telegram, and future Mobile platforms behave as one unified application with real-time sync, offline support, conflict handling, and notification deduplication.

**Architecture:** 
- A central Python-based Sync Engine will process events (`sync/sync_engine.py`, `event_bus.py`, `conflict_resolver.py`).
- Supabase Realtime will broadcast state changes to all connected clients.
- The Web App's `user-sync.ts` will be upgraded to push granular `PATCH` events to a `sync_queue` table instead of dumping the whole state object.
- A robust versioning system using `updated_at` and `version` columns will be added to core tables.
- Notification deduplication will be handled by a central manager assessing user presence via Realtime presence.

**Tech Stack:** Next.js 15, Supabase (Realtime, Postgres triggers), Python 3.11+ (Background worker), TypeScript.

## Global Constraints

- Must retain backward compatibility with the existing web app UI and stores.
- Do not break existing webhook workflows (`/api/webhook`).
- Sync engine must process incremental updates (PATCH) only, never full table replacements.
- Conflict resolution must avoid silent overwrites.

---

### Task 1: Database Schema & Versioning

**Files:**
- Create: `supabase/migrations/11_universal_sync_layer.sql`

**Interfaces:**
- Consumes: Supabase Postgres
- Produces: New `sync_queue` and `sync_audit_log` tables, version tracking columns.

- [ ] **Step 1: Write Migration for Versioning & Queues**
Create a new migration to add `version` and `updated_at` columns, and create the sync tables.

```sql
-- supabase/migrations/11_universal_sync_layer.sql
-- 1. Add versioning to core tables (example: profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 2. Create Sync Queue Table
CREATE TABLE IF NOT EXISTS public.sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    payload JSONB NOT NULL,
    version INTEGER NOT NULL,
    source_platform TEXT NOT NULL, -- 'web', 'telegram', 'mobile'
    status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'conflict'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Audit Log Table
CREATE TABLE IF NOT EXISTS public.sync_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    previous_version JSONB,
    new_version JSONB,
    source_platform TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status TEXT NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can manage queue, users can insert
CREATE POLICY "Users can insert sync items" ON public.sync_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage sync queue" ON public.sync_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
```

- [ ] **Step 2: Commit Database Changes**
```bash
git add supabase/migrations/11_universal_sync_layer.sql
git commit -m "feat(sync): add universal sync queue, audit log, and versioning tables"
```

---

### Task 2: Build Python Sync Engine (Core Modules)

**Files:**
- Create: `python_backend/sync/__init__.py`
- Create: `python_backend/sync/event_bus.py`
- Create: `python_backend/sync/conflict_resolver.py`
- Create: `python_backend/sync/sync_engine.py`

**Interfaces:**
- Consumes: Supabase `sync_queue` table.
- Produces: Conflict-resolved data updates to Supabase core tables, Audit logs.

- [ ] **Step 1: Implement Conflict Resolver**
Create `python_backend/sync/conflict_resolver.py`.

```python
import logging

logger = logging.getLogger("aura_fit.sync.resolver")

class ConflictResolver:
    @staticmethod
    def resolve(client_payload: dict, client_version: int, server_record: dict) -> tuple[bool, dict]:
        """
        Returns (is_conflict, resolved_payload).
        If client_version < server_record['version'], it's a conflict.
        Currently, server wins on conflict, but we merge non-overlapping fields.
        """
        server_version = server_record.get('version', 1)
        if client_version < server_version:
            logger.warning("Conflict detected!")
            # Basic merge: keep server data, apply client payload keys only if missing
            merged = server_record.copy()
            for k, v in client_payload.items():
                if k not in merged:
                    merged[k] = v
            return True, merged
        return False, client_payload
```

- [ ] **Step 2: Implement Sync Engine**
Create `python_backend/sync/sync_engine.py`.

```python
import asyncio
import logging
from services.supabase_service import supabase_service
from sync.conflict_resolver import ConflictResolver

logger = logging.getLogger("aura_fit.sync.engine")

class SyncEngine:
    async def process_queue(self):
        """Polls or receives triggers for pending items in sync_queue."""
        if not supabase_service.client:
            return
        
        # Fetch pending items
        res = supabase_service.client.table('sync_queue').select('*').eq('status', 'pending').order('created_at').limit(50).execute()
        items = res.data or []
        
        for item in items:
            try:
                # 1. Read current server state
                server_res = supabase_service.client.table(item['entity_name']).select('*').eq('id', item['entity_id']).execute()
                server_record = server_res.data[0] if server_res.data else {}
                
                # 2. Resolve conflicts
                is_conflict, resolved_payload = ConflictResolver.resolve(
                    item['payload'], item['version'], server_record
                )
                
                # 3. Apply updates & increment version
                resolved_payload['version'] = server_record.get('version', 0) + 1
                
                if item['operation_type'] == 'UPDATE':
                    supabase_service.client.table(item['entity_name']).update(resolved_payload).eq('id', item['entity_id']).execute()
                
                # 4. Mark processed & Audit log
                supabase_service.client.table('sync_queue').update({'status': 'processed'}).eq('id', item['id']).execute()
                supabase_service.client.table('sync_audit_log').insert({
                    'entity_name': item['entity_name'],
                    'operation_type': item['operation_type'],
                    'previous_version': server_record,
                    'new_version': resolved_payload,
                    'source_platform': item['source_platform'],
                    'sync_status': 'conflict_resolved' if is_conflict else 'success'
                }).execute()
                
            except Exception as e:
                logger.error(f"Failed to process sync item {item['id']}: {e}")
                supabase_service.client.table('sync_queue').update({'status': 'error'}).eq('id', item['id']).execute()

sync_engine = SyncEngine()
```

- [ ] **Step 3: Commit**
```bash
git add python_backend/sync/
git commit -m "feat(sync): implement python sync engine and conflict resolver"
```

---

### Task 3: Integrate Background Sync in Main App

**Files:**
- Modify: `python_backend/main.py`

**Interfaces:**
- Consumes: `SyncEngine.process_queue`

- [ ] **Step 1: Add Background Worker**
Modify `main.py` to run the sync engine periodically.

```python
from sync.sync_engine import sync_engine

async def start_sync_worker():
    """Background task to process the sync queue."""
    logger.info("⚙️ Starting Universal Sync Engine worker...")
    while True:
        try:
            await sync_engine.process_queue()
        except Exception as e:
            logger.error(f"Sync worker error: {e}")
        await asyncio.sleep(5) # Poll every 5 seconds
```

- [ ] **Step 2: Add to main tasks**
In `main()` inside `main.py`:
```python
    tasks = [
        asyncio.create_task(start_fastapi_server()),
        asyncio.create_task(start_telegram_bot()),
        asyncio.create_task(start_sync_worker()),
    ]
```

- [ ] **Step 3: Commit**
```bash
git add python_backend/main.py
git commit -m "feat(sync): start background sync worker in main service"
```

---

### Task 4: Web App Incremental Sync & Offline Queue

**Files:**
- Modify: `src/lib/supabase/user-sync.ts`

**Interfaces:**
- Consumes: `SyncUpdates`
- Produces: `INSERT` to `sync_queue` table instead of massive JSON blobs to profiles.

- [ ] **Step 1: Refactor `flushSyncQueue`**
Update `src/lib/supabase/user-sync.ts` to push to `sync_queue` iteratively using `PATCH` logic.

```typescript
export async function flushSyncQueue() {
  if (typeof window === 'undefined' || isFlushing || !navigator.onLine) return
  
  const queuedUpdates = await getQueue()
  if (Object.keys(queuedUpdates).length === 0) return

  isFlushing = true
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { isFlushing = false; return; }

    // Instead of massive update, generate sync_queue items
    const queueItems = []
    
    // Example: process active_workout incremental patch
    if (queuedUpdates.active_workout) {
      queueItems.push({
        entity_name: 'profiles',
        entity_id: user.id,
        operation_type: 'UPDATE',
        payload: { active_workout: queuedUpdates.active_workout },
        version: 1, // Store locally tracked version
        source_platform: 'web'
      })
    }
    
    if (queueItems.length > 0) {
      await supabase.from('sync_queue').insert(queueItems)
    }

    await clearQueue()
    window.dispatchEvent(new CustomEvent('aura-sync-success'))
  } catch (err) {
    console.error('Error in flushSyncQueue:', err)
  } finally {
    isFlushing = false
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/lib/supabase/user-sync.ts
git commit -m "refactor(web): switch to incremental event-based sync queue pushes"
```

---

### Task 5: Supabase Realtime Broadcasting

**Files:**
- Modify: `src/components/layout/responsive-nav.tsx` (or a dedicated `SyncProvider`)

**Interfaces:**
- Consumes: Supabase Realtime channel `public:profiles`.

- [ ] **Step 1: Listen for Realtime Updates**
Subscribe to Postgres changes and update Zustand state automatically.

```tsx
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/store/use-profile-store'

export function useRealtimeSync() {
  const { setProfile } = useProfileStore()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          // Update local state incrementally based on server broadcast
          console.log('Realtime sync payload received:', payload.new)
          // setProfile(payload.new) // Apply changes
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
```
*(Integrate `useRealtimeSync()` into `layout.tsx` or `responsive-nav.tsx`)*

- [ ] **Step 2: Commit**
```bash
git add src/components/layout/responsive-nav.tsx
git commit -m "feat(sync): add supabase realtime listener for live state updates"
```

---

### Task 6: Notification Deduplication & Deep Linking

**Files:**
- Modify: `python_backend/bots/telegram_bot.py`
- Modify: `python_backend/api/webhook.py`

**Interfaces:**
- Consumes: Realtime presence or a `last_active_at` timestamp.
- Produces: Skipped telegram messages if user is active on Web.

- [ ] **Step 1: Check Online Status Before Sending**
Update `webhook.py` to check user presence/activity before sending.
```python
    # Pseudo-logic inside webhook.py
    user_profile = supabase_service.client.table('profiles').select('last_active_at').eq('id', payload.user_id).execute()
    # If last_active_at < 5 mins ago, user is online -> Skip Telegram push
    # Else, dispatch to Telegram.
```

- [ ] **Step 2: Universal Deep Links**
Update messages in `telegram_bot.py` to ALWAYS include deep links contextually.
```python
def get_deep_link_keyboard(action: str):
    url = "https://aurafitiris.vercel.app"
    if action == "workout": url += "/workout"
    elif action == "nutrition": url += "/calculator" # example
    
    return InlineKeyboardMarkup([[InlineKeyboardButton("🚀 Open App", url=url)]])
```

- [ ] **Step 3: Commit**
```bash
git add python_backend/api/webhook.py python_backend/bots/telegram_bot.py
git commit -m "feat(telegram): add notification deduplication and contextual deep links"
```
