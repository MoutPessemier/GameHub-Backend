declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string | undefined;
    PORT: string;
    MONGOOSE_URI: string;
    MONGOOSE_NAME: string;
    SENTRY_DSN: string;
  }
}
