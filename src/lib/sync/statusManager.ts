
import { SyncStatus } from '../types';

export class StatusManager {
  private status: SyncStatus = 'idle';
  private listeners: ((status: SyncStatus) => void)[] = [];
  
  setStatus(status: SyncStatus): void {
    this.status = status;
    this.notifyListeners();
  }
  
  getStatus(): SyncStatus {
    return this.status;
  }
  
  addStatusListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.status));
  }
}
