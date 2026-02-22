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

// Supabase client - use VITE_ prefixed vars from .env
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

console.log(`Found ${records.length} records in CSV`);

// Function to import projects
async function importProjects() {
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      // Prepare data for database
      const projectData = {
        id: record.id,
        name: record.name,
        created_at: record.created_at || new Date().toISOString(),
        country: record.country || 'OTHER',
        image_url: record.image_url || null,
        project_url: record.project_url || null,
        motto: record.motto || null,
        description: record.description || null,
        linkedin_url: record.linkedin_url || null,
        is_anonymous: record.is_anonymous === 'true',
        contact_email: record.contact_email || null,
        votes: 0
      };

      console.log(`Inserting: ${projectData.name}`);

      // Insert into Supabase
      const { error } = await supabase
        .from('projects')
        .insert(projectData);

      if (error) {
        console.error(`Error inserting ${projectData.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Successfully inserted: ${projectData.name}`);
        successCount++;
      }

    } catch (err) {
      console.error(`Error processing record:`, err);
      errorCount++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Run import
importProjects()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
