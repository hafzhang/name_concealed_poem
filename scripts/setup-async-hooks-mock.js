const fs = require('fs');
const path = require('path');

// Setup async_hooks mock module for Cloudflare Workers Edge Runtime
// async_hooks is a Node.js built-in that doesn't work in edge environments

const asyncHooksDir = path.join(__dirname, '..', 'node_modules', 'async_hooks');

// Create directory if it doesn't exist
if (!fs.existsSync(asyncHooksDir)) {
  fs.mkdirSync(asyncHooksDir, { recursive: true });
}

// Create package.json
const packageJson = {
  name: 'async_hooks',
  version: '1.0.0',
  main: 'index.js'
};
fs.writeFileSync(
  path.join(asyncHooksDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Create index.js with mock implementation
const indexJs = `// Mock async_hooks module for Cloudflare Workers Edge Runtime
// async_hooks is a Node.js built-in that doesn't work in edge environments

class AsyncLocalStorage {
  constructor() {
    this._store = new Map();
  }

  getStore() {
    return this._store.get('current');
  }

  run(store, callback, ...args) {
    this._store.set('current', store);
    try {
      return callback(...args);
    } finally {
      this._store.delete('current');
    }
  }

  enterWith(store) {
    this._store.set('current', store);
  }
}

// Export mock implementations
module.exports = {
  AsyncLocalStorage,
  createHook: () => ({}),
  executionAsyncId: () => 1,
  triggerAsyncId: () => 0,
  asyncWrap: () => {},
};
`;
fs.writeFileSync(path.join(asyncHooksDir, 'index.js'), indexJs);

console.log('✓ async_hooks mock module setup complete');
