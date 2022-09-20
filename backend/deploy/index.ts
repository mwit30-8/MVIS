import 'dotenv/config'; // TODO: Use Config instead of env

export default new Promise<void>(async (resolve) => {
    const yargs = (await import('yargs')).default;
    const { hideBin } = await import('yargs/helpers');
    await yargs(hideBin(process.argv))
        .scriptName("deploy")
        .strict()
        .help()
        .command(
            'local',
            'deploy to local DGraph server',
            (yargs) => {
                return yargs
                    .option('watch', {
                        alias: 'w',
                        boolean: true,
                        default: false,
                        type: 'boolean',
                        describe: 'watch over file changes',
                    });
            },
            async (argv) => {
                return new Promise(async (resolve) => {
                    const utils = await import('./utils');
                    const fs = await import('fs');
                    const path = await import('path');
                    const ROOT_DIR = './src/';
                    const SCHEMA_PATH = path.resolve(ROOT_DIR, 'schema.graphql');
                    const BACKEND_URL = "http://localhost:8080";
                    const deployment_client = await utils.getDeploymentClient(BACKEND_URL);
                    const client = await utils.getGeneralClient(BACKEND_URL);
                    const updateSchema = async () => {
                        const schema = await utils.buildSchema(SCHEMA_PATH, {
                            AUTH0_PUBLIC_KEY: process.env.AUTH0_PUBLIC_KEY as string,
                            AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID as string,
                        });
                        console.log("Built schema");
                        await utils.updateSchema(deployment_client, schema);
                        console.log("Deployed schema");
                        await utils.initializeData(client);
                        console.log("Initialized Data");
                    }
                    const updateLambda = async () => {
                        await utils.buildLambda();
                        console.log("Built lambda script");
                    }
                    console.log(`::set-output name=url::${BACKEND_URL}/graphql`); // Return backend url for GitHub Actions
                    if (argv.watch) {
                        const schema_watcher = fs.watch(SCHEMA_PATH, async () => {
                            await updateSchema().catch(error => console.error(error));
                        });
                        const lambda_watcher = fs.watch(ROOT_DIR, async () => {
                            await updateLambda().catch(error => console.error(error));
                        });
                        process.on("SIGINT", () => {
                            console.log("graceful shutdown");
                            schema_watcher.close();
                            lambda_watcher.close();
                            resolve();
                        });
                    } else {
                        await updateSchema();
                        await updateLambda();
                        resolve();
                    }
                });
            }
        )
        .command(
            'cloud',
            'deploy to DGraph Cloud',
            (yargs) => {
                return yargs;
            },
            async (argv) => {
                return new Promise(async (resolve) => {
                    const utils = await import('./utils');
                    const fs = await import('fs');
                    const path = await import('path');
                    const ROOT_DIR = './src/';
                    const SCHEMA_PATH = path.resolve(ROOT_DIR, 'schema.graphql');
                    const CEREBRO_EMAIL = process.env.CEREBRO_EMAIL as string;
                    const CEREBRO_PASSWORD = process.env.CEREBRO_PASSWORD as string;
                    const CEREBRO_JWT = process.env.CEREBRO_JWT ?? await utils.getCerebroJWT(CEREBRO_EMAIL, CEREBRO_PASSWORD);
                    const cerebro_client = await utils.getCerebroClient(CEREBRO_JWT);
                    const DEPLOYMENT_NAME = process.env.DEPLOYMENT_NAME as string;
                    const backend_info = await utils.getBackendInfo(cerebro_client, DEPLOYMENT_NAME);
                    const BACKEND_URL = `https://${backend_info.url}`;
                    const deployment_client = await utils.getDeploymentClient(BACKEND_URL, backend_info.jwtToken);
                    const client = await utils.getGeneralClient(BACKEND_URL, backend_info.jwtToken);
                    const updateSchema = async () => {
                        const schema = await utils.buildSchema(SCHEMA_PATH, {
                            AUTH0_DOMAIN: process.env.AUTH0_DOMAIN as string,
                            AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID as string,
                        });
                        console.log("Built schema");
                        await utils.updateSchema(deployment_client, schema);
                        console.log("Deployed schema");
                        await utils.initializeData(client);
                        console.log("Initialized Data");
                    }
                    const updateLambda = async () => {
                        const script = await utils.buildLambda(true)
                        console.log("Built lambda script");
                        await utils.updateLambda(cerebro_client, backend_info.uid, script);
                        console.log("Deployed lambda script");
                    }
                    console.log(`::set-output name=url::${BACKEND_URL}/graphql`); // Return backend url for GitHub Actions
                    if (argv.watch) {
                        const schema_watcher = fs.watch(SCHEMA_PATH, async () => {
                            await updateSchema().catch(error => console.error(error));
                        });
                        const lambda_watcher = fs.watch(ROOT_DIR, async () => {
                            await updateLambda().catch(error => console.error(error));
                        });
                        process.on("SIGINT", function () {
                            console.log("graceful shutdown");
                            schema_watcher.close();
                            lambda_watcher.close();
                            resolve();
                        });
                    } else {
                        await updateSchema();
                        await updateLambda();
                        resolve();
                    }
                });
            }
        )
        .parse()
    resolve();
});