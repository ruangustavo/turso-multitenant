import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import z, { treeifyError } from "zod/v4";
import { checkDatabaseExists, getDatabaseClient } from "../db/utils";

export const tenantPlugin = fastifyPlugin(async (app: FastifyInstance) => {
  app.decorateRequest("db");
  app.decorateRequest("tenant");

  app.addHook("onRequest", async (request, reply) => {
    const tenantHeader = request.headers["x-tenant"];

    const tenantParsed = z
      .string()
      .min(1, "Tenant is required")
      .safeParse(tenantHeader);

    if (!tenantParsed.success) {
      return reply.status(400).send({
        error: "Invalid tenant",
        details: treeifyError(tenantParsed.error),
      });
    }

    const tenant = tenantParsed.data;
    request.tenant = tenant;

    if (request.user && request.user.tenant !== tenant) {
      return reply.status(403).send({
        error: "Access denied: tenant mismatch",
      });
    }

    const tenantExists = await checkDatabaseExists(tenant);

    if (!tenantExists) {
      return reply.status(400).send({
        error: "Tenant does not exist",
      });
    }

    const db = getDatabaseClient(tenantParsed.data);

    if (!db) {
      return reply
        .status(400)
        .send({ error: "Failed to create database client" });
    }

    request.db = db;
  });
});
