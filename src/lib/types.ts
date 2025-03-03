
export interface FolderPath {
  path: string;
  name: string;
}

export interface SyncSettings {
  sourcePath: string;
  destinationPath: string;
  pollingInterval: number; // in seconds
  isMonitoring: boolean;
}

export type SyncStatus = 'idle' | 'syncing' | 'monitoring' | 'error';
