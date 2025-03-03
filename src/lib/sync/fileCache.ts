
import { SyncStats } from '../types';

export interface FileInfo {
  lastModified: number;
  size: number;
}

export class FileCache {
  private cache: Map<string, FileInfo> = new Map();

  clear(): void {
    this.cache.clear();
  }

  get(fileKey: string): FileInfo | undefined {
    return this.cache.get(fileKey);
  }

  set(fileKey: string, info: FileInfo): void {
    this.cache.set(fileKey, info);
  }

  has(fileKey: string): boolean {
    return this.cache.has(fileKey);
  }

  getAll(): Map<string, FileInfo> {
    return this.cache;
  }
}
