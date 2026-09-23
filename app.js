import Fastify from "fastify";
import cookie from "@fastify/cookie";
import formbody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import rawBody from "fastify-raw-body";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import workflowRoutes from "./routes/workflow.routes.js";
import { PORT, NODE_ENV, JWT_SECRET, JWT_EXPIRES_IN } from "./config/env.js";
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

// Authentication by token
await fastify.register(jwt, {
  secret: JWT_SECRET,
  sign: { expiresIn: JWT_EXPIRES_IN || "1d" },
  cookie: { cookieName: "token", signed: false },
});

fastify.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    request.log.warn({ code: err.code, msg: err.message }, "jwt verify failed");
    reply.code(401).send({ success: false, error: "Unauthorized", code: err.code });
  }
});

await fastify.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  errorResponseBuilder: (request, context) => ({
    statusCode: 429,
    success: false,
    error: `Too many requests, retry in ${context.after}`,
  }),
});

await fastify.register(rawBody, {
  field: "rawBody",   // request.rawBody
  global: false,      // only routes that opt in
  encoding: "utf8",   // a string, which is what signature verification wants
  runFirst: true,     // grab it before any other preParsing hook
});


// Routes
await fastify.register(authRoutes, { prefix: "/api/v1/auth" });
await fastify.register(userRoutes, { prefix: "/api/v1/user" });
await fastify.register(subscriptionRoutes, { prefix: "/api/v1/subscription" });
await fastify.register(workflowRoutes, { prefix: "/api/v1/workflow" });

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
