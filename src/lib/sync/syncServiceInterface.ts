
import { FolderPath, SyncSettings, SyncStatus, SyncStats } from '../types';

export interface SyncServiceInterface {
  setSourcePath(path: string): void;
  setDestinationPath(path: string): void;
  setPollingInterval(seconds: number): void;
  getSettings(): SyncSettings;
  getStatus(): SyncStatus;
  getLatestStats(): SyncStats | null;
  canSync(): boolean;
  browseForFolder(type: 'source' | 'destination'): Promise<FolderPath>;
  syncNow(): Promise<void>;
  startMonitoring(): void;
  stopMonitoring(): void;
  addStatusListener(listener: (status: SyncStatus) => void): () => void;
  addStatsListener(listener: (stats: SyncStats | null) => void): () => void;
}
