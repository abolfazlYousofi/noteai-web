import crypto from 'crypto';

// دریافت کلید از فایل .env
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
// تبدیل کلید به بافر ۳۲ بایتی (برای AES-256)
const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

/**
 * رمزنگاری یک فایل (بافر)
 */
export function encryptBuffer(buffer: Buffer): Buffer {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is not set in .env');

  // تولید IV تصادفی برای هر فایل (بسیار مهم برای امنیت)
  const iv = crypto.randomBytes(12);
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  
  // گرفتن Authentication Tag (برای تشخیص دستکاری فایل)
  const authTag = cipher.getAuthTag();

  // ساختار نهایی: [IV (12 bytes)] + [Auth Tag (16 bytes)] + [Encrypted Data]
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * رمزگشایی یک فایل (بافر)
 */
export function decryptBuffer(encryptedBuffer: Buffer): Buffer {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is not set in .env');

  // جدا کردن اجزای فایل
  const iv = encryptedBuffer.subarray(0, 12);
  const authTag = encryptedBuffer.subarray(12, 28);
  const encryptedData = encryptedBuffer.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  // رمزگشایی
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}