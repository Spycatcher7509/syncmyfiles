
import { SyncSettings } from '../types';

export class SettingsManager {
  private settings: SyncSettings = {
    sourcePath: '',
    destinationPath: '',
    pollingInterval: 5, // default 5 seconds
    isMonitoring: false
  };
  
  setSourcePath(path: string): void {
    // Remove any (Mock) indicators if they exist for backward compatibility
    this.settings.sourcePath = path.replace(' (Mock)', '');
  }
  
  setDestinationPath(path: string): void {
    // Remove any (Mock) indicators if they exist for backward compatibility
    this.settings.destinationPath = path.replace(' (Mock)', '');
  }
  
  setPollingInterval(seconds: number): void {
    this.settings.pollingInterval = seconds;
  }
  
  setMonitoring(isMonitoring: boolean): void {
    this.settings.isMonitoring = isMonitoring;
  }
  
  getSettings(): SyncSettings {
    return { ...this.settings };
  }
}
