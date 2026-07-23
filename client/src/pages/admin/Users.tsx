import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Ban, CheckCircle, Trash2, Settings, Mail } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

export default function AdminUsers() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{
    users: User[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['/api/admin/users', page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const updateLimitsMutation = useMutation({
    mutationFn: async ({ userId, limits }: { userId: string; limits: any }) => {
      return await apiRequest(`/api/admin/users/${userId}/limits`, {
        method: 'PUT',
        body: JSON.stringify(limits),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditDialogOpen(false);
      toast({
        title: t('adminPanel.users.toasts.limitsUpdated'),
        description: t('adminPanel.users.toasts.limitsUpdatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || t('adminPanel.users.toasts.limitsError'),
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('adminPanel.users.toasts.roleUpdated'),
        description: t('adminPanel.users.toasts.roleUpdatedDesc'),
      });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('adminPanel.users.toasts.suspended'),
        description: t('adminPanel.users.toasts.suspendedDesc'),
      });
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}/activate`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('adminPanel.users.toasts.activated'),
        description: t('adminPanel.users.toasts.activatedDesc'),
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('adminPanel.users.toasts.deleted'),
        description: t('adminPanel.users.toasts.deletedDesc'),
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ to, subject, message, lang }: { to: string; subject: string; message: string; lang?: string }) => {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to, subject, message, lang }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return res.json();
    },
    onSuccess: () => {
      setEmailDialogOpen(false);
      setEmailSubject('');
      setEmailMessage('');
      toast({ title: t('adminPanel.users.toasts.emailSent'), description: t('adminPanel.users.toasts.emailSentDesc', { email: emailTarget?.email }) });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || t('adminPanel.users.toasts.emailError'), variant: "destructive" });
    },
  });

  const handleOpenEmail = (user: User) => {
    setEmailTarget(user);
    setEmailSubject('');
    setEmailMessage('');
    setEmailDialogOpen(true);
  };

  const handleEditLimits = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSubmitLimits = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.currentTarget);
    const limits = {
      maxStorageBytes: parseInt(formData.get('maxStorageBytes') as string),
      maxConcurrentOperations: parseInt(formData.get('maxConcurrentOperations') as string),
      maxDailyOperations: parseInt(formData.get('maxDailyOperations') as string),
    };

    updateLimitsMutation.mutate({ userId: selectedUser.id, limits });
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 GB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">{t('adminPanel.users.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="page-admin-users">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('adminPanel.users.title')}</h1>
        <div className="text-sm text-muted-foreground">
          {t('adminPanel.users.total', { count: data?.total || 0 })}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-users">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminPanel.users.cols.user')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminPanel.users.cols.email')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminPanel.users.cols.role')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminPanel.users.cols.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminPanel.users.cols.limits')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">{t('adminPanel.users.cols.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/50" data-testid={`row-user-${user.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select
                      value={user.role}
                      onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                      data-testid={`select-role-${user.id}`}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t('adminPanel.users.roleUser')}</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('adminPanel.users.statusActive')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t('adminPanel.users.statusSuspended')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>Storage: {formatBytes(user.maxStorageBytes || 0)}</div>
                    <div>Ops: {user.maxConcurrentOperations || 0}/{user.maxDailyOperations || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEmail(user)}
                        title={t('adminPanel.users.sendEmailTitle')}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLimits(user)}
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      {user.isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => suspendUserMutation.mutate(user.id)}
                          data-testid={`button-suspend-${user.id}`}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => activateUserMutation.mutate(user.id)}
                          data-testid={`button-activate-${user.id}`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(t('adminPanel.users.confirmDelete'))) {
                            deleteUserMutation.mutate(user.id);
                          }
                        }}
                        data-testid={`button-delete-${user.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              data-testid="button-prev-page"
            >
              {t('adminPanel.prev')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('adminPanel.pageOfShort', { page, total: data.totalPages })}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              data-testid="button-next-page"
            >
              {t('adminPanel.next')}
            </Button>
          </div>
        )}
      </Card>

      {/* Edit Limits Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-limits">
          <DialogHeader>
            <DialogTitle>{t('adminPanel.users.editLimitsTitle')}</DialogTitle>
            <DialogDescription>
              {t('adminPanel.users.editLimitsDesc', { name: `${selectedUser?.firstName} ${selectedUser?.lastName}` })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitLimits} className="space-y-4">
            <div>
              <Label htmlFor="maxStorageBytes">{t('adminPanel.users.maxStorage')}</Label>
              <Input
                id="maxStorageBytes"
                name="maxStorageBytes"
                type="number"
                defaultValue={((selectedUser?.maxStorageBytes || 0) / (1024 * 1024 * 1024)).toFixed(0)}
                data-testid="input-max-storage"
              />
            </div>
            <div>
              <Label htmlFor="maxConcurrentOperations">{t('adminPanel.users.concurrentOps')}</Label>
              <Input
                id="maxConcurrentOperations"
                name="maxConcurrentOperations"
                type="number"
                defaultValue={selectedUser?.maxConcurrentOperations || 5}
                data-testid="input-max-concurrent"
              />
            </div>
            <div>
              <Label htmlFor="maxDailyOperations">{t('adminPanel.users.dailyOps')}</Label>
              <Input
                id="maxDailyOperations"
                name="maxDailyOperations"
                type="number"
                defaultValue={selectedUser?.maxDailyOperations || 100}
                data-testid="input-max-daily"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t('adminPanel.users.cancel')}
              </Button>
              <Button type="submit" disabled={updateLimitsMutation.isPending} data-testid="button-save-limits">
                {updateLimitsMutation.isPending ? t('adminPanel.users.saving') : t('adminPanel.users.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('adminPanel.users.sendEmailTitle')} {emailTarget?.firstName || emailTarget?.email}</DialogTitle>
            <DialogDescription>{emailTarget?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="email-subject">{t('adminPanel.users.emailSubject')}</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={t('adminPanel.users.emailSubjectPlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="email-message">{t('adminPanel.users.emailBody')}</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder={t('adminPanel.users.emailBodyPlaceholder')}
                rows={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                {t('adminPanel.users.cancel')}
              </Button>
              <Button
                disabled={!emailSubject || !emailMessage || sendEmailMutation.isPending}
                onClick={() => emailTarget && sendEmailMutation.mutate({
                  to: emailTarget.email!,
                  subject: emailSubject,
                  message: emailMessage,
                  lang: emailTarget.language || 'es',
                })}
              >
                {sendEmailMutation.isPending ? t('adminPanel.users.sendingEmail') : t('adminPanel.users.sendEmail')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
