import { AuthError } from '../errors';

/** Async key-value storage. Native adapters back it with Keychain or Keystore. */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface PendingTransaction {
  provider: string;
  codeVerifier?: string;
  nonce?: string;
  oauth1RequestTokenSecret?: string;
  createdAt: number;
}

export type TransactionData = Omit<PendingTransaction, 'createdAt'>;

export const TRANSACTION_TTL_MS = 10 * 60 * 1000;

const ENTRY_PREFIX = 'usa.tx.';
const INDEX_KEY = 'usa.tx.index';

/**
 * Pending sign-in attempts, keyed by `state` (or the OAuth 1.0 request token).
 * Every operation runs through one queue, so consume is read-and-delete in one step.
 */
export class TransactionStore {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly kv: KeyValueStore,
    private readonly ttlMs: number = TRANSACTION_TTL_MS,
    private readonly now: () => number = () => Date.now()
  ) {}

  save(key: string, data: TransactionData): Promise<void> {
    return this.run(async () => {
      await this.purgeExpired();
      const index = await this.readIndex();
      if (index.includes(key)) {
        throw new AuthError('state_mismatch', 'OAuth state mismatch');
      }
      const record: PendingTransaction = { ...data, createdAt: this.now() };
      await this.kv.set(ENTRY_PREFIX + key, JSON.stringify(record));
      index.push(key);
      await this.writeIndex(index);
    });
  }

  /** Returns the pending attempt and deletes it. A second call for the same key returns undefined. */
  consume(key: string): Promise<PendingTransaction | undefined> {
    return this.run(async () => {
      await this.purgeExpired();
      const record = await this.readRecord(key);
      await this.delete(key);
      if (!record || this.isExpired(record)) return undefined;
      return record;
    });
  }

  discard(key: string): Promise<void> {
    return this.run(() => this.delete(key));
  }

  private run<T>(task: () => Promise<T>): Promise<T> {
    const next = this.queue.then(task, task);
    this.queue = next.catch(() => undefined);
    return next;
  }

  private isExpired(record: PendingTransaction): boolean {
    return this.now() - record.createdAt >= this.ttlMs;
  }

  private async readRecord(key: string): Promise<PendingTransaction | undefined> {
    const raw = await this.kv.get(ENTRY_PREFIX + key);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as PendingTransaction;
    } catch {
      return undefined;
    }
  }

  private async delete(key: string): Promise<void> {
    await this.kv.remove(ENTRY_PREFIX + key);
    const index = await this.readIndex();
    if (index.includes(key)) {
      await this.writeIndex(index.filter(item => item !== key));
    }
  }

  private async purgeExpired(): Promise<void> {
    const keys = await this.readIndex();
    const records = await Promise.all(keys.map(key => this.readRecord(key)));
    const expired = keys.filter((_key, i) => {
      const record = records[i];
      return !record || this.isExpired(record);
    });
    if (expired.length === 0) return;
    await Promise.all(expired.map(key => this.kv.remove(ENTRY_PREFIX + key)));
    await this.writeIndex(keys.filter(key => !expired.includes(key)));
  }

  private async readIndex(): Promise<string[]> {
    const raw = await this.kv.get(INDEX_KEY);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  private async writeIndex(index: string[]): Promise<void> {
    if (index.length === 0) {
      await this.kv.remove(INDEX_KEY);
      return;
    }
    await this.kv.set(INDEX_KEY, JSON.stringify(index));
  }
}

/** In-memory store for tests and for hosts that do not persist across restarts. */
export function memoryKeyValueStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    get: key => Promise.resolve(map.get(key) ?? null),
    set: (key, value) => {
      map.set(key, value);
      return Promise.resolve();
    },
    remove: key => {
      map.delete(key);
      return Promise.resolve();
    }
  };
}
