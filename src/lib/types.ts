
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
  interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    kind: 'file';
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: 'directory';
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    entries(): AsyncIterable<[string, FileSystemHandle]>;
  }

  interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
  }

  interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
  }

  interface Window {
    showDirectoryPicker(options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }): Promise<FileSystemDirectoryHandle>;
  }
}
