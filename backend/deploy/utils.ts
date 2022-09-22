import { gql, GraphQLClient } from 'graphql-request';
import type { Configuration } from 'webpack';

const CEREBRO_URL = "https://cerebro.cloud.dgraph.io";

export type BackendInfo = {
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

export function getCerebroJWT(email: string, password: string): Promise<string> {
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
            .catch(error => reject(error));
    })
}
export function getCerebroClient(cerebro_jwt: string): Promise<GraphQLClient> {
    return new Promise((resolver) => {
        const deployment_client = new GraphQLClient(`${CEREBRO_URL}/graphql`);
        resolver(deployment_client.setHeader('authorization', `Bearer ${cerebro_jwt}`));
    });
}
export function getBackendInfo(cerebro_client: GraphQLClient, name: string): Promise<BackendInfo | undefined> {
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
            .catch(error => reject(error));
        const backend = deployments.filter((deployment) => deployment.name === name);
        const backend_info = backend.length === 1 ? backend[0] : undefined;
        resolver(backend_info);
    })
}
export function getDeploymentClient(backend_url: string, jwtToken?: string): Promise<GraphQLClient> {
    return new Promise((resolver) => {
        const deployment_client = new GraphQLClient(`${backend_url}/admin`);
        if (jwtToken)
            deployment_client.setHeader('X-Auth-Token', jwtToken);
        resolver(deployment_client);
    });
}
export function getGeneralClient(backend_url: string, jwtToken?: string): Promise<GraphQLClient> {
    return new Promise((resolver) => {
        const deployment_client = new GraphQLClient(`${backend_url}/graphql`);
        if (jwtToken)
            deployment_client.setHeader('X-Auth-Token', jwtToken);
        resolver(deployment_client);
    });
}
type IBuildSchemaArgs = {
    AUTH0_DOMAIN?: string;
    AUTH0_PUBLIC_KEY?: string;
    AUTH0_CLIENT_ID?: string
};
export function buildSchema(schema_path: string, args: IBuildSchemaArgs): Promise<string> {
    type IDgraph = {
        Authorization?: {
            Header?: string;
            Namespace?: string;
            Algo?: string;
            VerificationKey?: string;
            JWKUrl?: string;
            JWKUrls?: string[];
            Audience?: string[];
            ClosedByDefault?: boolean;
        }
    };
    return new Promise(async (resolver, reject) => {
        const fs = await import('node:fs');
        const schema_file = fs.readFileSync(schema_path);
        const Dgraph: IDgraph = {};
        if (args.AUTH0_DOMAIN) {
            Dgraph.Authorization = {
                "Header": "X-MVIS-Auth-Token",
                "Namespace": "https://dgraph.io/jwt/claims"
            };
            Dgraph.Authorization.JWKUrl = `https://${args.AUTH0_DOMAIN}/.well-known/jwks.json`;
        }
        else if (args.AUTH0_PUBLIC_KEY) {
            Dgraph.Authorization = {
                "Header": "X-MVIS-Auth-Token",
                "Namespace": "https://dgraph.io/jwt/claims"
            };
            Dgraph.Authorization.Algo = "RS256";
            Dgraph.Authorization.VerificationKey = JSON.stringify(args.AUTH0_PUBLIC_KEY).slice(1, -1);
        }
        if (Dgraph.Authorization && args.AUTH0_CLIENT_ID)
            Dgraph.Authorization.Audience = [args.AUTH0_CLIENT_ID];
        let schema = schema_file.toString();
        if (Dgraph.Authorization)
            schema += `\n# Dgraph.Authorization ${JSON.stringify(Dgraph.Authorization)}\n`;

        resolver(schema);
    });
}
export function updateSchema(deployment_client: GraphQLClient, schema: string): Promise<string> {
    return new Promise((resolver, reject) => {
        const UPDATE_SCHEMA = gql`
            mutation($schema: String!) {
                updateGQLSchema(input: { set: { schema: $schema } }) {
                    gqlSchema {
                        generatedSchema
                    }
                }
            }
        `;
        const VARIABLE = {
            schema
        };
        deployment_client.request(UPDATE_SCHEMA, VARIABLE)
            .then(response => resolver(response.updateGQLSchema.gqlSchema.generatedSchema))
            .catch(error => reject(error));
    });
}
export function buildLambda(webpackConfig: string): Promise<undefined>;
export function buildLambda(webpackConfig: string, asString: false, toFile?: true, isProduction?: boolean): Promise<undefined>;
export function buildLambda(webpackConfig: string, asString: true, toFile?: boolean, isProduction?: boolean): Promise<string>;
export function buildLambda(webpackConfig: string, asString?: boolean, toFile?: boolean, isProduction?: boolean): Promise<string | undefined>;
export function buildLambda(webpackConfig: string, asString: boolean = false, toFile: boolean = true, isProduction: boolean = false): Promise<string | undefined> {
    return new Promise(async (resolver, reject) => {
        const path = await import('path');
        const webpack = (await import('webpack')).default;
        const config: Configuration = (await import(webpackConfig)).default();
        const compiler = webpack(config);
        if (!toFile) {
            const { createFsFromVolume, Volume } = await import('memfs');
            const fs = createFsFromVolume(new Volume());
            compiler.outputFileSystem = fs;
        }
        compiler.run((err) => {
            if (err) {
                reject(err);
                return;
            }
            compiler.close(async (closeErr) => {
                if (closeErr) {
                    reject(closeErr);
                    return;
                }
                if (asString)
                    compiler.outputFileSystem.readFile((path.posix ?? path).join(config.output?.path as string, config.output?.filename as string), (err, data) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolver(data?.toString());
                        return;
                    });
                else
                    resolver(undefined);
            });
        });
    });
}
export function updateLambda(cerebro_client: GraphQLClient, backend_uid: string, script: string): Promise<any> {
    return new Promise(async (resolver, reject) => {
        if (!script) {
            reject('No script generated.');
            return;
        }
        const encode = ((str: string) => Buffer.from(str).toString('base64'));
        const UPDATE_LAMBDA = gql`
            mutation updateLambda($input: UpdateLambdaInput!){
                updateLambda(input: $input)
            }
        `;
        const encoded = encode(script);
        const VARIABLE = {
            input: {
                deploymentID: backend_uid,
                tenantID: 0,
                lambdaScript: encoded,
            }
        };
        cerebro_client.request(UPDATE_LAMBDA, VARIABLE)
            .then(response => resolver(response))
            .catch(error => reject(error));
    });
}
export function initializeData(client: GraphQLClient): Promise<any> {
    const INITIALIZE_PLACE = gql`
        mutation addPlace($name: String!, $capacity: Int! = 0) {
            addPlace(input: [
                {name: $name, capacity: $capacity, participants: []}
            ]) {
                __typename
            }
        }
    `;
    const places = [{ name: 'Gym', capacity: 10 }]; // TODO: Fetch true data.
    const initialize_places = places.map((place) => client.request(INITIALIZE_PLACE, place));
    return Promise.all(([] as Promise<any>[]).concat(initialize_places));
}
