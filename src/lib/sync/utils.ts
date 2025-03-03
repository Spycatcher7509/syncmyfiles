
import { SyncStats } from '../types';

export function generateMockSyncStats(): SyncStats {
  // Generate random but realistic mock sync stats
  const filesCopied = Math.floor(Math.random() * 50) + 5; // Between 5 and 55 files
  const averageFileSize = Math.floor(Math.random() * 500000) + 10000; // 10KB to 510KB average
  const bytesCopied = filesCopied * averageFileSize;
  const startTime = Date.now() - Math.floor(Math.random() * 10000); // Started 0-10 seconds ago
  
  return {
    filesCopied,
    bytesCopied,
    startTime,
    endTime: 0, // Will be set by syncNow
    duration: 0  // Will be calculated by syncNow
  };
}

// Add any other utility functions here
