import { z } from "zod/v4";

const envSchema = z.object({
  TURSO_API_TOKEN: z
    .string()
    .describe("turso auth api-tokens mint <token_name>"),
  TURSO_AUTH_TOKEN: z
    .string()
    .describe("turso db tokens create <database-name>"),
  TURSO_ORG: z.string().describe("your personal or organization name"),
  TURSO_DATABASE_NAME: z.string().describe("turso db create <database-name>"),
  TURSO_GROUP_AUTH_TOKEN: z
    .string()
    .describe("turso group tokens create <group-name>"),
});

const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  throw new Error("❌ Invalid environment variables");
}

export const env = parsedEnv.data;
