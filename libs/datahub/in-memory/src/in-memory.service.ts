import { Injectable } from '@nestjs/common';

@Injectable()
export class InMemoryCacheService {
  private readonly store = new Map<string, any>();

  set<T>(key: string, value: T, ttlMs?: number) {
    this.store.set(key, value);
    if (ttlMs) {
      setTimeout(() => this.store.delete(key), ttlMs);
    }
  }

  get<T>(key: string): T | undefined {
    return this.store.get(key);
  }
}