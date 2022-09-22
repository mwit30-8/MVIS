import Constant from "expo-constants";

export const BACKEND_URL = Constant.manifest?.extra?.BACKEND_URL as string;
export const BACKEND_API_KEY = Constant.manifest?.extra
  ?.BACKEND_API_KEY as string;
export const AUTH0_DOMAIN = Constant.manifest?.extra?.AUTH0_DOMAIN as string;
export const AUTH0_CLIENT_ID = Constant.manifest?.extra
  ?.AUTH0_CLIENT_ID as string;
export const SERVED_PATH = process.env.SERVED_PATH as string | undefined;
