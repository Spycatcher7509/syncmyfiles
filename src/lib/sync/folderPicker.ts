
import { FolderPath } from '../types';

export class FolderPicker {
  static async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
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
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      throw error;
    }
  }
}
