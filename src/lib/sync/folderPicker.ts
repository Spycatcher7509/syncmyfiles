
import { FolderPath } from '../types';

export class FolderPicker {
  private static mockFolderCounter = 0;
  
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
        // Provide realistic mock paths for testing
        FolderPicker.mockFolderCounter++;
        
        // Create different mock paths based on the folder type
        let mockPath, mockName;
        if (type === 'source') {
          mockName = `Documents_${FolderPicker.mockFolderCounter}`;
          mockPath = `/Users/mockuser/${mockName}`;
        } else {
          mockName = `Backup_${FolderPicker.mockFolderCounter}`;
          mockPath = `/Users/mockuser/${mockName}`;
        }
        
        console.log(`Using mock folder path for ${type}: ${mockPath}`);
        
        return {
          path: mockPath,
          name: mockName,
          // No handle in mock mode
        };
      }
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      throw error;
    }
  }
}
