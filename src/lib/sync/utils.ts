
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function mockSyncOperation(stats: any): Promise<void> {
  // Simulate some delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate copying files with random data
  const numFiles = Math.floor(Math.random() * 5) + 1; // 1-5 files
  const sizePerFile = Math.floor(Math.random() * 500000) + 50000; // 50KB - 500KB per file
  
  stats.filesCopied = numFiles;
  stats.bytesCopied = numFiles * sizePerFile;
  
  console.log(`Mock sync completed. Simulated copying ${numFiles} files.`);
}
