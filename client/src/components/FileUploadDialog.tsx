import { useState } from 'react';
import { Upload, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

export default function FileUploadDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState<'google' | 'dropbox'>('google');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, dest }: { file: File; dest: 'google' | 'dropbox' }) => {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const response = await fetch('/api/upload-file', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: file.name,
                content: base64,
                provider: dest,
                mimeType: file.type,
              }),
              credentials: 'include',
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.message || 'Upload failed');
            }
            
            resolve(await response.json());
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Archivo subido exitosamente',
        description: `Tu archivo "${selectedFile?.name}" se ha subido a ${destination === 'google' ? 'Google Drive' : 'Dropbox'}.`,
      });
      setOpen(false);
      setSelectedFile(null);
      setUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error al subir archivo',
        description: error.message || 'Algo salió mal durante la carga.',
        variant: 'destructive',
      });
      setUploading(false);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: 'Archivo demasiado grande',
          description: 'El archivo no debe exceder 100 MB.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    uploadMutation.mutate({ file: selectedFile, dest: destination });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
          <Upload className="w-4 h-4" />
          Subir Archivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-8 z-[200] !top-[20%] !translate-y-0">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-slate-900">Subir archivo a la nube</DialogTitle>
          <DialogDescription className="text-slate-500 text-[0.95rem]">
            Selecciona un archivo y elige el destino para guardarlo de forma segura.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* File Input */}
          <div className="relative group">
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <label 
              htmlFor="file-input" 
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer bg-slate-50/50 hover:bg-white
                ${selectedFile 
                  ? 'border-blue-500 bg-blue-50/30' 
                  : 'border-slate-200 hover:border-blue-400'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${selectedFile ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-slate-700 mb-1">
                {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Máximo 100 MB'}
              </span>
            </label>
          </div>

          {/* Destination Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Destino de subida</label>
            <Select value={destination} onValueChange={(v: any) => setDestination(v)} disabled={uploading}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="google" className="py-3 cursor-pointer">Google Drive</SelectItem>
                <SelectItem value="dropbox" className="py-3 cursor-pointer">Dropbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning */}
          {(destination === 'google' || destination === 'dropbox') && (
            <div className="flex gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-sm text-blue-700 leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="font-medium">Asegúrate de haber conectado tu cuenta de <span className="font-bold">{destination === 'google' ? 'Google Drive' : 'Dropbox'}</span> primero.</p>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`w-full h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] ${
              !selectedFile || uploading 
                ? 'bg-slate-100 text-slate-400 border-none shadow-none' 
                : 'bg-[#0061D5] hover:bg-[#0052B5] text-white'
            }`}
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {uploading ? 'Subiendo archivo...' : 'Comenzar Subida'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
