import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env file
config({ path: '.env' });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBucket() {
  console.log('Creating bucket...');

  const { data, error } = await supabase.storage.createBucket('project-images', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
  });

  if (error) {
    console.error('Error creating bucket:', error);
    console.log('');
    console.log('If bucket already exists or permissions issue, please create it manually:');
    console.log('https://supabase.com/dashboard/project/gicrpczuonnxzmldfotl/storage');
  } else {
    console.log('✓ Bucket created successfully!');
    console.log('Bucket info:', data);
  }
}

createBucket()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
