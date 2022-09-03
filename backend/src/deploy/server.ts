async function main(): Promise<void> {
    const utils = require('./utils');
    const cerebro_jwt = process.env.CEREBRO_JWT ?? await utils.getCerebroJWT(process.env.CEREBRO_EMAIL ?? '', process.env.CEREBRO_PASSWORD ?? '');
    const cerebro_client = await utils.getCerebroClient(cerebro_jwt);
    const backend_info = await utils.getBackendInfo(cerebro_client, process.env.DEPLOYMENT_NAME ?? '');
    const deployment_client = await utils.getDeploymentClient(`https://${backend_info.url}`, backend_info.jwtToken);
    const updateSchema = async () => {
        const schema = await utils.buildSchema('./src/schema.graphql');
        await utils.updateSchema(deployment_client, schema);
    }
    const updateLambda = async () => {
        await utils.updateLambda(cerebro_client, backend_info.uid);
    }
    updateSchema();
    updateLambda();
}

main();
