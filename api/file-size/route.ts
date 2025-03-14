import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filename = searchParams.get('file');
  
  if (!filename) {
    return NextResponse.json({ error: 'No file specified' }, { status: 400 });
  }
  
  try {
    // Path to the downloads directory in the public folder
    const filePath = path.join(process.cwd(), 'public', 'downloads', filename);
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    
    // Convert bytes to more readable format
    let fileSize: string;
    if (fileSizeInBytes < 1024) {
      fileSize = `${fileSizeInBytes} B`;
    } else if (fileSizeInBytes < 1024 * 1024) {
      fileSize = `${(fileSizeInBytes / 1024).toFixed(1)} KB`;
    } else if (fileSizeInBytes < 1024 * 1024 * 1024) {
      fileSize = `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      fileSize = `${(fileSizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    
    return NextResponse.json({ size: fileSize });
  } catch (error) {
    console.error('Error getting file size:', error);
    return NextResponse.json({ error: 'Failed to get file size' }, { status: 500 });
  }
}