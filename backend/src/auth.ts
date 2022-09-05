import * as config from './config';
import type jwt from 'jsonwebtoken';

/**
 * 
 * @remark This will not verify whether the signature is valid. You should not use this for untrusted messages.
 * @param token JWT ID token
 */
export const decodeJwt = async (token?: string): Promise<jwt.Jwt | null> => {
    //TODO: Implement verification under achievable performance.
    return new Promise(async (resolve, reject) => {
        if (!token) {
            resolve(null);
            return;
        }
        const parseBase64UrlJson = (base64url: string) => {
            const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
            const json = Buffer.from(base64, 'base64').toString();
            const object = JSON.parse(json);
            return object;
        };
        const [_header, _payload, signature] = token.split('.')
        const header = parseBase64UrlJson(_header);
        const payload = parseBase64UrlJson(_payload);
        resolve({
            header,
            payload,
            signature,
        });
    });
}