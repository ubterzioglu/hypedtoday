import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// SQL migration file path
const sqlFile = path.join(__dirname, 'database-migrations/phase1-schema.sql');

// Read SQL file
const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

console.log('Applying Phase 1 database migration...');
console.log('');

// Get Supabase project ref from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('Could not extract project ref from VITE_SUPABASE_URL');
  console.error('Please check your .env file');
  process.exit(1);
}

console.log(`Project ref: ${projectRef}`);
console.log('');

// Use Supabase CLI to run SQL
try {
  console.log('Running SQL migration...');
  console.log('');

  const command = `supabase db remote commit --project-ref ${projectRef} --schema public`;

  // Execute the command
  execSync(command, {
    stdio: 'inherit',
    cwd: __dirname
  });

  console.log('');
  console.log('✓ Migration completed successfully!');
  console.log('');
  console.log('Note: If the command failed, please run the SQL manually:');
  console.log('https://supabase.com/dashboard/project/gicrpczuonnxzmldfotl/sql/new');
  console.log('');
  console.log('SQL file location:');
  console.log(sqlFile);

} catch (error) {
  console.error('Error running migration:', error);
  console.log('');
  console.log('Please run the SQL manually in Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/gicrpczuonnxzmldfotl/sql/new');
  console.log('');
  console.log('SQL file location:');
  console.log(sqlFile);
  process.exit(1);
}
