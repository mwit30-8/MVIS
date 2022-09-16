import Constant from 'expo-constants';
import manifest from '../../app.config';

export const BACKEND_URL = (Constant.manifest || manifest.expo).extra?.BACKEND_URL as string;
export const BACKEND_API_KEY = (Constant.manifest || manifest.expo).extra?.BACKEND_API_KEY as string;
export const AUTH0_DOMAIN = (Constant.manifest || manifest.expo).extra?.AUTH0_DOMAIN as string;
export const AUTH0_CLIENT_ID = (Constant.manifest || manifest.expo).extra?.AUTH0_CLIENT_ID as string;
export const SERVED_PATH = process.env.SERVED_PATH as string | undefined;