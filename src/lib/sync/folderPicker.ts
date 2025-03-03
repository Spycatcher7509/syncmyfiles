
import { FolderPath } from '../types';

export class FolderPicker {
  static async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      // Check if the File System Access API is available
      if (typeof window.showDirectoryPicker === 'function') {
        // Use the File System Access API to let the user select a directory
        const directoryHandle = await window.showDirectoryPicker({
          id: type === 'source' ? 'source-directory' : 'destination-directory',
          mode: 'readwrite',
        });
        
        // Get the folder name from the handle
        const folderName = directoryHandle.name;
        const folderPath = `/${folderName}`;
        
        return {
          path: folderPath,
          name: folderName,
          handle: directoryHandle, // Return the handle for later use
        };
      } else {
        // Fallback for browsers that don't support the File System Access API
        // Simulate a folder selection with a mock path
        const mockFolderName = type === 'source' ? 'Source Folder' : 'Destination Folder';
        const mockPath = `/${mockFolderName} (Mock)`;
        
        console.log(`Using mock folder for ${type} as File System Access API is not supported`);
        
        return {
          path: mockPath,
          name: mockFolderName,
        };
      }
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      throw error;
    }
  }
}
