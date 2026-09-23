import { signUp, signIn, signOut } from "../controllers/auth.controller.js";

// Routes are the endpoints that i wanna hit (i could write the controllers here but it's not so DRY)
// Path: /api/v1/auth/[sign-up, sign-in, etc...] (POST)
export default async function authRoutes(fastify) {
  const strict = { rateLimit: { max: 5, timeWindow: "1 minute", groupId: "auth" } };

  fastify.post("/sign-up", { config: strict }, signUp);
  fastify.post("/sign-in", { config: strict }, signIn);
  fastify.post("/sign-out", signOut);
}
