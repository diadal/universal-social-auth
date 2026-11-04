import type { PlatformName } from '../platform/types';
export interface PlatformOverride {
    clientId?: string | number;
    redirectUri?: string;
}
export type PlatformOverrides = Partial<Record<PlatformName, PlatformOverride>>;
export declare const PLATFORM_NAMES: readonly PlatformName[];
export declare function applyPlatformOverrides(config: Record<string, unknown>, platform: PlatformName): Record<string, unknown>;
