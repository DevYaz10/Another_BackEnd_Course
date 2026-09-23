import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { APP_URL } from "../config/env.js";

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const isAdmin = (request) => request.user.role === "admin";

// Load a subscription and assert the caller may touch it.
// Every :id route goes through this — without it any logged-in user could read,
// update or delete someone else's subscription just by guessing an id (IDOR).
const findOwnedSubscription = async (request, id) => {
  const subscription = await Subscription.findById(id);
  if (!subscription) throw httpError(404, "Subscription not found");

  const isOwner = String(subscription.user) === String(request.user.userId);
  if (!isOwner && !isAdmin(request)) {
    throw httpError(403, "Not authorized for this resource");
  }
  return subscription;
};

// GET /api/v1/subscription
export const getSubscriptions = async (request, reply) => {
  if (!isAdmin(request)) throw httpError(403, "Admins only");

  const subscriptions = await Subscription.find();
  return reply.send({ success: true, count: subscriptions.length, data: subscriptions });
};

// GET /api/v1/subscription/:id
export const getSubscription = async (request, reply) => {
  const subscription = await findOwnedSubscription(request, request.params.id);
  return reply.send({ success: true, data: subscription });
};

// POST /api/v1/subscription
export const createSubscription = async (request, reply) => {
  const {
    name, price, currency, frequency,
    category, paymentMethod, startDate, renewalDate,
  } = request.body;

  const subscription = await Subscription.create({
    name, price, currency, frequency,
    category, paymentMethod, startDate, renewalDate,
    user: request.user.userId,
  });

  
  await workflowClient.trigger({
    url: `${APP_URL}/api/v1/workflow/subscription/reminder`,
    body: { subscriptionId: subscription._id },
  });


  return reply.code(201).send({ success: true, data: subscription });
};

// PUT /api/v1/subscription/:id
export const updateSubscription = async (request, reply) => {
  const subscription = await findOwnedSubscription(request, request.params.id);

  const {
    name, price, currency, frequency,
    category, paymentMethod, startDate, renewalDate,
  } = request.body;

  const patch = { name, price, currency, frequency, category, paymentMethod, startDate, renewalDate };
  for (const [field, value] of Object.entries(patch)) {
    if (value !== undefined) subscription[field] = value;   // only overwrite what was sent
  }

  await subscription.save();   // validators + the pre-save hook both run here
  return reply.send({ success: true, data: subscription });
};

// DELETE /api/v1/subscription/:id
export const deleteSubscription = async (request, reply) => {
  const subscription = await findOwnedSubscription(request, request.params.id);
  await subscription.deleteOne();
  return reply.send({ success: true, message: "Subscription deleted" });
};

// GET /api/v1/subscription/user/:id
export const getUserSubscriptions = async (request, reply) => {
  const { id } = request.params;

  const isSelf = String(request.user.userId) === String(id);
  if (!isSelf && !isAdmin(request)) throw httpError(403, "Not authorized for this resource");

  const subscriptions = await Subscription.find({ user: id });
  return reply.send({ success: true, count: subscriptions.length, data: subscriptions });
};

// PUT /api/v1/subscription/:id/cancel
export const cancelSubscription = async (request, reply) => {
  const subscription = await findOwnedSubscription(request, request.params.id);

  if (subscription.status === "canceled") throw httpError(409, "Subscription is already canceled");

  subscription.status = "canceled";
  await subscription.save();
  return reply.send({ success: true, data: subscription });
};

// PUT /api/v1/subscription/upcoming-renewals/:id
export const upcomingRenewals = async (request, reply) => {
  const { id } = request.params;

  const isSelf = String(request.user.userId) === String(id);
  if (!isSelf && !isAdmin(request)) throw httpError(403, "Not authorized for this resource");

  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const subscriptions = await Subscription.find({
    user: id,
    status: "active",
    renewalDate: { $gte: now, $lte: inSevenDays },
  }).sort({ renewalDate: 1 });

  return reply.send({ success: true, count: subscriptions.length, data: subscriptions });
};