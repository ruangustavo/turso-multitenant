import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { treeifyError, z } from "zod/v4";
import { users as usersTable } from "../db/schema";
import { tenantPlugin } from "../plugins/tenant";

export const authRoutes: FastifyPluginAsync = async (app) => {
  // No sign-up route, the user is created when the tenant is created

  // It means that the tenant id should be passed in the request header (x-tenant)
  app.register(tenantPlugin);

  app.post(
    "/sign-in",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const db = request.db;

      const authSchema = z.object({
        username: z.string().min(1, "Field 'username' is required"),
        password: z.string().min(1, "Field 'password' is required"),
      });

      const authParsed = authSchema.safeParse(request.body);
      if (!authParsed.success) {
        return {
          error: "Invalid request body",
          details: treeifyError(authParsed.error),
        };
      }

      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, authParsed.data.username))
        .get();

      if (!user) {
        return { error: "User not found" };
      }

      const isPasswordValid = await compare(
        authParsed.data.password,
        user.password,
      );

      if (!isPasswordValid) {
        return { error: "Invalid password" };
      }

      const accessToken = await reply.jwtSign(
        {
          userId: user.id,
          tenant: request.tenant,
        },
        { expiresIn: "1h" },
      );

      return { accessToken };
    },
  );
};
