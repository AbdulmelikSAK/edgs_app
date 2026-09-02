export declare class TotpUtils {
    static generateSecret(): string;
    static generateOtpauthUrl(label: string, issuer: string, secret: string): string;
    static verifyTotp(token: string, secret: string, window?: number): boolean;
    private static generateTokenForCounter;
    private static base32Encode;
    private static base32Decode;
}
