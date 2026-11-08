import fs from 'fs/promises';
import path from 'path';
import { StorageProvider } from './storage-provider';

export class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), 'private-uploads');

  async saveFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filePath = path.join(this.uploadDir, fileName);
    await fs.writeFile(filePath, fileBuffer);
    return fileName;
  }

  async readFile(fileKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, fileKey);
    return await fs.readFile(filePath);
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
    // در حالت لوکال، فایل‌ها از طریق API خودمان پخش می‌شوند
    return `/api/media/${fileKey}`;
  }
}