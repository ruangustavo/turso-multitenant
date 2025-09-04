import { fastify } from "fastify";
import { tenantsRoutes } from "./routes/tenants";
import { todosRoutes } from "./routes/todos";

const app = fastify();

app.register(todosRoutes);
app.register(tenantsRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP server running!");
  });
