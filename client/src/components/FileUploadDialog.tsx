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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir archivo a la nube</DialogTitle>
          <DialogDescription>
            Selecciona un archivo y elige a dónde deseas subirlo (Google Drive o Dropbox).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo'}
                </span>
                <span className="text-xs text-gray-500">Máximo 100 MB</span>
              </div>
              <input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Destination Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Destino</label>
            <Select value={destination} onValueChange={(v: any) => setDestination(v)} disabled={uploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Drive</SelectItem>
                <SelectItem value="dropbox">Dropbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Warning */}
          {destination === 'google' || destination === 'dropbox' && (
            <div className="flex gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Asegúrate de haber conectado tu cuenta de {destination === 'google' ? 'Google Drive' : 'Dropbox'} primero.</span>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
