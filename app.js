import Fastify from "fastify";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import { PORT, NODE_ENV } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middlware.js";

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
});


fastify.register(authRoutes, { prefix: '/api/v1/auth' });
fastify.register(userRoutes, { prefix: '/api/v1/user' });
fastify.register(subscriptionRoutes, { prefix: '/api/v1/subscription' });

fastify.use(errorMiddleware);

fastify.get("/", (req, res) => {
  res.send({ hello: "world" });
});

fastify.listen({ port: PORT }, async function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  await connectToDatabase();

});

export default fastify;