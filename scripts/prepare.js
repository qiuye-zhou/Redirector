import { execSync } from 'node:child_process'
import fs from 'fs-extra'

import { r, log } from './utils'
function writeManifest() {
  // stdio: 'inherit' 表示子进程的输出会被直接输出到父进程的控制台
  execSync('npx esno ./scripts/manifest.js', { stdio: 'inherit' })
}

// 复制public目录下的静态资源到extensions目录
async function copyPublicAssets() {
  try {
    // 确保extensions目录存在
    await fs.ensureDir(r('extensions'))

    const publicDir = r('public')

    // 检查public目录是否存在
    const publicExists = await fs.pathExists(publicDir)

    if (publicExists) {
      const files = await fs.readdir(publicDir)

      // 确保extensions/assets目录存在
      await fs.ensureDir(r('extensions/assets'))

      // 复制public目录下的所有文件到extensions/assets目录
      for (const file of files) {
        const srcPath = r('public', file)
        const destPath = r('extensions/assets', file)
        await fs.copy(srcPath, destPath, { overwrite: true })
      }

      log('PRE', 'copied public assets to extensions directory')
    }
  } catch (error) {
    console.error('Error copying public assets:', error)
  }
}

writeManifest()
copyPublicAssets()