
import React from 'react';
import { Button } from '@/components/ui/button';
import { Folder } from 'lucide-react';
import syncService from '@/lib/sync';
import { FolderPicker } from '@/lib/sync/folderPicker';

interface FolderSelectorProps {
  type: 'source' | 'destination';
  path: string;
  onPathChange: (path: string) => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ 
  type, 
  path, 
  onPathChange 
}) => {
  const [isSelecting, setIsSelecting] = React.useState(false);
  const isApiSupported = React.useMemo(() => FolderPicker.isFileSystemAccessApiSupported(), []);
  
  const handleBrowse = async () => {
    try {
      setIsSelecting(true);
      const folderPath = await syncService.browseForFolder(type);
      onPathChange(folderPath.path);
    } catch (error: any) {
      if (error.message !== 'Folder selection cancelled') {
        console.error('Failed to select folder:', error);
      }
    } finally {
      setIsSelecting(false);
    }
  };
  
  return (
    <div className="space-y-3 animate-in animate-fade-in-up" style={{ animationDelay: type === 'source' ? '0ms' : '100ms' }}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          {type === 'source' ? 'Source Folder' : 'Destination Folder'}
        </label>
      </div>
      
      <div className="flex space-x-2">
        <div className="folder-path flex-1 flex items-center rounded-md px-3 py-2 bg-muted/50">
          {path ? (
            <div className="flex items-center space-x-2 truncate">
              <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{path}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">No folder selected</span>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBrowse}
          disabled={isSelecting || !isApiSupported}
          className="flex-shrink-0 transition-all hover:scale-105"
        >
          <Folder className="h-4 w-4 mr-1" />
          Browse
        </Button>
      </div>
      
      {!isApiSupported && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Your browser doesn't support file system access. This app requires the File System Access API.
        </p>
      )}
    </div>
  );
};

export default FolderSelector;
