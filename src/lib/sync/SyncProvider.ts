
import { FolderPath } from '../types';
import { FolderPicker } from './folderPicker';
import { toast } from 'sonner';

export class SyncProvider {
  private sourceDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private destinationDirectoryHandle: FileSystemDirectoryHandle | null = null;
  
  constructor() {
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
  
  canSync(): boolean {
    return !!this.sourceDirectoryHandle && !!this.destinationDirectoryHandle;
  }
  
  async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      // Only use real folder selection
      const folderInfo = await FolderPicker.browseForFolder(type);
      
      // Store the directory handle for later use
      if (folderInfo.handle) {
        if (type === 'source') {
          this.sourceDirectoryHandle = folderInfo.handle as FileSystemDirectoryHandle;
        } else {
          this.destinationDirectoryHandle = folderInfo.handle as FileSystemDirectoryHandle;
        }
      }
      
      // Remove the handle before returning to the caller
      const { handle, ...result } = folderInfo;
      return result;
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      throw error;
    }
  }
}
