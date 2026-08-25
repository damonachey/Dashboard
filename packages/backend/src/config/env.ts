import 'dotenv/config';
import { z } from 'zod';

// A blank `VAR=` line in .env parses as "", not undefined — normalize that to undefined
// so optional vars behave the same whether they're left blank or omitted entirely.
const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v));

const envSchema = z.object({
  PORT: z.coerce.number().int().default(4317),
  GITHUB_TOKEN: optionalString,
  GOOGLE_CLIENT_ID: optionalString,
  GOOGLE_CLIENT_SECRET: optionalString,
  GOOGLE_OAUTH_REDIRECT_PORT: z.coerce.number().int().default(53682),
  DATA_DIR: optionalString,
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
