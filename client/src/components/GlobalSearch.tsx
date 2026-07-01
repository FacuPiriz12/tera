import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Search, Folder, File, Loader2, X, ArrowRight, ExternalLink } from 'lucide-react';
import GoogleDriveLogo from './GoogleDriveLogo';
import DropboxLogo from './DropboxLogo';
import OneDriveLogo from './OneDriveLogo';
import BoxLogo from './BoxLogo';
import S3Logo from './S3Logo';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

interface SearchResult {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size?: number;
  isFolder: boolean;
  provider: Provider;
}

type Provider = 'google' | 'dropbox' | 'onedrive' | 'box' | 's3';

const PROVIDERS: Provider[] = ['google', 'dropbox', 'onedrive', 'box', 's3'];

const PROVIDER_LABELS: Record<Provider, string> = {
  google: 'Google Drive',
  dropbox: 'Dropbox',
  onedrive: 'OneDrive',
  box: 'Box',
  s3: 'Amazon S3',
};

function ProviderIcon({ provider, className }: { provider: Provider; className?: string }) {
  if (provider === 'google')   return <GoogleDriveLogo className={className} />;
  if (provider === 'dropbox')  return <DropboxLogo className={className} />;
  if (provider === 'onedrive') return <OneDriveLogo className={className} />;
  if (provider === 'box')      return <BoxLogo className={className} />;
  return <S3Logo className={className} />;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

type ProviderStatus = 'idle' | 'loading' | 'done' | 'error';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Record<Provider, SearchResult[]>>({
    google: [], dropbox: [], onedrive: [], box: [], s3: [],
  });
  const [status, setStatus] = useState<Record<Provider, ProviderStatus>>({
    google: 'idle', dropbox: 'idle', onedrive: 'idle', box: 'idle', s3: 'idle',
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRefs = useRef<Record<string, AbortController>>({});

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ google: [], dropbox: [], onedrive: [], box: [], s3: [] });
      setStatus({ google: 'idle', dropbox: 'idle', onedrive: 'idle', box: 'idle', s3: 'idle' });
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const searchProvider = useCallback(async (provider: Provider, q: string) => {
    // abort previous call for this provider
    abortRefs.current[provider]?.abort();
    const ctrl = new AbortController();
    abortRefs.current[provider] = ctrl;

    setStatus(prev => ({ ...prev, [provider]: 'loading' }));
    try {
      const res = await fetch(`/api/search?provider=${provider}&q=${encodeURIComponent(q)}`, {
        credentials: 'include',
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error();
      const data: SearchResult[] = await res.json();
      setResults(prev => ({ ...prev, [provider]: data }));
      setStatus(prev => ({ ...prev, [provider]: 'done' }));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setStatus(prev => ({ ...prev, [provider]: 'error' }));
    }
  }, []);

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setResults({ google: [], dropbox: [], onedrive: [], box: [], s3: [] });
      setStatus({ google: 'idle', dropbox: 'idle', onedrive: 'idle', box: 'idle', s3: 'idle' });
      return;
    }

    debounceRef.current = setTimeout(() => {
      PROVIDERS.forEach(p => searchProvider(p, q.trim()));
    }, 300);
  }, [searchProvider]);

  const handleOpenInExplorer = (result: SearchResult) => {
    onClose();
    setLocation('/cloud-explorer');
  };

  const isSearching = Object.values(status).some(s => s === 'loading');
  const hasAnyResults = Object.values(results).some(r => r.length > 0);
  const hasSearched = query.trim().length >= 2;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          {isSearching
            ? <Loader2 className="w-5 h-5 text-blue-500 flex-shrink-0 animate-spin" />
            : <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder={t('globalSearch.placeholder', 'Buscar en todas tus nubes...')}
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button onClick={() => handleQueryChange('')} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-400 border border-gray-200">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {!hasSearched && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-sm">{t('globalSearch.hint', 'Escribí al menos 2 caracteres para buscar')}</p>
            </div>
          )}

          {hasSearched && !hasAnyResults && !isSearching && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <p className="text-sm">{t('globalSearch.noResults', 'Sin resultados para')} <strong className="text-gray-600">"{query}"</strong></p>
            </div>
          )}

          {PROVIDERS.map(provider => {
            const providerResults = results[provider];
            const providerStatus = status[provider];
            if (providerStatus === 'idle' || (providerStatus === 'done' && providerResults.length === 0)) return null;

            return (
              <div key={provider}>
                {/* Provider header */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
                  <ProviderIcon provider={provider} className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{PROVIDER_LABELS[provider]}</span>
                  {providerStatus === 'loading' && <Loader2 className="w-3 h-3 text-blue-400 animate-spin ml-auto" />}
                  {providerStatus === 'done' && (
                    <span className="text-xs text-gray-400 ml-auto">{providerResults.length} resultado{providerResults.length !== 1 ? 's' : ''}</span>
                  )}
                  {providerStatus === 'error' && <span className="text-xs text-red-400 ml-auto">Error</span>}
                </div>

                {/* Results list */}
                {providerResults.map(result => (
                  <button
                    key={result.id}
                    onClick={() => handleOpenInExplorer(result)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      result.isFolder ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400'
                    }`}>
                      {result.isFolder ? <Folder className="w-4 h-4" /> : <File className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{result.name}</p>
                      <p className="text-xs text-gray-400 truncate">{result.path}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {result.size && <span className="text-xs text-gray-400">{formatSize(result.size)}</span>}
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4">
          <span className="text-xs text-gray-400">
            {t('globalSearch.footer', 'Buscando en todas tus nubes conectadas')}
          </span>
        </div>
      </div>
    </div>
  );
}
