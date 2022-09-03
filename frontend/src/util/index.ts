import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import * as config from './config';

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

export const verifyJwt = (token: string) => {
    const AUTH0_JWKS_URL = `${config.AUTH0_URL}/.well-known/jwks.json`;
    const jwks = createRemoteJWKSet(new URL(AUTH0_JWKS_URL));
    return jwtVerify(token, jwks)
}