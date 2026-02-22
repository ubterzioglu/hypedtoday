import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env file
config({ path: '.env' });

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBuckets() {
  console.log('Checking Supabase Storage buckets...');
  console.log('');

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('Error listing buckets:', error);
    console.log('');
    console.log('Please check your Supabase Storage dashboard:');
    console.log('https://supabase.com/dashboard/project/gicrpczuonnxzmldfotl/storage');
  } else {
    console.log('Available buckets:');
    console.log('');
    if (buckets && buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log(`- Name: ${bucket.name}`);
        console.log(`  Public: ${bucket.public}`);
        console.log(`  ID: ${bucket.id}`);
        console.log('');
      });
    } else {
      console.log('No buckets found. Please create a bucket named "project-images".');
    }
  }
}

checkBuckets()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
