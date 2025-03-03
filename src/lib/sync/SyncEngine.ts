
import { SyncStats } from '../types';
import { FileUtils } from './fileUtils';
import { FileCache } from './fileCache';
import { SyncProvider } from './SyncProvider';
import { toast } from 'sonner';

export class SyncEngine {
  private fileCache: FileCache = new FileCache();
  private demoStats: SyncStats = {
    filesCopied: 0,
    bytesCopied: 0,
    startTime: 0,
    endTime: 0,
    duration: 0
  };
  
  constructor(private syncProvider: SyncProvider) {}
  
  async executeSync(): Promise<SyncStats> {
    if (!this.syncProvider.canSync()) {
      throw new Error('Source and destination folders must be selected first.');
    }
    
    try {
      console.log('Starting sync process...');
      
      // Check if we're in demo mode
      if (this.syncProvider.isInDemoMode()) {
        return this.executeDemoSync();
      }
      
      // Initialize real sync stats
      const stats: SyncStats = {
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
  
  // Simulate a sync operation for demo mode
  private async executeDemoSync(): Promise<SyncStats> {
    console.log('Executing demo sync');
    
    // Create a delay to simulate sync operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update demo stats to show some progress each time
    this.demoStats = {
      filesCopied: this.demoStats.filesCopied + Math.floor(Math.random() * 5) + 1,
      bytesCopied: this.demoStats.bytesCopied + Math.floor(Math.random() * 1024 * 1024 * 10),
      startTime: Date.now() - 1500,
      endTime: Date.now(),
      duration: 1500
    };
    
    console.log('Demo sync completed', this.demoStats);
    return { ...this.demoStats };
  }
  
  clearFileCache(): void {
    this.fileCache.clear();
  }
}
