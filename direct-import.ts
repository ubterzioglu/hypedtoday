import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Load .env file
config({ path: '.env' });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('Starting CSV import...');
  console.log('');

  // First, check if we can insert data into existing table
  const testProject = {
    name: 'Test Project',
    country: 'TR',
    image_url: null,
    project_url: null,
    motto: 'Test motto',
    description: 'Test description',
    votes: 0
  };

  console.log('Test insert...');
  const { error: testError } = await supabase
    .from('projects')
    .insert(testProject);

  if (testError) {
    console.error('Test insert failed:', testError);
    console.log('');
    console.log('The existing table structure doesn\'t match our data.');
    console.log('Please run the SQL manually in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/gicrpczuonnxzmldfotl/sql/new');
    console.log('');
    console.log('Then run: npx tsx import-csv.ts');
    return;
  }

  console.log('✓ Test insert successful! Table structure is compatible.');
  console.log('');
  console.log('Removing test record...');

  // Remove the test record
  await supabase
    .from('projects')
    .delete()
    .eq('name', 'Test Project');

  console.log('✓ Test record removed.');
  console.log('');
  console.log('Now importing CSV data...');

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
        console.error(`✗ Error inserting ${projectData.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Successfully inserted: ${projectData.name}`);
        successCount++;
      }

    } catch (err) {
      console.error(`✗ Error processing record:`, err);
      errorCount++;
    }
  }

  console.log('');
  console.log(`Import complete!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

main()
  .then(() => {
    console.log('');
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
