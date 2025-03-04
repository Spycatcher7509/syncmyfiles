
import React from 'react';
import { SyncStats } from '@/lib/types';

interface SyncStatisticsProps {
  stats: SyncStats | null;
}

const SyncStatistics: React.FC<SyncStatisticsProps> = ({ stats }) => {
  if (!stats) {
    return null;
  }

  // Format bytes into a readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration from milliseconds
  const formatDuration = (ms: number): string => {
    return (ms / 1000).toFixed(2) + 's';
  };

  // Don't show if no files were copied
  if (stats.filesCopied === 0) {
    return null;
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4 mt-4 animate-in animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <h3 className="text-sm font-medium mb-2">Last Move Results</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">Files moved:</span>
          <span className="font-medium">{stats.filesCopied}</span>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">Data transferred:</span>
          <span className="font-medium">{formatBytes(stats.bytesCopied)}</span>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">Duration:</span>
          <span className="font-medium">{formatDuration(stats.duration)}</span>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">Time:</span>
          <span className="font-medium">{new Date(stats.endTime).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default SyncStatistics;
