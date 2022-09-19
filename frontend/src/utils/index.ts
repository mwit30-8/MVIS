import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import schema from '../../generated/introspection';
import * as graphql from '../../generated/graphql';
import * as config from './config';
import { Buffer } from 'buffer';

export const createBackendClient = (token?: string) => {
    const httpLink = new HttpLink({
        uri: config.BACKEND_URL,
    });
    const authLink = setContext((_, { headers: headers_ }) => {
        const headers = { ...headers_ }
        if (token)
            headers["X-MVIS-Auth-Token"] = `Bearer ${token}`;
        if (config.BACKEND_API_KEY)
            headers["X-Auth-Token"] = config.BACKEND_API_KEY; // header["DG-Auth"]
        return {
            headers
        }
    });
    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache({
            possibleTypes: schema.possibleTypes
        }),
    });
}

export const verifyJwt = async (token: string) => {
    console.log(token)
    const parseBase64UrlJson = (base64url: string) => {
        const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
        const json = Buffer.from(base64, 'base64').toString();
        const object = JSON.parse(json);
        return object;
    };
    const [_header, _payload, signature] = token.split('.')
    const header = parseBase64UrlJson(_header);
    const payload = parseBase64UrlJson(_payload);
    const client = createBackendClient(token);
    await client.mutate<graphql.CreateUserMutation, graphql.CreateUserMutationVariables>({
        mutation: graphql.CreateUserDocument,
        variables: { email: payload.email }
    });
    const isAuth = await client.query<graphql.UserQuery, graphql.UserQueryVariables>({
        query: graphql.UserDocument
    });
    return isAuth.data?.queryUser?.[0]?.idToken !== undefined;
}