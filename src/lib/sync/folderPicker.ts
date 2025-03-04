
import { FolderPath } from '../types';
import { toast } from 'sonner';

export class FolderPicker {
  static isFileSystemAccessApiSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }
  
  static isRunningInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      // If we can't access window.top due to security restrictions,
      // we're definitely in an iframe
      return true;
    }
  }

  static checkAndNotifyApiSupport(): { isSupported: boolean; reason?: string } {
    // Check if running in an iframe first - some browsers block the API in iframes
    if (this.isRunningInIframe()) {
      toast.info('Running in iframe mode', {
        description: 'File system access is limited in iframes. Using demo mode.',
        duration: 5000,
      });
      return { 
        isSupported: false, 
        reason: 'iframe' 
      };
    }

    // Check for API support
    if (!this.isFileSystemAccessApiSupported()) {
      toast.error('Browser not supported', {
        description: 'Your browser doesn\'t support the File System Access API. Try using Chrome, Edge, or Opera.',
        duration: 8000,
      });
      return { 
        isSupported: false, 
        reason: 'api_unavailable' 
      };
    }

    // Additional check for secure context (HTTPS or localhost)
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      toast.error('Insecure context', {
        description: 'File System Access API requires HTTPS or localhost. Your connection is not secure.',
        duration: 8000,
      });
      return { 
        isSupported: false, 
        reason: 'insecure_context' 
      };
    }

    return { isSupported: true };
  }
  
  static async browseForFolder(type: 'source' | 'destination'): Promise<FolderPath> {
    try {
      // Check if running in an iframe
      if (FolderPicker.isRunningInIframe()) {
        console.log('Running in iframe, using demo folder data');
        
        // Return mock folder data when in an iframe
        return {
          path: type === 'source' ? '/Documents/SourceFolder' : '/Documents/DestinationFolder',
          name: type === 'source' ? 'SourceFolder' : 'DestinationFolder',
          // We'll still return a handle for type safety, but it won't be used
          handle: null,
          isDemo: true
        };
      }
      
      // Check if File System Access API is supported
      if (!FolderPicker.isFileSystemAccessApiSupported()) {
        console.log('File System Access API is not supported by this browser');
        throw new Error('Your browser does not support the File System Access API required for this app');
      }
      
      // Use the File System Access API to let the user select a directory
      const directoryHandle = await window.showDirectoryPicker({
        id: type === 'source' ? 'source-directory' : 'destination-directory',
        mode: 'readwrite',
      });
      
      // Get the folder name from the handle
      const folderName = directoryHandle.name;
      
      // For better UX, we'll show a more complete path
      // This is just a representation since browser security doesn't give us the full path
      const folderPath = `/${folderName}`;
      
      console.log(`Selected ${type} folder:`, folderPath);
      
      return {
        path: folderPath,
        name: folderName,
        handle: directoryHandle, // Return the handle for later use
        isDemo: false
      };
    } catch (error: any) {
      // Handle user cancellation separately from other errors
      if (error.name === 'AbortError') {
        console.log('Folder selection was cancelled by the user');
        throw new Error('Folder selection cancelled');
      }
      
      console.error(`Error selecting ${type} folder:`, error);
      toast.error(`Failed to select folder: ${error.message || 'Unknown error'}`);
      throw error;
    }
  }
}
