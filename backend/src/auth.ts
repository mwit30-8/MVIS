import * as config from './config';
import type jwt from 'jsonwebtoken';
// import jwksClient from 'jwks-rsa';

export const decodeJwt = async (token: string): Promise<jwt.JwtPayload | undefined> => {
    // return new Promise<jwt.JwtPayload | undefined>((resolve, reject) => {
    //     const AUTH0_JWKS_URL = `${config.AUTH0_URL}/.well-known/jwks.json`;
    //     const client = jwksClient({
    //         jwksUri: AUTH0_JWKS_URL
    //     });
    //     function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    //         client.getSigningKey(header.kid, function (err, key) {
    //             if (!key)
    //                 reject(err);
    //             var signingKey = (key as jwksClient.CertSigningKey).publicKey || (key as jwksClient.RsaSigningKey).rsaPublicKey;
    //             callback(null, signingKey);
    //         });
    //     }
    //     jwt.verify(token, getKey, function (err, decoded) {
    //         if (err)
    //             reject(err);
    //         resolve(decoded as jwt.JwtPayload | undefined)
    //     });
    // });
    console.warn("This will not verify whether the signature is valid. You should not use this for untrusted messages.")
    // return jwt.decode(token) as jwt.JwtPayload;
    return new Promise(async (resolve, reject) => {
        const decode = ((str: string) => Buffer.from(str, 'base64').toString());
        const [header, payload] = token.split('.').map(part => decode(part.replace(/-/g, '+').replace(/_/g, '/')));
        const jwtHeader = JSON.parse(header);
        const jwtPayload = JSON.parse(payload);
        resolve({
            protectedHeader: jwtHeader,
            payload: jwtPayload,
        });
    });
}