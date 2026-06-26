import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, FileSpreadsheet, Image as ImageIcon, Video, Music, Archive, File, Folder } from 'lucide-react';
import GoogleDriveLogo from './GoogleDriveLogo';
import DropboxLogo from './DropboxLogo';
import OneDriveLogo from './OneDriveLogo';
import BoxLogo from './BoxLogo';
import S3Logo from './S3Logo';

type Provider = 'google' | 'dropbox' | 'onedrive' | 'box' | 's3';

export interface PreviewItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string | number;
  isFolder: boolean;
}

interface Props {
  item: PreviewItem;
  provider: Provider;
  s3Bucket?: string;
  onClose: () => void;
}

function formatSize(size?: string | number): string {
  if (size === undefined || size === null) return '';
  const bytes = typeof size === 'string' ? parseInt(size) : size;
  if (isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text/plain')) return FileText;
  if (mimeType.includes('presentation')) return FileText;
  if (mimeType.includes('image')) return ImageIcon;
  if (mimeType.includes('video')) return Video;
  if (mimeType.includes('audio')) return Music;
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed') || mimeType.includes('tar') || mimeType.includes('rar')) return Archive;
  if (mimeType.includes('folder')) return Folder;
  return File;
}

function getFileColor(mimeType: string): string {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'bg-emerald-50 text-emerald-500';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'bg-blue-50 text-blue-500';
  if (mimeType.includes('presentation')) return 'bg-orange-50 text-orange-500';
  if (mimeType.includes('image')) return 'bg-purple-50 text-purple-500';
  if (mimeType.includes('video')) return 'bg-pink-50 text-pink-500';
  if (mimeType.includes('audio')) return 'bg-yellow-50 text-yellow-500';
  if (mimeType.includes('pdf')) return 'bg-red-50 text-red-500';
  if (mimeType.includes('folder')) return 'bg-blue-50 text-blue-500';
  return 'bg-gray-50 text-gray-400';
}

function getProviderName(provider: Provider): string {
  const names: Record<Provider, string> = {
    google: 'Google Drive', dropbox: 'Dropbox',
    onedrive: 'OneDrive', box: 'Box', s3: 'Amazon S3',
  };
  return names[provider];
}

function ProviderIcon({ provider, className }: { provider: Provider; className?: string }) {
  if (provider === 'google') return <GoogleDriveLogo className={className} />;
  if (provider === 'dropbox') return <DropboxLogo className={className} />;
  if (provider === 'onedrive') return <OneDriveLogo className={className} />;
  if (provider === 'box') return <BoxLogo className={className} />;
  return <S3Logo className={className} />;
}

function isImage(mimeType: string) {
  return mimeType.startsWith('image/') || mimeType.includes('image');
}

function thumbnailUrl(provider: Provider, item: PreviewItem, s3Bucket?: string): string {
  if (provider === 's3') {
    return `/api/preview/thumbnail?provider=s3&bucket=${encodeURIComponent(s3Bucket ?? '')}&key=${encodeURIComponent(item.id)}`;
  }
  return `/api/preview/thumbnail?provider=${provider}&fileId=${encodeURIComponent(item.id)}`;
}

function friendlyType(mimeType: string): string {
  if (!mimeType) return 'Archivo';
  if (mimeType.includes('folder')) return 'Carpeta';
  if (mimeType.includes('image/jpeg')) return 'JPEG';
  if (mimeType.includes('image/png')) return 'PNG';
  if (mimeType.includes('image/gif')) return 'GIF';
  if (mimeType.includes('image/webp')) return 'WebP';
  if (mimeType.includes('image/')) return 'Imagen';
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Hoja de cálculo';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Documento';
  if (mimeType.includes('presentation')) return 'Presentación';
  if (mimeType.includes('video/')) return 'Video';
  if (mimeType.includes('audio/')) return 'Audio';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'Archivo comprimido';
  if (mimeType.includes('text/plain')) return 'Texto';
  return mimeType.split('/')[1]?.toUpperCase() ?? 'Archivo';
}

export default function FilePreviewModal({ item, provider, s3Bucket, onClose }: Props) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const showImage = isImage(item.mimeType) && !imgError;
  const Icon = getFileIcon(item.mimeType);
  const colorClass = getFileColor(item.mimeType);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <ProviderIcon provider={provider} className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-semibold text-slate-500 flex-shrink-0">{getProviderName(provider)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image preview */}
          {showImage && (
            <div className="relative bg-gray-50 flex items-center justify-center" style={{ minHeight: 180 }}>
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                src={thumbnailUrl(provider, item, s3Bucket)}
                alt={item.name}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                className={`max-w-full max-h-64 object-contain transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          )}

          {/* Icon fallback for non-images */}
          {!showImage && (
            <div className="flex items-center justify-center py-10 bg-gray-50">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${colorClass}`}>
                <Icon className="w-10 h-10" />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm font-bold text-slate-800 leading-tight break-all" title={item.name}>
              {item.name}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">{friendlyType(item.mimeType)}</span>
              {item.size ? (
                <span className="font-semibold text-slate-500">{formatSize(item.size)}</span>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
