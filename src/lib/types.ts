export interface FolderPath {
  path: string;
  name: string;
  handle?: FileSystemDirectoryHandle | null; // Only used internally
  isDemo?: boolean; // Indicates if this is demo data
}

export interface SyncSettings {
  sourcePath: string;
  destinationPath: string;
  pollingInterval: number; // in seconds
  isMonitoring: boolean;
}

export type SyncStatus = 'idle' | 'syncing' | 'monitoring' | 'error';

export interface SyncStats {
  filesCopied: number;
  bytesCopied: number;
  startTime: number;
  endTime: number;
  duration: number;
}

// Add FileSystem Access API types for TypeScript (if not already defined)
declare global {
  interface FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory';
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

  // Make this conditional to avoid conflicts with existing declarations
  interface Window {
    showDirectoryPicker?: (options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }) => Promise<FileSystemDirectoryHandle>;
  }
}
