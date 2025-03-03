
import React from 'react';
import { Button } from '@/components/ui/button';
import { Folder, FolderArchive } from 'lucide-react';
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
  const isMockMode = React.useMemo(() => !FolderPicker.isFileSystemAccessApiSupported(), []);
  
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
  
  const isMockPath = path && path.includes('(Mock)');
  
  return (
    <div className="space-y-3 animate-in animate-fade-in-up" style={{ animationDelay: type === 'source' ? '0ms' : '100ms' }}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          {type === 'source' ? 'Source Folder' : 'Destination Folder'}
        </label>
      </div>
      
      <div className="flex space-x-2">
        <div className={`folder-path flex-1 flex items-center rounded-md px-3 py-2 ${isMockPath ? 'bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-muted/50'}`}>
          {path ? (
            <div className="flex items-center space-x-2 truncate">
              {isMockPath ? (
                <FolderArchive className="h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              ) : (
                <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              )}
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
          disabled={isSelecting}
          className="flex-shrink-0 transition-all hover:scale-105"
        >
          <Folder className="h-4 w-4 mr-1" />
          Browse
        </Button>
      </div>
      
      {isMockMode && !path && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400">
          Your browser doesn't support file system access. Mock folders will be used instead.
        </p>
      )}
    </div>
  );
};

export default FolderSelector;
