
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
        // Simply inform the user that folder selection isn't supported
        console.error('This browser does not support the File System Access API required for folder selection.');
        
        throw new Error('Folder selection is not supported in this browser. Please use a modern browser like Chrome, Edge, or Opera.');
      }
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      throw error;
    }
  }
}
