
import { FolderPath, SyncStats } from '../types';
import { generateMockSyncStats } from './utils';
import { FolderPicker } from './folderPicker';
import { toast } from 'sonner';

export class MockSyncService {
  private mockFolderCounter = 0;
  
  isMockModeAvailable(): boolean {
    return !FolderPicker.isFileSystemAccessApiSupported();
  }
  
  generateMockFolderPath(type: 'source' | 'destination'): FolderPath {
    this.mockFolderCounter++;
    
    // Create different mock paths based on the folder type
    let mockPath, mockName;
    if (type === 'source') {
      mockName = `Documents_${this.mockFolderCounter}`;
      mockPath = `/Source Folder (Mock)`;
    } else {
      mockName = `Backup_${this.mockFolderCounter}`;
      mockPath = `/Destination Folder (Mock)`;
    }
    
    // Notify user they're in mock mode
    if (this.mockFolderCounter <= 2) { // Only show once for source and once for destination
      toast.info("Using mock mode", {
        description: "Your browser doesn't support the File System Access API. Using simulated folders instead.",
        duration: 5000,
      });
    }
    
    console.log(`Using mock folder path for ${type}: ${mockPath}`);
    
    return {
      path: mockPath,
      name: mockName,
      // No handle in mock mode
    };
  }
  
  generateMockSyncStats(): SyncStats {
    return generateMockSyncStats();
  }
}
