
import { SyncStats } from '../types';

export interface LogEntry {
  action: 'move' | 'error' | 'info' | 'monitor_start' | 'monitor_stop';
  timestamp: number;
  details: string;
  path?: string;
  error?: string;
  stats?: Partial<SyncStats>;
}

export class LogService {
  private logs: LogEntry[] = [];
  private maxLogEntries: number = 100;
  private logListeners: ((logs: LogEntry[]) => void)[] = [];
  
  constructor() {
    // Initialize with a startup log
    this.log('info', 'Application started');
  }
  
  log(action: LogEntry['action'], details: string, path?: string, error?: any, stats?: Partial<SyncStats>): void {
    const entry: LogEntry = {
      action,
      timestamp: Date.now(),
      details,
      path,
      error: error ? (error.message || String(error)) : undefined,
      stats
    };
    
    // Add to the beginning of the array for most recent first
    this.logs.unshift(entry);
    
    // Limit log size
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(0, this.maxLogEntries);
    }
    
    // Also log to console for development
    console.log(`[${action.toUpperCase()}] ${details}${path ? ` - ${path}` : ''}${error ? ` - Error: ${entry.error}` : ''}`);
    
    // Notify listeners
    this.notifyListeners();
  }
  
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  clearLogs(): void {
    this.logs = [];
    this.log('info', 'Logs cleared');
  }
  
  addLogListener(listener: (logs: LogEntry[]) => void): () => void {
    this.logListeners.push(listener);
    
    // Return function to remove listener
    return () => {
      this.logListeners = this.logListeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    this.logListeners.forEach(listener => listener([...this.logs]));
  }
}

// Create a singleton instance
export const logService = new LogService();
