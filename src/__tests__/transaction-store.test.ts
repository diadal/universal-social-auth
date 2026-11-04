import { TransactionStore, memoryKeyValueStore } from '../platform/transaction-store';

describe('TransactionStore', () => {
  const setup = (ttlMs = 1000) => {
    let clock = 0;
    const store = new TransactionStore(memoryKeyValueStore(), ttlMs, () => clock);
    return {
      store,
      advance: (ms: number) => {
        clock += ms;
      }
    };
  };

  it('returns a saved transaction once and then nothing', async () => {
    const { store } = setup();
    await store.save('state-1', { provider: 'github', codeVerifier: 'v' });
    expect(await store.consume('state-1')).toMatchObject({ provider: 'github', codeVerifier: 'v' });
    expect(await store.consume('state-1')).toBeUndefined();
  });

  it('returns undefined for an unknown key', async () => {
    const { store } = setup();
    expect(await store.consume('missing')).toBeUndefined();
  });

  it('treats an entry as expired at the TTL boundary', async () => {
    const { store, advance } = setup(1000);
    await store.save('state-1', { provider: 'github' });
    advance(999);
    await store.save('state-2', { provider: 'google' });
    advance(1);
    expect(await store.consume('state-1')).toBeUndefined();
    expect(await store.consume('state-2')).toMatchObject({ provider: 'google' });
  });

  it('keeps entries inside the TTL', async () => {
    const { store, advance } = setup(1000);
    await store.save('state-1', { provider: 'github' });
    advance(500);
    expect(await store.consume('state-1')).toMatchObject({ provider: 'github' });
  });

  it('isolates entries by key', async () => {
    const { store } = setup();
    await store.save('a', { provider: 'github' });
    await store.save('b', { provider: 'google' });
    expect(await store.consume('b')).toMatchObject({ provider: 'google' });
    expect(await store.consume('a')).toMatchObject({ provider: 'github' });
  });

  it('does not overwrite an active transaction with the same key', async () => {
    const { store } = setup();
    await store.save('state-1', { provider: 'github', codeVerifier: 'first' });

    await expect(
      store.save('state-1', { provider: 'google', codeVerifier: 'second' })
    ).rejects.toMatchObject({ kind: 'state_mismatch' });
    await expect(store.consume('state-1')).resolves.toMatchObject({
      provider: 'github',
      codeVerifier: 'first'
    });
  });

  it('discard removes the entry', async () => {
    const { store } = setup();
    await store.save('state-1', { provider: 'github' });
    await store.discard('state-1');
    expect(await store.consume('state-1')).toBeUndefined();
  });

  it('lets only one of two concurrent consumes win', async () => {
    const { store } = setup();
    await store.save('state-1', { provider: 'github' });
    const [first, second] = await Promise.all([store.consume('state-1'), store.consume('state-1')]);
    const winners = [first, second].filter(Boolean);
    expect(winners).toHaveLength(1);
  });
});
