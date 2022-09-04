import { addGraphQLResolvers, addMultiParentGraphQLResolvers } from '@slash-graphql/lambda-types';

addGraphQLResolvers({
    'Query.version': ({ authHeader }) => {
        if(!authHeader) return 'Access Denied (No Auth header)';
        if(!authHeader.value) return 'Access Denied (No Auth Content)';
        const headerValue = authHeader.value;
        if (headerValue === "") return 'Access Denied (Empty Auth Content)';
        const base64Url = headerValue.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jwtPayload = JSON.parse(atob(base64));
        return `0.0.0 (Requested from ${jwtPayload.name})`;
    },
});
addMultiParentGraphQLResolvers({});
