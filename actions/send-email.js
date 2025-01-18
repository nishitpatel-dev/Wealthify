"use server"

import { Resend } from "resend";

export async function sendEmail({ to, subject, reactComponent }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const { data } = await resend.emails.send({
      from: "Wealthify <onboarding@resend.dev>",
      to,
      subject,
      react: reactComponent,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send an email:", error);
    return { success: false, error };
  }
}
