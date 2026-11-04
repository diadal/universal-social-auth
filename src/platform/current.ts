import { webPlatform } from './web';
import type { PlatformAdapter } from './types';

let active: PlatformAdapter = webPlatform;

/** Selects the adapter used by the next sign-in. Hosts call this once at startup. */
export function setPlatform(adapter: PlatformAdapter): void {
  active = adapter;
}

export function getPlatform(): PlatformAdapter {
  return active;
}
