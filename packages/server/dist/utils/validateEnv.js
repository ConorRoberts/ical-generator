"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    R2_ACCESS_KEY_ID: zod_1.z.string(),
    R2_SECRET_ACCESS_KEY: zod_1.z.string(),
    R2_ACCOUNT_ID: zod_1.z.string(),
    R2_BUCKET_NAME: zod_1.z.string(),
    OPENAI_API_KEY: zod_1.z.string(),
    PORT: zod_1.z.string().optional().default("8080").transform(Number),
});
const validateEnv = () => {
    return envSchema.safeParse({
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
        R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        PORT: process.env.PORT,
    });
};
exports.validateEnv = validateEnv;
