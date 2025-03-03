
import { FolderPath, SyncStats } from '../types';
import { generateMockSyncStats } from './utils';

export class MockSyncService {
  private mockFolderCounter = 0;
  
  isMockModeAvailable(): boolean {
    return typeof window.showDirectoryPicker !== 'function';
  }
  
  generateMockFolderPath(type: 'source' | 'destination'): FolderPath {
    this.mockFolderCounter++;
    
    // Create different mock paths based on the folder type
    let mockPath, mockName;
    if (type === 'source') {
      mockName = `Documents_${this.mockFolderCounter}`;
      mockPath = `/Users/mockuser/${mockName}`;
    } else {
      mockName = `Backup_${this.mockFolderCounter}`;
      mockPath = `/Users/mockuser/${mockName}`;
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
