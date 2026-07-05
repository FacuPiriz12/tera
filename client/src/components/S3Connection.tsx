import { useState } from "react";
import { useS3Auth } from "@/hooks/useS3Auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { isConnected, region, connect, isConnecting, connectError, disconnect, isDisconnecting, isLoadingStatus } = useS3Auth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('us-east-1');
  const provider = 'Amazon S3';

  const handleConnect = () => {
    connect(
      { accessKeyId, secretAccessKey, region: selectedRegion },
      {
        onSuccess: () => {
          setOpen(false);
          setAccessKeyId('');
          setSecretAccessKey('');
          toast({
            title: t('pages.integrations.connectSuccess'),
            description: t('pages.integrations.connectSuccessDesc', { provider }),
          });
        },
        onError: (err: any) => {
          toast({
            title: t('pages.integrations.connectError'),
            description: err.message || t('pages.integrations.s3InvalidCredentials'),
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: t('pages.integrations.disconnectSuccess'),
      description: t('pages.integrations.disconnectSuccessDesc', { provider }),
    });
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
                  {t('pages.integrations.disconnect')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('pages.integrations.disconnectTitle', { provider })}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('pages.integrations.disconnectDesc', { provider })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('pages.integrations.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDisconnect}>{t('pages.integrations.disconnect')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="px-8 text-[#FF9900] border-slate-200" data-testid="button-connect-s3">
                  {t('pages.integrations.connect')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-1">
                    <S3Logo className="w-6 h-6" />
                    <DialogTitle>{t('pages.integrations.connect')} Amazon S3</DialogTitle>
                  </div>
                  <DialogDescription>
                    {t('pages.integrations.s3DialogDesc')}
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
                    <Label htmlFor="region">{t('pages.integrations.s3Region')}</Label>
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
                  <Button variant="outline" onClick={() => setOpen(false)}>{t('pages.integrations.cancel')}</Button>
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting || !accessKeyId || !secretAccessKey}
                    className="bg-[#FF9900] hover:bg-[#e68a00] text-white"
                  >
                    {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isConnecting ? t('pages.integrations.verifying') : t('pages.integrations.connect')}
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
              {t('pages.integrations.connected')} · {region}
            </Badge>
          ) : (
            <Badge variant="default" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              <XCircle className="w-3 h-3 mr-1" />
              {t('pages.integrations.disconnected')}
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
      {isConnected ? t('pages.integrations.connected') : t('pages.integrations.connect')}
      {isConnected && <CheckCircle className="w-4 h-4 text-green-500" />}
    </Button>
  );
}
