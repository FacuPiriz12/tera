import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, getAuthHeaders } from "@/lib/queryClient";

export interface TransferJob {
  id: string;
  fileName: string;
  status: 'queued' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  sourceProvider: string;
  targetProvider: string;
  errorMessage?: string;
  copiedFileUrl?: string;
  createdAt: string;
}

interface TransferContextType {
  jobs: TransferJob[];
  activeJobsCount: number;
  addJob: (job: TransferJob) => void;
  updateJob: (jobId: string, updates: Partial<TransferJob>) => void;
  removeJob: (jobId: string) => void;
  clearCompletedJobs: () => void;
  isConnected: boolean;
}

const TransferContext = createContext<TransferContextType | null>(null);

export function TransferProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<TransferJob[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  const addJob = useCallback((job: TransferJob) => {
    setJobs(prev => {
      const exists = prev.some(j => j.id === job.id);
      if (exists) {
        return prev.map(j => j.id === job.id ? { ...j, ...job } : j);
      }
      return [job, ...prev];
    });
  }, []);

  const updateJob = useCallback((jobId: string, updates: Partial<TransferJob>) => {
    setJobs(prev => {
      const exists = prev.some(j => j.id === jobId);
      if (exists) {
        return prev.map(job => job.id === jobId ? { ...job, ...updates } : job);
      }
      return [{
        id: jobId,
        fileName: updates.fileName || 'Transferencia',
        status: updates.status || 'in_progress',
        progress: updates.progress || 0,
        sourceProvider: updates.sourceProvider || '',
        targetProvider: updates.targetProvider || '',
        createdAt: new Date().toISOString(),
        ...updates
      } as TransferJob, ...prev];
    });
  }, []);

  const removeJob = useCallback((jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);

  const clearCompletedJobs = useCallback(() => {
    setJobs(prev => prev.filter(job => 
      job.status !== 'completed' && job.status !== 'failed' && job.status !== 'cancelled'
    ));
  }, []);

  const connectSSE = useCallback(() => {
    if (!isAuthenticated || eventSourceRef.current) return;

    const eventSource = new EventSource('/api/transfer-jobs/events', { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    });

    eventSource.addEventListener('progress', (event) => {
      const jobData = JSON.parse(event.data);
      updateJob(jobData.jobId, { 
        status: 'in_progress', 
        progress: jobData.progressPct,
        fileName: jobData.fileName || undefined
      });
    });

    eventSource.addEventListener('completed', (event) => {
      const jobData = JSON.parse(event.data);
      updateJob(jobData.jobId, { 
        status: 'completed', 
        progress: 100, 
        copiedFileUrl: jobData.copiedFileUrl 
      });
      
      toast({
        title: "Transferencia completada",
        description: `${jobData.fileName} transferido exitosamente`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/copy-operations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/drive/files'] });
    });

    eventSource.addEventListener('failed', (event) => {
      const jobData = JSON.parse(event.data);
      updateJob(jobData.jobId, { 
        status: 'failed', 
        errorMessage: jobData.errorMessage 
      });
      
      toast({
        title: "Error en transferencia",
        description: jobData.errorMessage || `Error al transferir`,
        variant: "destructive"
      });

      queryClient.invalidateQueries({ queryKey: ['/api/copy-operations'] });
    });

    eventSource.addEventListener('cancelled', (event) => {
      const jobData = JSON.parse(event.data);
      updateJob(jobData.jobId, { status: 'cancelled' });
    });

    eventSource.addEventListener('retry', (event) => {
      const jobData = JSON.parse(event.data);
      updateJob(jobData.jobId, { 
        status: 'pending',
        errorMessage: `Reintentando (${jobData.attempts})...`
      });
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      eventSourceRef.current = null;

      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, delay);
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [isAuthenticated, toast, updateJob]);

  const fetchAllJobs = useCallback(async () => {
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch('/api/copy-operations', { 
        headers: authHeaders,
        credentials: 'include' 
      });
      if (response.ok) {
        const operations = await response.json();
        
        const fetchedJobs: TransferJob[] = operations.map((op: any) => ({
          id: op.id,
          fileName: op.fileName || 'Transferencia',
          status: op.status,
          progress: op.progressPct || 0,
          sourceProvider: op.sourceProvider || '',
          targetProvider: op.destProvider || '',
          errorMessage: op.errorMessage,
          copiedFileUrl: op.copiedFileUrl,
          createdAt: op.createdAt || new Date().toISOString()
        }));
        
        setJobs(prev => {
          const fetchedIds = new Set(fetchedJobs.map(j => j.id));
          const existingActiveJobs = prev.filter(j => 
            !fetchedIds.has(j.id) && 
            (j.status === 'in_progress' || j.status === 'pending' || j.status === 'queued')
          );
          
          const mergedJobs = [...existingActiveJobs];
          for (const job of fetchedJobs) {
            const existingIndex = mergedJobs.findIndex(j => j.id === job.id);
            if (existingIndex >= 0) {
              const existing = mergedJobs[existingIndex];
              if (existing.status === 'in_progress' || existing.status === 'pending') {
                continue;
              }
              mergedJobs[existingIndex] = job;
            } else {
              mergedJobs.push(job);
            }
          }
          
          return mergedJobs.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        
        reconnectAttempts.current = 0;
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllJobs();
      connectSSE();
    } else {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      setJobs([]);
      setIsConnected(false);
      reconnectAttempts.current = 0;
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, connectSSE, fetchAllJobs]);

  const activeJobsCount = jobs.filter(j => 
    j.status === 'in_progress' || j.status === 'pending' || j.status === 'queued'
  ).length;

  return (
    <TransferContext.Provider value={{
      jobs,
      activeJobsCount,
      addJob,
      updateJob,
      removeJob,
      clearCompletedJobs,
      isConnected
    }}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
}
