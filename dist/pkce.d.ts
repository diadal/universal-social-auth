export declare function createRandomString(byteLength?: number): string;
export declare function createCodeVerifier(): string;
export declare function createCodeChallenge(verifier: string): Promise<string>;
