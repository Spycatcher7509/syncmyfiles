
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

// Add FileSystem Access API types for TypeScript (if not already defined)
declare global {
  interface Window {
    showDirectoryPicker(options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }): Promise<FileSystemDirectoryHandle>;
  }
}
