
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Folder, AlertCircle, Info } from 'lucide-react';
import syncService from '@/lib/sync';
import { FolderPicker } from '@/lib/sync/folderPicker';
import { toast } from 'sonner';

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
  const [apiSupport, setApiSupport] = useState<{
    isSupported: boolean;
    reason?: string;
    checked: boolean;
  }>({ isSupported: false, checked: false });
  
  // Check API support on component mount
  useEffect(() => {
    const supportStatus = FolderPicker.checkAndNotifyApiSupport();
    setApiSupport({
      ...supportStatus,
      checked: true
    });
  }, []);
  
  const handleBrowse = async () => {
    try {
      setIsSelecting(true);
      const folderPath = await syncService.browseForFolder(type);
      onPathChange(folderPath.path);
      
      if (folderPath.isDemo) {
        toast.info('Demo mode active', {
          description: 'Using simulated folder paths for demonstration',
        });
      }
    } catch (error: any) {
      if (error.message !== 'Folder selection cancelled') {
        console.error('Failed to select folder:', error);
      }
    } finally {
      setIsSelecting(false);
    }
  };
  
  const renderApiSupportMessage = () => {
    if (!apiSupport.checked) return null;
    
    if (!apiSupport.isSupported) {
      let message = 'Your browser doesn\'t support file system access.';
      let icon = <AlertCircle className="h-4 w-4 text-red-500 mr-1" />;
      
      if (apiSupport.reason === 'iframe') {
        message = 'Running in an iframe - using demo mode instead.';
        icon = <Info className="h-4 w-4 text-amber-500 mr-1" />;
      } else if (apiSupport.reason === 'insecure_context') {
        message = 'File System Access requires HTTPS or localhost.';
      }
      
      return (
        <div className="flex items-center text-xs mt-2 text-red-600 dark:text-red-400">
          {icon}
          <span>{message}</span>
        </div>
      );
    }
    
    return null;
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
          disabled={isSelecting || (!apiSupport.isSupported && apiSupport.reason !== 'iframe')}
          className="flex-shrink-0 transition-all hover:scale-105"
          title={!apiSupport.isSupported && apiSupport.reason !== 'iframe' ? 
            'Your browser doesn\'t support the File System Access API' : 
            'Browse for a folder'}
        >
          <Folder className="h-4 w-4 mr-1" />
          Browse
        </Button>
      </div>
      
      {renderApiSupportMessage()}
    </div>
  );
};

export default FolderSelector;
