import fs from 'fs-extra'

export async function getManifest() {
  const pkg = await fs.readJson('package.json')

  const manifest = {
    manifest_version: 3,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    action: {
      default_icon: './assets/logo.png',
      default_popup: 'popup.html',
    },
    permissions: [
      'storage',
      'webRequest',
      'declarativeNetRequest',
      'tabs',
      'scripting',
    ],
    declarative_net_request: {
      rule_resources: [],
    },
    host_permissions: ['<all_urls>'],
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
    icons: {
      16: './assets/logo.png',
      48: './assets/logo.png',
      128: './assets/logo.png',
    },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content.js'],
        css: ['content.css'],
      },
    ],
  }

  return manifest
}
