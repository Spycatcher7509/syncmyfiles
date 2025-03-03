
import { FolderPath, SyncStatus, SyncStats } from '../types';
import { SyncServiceInterface } from './syncServiceInterface';
import { MonitoringService } from './monitoringService';
import { SettingsManager } from './settingsManager';
import { StatusManager } from './statusManager';
import { StatsManager } from './statsManager';
import { SyncProvider } from './SyncProvider';
import { SyncEngine } from './SyncEngine';
import { toast } from 'sonner';

class SyncService implements SyncServiceInterface {
  private syncProvider: SyncProvider;
  private syncEngine: SyncEngine;
  private monitoringService: MonitoringService;
  private settingsManager: SettingsManager;
  private statusManager: StatusManager;
  private statsManager: StatsManager;
  
  constructor() {
    this.settingsManager = new SettingsManager();
    this.statusManager = new StatusManager();
    this.statsManager = new StatsManager();
    this.syncProvider = new SyncProvider();
    this.syncEngine = new SyncEngine(this.syncProvider);
    
    this.monitoringService = new MonitoringService(
      () => this.syncNow(),
      (status) => this.statusManager.setStatus(status),
      () => this.settingsManager.getSettings().pollingInterval
    );
  }
  
  setSourcePath(path: string): void {
    this.settingsManager.setSourcePath(path);
  }
  
  setDestinationPath(path: string): void {
    this.settingsManager.setDestinationPath(path);
  }
  
  setPollingInterval(seconds: number): void {
    this.settingsManager.setPollingInterval(seconds);
    
    // If currently monitoring, restart with new interval
    if (this.settingsManager.getSettings().isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
  
  getSettings() {
    return this.settingsManager.getSettings();
  }
  
  getStatus(): SyncStatus {
    return this.statusManager.getStatus();
  }
  
  getLatestStats(): SyncStats | null {
    return this.statsManager.getLatestStats();
  }
  
  canSync(): boolean {
    return this.syncProvider.canSync();
  }
  
  async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      const folderInfo = await this.syncProvider.browseForFolder(type);
      
      // Set the path in settings
      if (type === 'source') {
        this.setSourcePath(folderInfo.path);
      } else {
        this.setDestinationPath(folderInfo.path);
      }
      
      return folderInfo;
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      throw error;
    }
  }
  
  async syncNow(): Promise<void> {
    if (!this.canSync()) {
      this.statusManager.setStatus('error');
      console.error('Source and destination folders must be selected');
      toast.error('Cannot sync', {
        description: 'Source and destination folders must be selected first.',
      });
      return;
    }
    
    try {
      this.statusManager.setStatus('syncing');
      
      // Clear file cache on manual sync to force a full sync
      if (!this.settingsManager.getSettings().isMonitoring) {
        this.syncEngine.clearFileCache();
      }
      
      // Execute the sync operation
      const stats = await this.syncEngine.executeSync();
      
      // Store and display the results
      this.statsManager.setStats(stats);
      this.statsManager.displaySyncResults(stats);
      
      // If we're not monitoring, return to idle after sync
      const settings = this.settingsManager.getSettings();
      if (!settings.isMonitoring) {
        this.statusManager.setStatus('idle');
      } else {
        this.statusManager.setStatus('monitoring');
      }
      
    } catch (error) {
      this.statusManager.setStatus('error');
      console.error('Sync failed:', error);
      toast.error('Sync failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
  
  startMonitoring(): void {
    if (!this.canSync()) {
      this.statusManager.setStatus('error');
      console.error('Source and destination folders must be selected');
      toast.error('Cannot start monitoring', {
        description: 'Source and destination folders must be selected first.',
      });
      return;
    }
    
    this.settingsManager.setMonitoring(true);
    this.monitoringService.startMonitoring();
    toast.success('Monitoring started', {
      description: `Checking for changes every ${this.settingsManager.getSettings().pollingInterval} seconds`,
    });
  }
  
  stopMonitoring(): void {
    this.monitoringService.stopMonitoring();
    this.settingsManager.setMonitoring(false);
    this.statusManager.setStatus('idle');
    toast.info('Monitoring stopped', {
      description: 'No longer checking for changes',
    });
  }
  
  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    return this.statusManager.addStatusListener(listener);
  }
  
  addStatsListener(listener: (stats: SyncStats | null) => void): () => void {
    return this.statsManager.addStatsListener(listener);
  }
}

// Singleton instance
const syncService = new SyncService();
export default syncService;
