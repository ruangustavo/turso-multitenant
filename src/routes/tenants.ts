import { hash } from "bcrypt";
import type { FastifyPluginAsync } from "fastify";
import { treeifyError, z } from "zod/v4";
import { users as usersTable } from "../db/schema";
import {
  checkDatabaseExists,
  getDatabaseClient,
  setupTenantDatabase,
} from "../db/utils";

export const tenantsRoutes: FastifyPluginAsync = async (app) => {
  app.post("/tenants", async (request) => {
    const tenantSchema = z.object({
      name: z
        .string()
        .min(1, "Field 'name' is required")
        .max(51)
        .regex(
          /^[a-z0-9-]+$/,
          "Name must only contain numbers, lowercase letters, and dashes",
        ),
      username: z.string().min(1, "Field 'username' is required"),
      password: z.string().min(1, "Field 'password' is required"),
    });

    const tenantParsed = tenantSchema.safeParse(request.body);
    if (!tenantParsed.success) {
      return {
        error: "Invalid request body",
        details: treeifyError(tenantParsed.error),
      };
    }

    const tenant = tenantParsed.data.name;
    const tenantExists = await checkDatabaseExists(tenant);

    if (!tenantExists) {
      const result = await setupTenantDatabase(tenant);
      if (!result) return { error: "Failed to create database" };
    } else {
      return { error: "Tenant already exists" };
    }

    const db = getDatabaseClient(tenant);
    if (!db) return { error: "Failed to create database client" };

    const hashedPassword = await hash(tenantParsed.data.password, 10);

    const createdUser = await db
      .insert(usersTable)
      .values({
        username: tenantParsed.data.username,
        password: hashedPassword,
      })
      .returning();

    if (!createdUser) return { error: "Failed to create user" };
  });
};
