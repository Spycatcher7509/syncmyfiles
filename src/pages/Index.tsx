
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import FolderSelector from '@/components/FolderSelector';
import SyncControls from '@/components/SyncControls';
import StatusIndicator from '@/components/StatusIndicator';
import syncService from '@/lib/syncService';
import { SyncStatus } from '@/lib/types';
import { toast } from 'sonner';

const Index = () => {
  const [sourcePath, setSourcePath] = useState('');
  const [destinationPath, setDestinationPath] = useState('');
  const [pollingInterval, setPollingInterval] = useState(5);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  
  useEffect(() => {
    // Initialize with current service settings
    const settings = syncService.getSettings();
    setSourcePath(settings.sourcePath);
    setDestinationPath(settings.destinationPath);
    setPollingInterval(settings.pollingInterval);
    setIsMonitoring(settings.isMonitoring);
    setSyncStatus(syncService.getStatus());
    
    // Add listener for status changes
    const removeListener = syncService.addStatusListener((status) => {
      setSyncStatus(status);
      
      // Show toast notifications for status changes
      if (status === 'syncing') {
        toast.info('Syncing files...', {
          description: 'Copying files between folders',
        });
      } else if (status === 'monitoring') {
        toast.success('Sync completed', {
          description: 'Files synchronized successfully',
        });
      } else if (status === 'error') {
        toast.error('Sync error', {
          description: 'Failed to synchronize files',
        });
      }
    });
    
    return () => removeListener();
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
              onPollingIntervalChange={handlePollingIntervalChange}
              onMonitoringChange={handleMonitoringChange}
              onSyncNow={handleSyncNow}
            />
            
            <StatusIndicator status={syncStatus} />
          </div>
        </main>
        
        <footer className="py-4 text-center text-xs text-muted-foreground">
          <p>FolderWhisper &copy; {new Date().getFullYear()} - Elegant file synchronization</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
