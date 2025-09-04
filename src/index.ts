import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import { fastify } from "fastify";
import { env } from "./env";
import { authRoutes } from "./routes/auth";
import { tenantsRoutes } from "./routes/tenants";
import { todosRoutes } from "./routes/todos";

const app = fastify();

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

app.register(todosRoutes);
app.register(tenantsRoutes);
app.register(authRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP server running!");
  });
