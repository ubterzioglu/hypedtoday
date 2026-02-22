import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// ES module __dirname polyfill
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
config({ path: '.env' });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sourceFolder = path.join(__dirname, '../New folder');
const bucketName = 'project-images';

async function uploadImages() {
  console.log('Starting image upload...');
  console.log('Source folder:', sourceFolder);
  console.log('');

  // Check if source folder exists
  if (!fs.existsSync(sourceFolder)) {
    console.error('Source folder not found:', sourceFolder);
    process.exit(1);
  }

  // Read all files in the folder
  const files = fs.readdirSync(sourceFolder);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].includes(ext);
  });

  console.log(`Found ${imageFiles.length} image files`);
  console.log('');

  // Check if bucket exists
  console.log('Checking bucket...');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

  if (bucketError) {
    console.error('Error checking buckets:', bucketError);
    console.log('');
    console.log('Please create the bucket manually in Supabase Dashboard:');
    console.log('1. Go to Storage > Create a new bucket');
    console.log('2. Bucket name: project-images');
    console.log('3. Make it public');
    return;
  }

  const bucketExists = buckets?.some(b => b.name === bucketName);

  if (!bucketExists) {
    console.log(`Bucket "${bucketName}" does not exist.`);
    console.log('');
    console.log('Please create the bucket manually in Supabase Dashboard:');
    console.log('1. Go to Storage > Create a new bucket');
    console.log('2. Bucket name: project-images');
    console.log('3. Make it public');
    return;
  }

  console.log(`✓ Bucket "${bucketName}" exists`);
  console.log('');

  // Upload files
  let successCount = 0;
  let errorCount = 0;

  for (const file of imageFiles) {
    try {
      const filePath = path.join(sourceFolder, file);
      const fileBuffer = fs.readFileSync(filePath);
      const contentType = getContentType(file);

      console.log(`Uploading: ${file}`);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(file, fileBuffer, {
          contentType,
          upsert: true
        });

      if (uploadError) {
        console.error(`✗ Error uploading ${file}:`, uploadError.message);
        errorCount++;
      } else {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${file}`;
        console.log(`✓ Uploaded: ${file}`);
        console.log(`  URL: ${publicUrl}`);
        successCount++;
      }

    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err);
      errorCount++;
    }

    console.log('');
  }

  console.log(`Upload complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.gif': 'image/gif'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

uploadImages()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
