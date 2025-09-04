import { createClient as createLibsqlClient } from "@libsql/client";
import { createClient as createTursoClient } from "@tursodatabase/api";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "../env";
import * as schema from "./schema";

const turso = createTursoClient({
  token: env.TURSO_API_TOKEN,
  org: env.TURSO_ORG,
});

export const checkDatabaseExists = async (tenant: string) => {
  try {
    await turso.databases.get(tenant);
    return true;
  } catch (_error) {
    return false;
  }
};

export const createDatabase = async (tenant: string) => {
  try {
    await turso.databases.create(tenant, {
      group: "default",
    });

    const db = getDatabaseClient(tenant);

    if (!db) {
      return false;
    }

    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const getDatabaseName = (tenant?: string) => {
  if (!tenant || typeof tenant !== "string") return null;
  return tenant.toLowerCase();
};

const getDatabaseUrl = (dbName: string | null) => {
  return dbName ? `${dbName}-${env.TURSO_ORG}.aws-us-east-1.turso.io` : null;
};

const getLibsqlUrl = (tenant?: string) => {
  const dbName = getDatabaseName(tenant);
  const url = getDatabaseUrl(dbName);
  return url ? `libsql://${url}` : null;
};

export const getDatabaseClient = (tenant?: string) => {
  const url = getLibsqlUrl(tenant);

  if (!url) {
    console.error("Failed to create database client: URL is null.");
    return null;
  }

  try {
    const client = createLibsqlClient({
      url,
      authToken: env.TURSO_GROUP_AUTH_TOKEN,
    });

    return drizzle(client, { schema });
  } catch (error) {
    console.error("Failed to create database client:", error);
    return null;
  }
};
