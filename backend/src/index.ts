import { addGraphQLResolvers, addMultiParentGraphQLResolvers } from '@slash-graphql/lambda-types';
import { decodeJwt } from './auth';

addGraphQLResolvers({
    'Query.version': () => '0.0.0',
    'User.idToken': async ({ authHeader, graphql }) => {
        // This query only allowed when authentication token is verified by DGraph.
        const jwtPayload = await decodeJwt(authHeader?.value);
        return jwtPayload?.payload ?? null;
    }
});
addMultiParentGraphQLResolvers({});
