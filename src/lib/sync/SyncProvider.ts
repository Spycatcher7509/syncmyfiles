
import { FolderPath } from '../types';
import { FolderPicker } from './folderPicker';
import { MockSyncService } from './MockSyncService';
import { toast } from 'sonner';

export class SyncProvider {
  private sourceDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private destinationDirectoryHandle: FileSystemDirectoryHandle | null = null;
  private mockService: MockSyncService;
  private isMockMode = false;
  
  constructor() {
    this.mockService = new MockSyncService();
    
    // Check if the File System Access API is available
    this.isMockMode = this.mockService.isMockModeAvailable();
    if (this.isMockMode) {
      console.log('File System Access API is not available. Using mock mode for testing.');
    }
  }
  
  getSourceDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.sourceDirectoryHandle;
  }
  
  getDestinationDirectoryHandle(): FileSystemDirectoryHandle | null {
    return this.destinationDirectoryHandle;
  }
  
  isMockModeEnabled(): boolean {
    return this.isMockMode;
  }
  
  canSync(): boolean {
    if (this.isMockMode) {
      // In mock mode, we just need paths to be set
      return true;
    }
    return !!this.sourceDirectoryHandle && !!this.destinationDirectoryHandle;
  }
  
  async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      if (this.isMockMode) {
        return this.mockService.generateMockFolderPath(type);
      }
      
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
