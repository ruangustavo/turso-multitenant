import type { FastifyPluginAsync } from "fastify";
import { treeifyError, z } from "zod/v4";
import { todos as todosTable } from "../db/schema";
import { authTenantPlugin } from "../plugins/auth-tenant";

export const todosRoutes: FastifyPluginAsync = async (app) => {
  app.register(authTenantPlugin);

  app.get("/todos", async (request) => {
    const db = request.db;
    const todos = await db.select().from(todosTable);
    return todos;
  });

  app.post("/todos", async (request, reply) => {
    const db = request.db;

    const schema = z.object({
      title: z.string().min(1, "Field 'title' is required"),
      completed: z.boolean().optional(),
    });

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return {
        error: "Invalid request body",
        details: treeifyError(parsed.error),
      };
    }

    const inserted = await db
      .insert(todosTable)
      .values(parsed.data)
      .returning();

    return reply.status(201).send(inserted[0]);
  });
};
