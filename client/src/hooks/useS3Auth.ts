import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/queryClient";

export interface S3AuthStatus {
  connected: boolean;
  region?: string;
}

export function useS3Auth() {
  const queryClient = useQueryClient();

  const { data: status, isLoading: isLoadingStatus } = useQuery<S3AuthStatus>({
    queryKey: ["/api/auth/s3/status"],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/auth/s3/status", { credentials: "include", headers });
      if (!response.ok) {
        if (response.status === 401) return { connected: false };
        throw new Error('Failed to check S3 auth status');
      }
      return response.json();
    },
    refetchInterval: 30000,
  });

  const connectMutation = useMutation({
    mutationFn: async (credentials: { accessKeyId: string; secretAccessKey: string; region: string }) => {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/auth/s3", {
        method: "POST",
        credentials: "include",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to connect S3');
      }
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/s3/status"] }),
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/auth/s3", { method: "DELETE", credentials: "include", headers });
      if (!response.ok) throw new Error('Failed to disconnect S3');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/auth/s3/status"] }),
  });

  return {
    status,
    isLoadingStatus,
    isConnected: status?.connected || false,
    region: status?.region,
    connect: connectMutation.mutate,
    isConnecting: connectMutation.isPending,
    connectError: connectMutation.error?.message,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
  };
}
