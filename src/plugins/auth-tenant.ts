import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { authPlugin } from "./auth";
import { tenantPlugin } from "./tenant";

// Register auth and tenant plugin for convenience
export const authTenantPlugin = fastifyPlugin(async (app: FastifyInstance) => {
  app.register(authPlugin);
  app.register(tenantPlugin);
});
