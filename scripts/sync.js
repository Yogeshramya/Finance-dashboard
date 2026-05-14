import { execSync } from 'child_process';
import process from 'process';
import path from 'path';
import readline from 'readline/promises';

try {
  // CLI flags
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const confirmFlag = argv.includes('--confirm');

  // 1. Determine changed files safely (null-separated)
  const statusRaw = execSync('git status --porcelain -z').toString();

  if (!statusRaw) {
    console.log('No changes to sync.');
    process.exit(0);
  }

  const entries = statusRaw.split('\0').filter(Boolean);

  // Parse paths and filter out sensitive files before staging
  const forbidden = new Set(['google-service-account.json', '.env', '.env.local', '.env.production', '.env.development']);

  const paths = entries.map(entry => {
    const payload = entry.slice(3).trim();
    const finalPath = payload.includes('->') ? payload.split('->').pop().trim() : payload;
    return finalPath.replace(/\\\\/g, '/');
  }).filter(p => {
    const base = path.basename(p);
    if (forbidden.has(base)) return false;
    if (p.startsWith('.next/') || p.startsWith('node_modules/') || p.startsWith('public/uploads/')) return false;
    return true;
  });

  const uniquePaths = Array.from(new Set(paths));
  if (uniquePaths.length === 0) {
    console.log('No non-sensitive changes to sync.');
    process.exit(0);
  }

  // Stage only the allowed files
  const addCmd = 'git add -- ' + uniquePaths.map(p => '"' + p.replace(/"/g, '\\"') + '"').join(' ');
  execSync(addCmd, { stdio: 'inherit' });

  const basenames = uniquePaths.map(p => path.basename(p));
  const files = Array.from(new Set(basenames)).slice(0, 5).join(', ');
  const more = uniquePaths.length > 5 ? '...' : '';
  const message = `Update: ${files}${more}`;

  // 3. Commit and Push
  console.log(`\n🚀 Committing changes: "${message}"`);
  try {
    if (dryRun) {
      console.log('\n--dry-run: Skipping commit.');
      console.log('Planned commit message:', message);
      console.log('Files to be committed:');
      uniquePaths.forEach(p => console.log(' -', p));
      process.exit(0);
    }

    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
  } catch (commitErr) {
    console.error('\n⚠️ No commit created (maybe nothing to commit):', commitErr.message);
    process.exit(0);
  }

  console.log('📤 Pushing to GitHub...');
  try {
    if (confirmFlag) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const answer = await rl.question('Push to remote? (y/n): ');
      await rl.close();
      if (!/^y(es)?$/i.test(answer)) {
        console.log('Push aborted by user.');
        process.exit(0);
      }
    }
    execSync('git push', { stdio: 'inherit' });
  } catch (pushErr) {
    console.warn('Push failed, attempting to set upstream and push...');
    execSync('git push --set-upstream origin main', { stdio: 'inherit' });
  }

  console.log('\n✅ Successfully synced!');
} catch (error) {
  console.error('\n❌ Sync failed:', error && error.message ? error.message : error);
  process.exit(1);
}
