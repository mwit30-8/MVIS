import type { GraphQLClient } from 'graphql-request';
import type { Configuration } from 'webpack';
import type { BackendInfo } from './utils';

export default new Promise<void>(async (resolve) => {
    const path = (await import('path')).default;
    const yargs = (await import('yargs')).default;
    const { hideBin } = await import('yargs/helpers');
    const argv = await yargs(hideBin(process.argv))
        .scriptName("deploy")
        .option('watch', {
            alias: 'w',
            boolean: true,
            type: 'boolean',
            default: false,
            describe: 'watch over file changes',
        })
        .option('local', {
            alias: 'l',
            boolean: true,
            type: 'boolean',
            default: false,
            describe: 'deploy to local DGraph server',
        })
        .option('github-action', {
            boolean: true,
            type: 'boolean',
            default: false,
            describe: 'log the output for GitHub Actions',
        })
        .option('port', {
            alias: 'p',
            string: true,
            type: 'string',
            default: '8080',
            describe: 'port of local DGraph server (ignored if deploy to DGraph cloud)',
            requiresArg: true
        })
        .option('cerebro-email', {
            alias: 'email',
            string: true,
            type: 'string',
            describe: 'email for cerebro (DGraph Cloud)',
            requiresArg: true
        })
        .option('cerebro-password', {
            alias: 'password',
            string: true,
            type: 'string',
            describe: 'password for cerebro (DGraph Cloud)',
            requiresArg: true
        })
        .option('cerebro-token', {
            alias: 'token',
            string: true,
            type: 'string',
            describe: 'token for cerebro (DGraph Cloud)',
            requiresArg: true
        })
        .option('deployment-name', {
            alias: 'name',
            string: true,
            type: 'string',
            describe: 'backend name for DGraph Cloud',
            requiresArg: true
        })
        .option('auth0-domain', {
            alias: 'domain',
            string: true,
            type: 'string',
            describe: 'Auth0 domain for JWKs',
            requiresArg: true
        })
        .option('auth0-clientid', {
            alias: 'clientid',
            string: true,
            type: 'string',
            describe: 'Audience for jwt verification',
            requiresArg: true
        })
        .option('auth0-publickey', {
            alias: 'publickey',
            string: true,
            type: 'string',
            describe: 'Public key for jwt verification',
            requiresArg: true
        })
        .option('webpack-config', {
            alias: 'webpack',
            string: true,
            type: 'string',
            default: './webpack.config.js',
            describe: 'path to lambda script',
            requiresArg: true,
            required: true,
        })
        .option('schema', {
            alias: 's',
            string: true,
            type: 'string',
            default: './src/schema.graphql',
            describe: 'path to graphql schema',
            requiresArg: true
        })
        .config()
        .help()
        .strict()
        .parse();
    const utils = await import('./utils');
    const fs = await import('fs');
    const webpackConfigPath = path.resolve(process.cwd(), argv.webpackConfig)
    console.log(webpackConfigPath)
    const webpackConfig: Configuration = (await import(webpackConfigPath)).default();
    const rootDir = webpackConfig.output?.path as string;
    const schemaPath = path.resolve(process.cwd(), argv.schema);
    const info = await (async () => {
        let cerebroJwt: string | undefined;
        let cerebroClient: GraphQLClient | undefined;
        let backendInfo: BackendInfo | undefined;
        let backendUrl: string;
        if (argv.local) {
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
            cerebroJwt,
            cerebroClient,
            backendInfo,
            backendUrl,
            deploymentClient,
            graphqlClient
        };
    })();
    if (argv.githubAction) {
        console.log(`::set-output name=url::${info.backendUrl}/graphql`); // Return backend url for GitHub Actions
    }
    const updateSchema = async () => {
        try {
            const schema = await utils.buildSchema(schemaPath, {
                AUTH0_DOMAIN: argv.auth0Domain,
                AUTH0_PUBLIC_KEY: argv.auth0Publickey,
                AUTH0_CLIENT_ID: argv.auth0Clientid,
            }).then((schema) => {
                console.log("Built schema");
                return schema
            });
            await utils.updateSchema(info.deploymentClient, schema).then((schema) => {
                console.log("Deployed schema");
                return schema;
            });
        } catch (error) {
            if (argv.auth0Domain && argv.auth0Publickey) {
                const schema = await utils.buildSchema(schemaPath, {
                    AUTH0_PUBLIC_KEY: argv.auth0Publickey,
                    AUTH0_CLIENT_ID: argv.auth0Clientid,
                }).then((schema) => {
                    console.log("Built schema (retried)");
                    return schema;
                });
                await utils.updateSchema(info.deploymentClient, schema).then((schema) => {
                    console.log("Deployed schema (retried)");
                    return schema;
                });
            }
        }
        await utils.initializeData(info.graphqlClient).then((response) => {
            console.log("Initialized Data");
            return response;
        }).catch((error) => {
            console.error(error);
        });
    }
    const updateLambda = async () => {
        const script = await utils.buildLambda(webpackConfigPath, !argv.local).then((script) => {
            console.log("Built lambda script");
            return script;
        });
        if (!argv.local) {
            await utils.updateLambda(info.cerebroClient!, info.backendInfo!.uid, script!).then((response) => {
                console.log("Deployed lambda script");
                return response;
            });
        }
    }
    if (argv.watch) {
        const schema_watcher = fs.watch(schemaPath, async () => {
            await updateSchema().catch(error => console.error(error));
        });
        const lambda_watcher = fs.watch(rootDir, async () => {
            await updateLambda().catch(error => console.error(error));
        });
        schema_watcher.emit('initialized');
        lambda_watcher.emit('initialized');
        process.on("SIGINT", () => {
            console.log("graceful shutdown");
            schema_watcher.close();
            lambda_watcher.close();
            resolve();
        });
    } else {
        await updateSchema();
        await updateLambda();
        console.log("graceful shutdown");
        resolve();
    }
    resolve();
});