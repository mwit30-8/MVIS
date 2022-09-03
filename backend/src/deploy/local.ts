async function main(): Promise<void> {
    const utils = require('./utils');
    const BACKEND_URL = process.env.BACKEND_URL ?? '';
    const deployment_client = await utils.getDeploymentClient(BACKEND_URL);
    const updateSchema = async () => {
        const schema = await utils.buildSchema('./src/schema.graphql');
        await utils.updateSchema(deployment_client, schema);
    }
    const buildLambda = async () => {
        await utils.buildLambda();
    }
    updateSchema();
    buildLambda();
}

main();
