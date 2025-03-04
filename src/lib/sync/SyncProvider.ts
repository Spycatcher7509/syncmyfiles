
import { FolderPath } from '../types';
import { FolderPicker } from './folderPicker';
import { toast } from 'sonner';

export class SyncProvider {
  private sourceDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private destinationDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private isDemoMode: boolean = false;
  
  constructor() {
    // Use the enhanced API support check
    const apiSupport = FolderPicker.checkAndNotifyApiSupport();
    this.isDemoMode = !apiSupport.isSupported;
    
    if (this.isDemoMode) {
      if (apiSupport.reason === 'iframe') {
        console.log('Running in iframe, demo mode will be used');
      } else {
        console.log('File System Access API not available. App will use demo mode.');
      }
    } else {
      console.log('File System Access API is available. Full functionality enabled.');
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
