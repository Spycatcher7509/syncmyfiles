
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import FolderSelector from '@/components/FolderSelector';
import SyncControls from '@/components/SyncControls';
import StatusIndicator from '@/components/StatusIndicator';
import SyncStatistics from '@/components/SyncStatistics';
import LogViewer from '@/components/LogViewer';
import syncService from '@/lib/sync';
import { SyncStatus, SyncStats } from '@/lib/types';
import { toast } from 'sonner';

const Index = () => {
  const [sourcePath, setSourcePath] = useState('');
  const [destinationPath, setDestinationPath] = useState('');
  const [pollingInterval, setPollingInterval] = useState(5);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [forceRemove, setForceRemove] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  
  useEffect(() => {
    // Initialize with current service settings
    const settings = syncService.getSettings();
    setSourcePath(settings.sourcePath);
    setDestinationPath(settings.destinationPath);
    setPollingInterval(settings.pollingInterval);
    setIsMonitoring(settings.isMonitoring);
    setForceRemove(settings.forceRemove);
    setSyncStatus(syncService.getStatus());
    setSyncStats(syncService.getLatestStats());
    
    // Add listener for status changes
    const removeStatusListener = syncService.addStatusListener((status) => {
      setSyncStatus(status);
      
      // Show toast notifications for status changes
      if (status === 'syncing') {
        toast.info('Moving files...', {
          description: 'Moving files from source to destination',
        });
      } else if (status === 'monitoring') {
        toast.success('Move completed', {
          description: 'Files moved successfully',
        });
      } else if (status === 'error') {
        toast.error('Move error', {
          description: 'Failed to move files',
        });
      }
    });
    
    // Add listener for stats changes
    const removeStatsListener = syncService.addStatsListener((stats) => {
      setSyncStats(stats);
    });
    
    return () => {
      removeStatusListener();
      removeStatsListener();
    };
  }, []);
  
  const handleSourcePathChange = (path: string) => {
    setSourcePath(path);
    syncService.setSourcePath(path);
  };
  
  const handleDestinationPathChange = (path: string) => {
    setDestinationPath(path);
    syncService.setDestinationPath(path);
  };
  
  const handlePollingIntervalChange = (seconds: number) => {
    setPollingInterval(seconds);
    syncService.setPollingInterval(seconds);
  };
  
  const handleMonitoringChange = (monitoring: boolean) => {
    setIsMonitoring(monitoring);
    
    if (monitoring) {
      syncService.startMonitoring();
      toast.success('Monitoring started', {
        description: `Checking for changes every ${pollingInterval} seconds`,
      });
    } else {
      syncService.stopMonitoring();
      toast.info('Monitoring stopped', {
        description: 'No longer checking for changes',
      });
    }
  };

  const handleForceRemoveChange = (force: boolean) => {
    setForceRemove(force);
    syncService.setForceRemove(force);
    
    if (force) {
      toast.info('Force remove enabled', {
        description: 'Non-empty directories will be removed recursively',
      });
    } else {
      toast.info('Force remove disabled', {
        description: 'Non-empty directories will be preserved',
      });
    }
  };
  
  const handleSyncNow = () => {
    syncService.syncNow();
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/50">
      <div className="container max-w-xl px-4 py-8 mx-auto flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 py-8 space-y-8">
          <div className="glass-panel rounded-2xl p-6 space-y-6 shadow-sm">
            <FolderSelector 
              type="source" 
              path={sourcePath} 
              onPathChange={handleSourcePathChange} 
            />
            
            <FolderSelector 
              type="destination" 
              path={destinationPath} 
              onPathChange={handleDestinationPathChange} 
            />
            
            <SyncControls 
              pollingInterval={pollingInterval}
              isMonitoring={isMonitoring}
              syncStatus={syncStatus}
              forceRemove={forceRemove}
              onPollingIntervalChange={handlePollingIntervalChange}
              onMonitoringChange={handleMonitoringChange}
              onForceRemoveChange={handleForceRemoveChange}
              onSyncNow={handleSyncNow}
            />
            
            <StatusIndicator status={syncStatus} />
            
            <SyncStatistics stats={syncStats} />
          </div>
        </main>
        
        <footer className="py-4 text-center text-xs text-muted-foreground">
          <p>FolderWhisper &copy; {new Date().getFullYear()} - Elegant file synchronization</p>
        </footer>
      </div>
      
      <LogViewer />
    </div>
  );
};

export default Index;
