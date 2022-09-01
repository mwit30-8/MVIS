import { addGraphQLResolvers, addMultiParentGraphQLResolvers } from '@slash-graphql/lambda-types';

addGraphQLResolvers({
    'Query.version': () => '0.0.0',
});
addMultiParentGraphQLResolvers({});