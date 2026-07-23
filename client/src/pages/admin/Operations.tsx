import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CopyOperation } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function AdminOperations() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    userId: '',
    status: '',
    provider: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{
    operations: CopyOperation[];
    total: number;
    totalPages: number;
  }>({
    queryKey: ['/api/admin/operations', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.status && { status: filters.status }),
        ...(filters.provider && { provider: filters.provider }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });
      const response = await fetch(`/api/admin/operations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch operations');
      return response.json();
    },
  });

  const retryOperationMutation = useMutation({
    mutationFn: async (operationId: string) => {
      return await apiRequest(`/api/admin/operations/${operationId}/retry`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/operations'] });
      toast({
        title: t('adminPanel.opRetried'),
        description: t('adminPanel.opRetriedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || t('adminPanel.opRetryError'),
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
        {status}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      status: '',
      provider: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">{t('adminOps.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="page-admin-operations">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('adminOps.title')}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? t('adminOps.hideFilters') : t('adminOps.showFilters')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6 mb-6" data-testid="card-filters">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="userId">{t('adminOps.userIdLabel')}</Label>
              <Input
                id="userId"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                placeholder={t('adminOps.userIdPlaceholder')}
                data-testid="input-filter-user-id"
              />
            </div>
            <div>
              <Label htmlFor="status">{t('adminOps.statusLabel')}</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder={t('adminOps.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('adminOps.all')}</SelectItem>
                  <SelectItem value="pending">{t('adminOps.pending')}</SelectItem>
                  <SelectItem value="in_progress">{t('adminOps.inProgress')}</SelectItem>
                  <SelectItem value="completed">{t('adminOps.completed')}</SelectItem>
                  <SelectItem value="failed">{t('adminOps.failed')}</SelectItem>
                  <SelectItem value="cancelled">{t('adminOps.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="provider">{t('adminOps.providerLabel')}</Label>
              <Select
                value={filters.provider}
                onValueChange={(value) => setFilters({ ...filters, provider: value })}
              >
                <SelectTrigger data-testid="select-filter-provider">
                  <SelectValue placeholder={t('adminOps.allProviders')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('adminOps.all')}</SelectItem>
                  <SelectItem value="google">Google Drive</SelectItem>
                  <SelectItem value="dropbox">Dropbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">{t('adminOps.startDateLabel')}</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                data-testid="input-filter-start-date"
              />
            </div>
            <div>
              <Label htmlFor="endDate">{t('adminOps.endDateLabel')}</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                data-testid="input-filter-end-date"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full" data-testid="button-clear-filters">
                <X className="w-4 h-4 mr-2" />
                {t('adminOps.clearFilters')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-operations">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminOps.colUser')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminOps.colFile')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminOps.colProvider')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminOps.colStatus')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminOps.colProgress')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('adminOps.colDate')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">{t('adminOps.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.operations.map((operation) => (
                <tr key={operation.id} className="hover:bg-muted/50" data-testid={`row-operation-${operation.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {operation.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {operation.userId.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">
                    <div className="text-sm">{operation.fileName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{operation.sourceProvider || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(operation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {operation.progressPct !== null ? `${operation.progressPct}%` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(new Date(operation.createdAt), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {operation.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryOperationMutation.mutate(operation.id)}
                        disabled={retryOperationMutation.isPending}
                        data-testid={`button-retry-${operation.id}`}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.operations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('adminOps.noResults')}
          </div>
        )}

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
              {t('adminPanel.pageOf', { page, total: data.totalPages, count: data.total })}
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
    </div>
  );
}
