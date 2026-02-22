import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
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

// Read CSV file
const csvPath = path.join(__dirname, '../projects_rows.csv');
const fileContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Extract filename from old URL and create new URL
function updateImageUrl(oldUrl: string): string {
  if (!oldUrl) return null;

  // Extract filename from old URL
  // Old format: https://zacsokxnytyfisagshlb.supabase.co/storage/v1/object/public/project-images/filename.ext
  const match = oldUrl.match(/project-images\/(.+)$/);
  if (match) {
    const filename = match[1];
    // New format: https://gicrpczuonnxzmldfotl.supabase.co/storage/v1/object/public/project-images/filename.ext
    return `${supabaseUrl}/storage/v1/object/public/project-images/${filename}`;
  }

  return oldUrl;
}

async function updateImageUrls() {
  console.log('Updating image URLs in database...');
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      const projectId = record.id;
      const oldImageUrl = record.image_url;
      const newImageUrl = updateImageUrl(oldImageUrl);

      if (!newImageUrl || newImageUrl === oldImageUrl) {
        console.log(`Skipping: ${record.name} (URL unchanged)`);
        continue;
      }

      console.log(`Updating: ${record.name}`);
      console.log(`  Old URL: ${oldImageUrl}`);
      console.log(`  New URL: ${newImageUrl}`);

      // Update in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ image_url: newImageUrl })
        .eq('id', projectId);

      if (error) {
        console.error(`✗ Error updating ${record.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Successfully updated: ${record.name}`);
        successCount++;
      }

      console.log('');

    } catch (err) {
      console.error(`✗ Error processing record:`, err);
      errorCount++;
    }
  }

  console.log(`Update complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

updateImageUrls()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
