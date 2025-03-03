
import React from 'react';
import { Button } from '@/components/ui/button';
import { Folder } from 'lucide-react';
import syncService from '@/lib/syncService';

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
  
  const handleBrowse = async () => {
    try {
      setIsSelecting(true);
      const folderPath = await syncService.browseForFolder(type);
      onPathChange(folderPath.path);
    } catch (error) {
      console.error('Failed to select folder:', error);
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
        <div className="folder-path flex-1 flex items-center">
          {path ? (
            <span className="truncate">{path}</span>
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
    </div>
  );
};

export default FolderSelector;
