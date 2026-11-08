import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { StorageProvider } from './storage-provider';
import { encryptBuffer, decryptBuffer } from '@/lib/security/encryption';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'default',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'noteai-uploads';

export class S3StorageProvider implements StorageProvider {
  async saveFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    // رمزنگاری قبل از آپلود
    const encryptedBuffer = encryptBuffer(fileBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: encryptedBuffer,
    });
    
    await s3Client.send(command);
    return fileName;
  }

  async readFile(fileKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    
    const response = await s3Client.send(command);
    if (!response.Body) throw new Error('File not found on S3');
    
    const byteArray = await response.Body.transformToByteArray();
    const encryptedBuffer = Buffer.from(byteArray);

    // رمزگشایی هنگام دانلود
    return decryptBuffer(encryptedBuffer);
  }

  async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });
    await s3Client.send(command);
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    return `/api/media/${fileKey}`;
  }
}