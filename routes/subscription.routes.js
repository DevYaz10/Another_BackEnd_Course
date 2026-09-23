import {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getUserSubscriptions,
  cancelSubscription,
  upcomingRenewals,
} from "../controllers/subscription.controller.js";

const userLimit = {
  config: {
    rateLimit: {
      max: 30,
      timeWindow: "1 minute",
      hook: "preHandler",
      keyGenerator: (request) => request.user.userId,
    },
  },
};

export default async function subscriptionRoutes(fastify) {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get("/", getSubscriptions);
  fastify.get("/:id", getSubscription);

  fastify.post("/", userLimit, createSubscription);
  fastify.put("/:id", userLimit, updateSubscription);
  fastify.delete("/:id", userLimit, deleteSubscription);

  fastify.get("/user/:id", getUserSubscriptions);
  fastify.put("/:id/cancel", userLimit, cancelSubscription);
  fastify.put("/upcoming-renewals/:id", upcomingRenewals);
}
