import Fastify from "fastify";
import cookie from "@fastify/cookie";
import formbody from "@fastify/formbody";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import { PORT, NODE_ENV } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});


fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);


await fastify.register(formbody);
await fastify.register(cookie);

// Routes
await fastify.register(authRoutes, { prefix: "/api/v1/auth" });
await fastify.register(userRoutes, { prefix: "/api/v1/user" });
await fastify.register(subscriptionRoutes, { prefix: "/api/v1/subscription" });

fastify.get("/", (request, reply) => {
  reply.send({ hello: "world" });
});

const start = async () => {
  try {
    await connectToDatabase();

    await fastify.listen({ port: PORT });

    fastify.log.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();

export default fastify;
