import { BACKEND_URL } from './config';
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';

export const createBackendClient = () => {
    const httpLink = createHttpLink({
        uri: BACKEND_URL
    });
    return new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
    });
}