import { DEV_URL, PROD_URL } from "./constants";

const isProd = process.env.NODE_ENV === "production";

export const URL = isProd ? PROD_URL : DEV_URL;

