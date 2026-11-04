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
export declare const TRANSACTION_TTL_MS: number;
export declare class TransactionStore {
    private readonly kv;
    private readonly ttlMs;
    private readonly now;
    private queue;
    constructor(kv: KeyValueStore, ttlMs?: number, now?: () => number);
    save(key: string, data: TransactionData): Promise<void>;
    consume(key: string): Promise<PendingTransaction | undefined>;
    discard(key: string): Promise<void>;
    private run;
    private isExpired;
    private readRecord;
    private delete;
    private purgeExpired;
    private readIndex;
    private writeIndex;
}
export declare function memoryKeyValueStore(): KeyValueStore;
