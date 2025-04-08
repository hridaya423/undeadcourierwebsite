import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  
  if (!platform) {
    return NextResponse.json({ error: 'No platform specified' }, { status: 400 });
  }
  
  try {
    const platformData: Record<string, { url: string, size: string, filename: string, version: string }> = {
      'windows': {
        url: 'https://github.com/hridaya423/undeadcourierwebsite/releases/download/windows/windows.zip',
        size: '257 MB',
        filename: 'windows.zip',
        version: 'v0.8'
      },
      'mac': {
        url: 'https://github.com/hridaya423/undeadcourierwebsite/releases/download/mac/mac.zip',
        size: '268 MB',
        filename: 'mac.zip',
        version: 'v0.8'
      },
      'linux': {
        url: 'https://github.com/hridaya423/undeadcourierwebsite/releases/download/linux/linux.zip',
        size: '259 MB',
        filename: 'linux.zip',
        version: 'v0.8'
      }
    };
    
    const platformInfo = platformData[platform.toLowerCase()];
    
    if (!platformInfo) {
      return NextResponse.json({ error: `No ${platform} download information available` }, { status: 404 });
    }
    
    return NextResponse.json({
      size: platformInfo.size,
      url: platformInfo.url,
      version: platformInfo.version,
      filename: platformInfo.filename
    });
  } catch (error) {
    console.error('Error processing download information:', error);
    return NextResponse.json({ error: 'Failed to get download information' }, { status: 500 });
  }
}
