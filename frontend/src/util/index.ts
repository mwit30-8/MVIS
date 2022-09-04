import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import * as config from './config';
import { Buffer } from "buffer"

export const createBackendClient = (token?: string) => {
    const httpLink = new HttpLink({
        uri: config.BACKEND_URL,
        headers: {
            "X-Auth-Token": token ? `Bearer ${token}` : "",
        },
    });
    return new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
    });
}

export const verifyJwt = async (token: string) => {
    const AUTH0_JWKS_URL = `${config.AUTH0_URL}/.well-known/jwks.json`;
    console.warn('This will not verify whether the signature is valid. You should not use this for untrusted messages.')
    const [header, payload] = token.split('.').map(part => Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    const jwtHeader = JSON.parse(header);
    const jwtPayload = JSON.parse(payload);
    return jwtPayload;
}