import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { S3StorageProvider } from '@/lib/storage/s3-provider';
import { z } from 'zod';

const requestSchema = z.object({
  fileType: z.enum(['audio', 'image']),
  contentType: z.string(),
  extension: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: 'اطلاعات نامعتبر' }, { status: 400 });

    const { fileType, contentType, extension } = validation.data;
    
    // ساخت یک نام فایل یکتا
    const fileKey = `${session.user.id}/${fileType}-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    const storageProvider = new S3StorageProvider();
    const result = await storageProvider.getPresignedUploadUrl(fileKey, contentType);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Upload URL Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}