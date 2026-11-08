export interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface StorageProvider {
  // ذخیره فایل و برگرداندن نام آن (Key)
  saveFile(fileBuffer: Buffer, fileName: string): Promise<string>;
  // خواندن فایل (برای ارسال به Whisper یا پخش در صفحه)
  readFile(fileKey: string): Promise<Buffer>;
  // حذف فایل
  deleteFile(fileKey: string): Promise<void>;
  // دریافت لینک دانلود (برای S3 کاربرد دارد، در لوکال API ما این کار را می‌کند)
  getDownloadUrl(fileKey: string): Promise<string>;
}