const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const messageParts = args.filter((arg) => arg !== '--dry-run');

const run = (command, commandArgs, { capture = false } = {}) => {
  if (capture) {
    return execFileSync(command, commandArgs, { cwd: root, encoding: 'utf8' }).trim();
  }
  const result = spawnSync(command, commandArgs, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
  return '';
};

const jsFiles = ['server.js', 'data.js', 'app.js', 'api/portfolio.js']
  .map((file) => path.join(root, file))
  .filter((filePath) => fs.existsSync(filePath));

console.log('Checking JavaScript syntax...');
jsFiles.forEach((filePath) => run(process.execPath, ['--check', filePath]));

const status = run('git', ['status', '--porcelain'], { capture: true });
if (!status) {
  console.log('Working tree is clean. Nothing to commit or push.');
  process.exit(0);
}

const branch = run('git', ['branch', '--show-current'], { capture: true }) || 'main';
const now = new Date();
const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
const commitMessage = messageParts.join(' ').trim() || `chore: update portfolio (${stamp})`;

if (dryRun) {
  console.log('[dry-run] Pending changes:');
  console.log(status);
  console.log(`[dry-run] Would commit with message: "${commitMessage}" and push to origin/${branch}`);
  process.exit(0);
}

run('git', ['add', '-A']);

const staged = run('git', ['diff', '--cached', '--name-only'], { capture: true })
  .split(/\r?\n/)
  .filter(Boolean);

if (staged.some((file) => /^\.env(\.|$)/i.test(path.basename(file)))) {
  console.error('Refusing to commit .env file. Check .gitignore before pushing.');
  run('git', ['reset', 'HEAD', '--', '.env*']);
  process.exit(1);
}

if (!staged.length) {
  console.log('No staged changes to commit.');
  process.exit(0);
}

console.log(`Committing ${staged.length} file(s) to ${branch}...`);
run('git', ['commit', '-m', commitMessage]);

console.log(`Pushing to origin/${branch}...`);
run('git', ['push', 'origin', branch]);
console.log('Done.');
