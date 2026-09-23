import { sendReminders } from "../controllers/workflow.controller.js";

export default async function workflowRoutes(fastify) {
  fastify.post("/subscription/reminder", { config: { rawBody: true } }, sendReminders);
}
