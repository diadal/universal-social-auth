import { AxiosInstance } from 'axios';
export interface OidcDiscoveryDocument {
    issuer: string;
    authorization_endpoint: string;
    token_endpoint?: string;
    jwks_uri?: string;
    [x: string]: unknown;
}
export interface IdTokenExpectations {
    issuer: string;
    audience: string;
    nonce?: string;
    now?: number;
    clockSkewSeconds?: number;
}
export declare function discoverOidc(issuer: string, $http: AxiosInstance): Promise<OidcDiscoveryDocument>;
export declare function validateIdTokenClaims(claims: Record<string, unknown>, expected: IdTokenExpectations): void;
