import { z } from "zod";

const envSchema = z.object({
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_ACCOUNT_ID: z.string(),
  R2_BUCKET_NAME: z.string(),
  OPENAI_API_KEY: z.string(),
  PORT: z.string().optional().default("8080").transform(Number),
});

export const validateEnv = () => {
  return envSchema.safeParse({
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PORT: process.env.PORT,
  });
};
