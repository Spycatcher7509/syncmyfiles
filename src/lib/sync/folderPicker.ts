
import { FolderPath } from '../types';
import { toast } from 'sonner';

export class FolderPicker {
  static isFileSystemAccessApiSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }
  
  static async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      // Check if File System Access API is supported
      if (!FolderPicker.isFileSystemAccessApiSupported()) {
        console.log('File System Access API is not supported by this browser');
        throw new Error('Your browser does not support the File System Access API required for this app');
      }
      
      // Use the File System Access API to let the user select a directory
      const directoryHandle = await window.showDirectoryPicker({
        id: type === 'source' ? 'source-directory' : 'destination-directory',
        mode: 'readwrite',
      });
      
      // Get the folder name from the handle
      const folderName = directoryHandle.name;
      
      // For better UX, we'll show a more complete path
      // This is just a representation since browser security doesn't give us the full path
      const folderPath = `/${folderName}`;
      
      console.log(`Selected ${type} folder:`, folderPath);
      
      return {
        path: folderPath,
        name: folderName,
        handle: directoryHandle, // Return the handle for later use
      };
    } catch (error: any) {
      // Handle user cancellation separately from other errors
      if (error.name === 'AbortError') {
        console.log('Folder selection was cancelled by the user');
        throw new Error('Folder selection cancelled');
      }
      
      console.error(`Error selecting ${type} folder:`, error);
      toast.error(`Failed to select folder: ${error.message || 'Unknown error'}`);
      throw error;
    }
  }
}
