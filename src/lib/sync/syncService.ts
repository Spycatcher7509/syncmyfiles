
import { FolderPath, SyncStatus, SyncStats } from '../types';
import { SyncServiceInterface } from './types';
import { FileUtils } from './fileUtils';
import { FolderPicker } from './folderPicker';
import { MonitoringService } from './monitoringService';
import { SettingsManager } from './settingsManager';
import { StatusManager } from './statusManager';
import { StatsManager } from './statsManager';
import { toast } from 'sonner';

class SyncService implements SyncServiceInterface {
  private sourceDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private destinationDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private fileCache: Map<string, FileInfo> = new Map();
  private monitoringService: MonitoringService;
  private settingsManager: SettingsManager;
  private statusManager: StatusManager;
  private statsManager: StatsManager;
  
  constructor() {
    this.settingsManager = new SettingsManager();
    this.statusManager = new StatusManager();
    this.statsManager = new StatsManager();
    
    this.monitoringService = new MonitoringService(
      () => this.syncNow(),
      (status) => this.statusManager.setStatus(status),
      () => this.settingsManager.getSettings().pollingInterval
    );
    
    // Check if the File System Access API is available
    if (typeof window.showDirectoryPicker !== 'function') {
      console.warn('File System Access API is not available. Full functionality requires a modern browser like Chrome, Edge, or Opera.');
    }
  }
  
  setSourcePath(path: string): void {
    this.settingsManager.setSourcePath(path);
  }
  
  setDestinationPath(path: string): void {
    this.settingsManager.setDestinationPath(path);
  }
  
  setPollingInterval(seconds: number): void {
    this.settingsManager.setPollingInterval(seconds);
    
    // If currently monitoring, restart with new interval
    if (this.settingsManager.getSettings().isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
  
  getSettings() {
    return this.settingsManager.getSettings();
  }
  
  getStatus(): SyncStatus {
    return this.statusManager.getStatus();
  }
  
  getLatestStats(): SyncStats | null {
    return this.statsManager.getLatestStats();
  }
  
  canSync(): boolean {
    return !!this.sourceDirectoryHandle && !!this.destinationDirectoryHandle;
  }
  
  async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      const folderInfo = await FolderPicker.browseForFolder(type);
      
      // Store the directory handle for later use
      if (folderInfo.handle) {
        if (type === 'source') {
          this.sourceDirectoryHandle = folderInfo.handle as FileSystemDirectoryHandle;
        } else {
          this.destinationDirectoryHandle = folderInfo.handle as FileSystemDirectoryHandle;
        }
      }
      
      // Set the path in settings
      if (type === 'source') {
        this.setSourcePath(folderInfo.path);
      } else {
        this.setDestinationPath(folderInfo.path);
      }
      
      // Remove the handle before returning to the caller
      const { handle, ...result } = folderInfo;
      return result;
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      throw error;
    }
  }
  
  async syncNow(): Promise<void> {
    if (!this.canSync()) {
      this.statusManager.setStatus('error');
      console.error('Source and destination folders must be selected');
      toast.error('Cannot sync', {
        description: 'Source and destination folders must be selected first.',
      });
      return;
    }
    
    try {
      this.statusManager.setStatus('syncing');
      console.log('Starting sync process...');
      
      // Initialize stats
      const stats: SyncStats = {
        filesCopied: 0,
        bytesCopied: 0,
        startTime: Date.now(),
        endTime: 0,
        duration: 0
      };
      
      // Clear file cache on manual sync to force a full sync
      if (!this.settingsManager.getSettings().isMonitoring) {
        this.fileCache.clear();
      }
      
      // Perform the actual sync
      await FileUtils.syncFolders(
        this.sourceDirectoryHandle!,
        this.destinationDirectoryHandle!,
        this.fileCache,
        stats
      );
      
      // Complete stats
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      this.statsManager.setStats(stats);
      
      // Show toast with sync results
      this.statsManager.displaySyncResults(stats);
      
      // If we're not monitoring, return to idle after sync
      const settings = this.settingsManager.getSettings();
      if (!settings.isMonitoring) {
        this.statusManager.setStatus('idle');
      } else {
        this.statusManager.setStatus('monitoring');
      }
      
      console.log('Sync completed successfully', stats);
    } catch (error) {
      this.statusManager.setStatus('error');
      console.error('Sync failed:', error);
      toast.error('Sync failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
  
  startMonitoring(): void {
    if (!this.canSync()) {
      this.statusManager.setStatus('error');
      console.error('Source and destination folders must be selected');
      toast.error('Cannot start monitoring', {
        description: 'Source and destination folders must be selected first.',
      });
      return;
    }
    
    this.settingsManager.setMonitoring(true);
    this.monitoringService.startMonitoring();
    toast.success('Monitoring started', {
      description: `Checking for changes every ${this.settingsManager.getSettings().pollingInterval} seconds`,
    });
  }
  
  stopMonitoring(): void {
    this.monitoringService.stopMonitoring();
    this.settingsManager.setMonitoring(false);
    this.statusManager.setStatus('idle');
    toast.info('Monitoring stopped', {
      description: 'No longer checking for changes',
    });
  }
  
  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    return this.statusManager.addStatusListener(listener);
  }
  
  addStatsListener(listener: (stats: SyncStats | null) => void): () => void {
    return this.statsManager.addStatsListener(listener);
  }
}

// Singleton instance
const syncService = new SyncService();
export default syncService;
