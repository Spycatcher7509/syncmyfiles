
import { SyncSettings } from '../types';

export class SettingsManager {
  private settings: SyncSettings = {
    sourcePath: '',
    destinationPath: '',
    pollingInterval: 5, // default 5 seconds
    isMonitoring: false
  };
  
  constructor() {
    // Load settings from localStorage if available
    this.loadFromStorage();
  }

  setSourcePath(path: string): void {
    this.settings.sourcePath = path;
    this.saveToStorage();
  }
  
  setDestinationPath(path: string): void {
    this.settings.destinationPath = path;
    this.saveToStorage();
  }
  
  setPollingInterval(seconds: number): void {
    this.settings.pollingInterval = seconds;
    this.saveToStorage();
  }
  
  setMonitoring(isMonitoring: boolean): void {
    this.settings.isMonitoring = isMonitoring;
    this.saveToStorage();
  }
  
  getSettings(): SyncSettings {
    return { ...this.settings };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('folderWhisper_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const savedSettings = localStorage.getItem('folderWhisper_settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
      
      // Set default source path if not already set
      if (!this.settings.sourcePath) {
        this.settings.sourcePath = '/Users/dassgehtdichnichtan/syncmyfiles';
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
  }
}
