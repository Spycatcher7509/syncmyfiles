
import { SyncSettings } from '../types';

export class SettingsManager {
  private settings: SyncSettings = {
    sourcePath: '',
    destinationPath: '',
    pollingInterval: 5, // default 5 seconds
    isMonitoring: false
  };
  
  setSourcePath(path: string): void {
    this.settings.sourcePath = path;
  }
  
  setDestinationPath(path: string): void {
    this.settings.destinationPath = path;
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
