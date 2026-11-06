// lib/ai/audio-processor.ts
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';

const execFileAsync = promisify(execFile);

/**
 * فایل صوتی را به قطعات ~۱۰ دقیقه‌ای تقسیم می‌کند (فرمت mp3).
 * از transcode استفاده می‌کند چون webm → segment با copy کدک مشکل دارد.
 */
export async function splitAudioIntoChunks(
  inputPath: string,
  outputDir: string
): Promise<string[]> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (!ffmpegPath) {
    throw new Error('FFmpeg binary not found');
  }

  const outputPattern = path.join(outputDir, 'chunk-%03d.mp3');

  const args = [
    '-i', inputPath,
    '-f', 'segment',
    '-segment_time', '600',        // ۶۰۰ ثانیه = ۱۰ دقیقه
    '-c:a', 'libmp3lame',           // transcode به mp3 (نه copy)
    '-b:a', '64k',                  // کیفیت پایین برای حجم کم
    '-vn',                          // حذف ویدیو اگر هست
    '-reset_timestamps', '1',
    outputPattern,
  ];

  try {
    await execFileAsync(ffmpegPath, args, { timeout: 300_000 }); // ۵ دقیقه timeout
  } catch (error: any) {
    console.error('FFmpeg execution error:', error);
    throw new Error('خطا در برش فایل صوتی: ' + (error?.message || 'unknown'));
  }

  const files = fs.readdirSync(outputDir)
    .filter(file => file.startsWith('chunk-') && file.endsWith('.mp3'))
    .map(file => path.join(outputDir, file))
    .sort();

  if (files.length === 0) {
    throw new Error('هیچ قطعه‌ای تولید نشد');
  }

  return files;
}

/**
 * پوشه موقت را پاک می‌کند
 */
export function cleanupDirectory(dirPath: string) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn('cleanupDirectory failed:', err);
  }
}