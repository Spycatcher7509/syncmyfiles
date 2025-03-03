
import React from 'react';
import { SyncStatus } from '@/lib/types';
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

interface StatusIndicatorProps {
  status: SyncStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'idle':
        return {
          icon: <Clock className="h-5 w-5 text-muted-foreground" />,
          label: 'Ready',
          description: 'The application is idle and ready to sync',
          color: 'bg-secondary'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="h-5 w-5 text-primary animate-spin" />,
          label: 'Syncing',
          description: 'Files are being synchronized',
          color: 'bg-primary/10'
        };
      case 'monitoring':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          label: 'Monitoring',
          description: 'Watching for changes to sync automatically',
          color: 'bg-green-500/10'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-destructive" />,
          label: 'Error',
          description: 'An error occurred during synchronization',
          color: 'bg-destructive/10'
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-muted-foreground" />,
          label: 'Ready',
          description: 'The application is idle and ready to sync',
          color: 'bg-secondary'
        };
    }
  };
  
  const { icon, label, description, color } = getStatusDetails();
  
  return (
    <div className={`${color} rounded-lg p-4 animate-in animate-fade-in-up`} style={{ animationDelay: '300ms' }}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium">{label}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicator;
