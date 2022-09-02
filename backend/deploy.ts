const { GraphQLClient, gql, ClientError } = require('graphql-request') as typeof import('graphql-request');
const fs = require('node:fs') as typeof import('node:fs');

const CEREBRO_URL = "https://cerebro.cloud.dgraph.io";

type BackendInfo = {
    uid: string,
    name: string,
    zone: string,
    url: string,
    owner: string,
    jwtToken: string,
    deploymentMode: string,
    deploymentType: string,
    lambdaScript: string,
};

function rejectGraphQLError(error: Error, reject: (reason?: any) => void = (reason) => { throw reason }) {
    if (error.name === ClientError.prototype.name)
        (error as typeof ClientError.prototype).response.errors?.forEach((err) => {
            reject(new Error(err.message));
        });
    else
        reject(error);
}

function getCerebroJWT(email: string, password: string): Promise<string> {
    return new Promise(async (resolver, reject) => {
        const LOGIN = gql`
            query Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                }
            }
        `;
        const VARIABLE = {
            email,
            password
        };
        const cerebro_client = new GraphQLClient(`${CEREBRO_URL}/graphql`);
        const CEREBRO_JWT = await cerebro_client.request(LOGIN, VARIABLE)
            .then((data: { login: { token: string } }) => resolver(data.login.token))
            .catch(error => rejectGraphQLError(error, reject));
    })
}
function getCerebroClient(cerebro_jwt: string): Promise<typeof GraphQLClient.prototype> {
    return new Promise((resolver) => {
        const deployment_client = new GraphQLClient(`${CEREBRO_URL}/graphql`);
        resolver(deployment_client.setHeader('authorization', `Bearer ${cerebro_jwt}`));
    });
}
function getBackendInfo(cerebro_client: typeof GraphQLClient.prototype, name: string): Promise<BackendInfo> {
    return new Promise(async (resolver, reject) => {
        const GET_DEPLOYMENTS = gql`
            {
                deployments {
                    uid
                    name
                    zone
                    url
                    owner
                    jwtToken
                    deploymentMode
                    deploymentType
                    lambdaScript
                }
            }
        `;
        const deployments: BackendInfo[] = await cerebro_client.request(GET_DEPLOYMENTS)
            .then((data) => data.deployments)
            .catch(error => rejectGraphQLError(error, reject));
        const backend_info = deployments.filter((deployment) => deployment.name === name)[0]
        resolver(backend_info);
    })
}
function getDeploymentClient(backend_info: BackendInfo): Promise<typeof GraphQLClient.prototype> {
    return new Promise((resolver) => {
        const deployment_client = new GraphQLClient(`https://${backend_info.url}/admin`);
        resolver(deployment_client.setHeader('X-Auth-Token', backend_info.jwtToken));
    });
}
function updateSchema(deployment_client: typeof GraphQLClient.prototype, schema_path: string): Promise<any> {
    return new Promise((resolver, reject) => {
        const schema = fs.readFileSync(schema_path).toString();
        const UPDATE_SCHEMA = gql`
            mutation($schema: String!) {
                updateGQLSchema(input: { set: { schema: $schema } }) {
                    gqlSchema {
                    schema
                    }
                }
            }
        `;
        const VARIABLE = {
            schema
        };
        deployment_client.request(UPDATE_SCHEMA, VARIABLE)
            .then(response => resolver(response))
            .catch(error => rejectGraphQLError(error, reject));
    });
}
function updateLambda(cerebro_client: typeof GraphQLClient.prototype, backend_info: BackendInfo): Promise<any> {
    return new Promise((resolver, reject) => {
        const path = require('path') as typeof import('path');
        const { createFsFromVolume, Volume } = require('memfs') as typeof import('memfs');
        const webpack = require('webpack') as typeof import('webpack');
        const { encode } = require('base-64') as typeof import('base-64');
        const config = (require('./webpack.config') as typeof import('./webpack.config'))(true);
        const fs = createFsFromVolume(new Volume());
        const compiler = webpack(config);
        const UPDATE_LAMBDA = gql`
            mutation updateLambda($input: UpdateLambdaInput!){
                updateLambda(input: $input)
            }
        `;
        compiler.outputFileSystem = fs;
        compiler.run((err) => {
            if (err) throw err;
            const content = fs.readFileSync((path.posix ?? path).join(config.output.path, config.output.filename)).toString();
            const encoded = encode(content);
            const VARIABLE = {
                input: {
                    deploymentID: backend_info.uid,
                    tenantID: 0,
                    lambdaScript: encoded,
                }
            };
            cerebro_client.request(UPDATE_LAMBDA, VARIABLE)
                .then(response => resolver(response))
                .catch(error => rejectGraphQLError(error, reject));
            compiler.close((closeErr) => {
                if (closeErr) throw closeErr;
            });
        });
    });
}

async function main(): Promise<void> {
    (require('dotenv') as typeof import('dotenv')).config()
    const cerebro_jwt = process.env.CEREBRO_JWT ?? await getCerebroJWT(process.env.CEREBRO_EMAIL ?? '', process.env.CEREBRO_PASSWORD ?? '');
    const cerebro_client = await getCerebroClient(cerebro_jwt);
    const backend_info = await getBackendInfo(cerebro_client, process.env.DEPLOYMENT_NAME ?? '');
    const deployment_client = await getDeploymentClient(backend_info);
    await updateSchema(deployment_client, './schema.graphql').then((response) => console.log(response));
    await updateLambda(cerebro_client, backend_info).then((response) => console.log(response));
}

main();
