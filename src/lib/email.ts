import nodemailer from "nodemailer";

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type TemplatedMailPayload = {
  to: string;
  subject: string;
  heading: string;
  intro: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export async function sendMail(payload: MailPayload) {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM ?? "subhaniagrizone@gmail.com";
  const user = process.env.SMTP_USER || from;
  const pass =
    process.env.SMTP_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.EMAIL_PASSWORD;
  const missing: string[] = [];

  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");

  if (missing.length > 0) {
    console.info("SMTP not configured; skipping email delivery.");
    return {
      ok: false,
      reason: "not-configured",
      missing,
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  return { ok: true };
}

function wrapEmailTemplate(payload: TemplatedMailPayload) {
  const socials = [
    { label: "Facebook", url: "https://www.facebook.com/569121816289640" },
    { label: "Instagram", url: "https://www.instagram.com/s_agrizone1" },
    { label: "YouTube", url: "https://www.youtube.com/@SubhaniAgrizone" },
  ];

  const cta =
    payload.ctaLabel && payload.ctaUrl
      ? `<p style="margin:20px 0 0"><a href="${payload.ctaUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">${payload.ctaLabel}</a></p>`
      : "";

  return `
  <div style="background:#f8fafc;padding:24px 12px;font-family:Segoe UI,Arial,sans-serif;color:#0f172a">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="padding:22px 24px;background:linear-gradient(135deg,#0f766e,#10b981);color:#ffffff">
        <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.95">Subhani Agrizone</p>
        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.2">${payload.heading}</h1>
      </div>
      <div style="padding:22px 24px">
        <p style="margin:0 0 12px;font-size:15px;line-height:1.7">${payload.intro}</p>
        <div style="font-size:14px;line-height:1.7;color:#1e293b">${payload.bodyHtml}</div>
        ${cta}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #e2e8f0;background:#f8fafc">
        <p style="margin:0 0 8px;font-size:13px;color:#334155">Growing Trust, Harvesting Success.</p>
        <p style="margin:0 0 10px;font-size:12px;color:#475569">Phone: 03007172382, 03167330089 | Email: subhaniagrizone@gmail.com</p>
        <p style="margin:0;font-size:12px;color:#64748b">${socials
          .map(
            (item) =>
              `<a href="${item.url}" style="color:#0f766e;text-decoration:none;margin-right:10px">${item.label}</a>`,
          )
          .join("")}</p>
      </div>
    </div>
  </div>`;
}

export async function sendTemplatedMail(payload: TemplatedMailPayload) {
  const html = wrapEmailTemplate(payload);
  const text = `${payload.heading}\n\n${payload.intro}`;
  return sendMail({
    to: payload.to,
    subject: payload.subject,
    html,
    text,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name?.split(" ")[0] ?? "there";
  return sendTemplatedMail({
    to,
    subject: "Welcome to Subhani Agrizone",
    heading: `Welcome, ${firstName}`,
    intro:
      "Your Subhani Agrizone account is active. You can now explore products, track orders, and manage your profile.",
    bodyHtml:
      "<p>Thank you for joining us. We provide authentic agricultural products and practical support for farmers and dealers across Pakistan.</p>",
    ctaLabel: "Start Shopping",
    ctaUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  });
}

export async function sendEmailVerificationEmail(payload: {
  to: string;
  name: string;
  verifyUrl: string;
}) {
  const firstName = payload.name?.split(" ")[0] ?? "there";
  return sendTemplatedMail({
    to: payload.to,
    subject: "Verify your email - Subhani Agrizone",
    heading: `Verify your email, ${firstName}`,
    intro:
      "Please confirm your email address to activate your account and start using all customer features.",
    bodyHtml:
      "<p>For your security, your account will remain pending until email verification is completed.</p><p>This verification link will expire in 24 hours.</p>",
    ctaLabel: "Verify Email",
    ctaUrl: payload.verifyUrl,
  });
}

export async function sendNewCustomerAdminAlert(payload: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
}) {
  const adminInbox =
    process.env.ADMIN_NOTIFICATION_EMAIL ?? "subhaniagrizone@gmail.com";

  return sendTemplatedMail({
    to: adminInbox,
    subject: "New Customer Registration - Subhani Agrizone",
    heading: "New Customer Registered",
    intro: "A new account has been created on Subhani Agrizone.",
    bodyHtml: `<p><strong>Name:</strong> ${payload.customerName}</p><p><strong>Email:</strong> ${payload.customerEmail}</p><p><strong>Phone:</strong> ${payload.customerPhone ?? "N/A"}</p>`,
    ctaLabel: "Open Admin Dashboard",
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/customers`,
  });
}

export async function sendOrderConfirmationEmail(payload: {
  to: string;
  name: string;
  orderNumber: string;
  grandTotal: number;
  estimatedDelivery?: string;
  trackUrl: string;
}) {
  const firstName = payload.name?.split(" ")[0] ?? "there";
  return sendTemplatedMail({
    to: payload.to,
    subject: `Order ${payload.orderNumber} confirmed - Subhani Agrizone`,
    heading: `Thanks, ${firstName}`,
    intro: `We have received your order ${payload.orderNumber} and it is now being processed.`,
    bodyHtml: `<p><strong>Order number:</strong> ${payload.orderNumber}</p><p><strong>Total:</strong> PKR ${payload.grandTotal.toLocaleString("en-PK")}</p><p><strong>Estimated delivery:</strong> ${payload.estimatedDelivery ?? "Shared in your dashboard"}</p>`,
    ctaLabel: "Track your order",
    ctaUrl: payload.trackUrl,
  });
}

export async function sendOrderAdminAlert(payload: {
  orderNumber: string;
  customerName: string;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
}) {
  const adminInbox =
    process.env.ADMIN_NOTIFICATION_EMAIL ?? "subhaniagrizone@gmail.com";

  return sendTemplatedMail({
    to: adminInbox,
    subject: `New order ${payload.orderNumber} - Subhani Agrizone`,
    heading: `New Order ${payload.orderNumber}`,
    intro: "A new checkout has been completed and is ready for fulfillment.",
    bodyHtml: `<p><strong>Customer:</strong> ${payload.customerName}</p><p><strong>Total:</strong> PKR ${payload.grandTotal.toLocaleString("en-PK")}</p><p><strong>Payment:</strong> ${payload.paymentMethod} (${payload.paymentStatus})</p>`,
    ctaLabel: "Open Orders",
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/orders`,
  });
}

export async function sendPaymentStatusUpdateEmail(payload: {
  to: string;
  name: string;
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  trackUrl: string;
}) {
  const firstName = payload.name?.split(" ")[0] ?? "there";
  return sendTemplatedMail({
    to: payload.to,
    subject: `Payment ${payload.paymentStatus} for ${payload.orderNumber}`,
    heading: `Payment ${payload.paymentStatus}`,
    intro: `Hi ${firstName}, payment status for order ${payload.orderNumber} is now ${payload.paymentStatus}.`,
    bodyHtml: `<p><strong>Order:</strong> ${payload.orderNumber}</p><p><strong>Method:</strong> ${payload.paymentMethod}</p><p><strong>Status:</strong> ${payload.paymentStatus}</p>`,
    ctaLabel: "Track order",
    ctaUrl: payload.trackUrl,
  });
}

export async function sendPaymentFailureAdminAlert(payload: {
  orderNumber: string;
  paymentMethod: string;
  reason?: string;
}) {
  const adminInbox =
    process.env.ADMIN_NOTIFICATION_EMAIL ?? "subhaniagrizone@gmail.com";

  return sendTemplatedMail({
    to: adminInbox,
    subject: `Payment failure ${payload.orderNumber}`,
    heading: "Payment failed",
    intro: `Payment failed for order ${payload.orderNumber}.`,
    bodyHtml: `<p><strong>Order:</strong> ${payload.orderNumber}</p><p><strong>Method:</strong> ${payload.paymentMethod}</p><p><strong>Reason:</strong> ${payload.reason ?? "No reason provided"}</p>`,
    ctaLabel: "Open payment reports",
    ctaUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/orders`,
  });
}
