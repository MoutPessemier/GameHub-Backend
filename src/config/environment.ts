import * as dotenv from 'dotenv';
const envPath = `${__dirname}/../../.env.${process.env.NODE_ENV || 'local'}`;
dotenv.config({ path: envPath });
console.log(` => dotenv config path: ${envPath}`);
const printedEnvKeys = ['NODE_ENV', 'PORT', 'MONGOOSE_URI', 'MONGOOSE_NAME', 'SENTRY_DSN'];
const printedEnvs = Object.entries(process.env).filter(([k, v]) => printedEnvKeys.includes(k));
printedEnvs.forEach(([k, v]) => console.log(` => [${k}]: ${v}`));
