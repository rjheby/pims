
type CacheItem<T> = {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
};

class QueryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private static instance: QueryCache;

  private constructor() {}

  public static getInstance(): QueryCache {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache();
    }
    return QueryCache.instance;
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the cache has expired
    if (Date.now() > item.timestamp + item.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  public set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public invalidateAll(): void {
    this.cache.clear();
  }
}

export const queryCache = QueryCache.getInstance();
