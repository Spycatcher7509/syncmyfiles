
import { FolderPath, SyncSettings, SyncStatus } from '../types';
import { SyncServiceInterface } from './types';
import { FileUtils, FileInfo } from './fileUtils';
import { FolderPicker } from './folderPicker';
import { MonitoringService } from './monitoringService';

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
      
      // Clear file cache on manual sync to force a full sync
      if (!this.settings.isMonitoring) {
        this.fileCache.clear();
      }
      
      await FileUtils.syncFolders(
        this.sourceDirectoryHandle!,
        this.destinationDirectoryHandle!,
        this.fileCache
      );
      
      // If we're not monitoring, return to idle after sync
      if (!this.settings.isMonitoring) {
        this.setStatus('idle');
      } else {
        this.setStatus('monitoring');
      }
      
      console.log('Sync completed successfully');
    } catch (error) {
      this.setStatus('error');
      console.error('Sync failed:', error);
    }
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
  
  private setStatus(status: SyncStatus): void {
    this.status = status;
    this.notifyListeners();
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.status));
  }
}

// Singleton instance
const syncService = new SyncService();
export default syncService;
