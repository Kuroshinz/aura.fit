'use client';

import * as React from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface MediaUploaderProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function MediaUploader({ mediaUrls, onChange, maxFiles = 3 }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (mediaUrls.length >= maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from('exercise-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('exercise-media')
        .getPublicUrl(fileName);

      onChange([...mediaUrls, publicUrl]);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (indexToRemove: number) => {
    onChange(mediaUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const isVideo = (url: string) => url.match(/\.(mp4|webm|ogg)$/i);

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragOver ? 'border-amber-500 bg-amber-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-amber-500/50 hover:bg-slate-900'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/mp4,video/webm"
          onChange={handleFileChange}
        />
        {isUploading ? (
          <div className="flex flex-col items-center text-amber-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm font-bold">Uploading...</span>
          </div>
        ) : (
          <>
            <UploadCloud className="w-10 h-10 text-slate-500 mb-3" />
            <p className="text-slate-300 font-bold mb-1">Click or drag file to upload</p>
            <p className="text-slate-500 text-xs">Supports MP4, GIF, JPG, PNG (Max {maxFiles})</p>
          </>
        )}
      </div>

      {/* Media Gallery */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {mediaUrls.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-900 aspect-video flex items-center justify-center">
              {isVideo(url) ? (
                <video src={url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              ) : (
                <img src={url} alt="Exercise media" className="w-full h-full object-cover" />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); removeMedia(idx); }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Type Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur text-[10px] uppercase font-bold text-slate-300 rounded flex items-center gap-1">
                {isVideo(url) ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                {isVideo(url) ? 'Video' : 'Image'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
