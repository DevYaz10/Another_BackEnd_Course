import dayjs from "dayjs";
import { serve } from "@upstash/workflow";
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

const REMINDERS = [7, 5, 2, 1];

const workflow = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`,
    );
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `Reminder ${daysBefore} days before`,
        reminderDate,
      );
    }

    if (dayjs().isSame(reminderDate, "day")) {
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription,
      );
    }
  }
});

// Fastify bridge: web Request -> handler -> web Response
export const sendReminders = async (request, reply) => {
  const webRequest = new Request(
    `${request.protocol}://${request.headers.host}${request.raw.url}`,
    {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.rawBody, // the exact bytes — the SDK verifies the signature with them
    },
  );

  const response = await workflow.handler(webRequest);

  reply.code(response.status);
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() === "content-length") continue; // Fastify recomputes it
    reply.header(key, value);
  }

return reply.send(await response.text());   // was: await response.json()
};

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);
    //* here you could send whatever you want like an sms or a text message but we chose email
    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    });
  });
};
