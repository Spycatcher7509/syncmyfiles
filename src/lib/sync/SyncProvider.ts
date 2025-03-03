
import { FolderPath } from '../types';
import { FolderPicker } from './folderPicker';
import { toast } from 'sonner';

export class SyncProvider {
  private sourceDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private destinationDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private isDemoMode: boolean = false;
  
  constructor() {
    // Check if running in iframe first
    if (FolderPicker.isRunningInIframe()) {
      console.log('Running in iframe, demo mode will be used');
      this.isDemoMode = true;
      toast.info('Demo Mode Active', {
        description: 'Running in demo mode because the app is in an iframe. File selection will be simulated.',
        duration: 8000,
      });
      return;
    }
    
    // Check if the File System Access API is available
    if (!FolderPicker.isFileSystemAccessApiSupported()) {
      console.log('File System Access API is not available. App functionality will be limited.');
      toast.error('Browser not supported', {
        description: 'Your browser does not support the File System Access API required for this app.',
        duration: 8000,
      });
    }
  }
  
  getSourceDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.sourceDirectoryHandle;
  }
  
  getDestinationDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.destinationDirectoryHandle;
  }
  
  isInDemoMode(): boolean {
    return this.isDemoMode;
  }
  
  canSync(): boolean {
    // In demo mode, we'll always allow syncing
    if (this.isDemoMode) {
      return true;
    }
    return !!this.sourceDirectoryHandle && !!this.destinationDirectoryHandle;
  }
  
  async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      // Get folder info from picker
      const folderInfo = await FolderPicker.browseForFolder(type);
      
      // Update demo mode if the folder info indicates it's demo data
      if (folderInfo.isDemo) {
        this.isDemoMode = true;
      }
      
      // Store the directory handle for later use
      if (folderInfo.handle) {
        if (type === 'source') {
          this.sourceDirectoryHandle = folderInfo.handle as FileSystemDirectoryHandle;
        } else {
          this.destinationDirectoryHandle = folderInfo.handle as FileSystemDirectoryHandle;
        }
      }
      
      // Remove the handle and isDemo before returning to the caller
      const { handle, isDemo, ...result } = folderInfo;
      return result;
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      throw error;
    }
  }
}
