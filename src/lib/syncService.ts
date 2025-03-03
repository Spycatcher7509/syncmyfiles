
import { FolderPath, SyncSettings, SyncStatus } from './types';

class SyncService {
  private settings: SyncSettings = {
    sourcePath: '',
    destinationPath: '',
    pollingInterval: 5, // default 5 seconds
    isMonitoring: false
  };
  
  private status: SyncStatus = 'idle';
  private monitoringInterval: number | null = null;
  private listeners: ((status: SyncStatus) => void)[] = [];

  // In a real implementation, this would use the file system APIs
  // For demonstration, we'll simulate the file system operations
  
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
    return !!this.settings.sourcePath && !!this.settings.destinationPath;
  }
  
  async syncNow(): Promise<void> {
    if (!this.canSync()) {
      this.setStatus('error');
      console.error('Source and destination folders must be selected');
      return;
    }
    
    try {
      this.setStatus('syncing');
      
      // Simulate syncing process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    this.setStatus('monitoring');
    
    // Clear existing interval if any
    if (this.monitoringInterval !== null) {
      window.clearInterval(this.monitoringInterval);
    }
    
    // Set up new monitoring interval
    this.monitoringInterval = window.setInterval(() => {
      // In a real implementation, this would check for file changes
      // and trigger a sync if needed
      console.log('Checking for changes...');
      
      // Simulate occasional syncing for demonstration
      const shouldSync = Math.random() > 0.7;
      if (shouldSync) {
        console.log('Changes detected, syncing...');
        this.syncNow();
      }
    }, this.settings.pollingInterval * 1000);
    
    this.notifyListeners();
  }
  
  stopMonitoring(): void {
    if (this.monitoringInterval !== null) {
      window.clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
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
  
  // In a real app, these would interact with the file system API
  // For demo purposes, they simulate the browsing experience
  
  browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    // Simulate folder selection
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomId = Math.floor(Math.random() * 1000);
        
        if (type === 'source') {
          resolve({
            path: `/Users/user/Documents/source-folder-${randomId}`,
            name: `source-folder-${randomId}`
          });
        } else {
          resolve({
            path: `/Users/user/Documents/destination-folder-${randomId}`,
            name: `destination-folder-${randomId}`
          });
        }
      }, 500);
    });
  }
}

// Singleton instance
const syncService = new SyncService();
export default syncService;
