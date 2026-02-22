import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env file
config({ path: '.env' });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addVotesColumn() {
  console.log('Please run this SQL in Supabase Dashboard to add the votes column:');
  console.log('');
  console.log('--- SQL ---');
  console.log('ALTER TABLE projects ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0;');
  console.log('CREATE INDEX IF NOT EXISTS projects_votes_idx ON projects(votes DESC);');
  console.log('---');
  console.log('');
  console.log('URL: https://supabase.com/dashboard/project/gicrpczuonnxzmldfotl/sql/new');
  console.log('');
}

addVotesColumn()
  .then(() => {
    console.log('After running the SQL, run: npx tsx import-csv.ts');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
