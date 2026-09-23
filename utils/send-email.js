import { emailTemplates } from "./email-template.js";
import dayjs from "dayjs";
import transporter, { accountEmail } from "../config/nodemailer.js";
import { APP_URL } from "../config/env.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) throw new Error("Missing required parameters");

  const template = emailTemplates.find((t) => t.label === type);
  if (!template) throw new Error("Invalid email type");

  const mailInfo = {
    userName: subscription.user.name,
    subscriptionName: subscription.name,
    renewalDate: dayjs(subscription.renewalDate).format("MMM D, YYYY"),
    planName: subscription.name,
    price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
    paymentMethod: subscription.paymentMethod,
    // these two are read by generateEmailTemplate and were missing:
    accountSettingsLink: `${APP_URL}/api/v1/subscription`,
    supportLink: "mailto:support@example.com",
  };

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  const info = await transporter.sendMail({
    from: accountEmail,
    to,
    subject,
    html: message,
  });

  console.log(`Reminder email sent to ${to}: ${info.response}`);
  return info;
};
