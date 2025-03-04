
import React, { useState, useEffect } from 'react';
import { logService, LogEntry } from '@/lib/sync/logService';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ChevronUp, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const unsubscribe = logService.addLogListener((updatedLogs) => {
      setLogs(updatedLogs);
    });
    
    // Initial load
    setLogs(logService.getLogs());
    
    return unsubscribe;
  }, []);
  
  const getActionColor = (action: LogEntry['action']): string => {
    switch (action) {
      case 'move':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'monitor_start':
      case 'monitor_stop':
        return 'text-blue-500';
      case 'info':
      default:
        return 'text-gray-400';
    }
  };
  
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
  };
  
  if (logs.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-background rounded-lg shadow-lg border border-border">
      <div 
        className="p-2 flex items-center justify-between cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-medium flex items-center gap-2">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          Activity Log ({logs.length})
        </h3>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              logService.clearLogs();
            }}
          >
            <XCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setLogs(logService.getLogs());
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <ScrollArea className="h-80 border-t border-border">
          <div className="p-2 space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="text-xs border-b border-border pb-2 last:border-b-0">
                <div className="flex justify-between">
                  <span className={`font-medium ${getActionColor(log.action)}`}>
                    {log.action.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground">{formatTime(log.timestamp)}</span>
                </div>
                <p className="mt-1">{log.details}</p>
                {log.path && <p className="text-muted-foreground mt-1 truncate">{log.path}</p>}
                {log.error && <p className="text-red-500 mt-1">{log.error}</p>}
                {log.stats && (
                  <div className="mt-1 grid grid-cols-3 gap-1">
                    {log.stats.filesCopied !== undefined && (
                      <div>Files: {log.stats.filesCopied}</div>
                    )}
                    {log.stats.bytesCopied !== undefined && (
                      <div>Bytes: {log.stats.bytesCopied}</div>
                    )}
                    {log.stats.duration !== undefined && (
                      <div>Duration: {(log.stats.duration / 1000).toFixed(2)}s</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default LogViewer;
