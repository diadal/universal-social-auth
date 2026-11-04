import { AuthErrorKind } from './errors';
export interface LifecycleEvent {
    provider: string;
}
export interface LifecycleErrorEvent extends LifecycleEvent {
    kind: AuthErrorKind;
}
export interface LifecycleHooks {
    onStart?: (event: LifecycleEvent) => void;
    onComplete?: (event: LifecycleEvent) => void;
    onCancel?: (event: LifecycleEvent) => void;
    onError?: (event: LifecycleErrorEvent) => void;
}
export declare function emitHook<K extends keyof LifecycleHooks>(hooks: LifecycleHooks | undefined, name: K, event: Parameters<NonNullable<LifecycleHooks[K]>>[0]): void;
