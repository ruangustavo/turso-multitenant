import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "./db/schema";

declare module "fastify" {
	interface FastifyRequest {
		db: LibSQLDatabase<typeof schema>;
	}
}
