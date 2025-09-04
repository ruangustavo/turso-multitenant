import type { FastifyPluginAsync } from "fastify";
import { treeifyError, z } from "zod/v4";
import { checkDatabaseExists, createDatabase } from "../db/utils";

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
      const result = await createDatabase(tenant);
      if (!result) return { error: "Failed to create database" };
    } else {
      return { error: "Tenant already exists" };
    }
  });
};
