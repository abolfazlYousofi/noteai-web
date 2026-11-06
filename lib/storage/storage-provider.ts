// lib/storage/storage-provider.ts
export interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface StorageProvider {
  // دریافت لینک برای آپلود مستقیم
  getPresignedUploadUrl(fileKey: string, contentType: string): Promise<UploadUrlResponse>;
  // دریافت لینک برای دانلود (پخش صدا)
  getPresignedDownloadUrl(fileKey: string): Promise<string>;
  // حذف فایل
  deleteFile(fileKey: string): Promise<void>;
}