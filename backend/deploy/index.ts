import type { GraphQLClient } from 'graphql-request';
import type { Configuration } from 'webpack';
import type { BackendInfo } from './utils';

export default new Promise<void>(async (resolve) => {
    const path = (await import('path')).default;
    const yargs = (await import('yargs')).default;
    const { hideBin } = await import('yargs/helpers');
    const utils = await import('./utils');
    const fs = await import('fs');
    async function getCompileOptions(
        argv: {
            webpackConfig: string;
            schema: string;
        }
    ): Promise<{
        webpackConfig: Configuration;
        rootDir: string;
        schemaPath: string;
    }> {
        const webpackConfigPath: string = path.resolve(process.cwd(), argv.webpackConfig);
        const webpackConfig: Configuration = (await import(webpackConfigPath)).default();
        const rootDir: string = webpackConfig.output?.path as string;
        const schemaPath: string = path.resolve(process.cwd(), argv.schema);
        return {
            webpackConfig,
            rootDir,
            schemaPath,
        };
    }
    async function getBackendInfo(
        isLocal: true,
        argv: {
            port: string;
        }
    ): Promise<{
        backendUrl: string;
        deploymentClient: GraphQLClient;
        graphqlClient: GraphQLClient;
    }>;
    async function getBackendInfo(
        isLocal: false,
        argv: {
            cerebroEmail: string;
            cerebroPassword: string;
            deploymentName: string;
        } | {
            cerebroToken: string;
            deploymentName: string;
        }
    ): Promise<{
        cerebroClient: GraphQLClient;
        backendInfo: BackendInfo;
        backendUrl: string;
        deploymentClient: GraphQLClient;
        graphqlClient: GraphQLClient;
    }>;
    async function getBackendInfo(
        isLocal: boolean,
        argv: {
            port?: string;
            cerebroToken?: string;
            cerebroEmail?: string;
            cerebroPassword?: string;
            deploymentName?: string;
        }
    ) {
        let cerebroJwt: string | undefined;
        let cerebroClient: GraphQLClient | undefined;
        let backendInfo: BackendInfo | undefined;
        let backendUrl: string;
        if (isLocal) {
            backendUrl = `http://localhost:${argv.port}`;
        } else {
            cerebroJwt = argv.cerebroToken ?? ((argv.cerebroEmail && argv.cerebroPassword) ? await utils.getCerebroJWT(argv.cerebroEmail, argv.cerebroPassword) : undefined);
            if (!cerebroJwt)
                throw new Error('When deploy to cloud, please provide both cerebro email and password or cerebro json web token.');
            cerebroClient = await utils.getCerebroClient(cerebroJwt);
            if (!argv.deploymentName)
                throw new Error('When deploy to cloud, please provide deployment name.');
            backendInfo = await utils.getBackendInfo(cerebroClient, argv.deploymentName);
            if (!backendInfo)
                throw new Error('Please provide a valid deployment name, the name provided might not exists or might not be unique.');
            backendUrl = `https://${backendInfo.url}`;
        }
        const deploymentClient = await utils.getDeploymentClient(backendUrl, backendInfo?.jwtToken);
        const graphqlClient = await utils.getGeneralClient(backendUrl, backendInfo?.jwtToken);
        return {
            cerebroClient,
            backendInfo,
            backendUrl,
            deploymentClient,
            graphqlClient,
        };
    }
    async function updateSchema(
        compileOption: {
            schemaPath: string;
        },
        backendInfo: {
            backendUrl: string;
            deploymentClient: GraphQLClient;
            graphqlClient: GraphQLClient;
        },
        auth0Info: {
            auth0Domain?: string;
            auth0Publickey?: string;
            auth0Clientid?: string;
        }
    ): Promise<void> {
        const schema = await utils.buildSchema(compileOption.schemaPath, {
            AUTH0_DOMAIN: auth0Info.auth0Domain,
            AUTH0_PUBLIC_KEY: auth0Info.auth0Publickey,
            AUTH0_CLIENT_ID: auth0Info.auth0Clientid,
        }).then((schema) => {
            console.log("Built schema");
            return schema
        });
        await utils.updateSchema(backendInfo.deploymentClient, schema).then((schema) => {
            console.log("Deployed schema");
            return schema;
        });
        await utils.initializeData(backendInfo.graphqlClient).then((response) => {
            console.log("Initialized Data");
            return response;
        }).catch((error) => {
            console.error(error);
        });
    }
    async function updateLambda(
        isLocal: true,
        compileOption: {
            webpackConfig: Configuration;
            rootDir: string;
        },
        backendInfo: {
        }
    ): Promise<void>
    async function updateLambda(
        isLocal: false,
        compileOption: {
            webpackConfig: Configuration;
            rootDir: string;
        },
        backendInfo: {
            cerebroClient: GraphQLClient;
            backendInfo: BackendInfo;
        }
    ): Promise<void>
    async function updateLambda(
        isLocal: boolean,
        compileOption: {
            webpackConfig: Configuration;
            rootDir: string;
        },
        backendInfo: {
            cerebroClient?: GraphQLClient;
            backendInfo?: BackendInfo;
        }
    ): Promise<void> {
        const script = await utils.buildLambda(compileOption.webpackConfig, !isLocal).then((script) => {
            console.log("Built lambda script");
            return script;
        });
        if (!isLocal) {
            await utils.updateLambda(backendInfo.cerebroClient!, backendInfo.backendInfo!.uid, script!).then((response) => {
                console.log("Deployed lambda script");
                return response;
            });
        }
    }
    async function handler(
        watch: boolean,
        isLocal: true,
        compileOption: {
            webpackConfig: Configuration;
            rootDir: string;
            schemaPath: string;
        },
        backendInfo: {
            backendUrl: string;
            deploymentClient: GraphQLClient;
            graphqlClient: GraphQLClient;
        },
        auth0Info?: {
            auth0Domain?: string;
            auth0Publickey?: string;
            auth0Clientid?: string;
        }
    ): Promise<void>
    async function handler(
        watch: boolean,
        isLocal: false,
        compileOption: {
            webpackConfig: Configuration;
            rootDir: string;
            schemaPath: string;
        },
        backendInfo: {
            cerebroClient: GraphQLClient;
            backendInfo: BackendInfo;
            backendUrl: string;
            deploymentClient: GraphQLClient;
            graphqlClient: GraphQLClient;
        },
        auth0Info?: {
            auth0Domain?: string;
            auth0Publickey?: string;
            auth0Clientid?: string;
        }
    ): Promise<void>
    async function handler(
        watch: boolean,
        isLocal: boolean,
        compileOption: {
            webpackConfig: Configuration;
            rootDir: string;
            schemaPath: string;
        },
        backendInfo: {
            cerebroClient?: GraphQLClient;
            backendInfo?: BackendInfo;
            backendUrl: string;
            deploymentClient: GraphQLClient;
            graphqlClient: GraphQLClient;
        },
        auth0Info: {
            auth0Domain?: string;
            auth0Publickey?: string;
            auth0Clientid?: string;
        } = {}
    ): Promise<void> {
        const _updateSchema = async () => {
            if (auth0Info.auth0Domain)
                try {
                    await updateSchema(compileOption, backendInfo, { auth0Domain: auth0Info.auth0Domain, auth0Clientid: auth0Info.auth0Clientid }).catch(error => console.error(error));
                    return;
                } catch (error) {
                    console.warn("Error using auth0 JWK, try using public key.");
                }
            if (auth0Info.auth0Publickey)
                try {
                    await updateSchema(compileOption, backendInfo, { auth0Publickey: auth0Info.auth0Publickey, auth0Clientid: auth0Info.auth0Clientid }).catch(error => console.error(error));
                } catch (error) {
                    console.warn("Error using public key, try using no authentication.");
                }
            await updateSchema(compileOption, backendInfo, {}).catch(error => console.error(error));
        };
        const _updateLambda = async () => {
            await updateLambda(isLocal as (true & false), compileOption, backendInfo).catch(error => console.error(error))
        };
        if (watch) {
            return await new Promise(async (resolve) => {
                const schema_watcher = fs.watch(compileOption.schemaPath, _updateSchema);
                const lambda_watcher = fs.watch(compileOption.rootDir, _updateLambda);
                schema_watcher.emit('initialized');
                lambda_watcher.emit('initialized');
                process.on("SIGINT", () => {
                    console.log("graceful shutdown");
                    schema_watcher.close();
                    lambda_watcher.close();
                    resolve();
                });
            });
        } else {
            return await new Promise(async (resolve) => {
                await _updateSchema();
                await _updateLambda();
                console.log("graceful shutdown");
                resolve();
            });
        }
    }
    return await yargs(hideBin(process.argv))
        .scriptName("deploy")
        .command(
            "info",
            "get DGraph cloud deployment information",
            (yargs) => {
                return yargs
                    .options({
                        'github-action': {
                            boolean: true,
                            type: 'boolean',
                            default: false,
                            describe: 'log the output for GitHub Actions',
                        },
                        'cerebro-email': {
                            alias: 'email',
                            string: true,
                            type: 'string',
                            describe: 'email for cerebro (DGraph Cloud)',
                            requiresArg: true
                        },
                        'cerebro-password': {
                            alias: 'password',
                            string: true,
                            type: 'string',
                            describe: 'password for cerebro (DGraph Cloud)',
                            requiresArg: true
                        },
                        'cerebro-token': {
                            alias: 'token',
                            string: true,
                            type: 'string',
                            describe: 'token for cerebro (DGraph Cloud)',
                            requiresArg: true
                        },
                        'deployment-name': {
                            alias: 'name',
                            string: true,
                            type: 'string',
                            describe: 'backend name for DGraph Cloud',
                            requiresArg: true
                        },
                    })
                    .config()
                    .help()
                    .strict();
            },
            async (argv) => {
                const backendInfo = await getBackendInfo(
                    false,
                    argv as {
                        cerebroEmail: string;
                        cerebroPassword: string;
                        deploymentName: string;
                    } | {
                        cerebroToken: string;
                        deploymentName: string;
                    }
                );
                console.log(`::set-output name=url::${backendInfo.backendUrl}/graphql`); // Return backend url for GitHub Actions
                return;
            }
        )
        .command(
            "local",
            "deploy to local DGraph server",
            (yargs) => {
                return yargs
                    .options({
                        'watch': {
                            alias: 'w',
                            boolean: true,
                            type: 'boolean',
                            default: false,
                            describe: 'watch over file changes',
                        },
                        'github-action': {
                            boolean: true,
                            type: 'boolean',
                            default: false,
                            describe: 'log the output for GitHub Actions',
                        },
                        'port': {
                            alias: 'p',
                            string: true,
                            type: 'string',
                            default: '8080',
                            describe: 'port of local DGraph server (ignored if deploy to DGraph cloud)',
                            requiresArg: true
                        },
                        'auth0-domain': {
                            alias: 'domain',
                            string: true,
                            type: 'string',
                            describe: 'Auth0 domain for JWKs',
                            requiresArg: true
                        },
                        'auth0-clientid': {
                            alias: 'clientid',
                            string: true,
                            type: 'string',
                            describe: 'Audience for jwt verification',
                            requiresArg: true
                        },
                        'auth0-publickey': {
                            alias: 'publickey',
                            string: true,
                            type: 'string',
                            describe: 'Public key for jwt verification',
                            requiresArg: true
                        },
                        'webpack-config': {
                            alias: 'webpack',
                            string: true,
                            type: 'string',
                            default: './webpack.config.js',
                            describe: 'path to lambda script',
                            requiresArg: true,
                            required: true,
                        },
                        'schema': {
                            alias: 's',
                            string: true,
                            type: 'string',
                            default: './src/schema.graphql',
                            describe: 'path to graphql schema',
                            requiresArg: true
                        },
                    })
                    .config()
                    .help()
                    .strict();
            },
            async (argv) => {
                const backendInfo = await getBackendInfo(
                    true,
                    argv
                );
                const compileOption = await getCompileOptions(argv);
                if (argv.githubAction)
                    console.log(`::set-output name=url::${backendInfo.backendUrl}/graphql`); // Return backend url for GitHub Actions
                handler(argv.watch, true, compileOption, backendInfo, argv);
                return;
            }
        )
        .command(
            "cloud",
            "deploy to DGraph cloud",
            (yargs) => {
                return yargs
                    .options({
                        'watch': {
                            alias: 'w',
                            boolean: true,
                            type: 'boolean',
                            default: false,
                            describe: 'watch over file changes',
                        },
                        'github-action': {
                            boolean: true,
                            type: 'boolean',
                            default: false,
                            describe: 'log the output for GitHub Actions',
                        },
                        'cerebro-email': {
                            alias: 'email',
                            string: true,
                            type: 'string',
                            describe: 'email for cerebro (DGraph Cloud)',
                            requiresArg: true
                        },
                        'cerebro-password': {
                            alias: 'password',
                            string: true,
                            type: 'string',
                            describe: 'password for cerebro (DGraph Cloud)',
                            requiresArg: true
                        },
                        'cerebro-token': {
                            alias: 'token',
                            string: true,
                            type: 'string',
                            describe: 'token for cerebro (DGraph Cloud)',
                            requiresArg: true
                        },
                        'deployment-name': {
                            alias: 'name',
                            string: true,
                            type: 'string',
                            describe: 'backend name for DGraph Cloud',
                            requiresArg: true
                        },
                        'auth0-domain': {
                            alias: 'domain',
                            string: true,
                            type: 'string',
                            describe: 'Auth0 domain for JWKs',
                            requiresArg: true
                        },
                        'auth0-clientid': {
                            alias: 'clientid',
                            string: true,
                            type: 'string',
                            describe: 'Audience for jwt verification',
                            requiresArg: true
                        },
                        'auth0-publickey': {
                            alias: 'publickey',
                            string: true,
                            type: 'string',
                            describe: 'Public key for jwt verification',
                            requiresArg: true
                        },
                        'webpack-config': {
                            alias: 'webpack',
                            string: true,
                            type: 'string',
                            default: './webpack.config.js',
                            describe: 'path to lambda script',
                            requiresArg: true,
                            required: true,
                        },
                        'schema': {
                            alias: 's',
                            string: true,
                            type: 'string',
                            default: './src/schema.graphql',
                            describe: 'path to graphql schema',
                            requiresArg: true
                        },
                    })
                    .config()
                    .help()
                    .strict();
            },
            async (argv) => {
                const backendInfo = await getBackendInfo(
                    false,
                    argv as {
                        cerebroEmail: string;
                        cerebroPassword: string;
                        deploymentName: string;
                    } | {
                        cerebroToken: string;
                        deploymentName: string;
                    }
                );
                const compileOption = await getCompileOptions(argv);
                if (argv.githubAction)
                    console.log(`::set-output name=url::${backendInfo.backendUrl}/graphql`); // Return backend url for GitHub Actions
                handler(argv.watch, false, compileOption, backendInfo, argv);
                return;
            }
        )
        .config()
        .help()
        .strict()
        .parse();
});