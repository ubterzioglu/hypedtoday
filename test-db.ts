import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env file
config({ path: '.env' });

// Supabase client - use VITE_ prefixed vars from .env
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);

  // Test connection
  const { data, error } = await supabase
    .from('projects')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.error('Connection failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log('✓ Connection successful!');
    console.log('Existing projects count:', data);
  }
}

testConnection()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
