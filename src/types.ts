import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type * as schema from "./db/schema";

declare module "fastify" {
  interface FastifyRequest {
    db: LibSQLDatabase<typeof schema>;
    tenant: string;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      userId: number;
      tenant: string;
    };
    user: {
      userId: number;
      tenant: string;
    };
  }
}
