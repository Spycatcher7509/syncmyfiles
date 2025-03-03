
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between py-6 animate-fade-in-up">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
          <svg 
            className="w-5 h-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <path d="m12 15 2 2 4-4" />
          </svg>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            File Sync
          </div>
          <h1 className="text-lg font-semibold">FolderWhisper</h1>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Sync your files with simplicity
      </div>
    </header>
  );
};

export default Header;
