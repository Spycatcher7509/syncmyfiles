
import { SyncStatus } from '../types';

export class MonitoringService {
  private monitoringInterval: number | null = null;
  
  constructor(
    private syncFn: () => Promise<void>,
    private setStatus: (status: SyncStatus) => void,
    private getIntervalSeconds: () => number
  ) {}
  
  startMonitoring(): void {
    // Clear existing interval if any
    this.stopMonitoring();
    
    this.setStatus('monitoring');
    
    // Initial sync
    this.syncFn();
    
    // Set up new monitoring interval
    this.monitoringInterval = window.setInterval(() => {
      console.log('Checking for changes...');
      this.syncFn();
    }, this.getIntervalSeconds() * 1000);
  }
  
  stopMonitoring(): void {
    if (this.monitoringInterval !== null) {
      window.clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  isMonitoring(): boolean {
    return this.monitoringInterval !== null;
  }
}
