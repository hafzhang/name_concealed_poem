// Mock async_hooks module for Cloudflare Workers Edge Runtime
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

  disable() {
    this._store.clear();
  }
}

// Export mock implementations
module.exports = {
  AsyncLocalStorage,
  createHook: () => ({
    enable: () => {},
    disable: () => {},
  }),
  executionAsyncId: () => 1,
  triggerAsyncId: () => 0,
  asyncWrap: () => {},
  executionAsyncResource: () => ({}),
};
