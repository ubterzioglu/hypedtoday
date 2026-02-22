import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';

// Load .env file
config({ path: '.env' });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applySchema() {
  console.log('Applying database schema...');

  // Read SQL file
  const sqlPath = './supabase-schema-updated.sql';
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  console.log('SQL content loaded. Now please run this SQL in Supabase Dashboard:');
  console.log('---');
  console.log(sqlContent);
  console.log('---');
  console.log('');
  console.log('To apply the schema:');
  console.log('1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new');
  console.log('2. Paste the SQL content above');
  console.log('3. Click "Run"');
  console.log('');
  console.log('After applying the schema, run: npx tsx import-csv.ts');
}

applySchema()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
