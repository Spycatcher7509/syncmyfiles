
import { SyncStats } from '../types';
import { FileUtils } from './fileUtils';
import { FileCache } from './fileCache';
import { SyncProvider } from './SyncProvider';
import { MockSyncService } from './MockSyncService';
import { toast } from 'sonner';

export class SyncEngine {
  private fileCache: FileCache = new FileCache();
  private mockService: MockSyncService;
  
  constructor(private syncProvider: SyncProvider) {
    this.mockService = new MockSyncService();
  }
  
  async executeSync(): Promise<SyncStats> {
    if (!this.syncProvider.canSync()) {
      throw new Error('Source and destination folders must be selected first.');
    }
    
    try {
      console.log('Starting sync process...');
      
      // Initialize stats
      let stats: SyncStats;
      
      if (this.syncProvider.isMockModeEnabled()) {
        // Generate mock sync stats for testing
        stats = this.mockService.generateMockSyncStats();
        toast.info('Mock sync completed', {
          description: 'This is a simulated sync. No real files were transferred.',
        });
      } else {
        // Using real file system
        stats = {
          filesCopied: 0,
          bytesCopied: 0,
          startTime: Date.now(),
          endTime: 0,
          duration: 0
        };
        
        // Perform the actual sync
        await FileUtils.syncFolders(
          this.syncProvider.getSourceDirectoryHandle()!,
          this.syncProvider.getDestinationDirectoryHandle()!,
          this.fileCache.getAll(),
          stats
        );
      }
      
      // Complete stats
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      
      console.log('Sync completed successfully', stats);
      return stats;
      
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
  
  clearFileCache(): void {
    this.fileCache.clear();
  }
}
