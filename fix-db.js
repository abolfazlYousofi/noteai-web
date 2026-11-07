const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// خواندن فایل .env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    console.error("❌ TURSO_DATABASE_URL در فایل .env پیدا نشد.");
    return;
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log("⏳ در حال اتصال به دیتابیس و اعمال تغییرات...");

  // مرحله ۱: اضافه کردن ستون به صورت معمولی
  try {
    await client.execute("ALTER TABLE notes ADD COLUMN share_token TEXT;");
    console.log("✅ ستون share_token با موفقیت اضافه شد.");
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log("ℹ️ ستون share_token از قبل وجود داشت.");
    } else {
      console.error("❌ خطا در اضافه کردن ستون:", error.message);
    }
  }

  // مرحله ۲: ساختن ایندکس یکتا (برای رعایت قانون UNIQUE)
  try {
    await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS notes_share_token_key ON notes(share_token);");
    console.log("✅ ایندکس یکتا (Unique Index) برای این ستون ساخته شد.");
  } catch (error) {
    console.error("❌ خطا در ساخت ایندکس یکتا:", error.message);
  }
}

main();