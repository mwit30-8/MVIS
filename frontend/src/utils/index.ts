import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import schema from '../../generated/introspection';
import * as graphql from '../../generated/graphql';
import * as config from './config';

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
    const client = createBackendClient(token);
    await client.mutate<graphql.CreateUserMutation, graphql.CreateUserMutationVariables>({
        mutation: graphql.CreateUserDocument,
        variables: { email: "" }
    });
    const isAuth = await client.query<graphql.UserQuery, graphql.UserQueryVariables>({
        query: graphql.UserDocument
    });
    return isAuth.data?.queryUser?.[0]?.idToken !== undefined;
}