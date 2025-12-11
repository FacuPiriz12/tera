import { useState } from "react";
import { useTransfer, TransferJob } from "@/contexts/TransferContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRightLeft, ChevronUp, ChevronDown, X, CheckCircle2, 
  XCircle, Loader2, ExternalLink, Minimize2, Maximize2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

export default function GlobalTransferIndicator() {
  const { jobs, activeJobsCount, clearCompletedJobs } = useTransfer();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [, setLocation] = useLocation();

  if (jobs.length === 0) return null;

  const activeJobs = jobs.filter(j => 
    j.status === 'in_progress' || j.status === 'pending' || j.status === 'queued'
  );
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  const getStatusIcon = (status: TransferJob['status']) => {
    switch (status) {
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Loader2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TransferJob['status']) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-50"
        data-testid="transfer-indicator-minimized"
      >
        <Button
          onClick={() => setIsMinimized(false)}
          className={cn(
            "rounded-full h-14 w-14 shadow-lg",
            activeJobsCount > 0 ? "bg-blue-500 hover:bg-blue-600 animate-pulse" : "bg-green-500 hover:bg-green-600"
          )}
          data-testid="btn-expand-transfers"
        >
          <div className="relative">
            <ArrowRightLeft className="h-6 w-6" />
            {activeJobsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-blue-500 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {activeJobsCount}
              </span>
            )}
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-xl transition-all duration-300",
        isExpanded ? "w-96" : "w-80"
      )}
      data-testid="transfer-indicator-panel"
    >
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="transfer-indicator-header"
      >
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">
            Transferencias
          </span>
          {activeJobsCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {activeJobsCount} activa{activeJobsCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {completedJobs.length > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {completedJobs.length} completada{completedJobs.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
            data-testid="btn-minimize-transfers"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="max-h-80 overflow-y-auto">
          {jobs.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              No hay transferencias
            </p>
          ) : (
            <div className="divide-y">
              {jobs.slice(0, 10).map((job) => (
                <div key={job.id} className="p-3 hover:bg-muted/30" data-testid={`transfer-job-${job.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <span className="text-sm font-medium truncate" title={job.fileName}>
                          {job.fileName}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {job.sourceProvider} → {job.targetProvider}
                      </div>
                    </div>
                    {job.status === 'completed' && job.copiedFileUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => window.open(job.copiedFileUrl, '_blank')}
                        data-testid={`btn-open-file-${job.id}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {job.status === 'in_progress' && (
                    <div className="mt-2">
                      <Progress value={job.progress} className="h-1.5" />
                      <span className="text-xs text-muted-foreground">{job.progress}%</span>
                    </div>
                  )}
                  
                  {job.status === 'failed' && job.errorMessage && (
                    <p className="text-xs text-red-500 mt-1 truncate" title={job.errorMessage}>
                      {job.errorMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isExpanded && activeJobs.length > 0 && (
        <div className="p-3">
          {activeJobs.slice(0, 2).map((job) => (
            <div key={job.id} className="mb-2 last:mb-0">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                <span className="truncate flex-1">{job.fileName}</span>
                <span className="text-muted-foreground">{job.progress}%</span>
              </div>
              <Progress value={job.progress} className="h-1 mt-1" />
            </div>
          ))}
          {activeJobs.length > 2 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              +{activeJobs.length - 2} más
            </p>
          )}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="flex items-center justify-between p-2 border-t bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => setLocation('/operations')}
            data-testid="btn-view-all-operations"
          >
            Ver todas
          </Button>
          {(completedJobs.length > 0 || failedJobs.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground"
              onClick={clearCompletedJobs}
              data-testid="btn-clear-completed"
            >
              Limpiar completadas
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
