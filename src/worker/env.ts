export interface Env {
  ASSETS: Fetcher;
  ORDERS: D1Database;
  VOW_JOBS: Queue<{ orderId: string }>;
  VOW_FILES: R2Bucket;
  OPENAI_API_KEY: string;
  MP_ACCESS_TOKEN: string;
  MP_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
}
