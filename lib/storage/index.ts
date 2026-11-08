import { StorageProvider } from './storage-provider';
import { LocalStorageProvider } from './local-provider';
// import { S3StorageProvider } from './s3-provider'; // وقتی S3 را ست کردیم آنکامنت می‌کنیم

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 's3') {
    // return new S3StorageProvider();
    throw new Error('S3 Provider not fully implemented yet');
  }

  return new LocalStorageProvider();
}