import type { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

export const authPlugin = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (_error) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });
});
