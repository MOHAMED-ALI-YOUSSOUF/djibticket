"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";

export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
  },
  handler: async (ctx, { to, subject, html }) => {
    console.log("Sending email to:", to);
console.log("Subject:", subject);
console.log("HTML:", html);
    const response = await fetch("http://localhost:3000/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
    console.log("Email service response:", await response.text());

    if (!response.ok) {
      throw new Error(`Failed to send email: ${await response.text()}`);
    }

    return { success: true };
  },
});