const cacheStore = new Map();

const DEFAULT_TTL_MS = 20000; // 20 seconds

const getCacheKey = (key) => `cache:${key}`;

const setCache = (key, value, ttl = DEFAULT_TTL_MS) => {
  const expires = Date.now() + ttl;
  cacheStore.set(getCacheKey(key), { value, expires });
};

const getCache = (key) => {
  const entry = cacheStore.get(getCacheKey(key));
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    cacheStore.delete(getCacheKey(key));
    return null;
  }
  return entry.value;
};

const clearCache = (key) => {
  cacheStore.delete(getCacheKey(key));
};

const clearAllCache = () => {
  cacheStore.clear();
};

module.exports = {
  getCache,
  setCache,
  clearCache,
  clearAllCache
};
