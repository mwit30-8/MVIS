import { addGraphQLResolvers, addMultiParentGraphQLResolvers } from '@slash-graphql/lambda-types';
import { verifyJwt } from './auth';

addGraphQLResolvers({
    'Query.version': () => '0.0.0',
    'Query.name': async ({ authHeader }) => {
        if (!authHeader?.value) return false;
        const jwtPayload = await verifyJwt(authHeader.value);
        return jwtPayload?.payload?.name ?? false;
    }
});
addMultiParentGraphQLResolvers({});
