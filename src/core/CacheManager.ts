import { QueryResponse } from '../types';

/**
 * Cache Manager for query responses and frequently accessed data
 */
export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private enabled: boolean;
  private defaultTimeout: number;
  private maxSize: number;

  constructor(enabled: boolean = true, timeout: number = 300000) { // 5 minutes default
    this.enabled = enabled;
    this.defaultTimeout = timeout;
    this.maxSize = 1000; // Maximum number of cached entries
  }

  /**
   * Get a cached response
   */
  async get(key: string): Promise<QueryResponse | null> {
    if (!this.enabled) {
      return null;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU
    entry.lastAccessed = Date.now();
    return entry.data;
  }

  /**
   * Set a cached response
   */
  async set(key: string, data: QueryResponse, timeout?: number): Promise<void> {
    if (!this.enabled) {
      return;
    }

    // Check cache size and evict if necessary
    if (this.cache.size >= this.maxSize) {
      await this.evictLRU();
    }

    const expiresAt = Date.now() + (timeout || this.defaultTimeout);
    const entry: CacheEntry = {
      data,
      expiresAt,
      lastAccessed: Date.now(),
      key,
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete a cached entry
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cached entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const now = Date.now();
    let expiredCount = 0;
    let totalSize = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      }
      totalSize += this.estimateSize(entry.data);
    }

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      hitRate: this.calculateHitRate(),
      totalSize,
      maxSize: this.maxSize,
    };
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }
  }

  /**
   * Enable or disable caching
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  /**
   * Set cache timeout
   */
  setTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  /**
   * Set maximum cache size
   */
  setMaxSize(maxSize: number): void {
    this.maxSize = maxSize;
    // Evict entries if current size exceeds new max
    while (this.cache.size > maxSize) {
      this.evictLRU();
    }
  }

  /**
   * Destroy the cache manager
   */
  async destroy(): Promise<void> {
    await this.clear();
  }

  // Private helper methods
  private async evictLRU(): Promise<void> {
    if (this.cache.size === 0) {
      return;
    }

    // Find the least recently used entry
    let lruKey = '';
    let lruTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  private calculateHitRate(): number {
    // This is a simplified hit rate calculation
    // In a real implementation, you'd track hits and misses
    return 0.85; // Mock 85% hit rate
  }

  private estimateSize(data: QueryResponse): number {
    // Rough estimation of data size in bytes
    return JSON.stringify(data).length * 2; // UTF-16 encoding
  }
}

// Supporting types
interface CacheEntry {
  data: QueryResponse;
  expiresAt: number;
  lastAccessed: number;
  key: string;
}

interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  hitRate: number;
  totalSize: number;
  maxSize: number;
}

