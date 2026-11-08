import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from './storage-provider';
import { encryptBuffer, decryptBuffer } from '@/lib/security/encryption';

export class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), 'private-uploads');

  async saveFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, fileName);
    
    // رمزنگاری قبل از ذخیره
    const encryptedBuffer = encryptBuffer(fileBuffer);
    await fs.writeFile(filePath, encryptedBuffer);
    
    return fileName;
  }

  async readFile(fileKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, fileKey);
    const encryptedBuffer = await fs.readFile(filePath);
    
    // رمزگشایی هنگام خواندن
    return decryptBuffer(encryptedBuffer);
  }

  async deleteFile(fileKey: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, fileKey);
      await fs.unlink(filePath);
    } catch (e) {
      console.warn(`File not found for delete: ${fileKey}`);
    }
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    return `/api/media/${fileKey}`;
  }
}