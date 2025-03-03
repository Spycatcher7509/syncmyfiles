
import { SyncStats } from '../types';
import { formatBytes } from './utils';
import { toast } from 'sonner';

export class StatsManager {
  private latestStats: SyncStats | null = null;
  private statsListeners: ((stats: SyncStats | null) => void)[] = [];
  
  setStats(stats: SyncStats): void {
    this.latestStats = stats;
    this.notifyListeners();
  }
  
  getLatestStats(): SyncStats | null {
    return this.latestStats;
  }
  
  addStatsListener(listener: (stats: SyncStats | null) => void): () => void {
    this.statsListeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.statsListeners = this.statsListeners.filter(l => l !== listener);
    };
  }
  
  displaySyncResults(stats: SyncStats): void {
    // Format the bytes into a readable format (KB, MB, etc.)
    const formattedBytes = formatBytes(stats.bytesCopied);
    const duration = (stats.duration / 1000).toFixed(2); // Convert to seconds
    
    // Show a toast with the results
    if (stats.filesCopied > 0) {
      toast.success('Sync completed', {
        description: `Copied ${stats.filesCopied} files (${formattedBytes}) in ${duration}s`,
      });
    } else {
      toast.info('Sync completed', {
        description: 'No files needed to be updated',
      });
    }
  }
  
  private notifyListeners(): void {
    this.statsListeners.forEach(listener => listener(this.latestStats));
  }
}
