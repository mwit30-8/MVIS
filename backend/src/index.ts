import { addGraphQLResolvers, addMultiParentGraphQLResolvers } from '@slash-graphql/lambda-types';
import { decodeJwt } from './auth';

addGraphQLResolvers({
    'Query.version': () => '0.0.0',
    'Query.name': async ({ authHeader }) => {
        if (!authHeader?.value) return null;
        const jwtPayload = await decodeJwt(authHeader.value);
        return jwtPayload?.payload?.name ?? null;
    }
});
addMultiParentGraphQLResolvers({});
