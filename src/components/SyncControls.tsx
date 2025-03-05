
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import syncService from '@/lib/sync';
import { SyncStatus } from '@/lib/types';

interface SyncControlsProps {
  pollingInterval: number;
  isMonitoring: boolean;
  syncStatus: SyncStatus;
  forceRemove: boolean;
  onPollingIntervalChange: (value: number) => void;
  onMonitoringChange: (isMonitoring: boolean) => void;
  onForceRemoveChange: (forceRemove: boolean) => void;
  onSyncNow: () => void;
}

const SyncControls: React.FC<SyncControlsProps> = ({
  pollingInterval,
  isMonitoring,
  syncStatus,
  forceRemove,
  onPollingIntervalChange,
  onMonitoringChange,
  onForceRemoveChange,
  onSyncNow
}) => {
  const canSync = syncService.canSync();
  const handleSliderChange = (value: number[]) => {
    onPollingIntervalChange(value[0]);
  };
  
  const handleMonitoringToggle = () => {
    onMonitoringChange(!isMonitoring);
  };

  const handleForceRemoveToggle = (checked: boolean) => {
    onForceRemoveChange(checked);
  };
  
  const renderButtonContent = () => {
    if (syncStatus === 'syncing') {
      return (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Syncing...
        </>
      );
    }
    
    if (isMonitoring) {
      return (
        <>
          <Pause className="h-4 w-4 mr-2" />
          Stop Monitoring
        </>
      );
    }
    
    return (
      <>
        <Play className="h-4 w-4 mr-2" />
        Start Monitoring
      </>
    );
  };
  
  return (
    <div className="space-y-6 animate-in animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            Polling Frequency
          </label>
          <span className="text-xs text-muted-foreground">
            {pollingInterval} {pollingInterval === 1 ? 'second' : 'seconds'}
          </span>
        </div>
        
        <Slider
          value={[pollingInterval]}
          min={1}
          max={60}
          step={1}
          onValueChange={handleSliderChange}
          disabled={!canSync}
          className="py-1"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Force Remove (Non-empty folders)</span>
        <Switch
          checked={forceRemove}
          onCheckedChange={handleForceRemoveToggle}
          disabled={!canSync}
        />
      </div>
      
      <div className="flex space-x-3">
        <Button
          className="flex-1 transition-all hover:scale-105"
          onClick={handleMonitoringToggle}
          disabled={!canSync || syncStatus === 'syncing'}
          variant={isMonitoring ? "secondary" : "default"}
        >
          {renderButtonContent()}
        </Button>
        
        <Button
          variant="outline"
          onClick={onSyncNow}
          disabled={!canSync || syncStatus === 'syncing'}
          className="transition-all hover:scale-105"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          Sync Now
        </Button>
      </div>
    </div>
  );
};

export default SyncControls;
