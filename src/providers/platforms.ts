import type { PlatformName } from '../platform/types';

export interface PlatformOverride {
  clientId?: string | number;
  redirectUri?: string;
}

export type PlatformOverrides = Partial<Record<PlatformName, PlatformOverride>>;

export const PLATFORM_NAMES: readonly PlatformName[] = ['web', 'ios', 'android'];

/**
 * Applies `platforms[platform]` over the base `clientId` and `redirectUri`.
 * Precedence: platform override, then base value. Returns the input unchanged when there is no override.
 */
export function applyPlatformOverrides(
  config: Record<string, unknown>,
  platform: PlatformName
): Record<string, unknown> {
  const platforms = config.platforms as PlatformOverrides | undefined;
  const override = platforms?.[platform];
  if (!override) return config;
  const next = { ...config };
  if (override.clientId !== undefined) next.clientId = override.clientId;
  if (override.redirectUri !== undefined) next.redirectUri = override.redirectUri;
  return next;
}
