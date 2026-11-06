import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.filename;

    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

    // ۱. بررسی اینکه آیا این فایل متعلق به کاربر است یا خیر
    const recording = await prisma.recording.findFirst({
      where: { storageKey: filename, userId: session.user.id }
    });
    
    const photo = await prisma.photo.findFirst({
      where: { storageKey: filename, recording: { userId: session.user.id } }
    });

    if (!recording && !photo) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // ۲. خواندن فایل از پوشه خصوصی
    const filePath = path.join(process.cwd(), 'private-uploads', filename);
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      const ext = path.extname(filename).toLowerCase();
      
      let contentType = 'audio/webm';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';

      return new NextResponse(fileBuffer, {
        headers: { 'Content-Type': contentType },
      });
    } catch (err) {
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}