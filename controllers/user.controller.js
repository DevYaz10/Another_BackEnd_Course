import User from "../models/urser.model.js";

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

// only the owner (or an admin) may read a given user document
const assertSelfOrAdmin = (request, id) => {
  const isSelf = String(request.user.userId) === String(id);
  const isAdmin = request.user.role === "admin";
  if (!isSelf && !isAdmin)
    throw httpError(403, "Not authorized for this resource");
};

// GET /api/v1/user
export const getUsers = async (request, reply) => {
  if (request.user.role !== "admin") throw httpError(403, "Admins only");
  const users = await User.find(); // password stays out: select:false + toJSON transform

  return reply.send({
    success: true,
    count: users.length,
    data: users,
  });
};

// GET /api/v1/user/:id
export const getUser = async (request, reply) => {
  const { id } = request.params;

  assertSelfOrAdmin(request, id); // authorization, after authentication

  const user = await User.findById(id); // a malformed id throws CastError -> your errorHandler's 404
  if (!user) throw httpError(404, "User not found");

  return reply.send({ success: true, data: user });
};
