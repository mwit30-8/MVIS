import * as config from './config';
import rs from 'jsrsasign';
import { Buffer } from 'buffer';

/**
 * JSON Web Key ([JWK](https://www.rfc-editor.org/rfc/rfc7517)). "RSA", "EC", "OKP", and "oct" key
 * types are supported.
 */
interface JWK {
    /** JWK "alg" (Algorithm) Parameter. */
    alg?: string
    crv?: string
    d?: string
    dp?: string
    dq?: string
    e?: string
    /** JWK "ext" (Extractable) Parameter. */
    ext?: boolean
    k?: string
    /** JWK "key_ops" (Key Operations) Parameter. */
    key_ops?: string[]
    /** JWK "kid" (Key ID) Parameter. */
    kid?: string
    /** JWK "kty" (Key Type) Parameter. */
    kty?: string
    n?: string
    oth?: Array<{
        d?: string
        r?: string
        t?: string
    }>
    p?: string
    q?: string
    qi?: string
    /** JWK "use" (Public Key Use) Parameter. */
    use?: string
    x?: string
    y?: string
    /** JWK "x5c" (X.509 Certificate Chain) Parameter. */
    x5c?: string[]
    /** JWK "x5t" (X.509 Certificate SHA-1 Thumbprint) Parameter. */
    x5t?: string
    /** "x5t#S256" (X.509 Certificate SHA-256 Thumbprint) Parameter. */
    'x5t#S256'?: string
    /** JWK "x5u" (X.509 URL) Parameter. */
    x5u?: string

    [propName: string]: unknown
}
/** Recognized JWT Claims Set members, any other members may also be present. */
interface JWTPayload {
    /** JWT Issuer - [RFC7519#section-4.1.1](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.1). */
    iss?: string

    /** JWT Subject - [RFC7519#section-4.1.2](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.2). */
    sub?: string

    /** JWT Audience [RFC7519#section-4.1.3](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.3). */
    aud?: string | string[]

    /** JWT ID - [RFC7519#section-4.1.7](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7). */
    jti?: string

    /** JWT Not Before - [RFC7519#section-4.1.5](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.5). */
    nbf?: number

    /** JWT Expiration Time - [RFC7519#section-4.1.4](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.4). */
    exp?: number

    /** JWT Issued At - [RFC7519#section-4.1.6](https://www.rfc-editor.org/rfc/rfc7519#section-4.1.6). */
    iat?: number

    /** Any other JWT Claim Set member. */
    [propName: string]: unknown
}
/** Recognized JWS Header Parameters, any other Header Members may also be present. */
interface JWSHeaderParameters {
    /** "kid" (Key ID) Header Parameter. */
    kid?: string

    /** "x5t" (X.509 Certificate SHA-1 Thumbprint) Header Parameter. */
    x5t?: string

    /** "x5c" (X.509 Certificate Chain) Header Parameter. */
    x5c?: string[]

    /** "x5u" (X.509 URL) Header Parameter. */
    x5u?: string

    /** "jku" (JWK Set URL) Header Parameter. */
    jku?: string

    /** "jwk" (JSON Web Key) Header Parameter. */
    jwk?: Pick<JWK, 'kty' | 'crv' | 'x' | 'y' | 'e' | 'n'>

    /** "typ" (Type) Header Parameter. */
    typ?: string

    /** "cty" (Content Type) Header Parameter. */
    cty?: string

    /** JWS "alg" (Algorithm) Header Parameter. */
    alg?: string

    /**
     * This JWS Extension Header Parameter modifies the JWS Payload representation and the JWS Signing
     * Input computation as per [RFC7797](https://www.rfc-editor.org/rfc/rfc7797).
     */
    b64?: boolean

    /** JWS "crit" (Critical) Header Parameter. */
    crit?: string[]

    /** Any other JWS Header member. */
    [propName: string]: unknown
}

interface JWTDecryptResult {
    /** JWT Claims Set. */
    payload: JWTPayload

    /** JWE Protected Header. */
    protectedHeader: JWSHeaderParameters
}

export const verifyJwt = async (token: string): Promise<JWTDecryptResult | null> => {
    return new Promise(async (resolve, reject) => {
        const AUTH0_JWKS_URL = `${config.AUTH0_URL}/.well-known/jwks.json`;
        const PUBLIC_KEY = rs.KEYUTIL.getKey(config.AUTH0_PUBLIC_KEY) as rs.RSAKey;
        const isValid = rs.KJUR.jws.JWS.verifyJWT(token, PUBLIC_KEY, {
            alg: ['RS256'],
            aud: [config.AUTH0_CLIENT_ID]
        });
        if (!isValid) resolve(null);
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