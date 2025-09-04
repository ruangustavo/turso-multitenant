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
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const createDatabase = async (tenant: string) => {
  try {
    await turso.databases.create(tenant, {
      group: "default",
    });
    return true;
  } catch (error) {
    console.error("Database creation failed:", error);
    return false;
  }
};

export const runMigrations = async (tenant: string) => {
  try {
    const db = getDatabaseClient(tenant);

    if (!db) {
      return false;
    }

    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    return false;
  }
};

export const setupTenantDatabase = async (tenant: string): Promise<boolean> => {
  const dbCreated = await createDatabase(tenant);
  if (!dbCreated) return false;

  const migrationsRun = await runMigrations(tenant);
  if (!migrationsRun) {
    return false;
  }

  return true;
};

export const getDatabaseClient = (tenant?: string) => {
  if (!tenant || typeof tenant !== "string") {
    console.error("Failed to create database client: Invalid tenant.");
    return null;
  }

  const dbName = tenant.toLowerCase();
  const url = `libsql://${dbName}-${env.TURSO_ORG}.aws-us-east-1.turso.io`;

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
