import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, body }) => {
  await resend.emails.send({
    from: "TicketTap <onboarding@resend.dev>",
    to,
    subject,
    html: body,
  });
};
