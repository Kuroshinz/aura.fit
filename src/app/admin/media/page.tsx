'use client';

import * as React from 'react';
import { PermissionGuard } from '@/lib/permissions/PermissionGuard';
import { HardDrive, UploadCloud } from 'lucide-react';
import { storageAdapter, StorageFile } from '@/services/storage/storage-adapter';
import { MediaGallery } from '@/modules/media/components/media-gallery';

export default function AdminMediaPage() {
  const [files, setFiles] = React.useState<StorageFile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    setLoading(true);
    // Hardcoding 'exercises' bucket for now
    const res = await storageAdapter.listFiles('exercises');
    if (res.success && res.data) {
      setFiles(res.data);
    }
    setLoading(false);
  }

  async function handleDelete(path: string) {
    if (confirm(`Are you sure you want to delete ${path}?`)) {
      await storageAdapter.deleteFile('exercises', path);
      loadFiles();
    }
  }

  return (
    <PermissionGuard permission="manage:media" fallback={<div>Unauthorized</div>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <HardDrive className="w-8 h-8 text-blue-500" />
              Media Manager
            </h1>
            <p className="text-slate-400 mt-1">Manage global assets, exercise GIFs, and upload new media.</p>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload File
          </button>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MediaGallery files={files} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}
