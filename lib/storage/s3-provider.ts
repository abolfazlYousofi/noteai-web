// lib/storage/s3-provider.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageProvider, UploadUrlResponse } from './storage-provider';

// این متغیرها باید در فایل .env تعریف شوند
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'default',
  endpoint: process.env.S3_ENDPOINT, // مثلاً https://s3.ir-thr-at1.arvanstorage.ir
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true, // برای سازگاری با آروان/لیارا
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'noteai-uploads';

export class S3StorageProvider implements StorageProvider {
  async getPresignedUploadUrl(fileKey: string, contentType: string): Promise<UploadUrlResponse> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });
    
    // لینک آپلود ۱۵ دقیقه اعتبار دارد
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return { uploadUrl, fileKey };
  }

  async getPresignedDownloadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    
    // لینک دانلود/پخش ۱ ساعت اعتبار دارد
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    await s3Client.send(command);
  }
}