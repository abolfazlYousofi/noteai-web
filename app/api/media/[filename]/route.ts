import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { getStorageProvider } from '@/lib/storage';
import path from 'path'; // فقط برای تشخیص پسوند فایل نیاز است

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.filename;

    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    // ۱. بررسی مالکیت فایل (اصل Complete Mediation)
    const recording = await prisma.recording.findFirst({
      where: { storageKey: filename, userId: session.user.id }
    });
    
    const photo = await prisma.photo.findFirst({
      where: { storageKey: filename, recording: { userId: session.user.id } }
    });

    if (!recording && !photo) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // ۲. خواندن فایل از لایه واسط (استفاده از Storage Provider)
    const storage = getStorageProvider();
    
    try {
      const fileBuffer = await storage.readFile(filename);
      const ext = path.extname(filename).toLowerCase();
      
      let contentType = 'audio/webm';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.mp3') contentType = 'audio/mpeg';
      if (ext === '.m4a') contentType = 'audio/mp4';

            return new NextResponse(new Uint8Array(fileBuffer), {
        headers: { 'Content-Type': contentType },
      });
    } catch (err) {
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Media Read Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}