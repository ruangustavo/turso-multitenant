import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

const url = `libsql://${env.TURSO_DATABASE_NAME}-${env.TURSO_ORG}.aws-us-east-1.turso.io`;

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dialect: "turso",
	dbCredentials: {
		url,
		authToken: env.TURSO_AUTH_TOKEN,
	},
});
