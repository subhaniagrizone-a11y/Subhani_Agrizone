import { sendOrderAdminAlert, sendOrderConfirmationEmail } from "@/lib/email";
import { siteConfig } from "@/lib/data";

type WhatsAppPayload = {
  to: string;
  body: string;
};

type NotificationResult =
  | { ok: true }
  | { ok: false; reason: string; missing?: string[] };

export async function sendWhatsAppNotification(
  payload: WhatsAppPayload,
): Promise<NotificationResult> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const sender = process.env.WHATSAPP_SENDER;

  if (!apiUrl || !token || !sender) {
    return {
      ok: false,
      reason: "not-configured",
      missing: [
        !apiUrl ? "WHATSAPP_API_URL" : "",
        !token ? "WHATSAPP_API_TOKEN" : "",
        !sender ? "WHATSAPP_SENDER" : "",
      ].filter(Boolean),
    };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: payload.to,
      body: payload.body,
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: `whatsapp-api-${response.status}` };
  }

  return { ok: true };
}

export async function sendCheckoutNotifications(payload: {
  orderNumber: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  grandTotal: number;
  estimatedDelivery?: string;
}) {
  const results = await Promise.allSettled([
    payload.customerEmail
      ? sendOrderConfirmationEmail({
          to: payload.customerEmail,
          name: payload.customerName,
          orderNumber: payload.orderNumber,
          grandTotal: payload.grandTotal,
          estimatedDelivery: payload.estimatedDelivery,
          trackUrl: `${siteConfig.url}/dashboard#orders`,
        })
      : Promise.resolve({ ok: false, reason: "missing-email" }),
    sendOrderAdminAlert({
      orderNumber: payload.orderNumber,
      customerName: payload.customerName,
      grandTotal: payload.grandTotal,
      paymentMethod: "Checkout",
      paymentStatus: "PENDING",
    }),
    payload.customerPhone
      ? sendWhatsAppNotification({
          to: payload.customerPhone,
          body: `Your Subhani Agrizone order ${payload.orderNumber} is confirmed. Total ${payload.grandTotal}. Estimated delivery ${payload.estimatedDelivery ?? "shared in dashboard"}.`,
        })
      : Promise.resolve({ ok: false, reason: "missing-phone" }),
  ]);

  return results;
}

export async function sendOrderWhatsAppNotification(payload: {
  orderNumber: string;
  customerName: string;
  customerPhone?: string | null;
  grandTotal: number;
  estimatedDelivery?: string;
}) {
  const targets = [siteConfig.contact.whatsapp, payload.customerPhone]
    .filter(Boolean)
    .filter(
      (value, index, array) => array.indexOf(value) === index,
    ) as string[];

  const results = await Promise.allSettled(
    targets.map((to) =>
      sendWhatsAppNotification({
        to,
        body: `Subhani Agrizone order ${payload.orderNumber} confirmed for ${payload.customerName}. Total ${payload.grandTotal}. Estimated delivery ${payload.estimatedDelivery ?? "shared in dashboard"}.`,
      }),
    ),
  );

  return results;
}
