export declare const PROVIDER_SCHEMA_VERSION = 1;
export interface ProviderIssue {
    provider: string;
    field: string;
    message: string;
}
export declare function validateProviderDefinition(name: string, definition: Record<string, unknown>, options?: {
    development?: boolean;
}): ProviderIssue[];
