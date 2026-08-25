import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().default(4317),
  GITHUB_TOKEN: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REDIRECT_PORT: z.coerce.number().int().default(53682),
  DATA_DIR: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
