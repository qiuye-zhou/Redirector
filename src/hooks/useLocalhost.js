export const storage = typeof chrome !== 'undefined' && chrome?.storage?.local
  ? chrome.storage.local
  : {
      get: (keys, callback) => {
        const result = {};
        if (Array.isArray(keys)) {
          keys.forEach(key => {
            result[key] = JSON.parse(localStorage.getItem(key));
          });
        } else if (typeof keys === 'string') {
          result[keys] = JSON.parse(localStorage.getItem(keys));
        }
        setTimeout(() => callback(result), 0);
      },
      set: (items, callback) => {
        Object.keys(items).forEach(key => {
          localStorage.setItem(key, JSON.stringify(items[key]));
        });
        if (callback) setTimeout(callback, 0);
      }
    };

