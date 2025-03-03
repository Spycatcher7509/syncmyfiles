
import { SyncStats } from '../types';
import { FileInfo } from './fileCache';
import { logService } from './logService';

export class FileUtils {
  static async syncFile(
    sourceDir: FileSystemDirectoryHandle,
    destDir: FileSystemDirectoryHandle,
    fileName: string,
    filePath: string,
    fileCache: Map<string, FileInfo>,
    stats: SyncStats
  ): Promise<void> {
    try {
      // Get the file handle from the source directory
      const sourceFileHandle = await sourceDir.getFileHandle(fileName);
      const sourceFile = await sourceFileHandle.getFile();
      
      // Check if the file has changed using the cache
      const fileKey = filePath;
      const cachedInfo = fileCache.get(fileKey);
      const currentInfo = {
        lastModified: sourceFile.lastModified,
        size: sourceFile.size
      };
      
      // Skip if the file hasn't changed
      if (cachedInfo && 
          cachedInfo.lastModified === currentInfo.lastModified && 
          cachedInfo.size === currentInfo.size) {
        return;
      }
      
      // Update the cache
      fileCache.set(fileKey, currentInfo);
      
      // Log the file operation start
      logService.log('info', 'Starting file move operation', filePath);
      
      // Read the source file
      const fileData = await sourceFile.arrayBuffer();
      
      // Create or overwrite the file in the destination directory
      let destFileHandle: FileSystemFileHandle;
      try {
        destFileHandle = await destDir.getFileHandle(fileName);
      } catch (error) {
        // File doesn't exist, create it
        destFileHandle = await destDir.getFileHandle(fileName, { create: true });
      }
      
      // Get a writable stream to the destination file
      const writable = await destFileHandle.createWritable();
      
      // Write the file data
      await writable.write(fileData);
      await writable.close();
      
      // After successful write to destination, remove the file from source
      // This is the new part that changes copying to moving
      try {
        // We need to use the removeEntry method on the parent directory
        await sourceDir.removeEntry(fileName);
        logService.log('move', 'File successfully moved', filePath);
      } catch (error) {
        logService.log('error', 'Error removing source file after copy', filePath, error);
        // We don't throw here because the file was already copied successfully
        // Just log the error and continue
      }
      
      // Update statistics
      stats.filesCopied++;
      stats.bytesCopied += sourceFile.size;
    } catch (error) {
      logService.log('error', 'Error during file move operation', filePath, error);
      console.error(`Error syncing file ${filePath}:`, error);
      throw error;
    }
  }

  static async syncFolders(
    sourceDir: FileSystemDirectoryHandle,
    destDir: FileSystemDirectoryHandle,
    fileCache: Map<string, FileInfo>,
    stats: SyncStats,
    subPath: string = ""
  ): Promise<void> {
    if (!sourceDir || !destDir) {
      console.log('Using mock mode for folder sync');
      return;
    }
    
    // Get all entries from the source directory
    for await (const [name, entry] of sourceDir.entries()) {
      const entryPath = subPath ? `${subPath}/${name}` : name;
      
      if (entry.kind === 'file') {
        await FileUtils.syncFile(sourceDir, destDir, name, entryPath, fileCache, stats);
      } else if (entry.kind === 'directory') {
        // Create the corresponding directory in the destination if it doesn't exist
        let destSubDir: FileSystemDirectoryHandle;
        try {
          destSubDir = await destDir.getDirectoryHandle(name);
        } catch (error) {
          // Directory doesn't exist, create it
          destSubDir = await destDir.getDirectoryHandle(name, { create: true });
        }
        
        // Recursively sync subdirectories
        const sourceSubDir = await sourceDir.getDirectoryHandle(name);
        await FileUtils.syncFolders(sourceSubDir, destSubDir, fileCache, stats, entryPath);
      }
    }
  }
}
