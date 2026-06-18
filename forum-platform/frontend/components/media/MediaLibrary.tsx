'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, Image, File, X, Folder, Grid, List, Search } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

interface MediaLibraryProps {
  userId: string;
  onSelect?: (item: MediaItem) => void;
  multiple?: boolean;
}

export default function MediaLibrary({ userId, onSelect, multiple = false }: MediaLibraryProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/media?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.media);
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setItems([...data.media, ...items]);
      }
    } catch (error) {
      console.error('Failed to upload:', error);
    } finally {
      setUploading(false);
    }
  }, [items]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      setSelected(prev =>
        prev.some(s => s.id === item.id)
          ? prev.filter(s => s.id !== item.id)
          : [...prev, item]
      );
    } else {
      setSelected([item]);
    }
  };

  const handleConfirm = () => {
    if (onSelect) {
      if (multiple) {
        selected.forEach(item => onSelect(item));
      } else if (selected.length > 0) {
        onSelect(selected[0]);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredItems = items.filter(item =>
    item.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-white">Media Library</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            <Button disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </label>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`m-4 p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-600 hover:border-slate-500'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
        <p className="text-slate-400 mb-2">
          Drag and drop files here, or click Upload above
        </p>
        <p className="text-sm text-slate-500">
          Supports images, videos, audio, PDFs, and documents
        </p>
      </div>

      {/* Media Grid/List */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-slate-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <p className="text-slate-400">No media files found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => {
              const isImage = item.mimeType.startsWith('image/');
              const isSelected = selected.some(s => s.id === item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`relative aspect-square rounded-lg overflow-hidden group ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {isImage ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <File className="w-12 h-12 text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm truncate px-2">{item.filename}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isImage = item.mimeType.startsWith('image/');
              const isSelected = selected.some(s => s.id === item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    isSelected ? 'bg-blue-500/20' : 'hover:bg-slate-700'
                  }`}
                >
                  {isImage ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.filename}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center">
                      <File className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="text-white truncate">{item.filename}</p>
                    <p className="text-sm text-slate-400">
                      {formatSize(item.size)} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {onSelect && (
        <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
          <span className="text-sm text-slate-400 py-2">
            {selected.length} selected
          </span>
          <Button variant="ghost" onClick={() => setSelected([])}>
            Clear
          </Button>
          <Button onClick={handleConfirm} disabled={selected.length === 0}>
            Insert {multiple ? 'All' : 'Selected'}
          </Button>
        </div>
      )}
    </div>
  );
}
