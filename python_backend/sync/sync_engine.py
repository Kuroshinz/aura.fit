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
        try:
            res = supabase_service.client.table('sync_queue').select('*').eq('status', 'pending').order('created_at').limit(50).execute()
        except Exception as e:
            logger.error(f"Error fetching sync queue: {e}")
            return
            
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
