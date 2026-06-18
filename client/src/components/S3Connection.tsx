import { useState } from "react";
import { useS3Auth } from "@/hooks/useS3Auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import S3Logo from "@/components/S3Logo";

const AWS_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-east-2', label: 'US East (Ohio)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
  { value: 'sa-east-1', label: 'South America (São Paulo)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
];

interface S3ConnectionProps {
  variant?: 'card' | 'inline';
}

export default function S3Connection({ variant = 'card' }: S3ConnectionProps) {
  const { isConnected, region, connect, isConnecting, connectError, disconnect, isDisconnecting, isLoadingStatus } = useS3Auth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('us-east-1');

  const handleConnect = () => {
    connect(
      { accessKeyId, secretAccessKey, region: selectedRegion },
      {
        onSuccess: () => {
          setOpen(false);
          setAccessKeyId('');
          setSecretAccessKey('');
          toast({ title: "¡Conectado exitosamente!", description: "Tu cuenta de Amazon S3 ha sido conectada." });
        },
        onError: (err: any) => {
          toast({ title: "Error de conexión", description: err.message || "Credenciales inválidas.", variant: "destructive" });
        },
      }
    );
  };

  const handleDisconnect = () => {
    disconnect();
    toast({ title: "Cuenta desconectada", description: "Tu cuenta de Amazon S3 ha sido desconectada." });
  };

  if (variant === 'card') {
    return (
      <div className="flex items-center justify-between" data-testid="s3-card">
        <div className="flex gap-2">
          {isConnected ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="px-8" disabled={isDisconnecting} data-testid="button-disconnect-s3">
                  {isDisconnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Desconectar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Desconectar Amazon S3?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esto eliminará tus credenciales de AWS. No podrás acceder a tus buckets hasta que vuelvas a conectar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDisconnect}>Desconectar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="px-8 text-[#FF9900] border-slate-200" data-testid="button-connect-s3">
                  Conectar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <S3Logo className="w-6 h-6" />
                    <DialogTitle>Conectar Amazon S3</DialogTitle>
                  </div>
                  <DialogDescription>
                    Ingresá tus credenciales de AWS IAM. Necesitás un usuario con permisos de S3.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="access-key">Access Key ID</Label>
                    <Input
                      id="access-key"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={accessKeyId}
                      onChange={e => setAccessKeyId(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="secret-key">Secret Access Key</Label>
                    <Input
                      id="secret-key"
                      type="password"
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      value={secretAccessKey}
                      onChange={e => setSecretAccessKey(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="region">Región</Label>
                    <select
                      id="region"
                      value={selectedRegion}
                      onChange={e => setSelectedRegion(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {AWS_REGIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  {connectError && (
                    <p className="text-xs text-red-600">{connectError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || !accessKeyId || !secretAccessKey}
                    className="bg-[#FF9900] hover:bg-[#e68a00] text-white"
                  >
                    {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isConnecting ? 'Verificando...' : 'Conectar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="ml-8">
          {isLoadingStatus ? null : isConnected ? (
            <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="w-3 h-3 mr-1" />
              Conectado · {region}
            </Badge>
          ) : (
            <Badge variant="default" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              <XCircle className="w-3 h-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={isConnected ? undefined : () => setOpen(true)}
      disabled={isConnecting || isDisconnecting}
      variant={isConnected ? "default" : "outline"}
      size="sm"
      className="flex items-center gap-2"
      data-testid="button-s3-inline"
    >
      <S3Logo className="w-4 h-4" />
      {isConnected ? "S3 Conectado" : "Conectar S3"}
      {isConnected && <CheckCircle className="w-4 h-4 text-green-500" />}
    </Button>
  );
}
