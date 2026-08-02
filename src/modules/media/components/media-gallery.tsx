'use client';

import * as React from 'react';
import { StorageFile } from '@/services/storage/storage-adapter';
import { Image as ImageIcon, Video, FileQuestion, Trash2 } from 'lucide-react';

interface MediaGalleryProps {
  files: StorageFile[];
  onDelete: (path: string) => void;
}

export function MediaGallery({ files, onDelete }: MediaGalleryProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-slate-800 rounded-xl bg-slate-900/20">
        <FileQuestion className="w-8 h-8 text-slate-500 mb-2" />
        <p className="text-slate-400 font-medium">No media files found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {files.map((file) => (
        <div key={file.id} className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden aspect-square">
          {file.type === 'image' || file.type === 'gif' ? (
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
          ) : file.type === 'video' ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <Video className="w-8 h-8 text-slate-500" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <ImageIcon className="w-8 h-8 text-slate-500" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p className="text-xs text-white font-medium truncate">{file.name}</p>
            <p className="text-[10px] text-slate-300">{(file.size / 1024).toFixed(1)} KB</p>
            
            <button 
              onClick={() => onDelete(file.name)}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
