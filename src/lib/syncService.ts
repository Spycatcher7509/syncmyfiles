
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
  private sourceDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private destinationDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private fileCache: Map<string, { lastModified: number, size: number }> = new Map();
  
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
      // Use the File System Access API to let the user select a directory
      const directoryHandle = await window.showDirectoryPicker({
        id: type === 'source' ? 'source-directory' : 'destination-directory',
        mode: 'readwrite',
      });
      
      // Store the directory handle for later use
      if (type === 'source') {
        this.sourceDirectoryHandle = directoryHandle;
      } else {
        this.destinationDirectoryHandle = directoryHandle;
      }
      
      // Get the folder name from the handle
      const folderName = directoryHandle.name;
      const folderPath = `/${folderName}`;
      
      return {
        path: folderPath,
        name: folderName
      };
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
      
      await this.syncFolders(this.sourceDirectoryHandle!, this.destinationDirectoryHandle!);
      
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
  
  private async syncFolders(
    sourceDir: FileSystemDirectoryHandle,
    destDir: FileSystemDirectoryHandle,
    subPath: string = ""
  ): Promise<void> {
    // Get all entries from the source directory
    for await (const [name, entry] of sourceDir.entries()) {
      const entryPath = subPath ? `${subPath}/${name}` : name;
      
      if (entry.kind === 'file') {
        await this.syncFile(sourceDir, destDir, name, entryPath);
      } else if (entry.kind === 'directory') {
        // Create the corresponding directory in the destination if it doesn't exist
        let destSubDir: FileSystemDirectoryHandle;
        try {
          destSubDir = await destDir.getDirectoryHandle(name);
        } catch (error) {
          // Directory doesn't exist, create it
          destSubDir = await destDir.getDirectoryHandle(name, { create: true });
        }
        
        // Recursively sync subdirectories
        const sourceSubDir = await sourceDir.getDirectoryHandle(name);
        await this.syncFolders(sourceSubDir, destSubDir, entryPath);
      }
    }
  }
  
  private async syncFile(
    sourceDir: FileSystemDirectoryHandle,
    destDir: FileSystemDirectoryHandle,
    fileName: string,
    filePath: string
  ): Promise<void> {
    try {
      // Get the file handle from the source directory
      const sourceFileHandle = await sourceDir.getFileHandle(fileName);
      const sourceFile = await sourceFileHandle.getFile();
      
      // Check if the file has changed using the cache
      const fileKey = filePath;
      const cachedInfo = this.fileCache.get(fileKey);
      const currentInfo = {
        lastModified: sourceFile.lastModified,
        size: sourceFile.size
      };
      
      // Skip if the file hasn't changed
      if (cachedInfo && 
          cachedInfo.lastModified === currentInfo.lastModified && 
          cachedInfo.size === currentInfo.size) {
        return;
      }
      
      // Update the cache
      this.fileCache.set(fileKey, currentInfo);
      
      // Read the source file
      const fileData = await sourceFile.arrayBuffer();
      
      // Create or overwrite the file in the destination directory
      let destFileHandle: FileSystemFileHandle;
      try {
        destFileHandle = await destDir.getFileHandle(fileName);
      } catch (error) {
        // File doesn't exist, create it
        destFileHandle = await destDir.getFileHandle(fileName, { create: true });
      }
      
      // Get a writable stream to the destination file
      const writable = await destFileHandle.createWritable();
      
      // Write the file data
      await writable.write(fileData);
      await writable.close();
      
      console.log(`Synced file: ${filePath}`);
    } catch (error) {
      console.error(`Error syncing file ${filePath}:`, error);
      throw error;
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
    
    // Initial sync
    this.syncNow();
    
    // Set up new monitoring interval
    this.monitoringInterval = window.setInterval(() => {
      console.log('Checking for changes...');
      this.syncNow();
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
}

// Singleton instance
const syncService = new SyncService();
export default syncService;
