import { BACKEND_URL } from './config';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const createBackendClient = () => {
    const httpLink = new HttpLink({
        uri: BACKEND_URL,
        fetchOptions: {
          method: 'GET',
          mode: 'no-cors',
        },
    });
    return new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
    });
}
