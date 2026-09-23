import User from "../models/urser.model.js";

const cookieOptions = () => ({
  path: "/",
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24,
});

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

//? here we did not apply "Atomic Operation" because in mongoose it already makes a whole 1 document unlike relational DB 
//? therefore there is no use for the second Check for the transaction
//* we might need it when making subscritipons but not for a simple account signup
export const signUp = async (request, reply) => {
  const { name, email, password } = request.body;

  const existing = await User.findOne({ email });
  if (existing) throw httpError(409, "Email is already registered");

  const user = await User.create({ name, email, password });

  const token = await reply.jwtSign({ userId: user._id });
  return reply.setCookie("token", token, cookieOptions()).code(201).send({
    success: true,
    data: user,
  });
};

export const signIn = async (request, reply) => {
  const { email, password } = request.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw httpError(401, "Invalid email or password");

  const matches = await user.comparePassword(password);
  if (!matches) throw httpError(401, "Invalid email or password"); 

  const token = await reply.jwtSign({ userId: user._id });
  return reply.setCookie("token", token, cookieOptions()).send({
    success: true,
    data: user,
  });
};

export const signOut = async (request, reply) => {
  return reply
    .clearCookie("token", { path: "/" })
    .send({ success: true, message: "Signed out" });
};