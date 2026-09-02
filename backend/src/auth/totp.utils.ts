import * as crypto from 'crypto';

export class TotpUtils {
  static generateSecret(): string {
    const buffer = crypto.randomBytes(20);
    return this.base32Encode(buffer);
  }

  static generateOtpauthUrl(label: string, issuer: string, secret: string): string {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  }

  static verifyTotp(token: string, secret: string, window = 1): boolean {
    if (!token || !secret) return false;
    const cleanToken = token.trim();
    const secretBuffer = this.base32Decode(secret);
    const timeStep = 30;
    const now = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(now / timeStep);

    for (let i = -window; i <= window; i++) {
      const counter = currentCounter + i;
      const generated = this.generateTokenForCounter(secretBuffer, counter);
      if (generated === cleanToken) return true;
    }
    return false;
  }

  private static generateTokenForCounter(secretBuffer: Buffer, counter: number): string {
    const buffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
      buffer[i] = counter & 0xff;
      counter = Math.floor(counter / 256);
    }
    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(buffer);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0xf;
    const code =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);
    const otp = code % 1000000;
    return String(otp).padStart(6, '0');
  }

  private static base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }
    return output;
  }

  private static base32Decode(input: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const cleanInput = input.toUpperCase().replace(/=+$/, '');
    let bits = 0;
    let value = 0;
    const output: number[] = [];
    for (let i = 0; i < cleanInput.length; i++) {
      const idx = alphabet.indexOf(cleanInput[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    return Buffer.from(output);
  }
}
