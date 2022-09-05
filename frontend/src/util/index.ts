import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as config from './config';
import * as jose from "jose"

export const createBackendClient = (token?: string) => {
    const httpLink = new HttpLink({
        uri: config.BACKEND_URL,
    });
    const authLink = setContext((_, { headers: headers_ }) => {
        const headers = { ...headers_ }
        if (token)
            headers["X-MVIS-Auth-Token"] = `Bearer ${token}`;
        if (config.BACKEND_API_KEY)
            headers["DG-Auth"] = config.BACKEND_API_KEY
        return {
            headers
        }
    });
    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
    });
}

export const verifyJwt = async (token: string) => {
    const AUTH0_JWKS_URL = `${config.AUTH0_URL}/.well-known/jwks.json`;
    const JWKS = jose.createRemoteJWKSet(new URL(AUTH0_JWKS_URL));
    const { payload, protectedHeader } = await jose.jwtVerify(token, JWKS, {
        audience: [config.AUTH0_CLIENT_ID],
    });
    return payload;
}