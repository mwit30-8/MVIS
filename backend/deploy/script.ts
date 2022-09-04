import 'dotenv/config';
import * as utils from './utils';

const SCHEMA_PATH = './src/schema.graphql';

export async function local(): Promise<void> {
    const BACKEND_URL = process.env.BACKEND_URL as string;
    const deployment_client = await utils.getDeploymentClient(BACKEND_URL);
    const updateSchema = async () => {
        const schema = await utils.buildSchema(SCHEMA_PATH, {
            AUTH0_PUBLIC_KEY: process.env.AUTH0_PUBLIC_KEY as string,
            AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID as string,
        });
        await utils.updateSchema(deployment_client, schema);
    }
    const buildLambda = async () => {
        await utils.buildLambda();
    }
    updateSchema();
    buildLambda();
}

export async function server(): Promise<void> {
    const CEREBRO_EMAIL = process.env.CEREBRO_EMAIL as string;
    const CEREBRO_PASSWORD = process.env.CEREBRO_PASSWORD as string;
    const CEREBRO_JWT = process.env.CEREBRO_JWT ?? await utils.getCerebroJWT(CEREBRO_EMAIL, CEREBRO_PASSWORD);
    const cerebro_client = await utils.getCerebroClient(CEREBRO_JWT);
    const DEPLOYMENT_NAME = process.env.DEPLOYMENT_NAME as string;
    const backend_info = await utils.getBackendInfo(cerebro_client, DEPLOYMENT_NAME);
    const deployment_client = await utils.getDeploymentClient(`https://${backend_info.url}`, backend_info.jwtToken);
    const updateSchema = async () => {
        const schema = await utils.buildSchema(SCHEMA_PATH, {
            AUTH0_PUBLIC_KEY: process.env.AUTH0_PUBLIC_KEY as string,
            AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID as string,
        });
        await utils.updateSchema(deployment_client, schema);
    }
    const updateLambda = async () => {
        await utils.updateLambda(cerebro_client, backend_info.uid);
    }
    updateSchema();
    updateLambda();
}