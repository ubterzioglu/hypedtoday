import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env file
config({ path: '.env' });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('Checking current table structure...');

  // Try to query all columns to see what's available
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error querying projects:', error);
  } else if (data && data.length > 0) {
    console.log('Current table columns:');
    console.log(Object.keys(data[0]).join(', '));
    console.log('');
    console.log('Sample row:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('Table is empty. Let me try to insert a sample to discover schema...');
    const { error: insertError } = await supabase
      .from('projects')
      .insert({ name: 'Test' });

    if (insertError) {
      console.log('Insert error reveals schema:');
      console.log(insertError.message);
    }
  }
}

checkSchema()
  .then(() => {
    console.log('');
    console.log('Please run this SQL in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/gicrpczuonnxzmldfotl/sql/new');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
