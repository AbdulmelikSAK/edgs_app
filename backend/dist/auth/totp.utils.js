"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TotpUtils = void 0;
const crypto = __importStar(require("crypto"));
class TotpUtils {
    static generateSecret() {
        const buffer = crypto.randomBytes(20);
        return this.base32Encode(buffer);
    }
    static generateOtpauthUrl(label, issuer, secret) {
        return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
    }
    static verifyTotp(token, secret, window = 1) {
        if (!token || !secret)
            return false;
        const cleanToken = token.trim();
        const secretBuffer = this.base32Decode(secret);
        const timeStep = 30;
        const now = Math.floor(Date.now() / 1000);
        const currentCounter = Math.floor(now / timeStep);
        for (let i = -window; i <= window; i++) {
            const counter = currentCounter + i;
            const generated = this.generateTokenForCounter(secretBuffer, counter);
            if (generated === cleanToken)
                return true;
        }
        return false;
    }
    static generateTokenForCounter(secretBuffer, counter) {
        const buffer = Buffer.alloc(8);
        for (let i = 7; i >= 0; i--) {
            buffer[i] = counter & 0xff;
            counter = Math.floor(counter / 256);
        }
        const hmac = crypto.createHmac('sha1', secretBuffer);
        hmac.update(buffer);
        const digest = hmac.digest();
        const offset = digest[digest.length - 1] & 0xf;
        const code = ((digest[offset] & 0x7f) << 24) |
            ((digest[offset + 1] & 0xff) << 16) |
            ((digest[offset + 2] & 0xff) << 8) |
            (digest[offset + 3] & 0xff);
        const otp = code % 1000000;
        return String(otp).padStart(6, '0');
    }
    static base32Encode(buffer) {
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
    static base32Decode(input) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        const cleanInput = input.toUpperCase().replace(/=+$/, '');
        let bits = 0;
        let value = 0;
        const output = [];
        for (let i = 0; i < cleanInput.length; i++) {
            const idx = alphabet.indexOf(cleanInput[i]);
            if (idx === -1)
                continue;
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
exports.TotpUtils = TotpUtils;
//# sourceMappingURL=totp.utils.js.map