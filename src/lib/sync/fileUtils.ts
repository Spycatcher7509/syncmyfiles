
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
        logService.log('info', 'File unchanged, skipping', filePath);
        return;
      }
      
      // Update the cache
      fileCache.set(fileKey, currentInfo);
      
      // Log the file operation start
      logService.log('info', 'Starting file move operation', filePath);
      
      // Read the source file
      const fileData = await sourceFile.arrayBuffer();
      
      // Check if the file already exists in the destination directory
      let destFileHandle: FileSystemFileHandle;
      let fileExists = false;
      try {
        destFileHandle = await destDir.getFileHandle(fileName);
        fileExists = true;
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
      try {
        console.log(`Attempting to remove source file: ${fileName}`);
        // Use the removeEntry method on the parent directory
        await sourceDir.removeEntry(fileName);
        console.log(`Source file ${fileName} removed successfully`);
        logService.log('move', 'File successfully moved', filePath);
        
        // Update statistics
        stats.filesCopied++;
        stats.bytesCopied += sourceFile.size;
      } catch (error) {
        console.error(`Error removing source file ${fileName}:`, error);
        logService.log('error', 'Error removing source file after copy', filePath, error);
        
        // Since we failed to remove the source file, still count it as a copy
        stats.filesCopied++;
        stats.bytesCopied += sourceFile.size;
      }
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
    
    console.log(`Syncing folder: ${subPath || 'root'}`);
    
    try {
      // Get all entries from the source directory
      for await (const [name, entry] of sourceDir.entries()) {
        const entryPath = subPath ? `${subPath}/${name}` : name;
        
        try {
          if (entry.kind === 'file') {
            await FileUtils.syncFile(sourceDir, destDir, name, entryPath, fileCache, stats);
          } else if (entry.kind === 'directory') {
            // Create the corresponding directory in the destination if it doesn't exist
            let destSubDir: FileSystemDirectoryHandle;
            try {
              destSubDir = await destDir.getDirectoryHandle(name);
            } catch (error) {
              // Directory doesn't exist, create it
              console.log(`Creating directory in destination: ${entryPath}`);
              destSubDir = await destDir.getDirectoryHandle(name, { create: true });
            }
            
            // Recursively sync subdirectories
            const sourceSubDir = await sourceDir.getDirectoryHandle(name);
            await FileUtils.syncFolders(sourceSubDir, destSubDir, fileCache, stats, entryPath);
            
            // After all files in the directory have been moved, try to remove the empty directory
            try {
              // Check if directory is empty before attempting to remove it
              let isEmpty = true;
              for await (const _ of sourceSubDir.entries()) {
                isEmpty = false;
                break;
              }
              
              if (isEmpty) {
                console.log(`Removing empty source directory: ${entryPath}`);
                await sourceDir.removeEntry(name);
                logService.log('info', 'Empty directory removed', entryPath);
              } else {
                console.log(`Directory not empty, skipping removal: ${entryPath}`);
                logService.log('info', 'Directory not empty, skipping removal', entryPath);
              }
            } catch (error) {
              console.error(`Error checking/removing source directory ${entryPath}:`, error);
              logService.log('error', 'Error checking/removing source directory', entryPath, error);
            }
          }
        } catch (error) {
          // Log the error but continue with other files/directories
          console.error(`Error processing ${entryPath}:`, error);
          logService.log('error', `Error processing entry: ${error instanceof Error ? error.message : 'Unknown error'}`, entryPath);
          // Don't throw here to allow other files to be processed
        }
      }
    } catch (error) {
      console.error(`Error syncing folder ${subPath || 'root'}:`, error);
      logService.log('error', 'Error syncing folder', subPath || 'root', error);
      throw error;
    }
  }
}
