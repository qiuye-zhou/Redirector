import { execSync } from 'node:child_process';
function writeManifest() {
  // stdio: 'inherit' 表示子进程的输出会被直接输出到父进程的控制台
  execSync('npx esno ./scripts/manifest.js', { stdio: 'inherit' })
}

writeManifest()