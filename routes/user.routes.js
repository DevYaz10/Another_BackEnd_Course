import { getUsers, getUser } from "../controllers/user.controller.js";

const idParam = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
    },
  },
};

export default async function userRoutes(fastify) {
  // every route in this plugin now requires a valid token
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get("/", getUsers);
  fastify.get("/:id", { schema: idParam }, getUser);

  // POST / PUT / DELETE stay as stubs until the course gets there —
  // they inherit the same hook, so they're already protected
}
