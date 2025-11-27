import { exec } from 'child_process';

console.log('Attempting to push database schema...');
console.log('DATABASE_URL available:', !!process.env.DATABASE_URL);
console.log('PGHOST available:', !!process.env.PGHOST);

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  console.error('Neither DATABASE_URL nor PGHOST are available');
  process.exit(1);
}

exec('npx drizzle-kit push', (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  console.log('Output:', stdout);
});
