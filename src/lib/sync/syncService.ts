
import { FolderPath, SyncSettings, SyncStatus, SyncStats } from '../types';
import { SyncServiceInterface } from './types';
import { FileUtils, FileInfo } from './fileUtils';
import { FolderPicker } from './folderPicker';
import { MonitoringService } from './monitoringService';
import { toast } from 'sonner';

class SyncService implements SyncServiceInterface {
  private settings: SyncSettings = {
    sourcePath: '',
    destinationPath: '',
    pollingInterval: 5, // default 5 seconds
    isMonitoring: false
  };
  
  private status: SyncStatus = 'idle';
  private listeners: ((status: SyncStatus) => void)[] = [];
  private sourceDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private destinationDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private fileCache: Map<string, FileInfo> = new Map();
  private monitoringService: MonitoringService;
  private latestStats: SyncStats | null = null;
  private statsListeners: ((stats: SyncStats | null) => void)[] = [];
  
  constructor() {
    this.monitoringService = new MonitoringService(
      () => this.syncNow(),
      (status) => this.setStatus(status),
      () => this.settings.pollingInterval
    );
  }
  
  setSourcePath(path: string): void {
    this.settings.sourcePath = path;
    this.notifyListeners();
  }
  
  setDestinationPath(path: string): void {
    this.settings.destinationPath = path;
    this.notifyListeners();
  }
  
  setPollingInterval(seconds: number): void {
    this.settings.pollingInterval = seconds;
    
    // If currently monitoring, restart with new interval
    if (this.settings.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
    
    this.notifyListeners();
  }
  
  getSettings(): SyncSettings {
    return { ...this.settings };
  }
  
  getStatus(): SyncStatus {
    return this.status;
  }
  
  getLatestStats(): SyncStats | null {
    return this.latestStats;
  }
  
  canSync(): boolean {
    return !!this.sourceDirectoryHandle && !!this.destinationDirectoryHandle;
  }
  
  async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      const folderInfo = await FolderPicker.browseForFolder(type);
      
      // Store the directory handle for later use
      if (type === 'source') {
        this.sourceDirectoryHandle = folderInfo.handle as FileSystemDirectoryHandle;
      } else {
        this.destinationDirectoryHandle = folderInfo.handle as FileSystemDirectoryHandle;
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
      this.setStatus('error');
      console.error('Source and destination folders must be selected');
      return;
    }
    
    try {
      this.setStatus('syncing');
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
      if (!this.settings.isMonitoring) {
        this.fileCache.clear();
      }
      
      await FileUtils.syncFolders(
        this.sourceDirectoryHandle!,
        this.destinationDirectoryHandle!,
        this.fileCache,
        stats
      );
      
      // Complete stats
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      this.latestStats = stats;
      
      // Notify stats listeners
      this.notifyStatsListeners();
      
      // Show toast with sync results
      this.displaySyncResults(stats);
      
      // If we're not monitoring, return to idle after sync
      if (!this.settings.isMonitoring) {
        this.setStatus('idle');
      } else {
        this.setStatus('monitoring');
      }
      
      console.log('Sync completed successfully', stats);
    } catch (error) {
      this.setStatus('error');
      console.error('Sync failed:', error);
    }
  }
  
  private displaySyncResults(stats: SyncStats): void {
    // Format the bytes into a readable format (KB, MB, etc.)
    const formattedBytes = this.formatBytes(stats.bytesCopied);
    const duration = (stats.duration / 1000).toFixed(2); // Convert to seconds
    
    // Show a toast with the results
    if (stats.filesCopied > 0) {
      toast.success('Sync completed', {
        description: `Copied ${stats.filesCopied} files (${formattedBytes}) in ${duration}s`,
      });
    } else {
      toast.info('Sync completed', {
        description: 'No files needed to be updated',
      });
    }
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  startMonitoring(): void {
    if (!this.canSync()) {
      this.setStatus('error');
      console.error('Source and destination folders must be selected');
      return;
    }
    
    this.settings.isMonitoring = true;
    this.monitoringService.startMonitoring();
    this.notifyListeners();
  }
  
  stopMonitoring(): void {
    this.monitoringService.stopMonitoring();
    
    this.settings.isMonitoring = false;
    this.setStatus('idle');
    this.notifyListeners();
  }
  
  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  addStatsListener(listener: (stats: SyncStats | null) => void): () => void {
    this.statsListeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.statsListeners = this.statsListeners.filter(l => l !== listener);
    };
  }
  
  private setStatus(status: SyncStatus): void {
    this.status = status;
    this.notifyListeners();
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.status));
  }
  
  private notifyStatsListeners(): void {
    this.statsListeners.forEach(listener => listener(this.latestStats));
  }
}

// Singleton instance
const syncService = new SyncService();
export default syncService;
