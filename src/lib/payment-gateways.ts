import type { PaymentMethodId } from "@/lib/checkout";
import { createHmac, timingSafeEqual } from "crypto";

export type PaymentGatewaySession = {
  providerReference: string;
  status: "PENDING" | "AUTHORIZED" | "CAPTURED" | "MANUAL_REVIEW";
  nextActionLabel: string;
  instructions: string[];
  redirectUrl?: string;
  webhookSecretRequired: boolean;
};

export type PaymentGatewayContext = {
  orderNumber: string;
  amount: number;
  currency: string;
  method: PaymentMethodId;
  customerEmail?: string | null;
  customerPhone?: string | null;
};

export interface PaymentGatewayAdapter {
  key: string;
  methods: PaymentMethodId[];
  label: string;
  preparePayment(
    context: PaymentGatewayContext,
  ): Promise<PaymentGatewaySession>;
  verifyWebhook?(payload: string, signature: string | null): boolean;
}

function createReference(orderNumber: string, suffix: string) {
  return `${orderNumber}-${suffix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function verifyHmacSignature(
  payload: string,
  signature: string | null,
  secret: string | undefined,
) {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function buildManualSession(
  context: PaymentGatewayContext,
  instructions: string[],
) {
  return Promise.resolve({
    providerReference: createReference(context.orderNumber, "MANUAL"),
    status: "MANUAL_REVIEW" as const,
    nextActionLabel: "Awaiting verification",
    instructions,
    webhookSecretRequired: false,
  });
}

class OfflineGateway implements PaymentGatewayAdapter {
  key = "offline";

  methods: PaymentMethodId[] = ["COD", "BANK_TRANSFER"];

  label = "Offline payments";

  preparePayment(context: PaymentGatewayContext) {
    if (context.method === "COD") {
      return Promise.resolve({
        providerReference: createReference(context.orderNumber, "COD"),
        status: "PENDING" as const,
        nextActionLabel: "Cash on delivery",
        instructions: [
          "No online payment is needed right now.",
          "Keep the order number ready when the courier calls you.",
        ],
        webhookSecretRequired: false,
      });
    }

    return buildManualSession(context, [
      "Transfer the order amount to the bank account shown in checkout.",
      "Add the generated reference to the transaction note so support can verify it quickly.",
      "Manual confirmation is required before the order is marked paid.",
    ]);
  }
}

class JazzCashGateway implements PaymentGatewayAdapter {
  key = "jazzcash";

  methods: PaymentMethodId[] = ["JAZZCASH"];

  label = "JazzCash";

  async preparePayment(context: PaymentGatewayContext) {
    return buildManualSession(context, [
      "Complete the JazzCash transfer on your device.",
      "Paste the transaction reference into checkout before placing the order.",
      "The payment team can verify the order using the reference and order number.",
    ]);
  }

  verifyWebhook(payload: string, signature: string | null) {
    return verifyHmacSignature(
      payload,
      signature,
      process.env.JAZZCASH_WEBHOOK_SECRET,
    );
  }
}

class EasypaisaGateway implements PaymentGatewayAdapter {
  key = "easypaisa";

  methods: PaymentMethodId[] = ["EASYPAISA"];

  label = "Easypaisa";

  async preparePayment(context: PaymentGatewayContext) {
    return buildManualSession(context, [
      "Complete the Easypaisa transfer on your device.",
      "Paste the transaction reference into checkout before placing the order.",
      "The payment team can verify the order using the reference and order number.",
    ]);
  }

  verifyWebhook(payload: string, signature: string | null) {
    return verifyHmacSignature(
      payload,
      signature,
      process.env.EASYPAISA_WEBHOOK_SECRET,
    );
  }
}

class CardGateway implements PaymentGatewayAdapter {
  key = "card";

  methods: PaymentMethodId[] = [
    "DEBIT_CARD",
    "CREDIT_CARD",
    "VISA",
    "MASTERCARD",
  ];

  label = "Card gateway";

  async preparePayment(context: PaymentGatewayContext) {
    return {
      providerReference: createReference(context.orderNumber, "CARD"),
      status: "PENDING" as const,
      nextActionLabel: "Card payment prepared",
      instructions: [
        "The checkout flow is ready for a hosted card gateway or tokenized capture flow.",
        "Attach Stripe, a local PSP, or another provider by replacing this adapter implementation.",
      ],
      webhookSecretRequired: true,
    };
  }

  verifyWebhook(payload: string, signature: string | null) {
    return verifyHmacSignature(
      payload,
      signature,
      process.env.CARD_WEBHOOK_SECRET,
    );
  }
}

const adapters: PaymentGatewayAdapter[] = [
  new OfflineGateway(),
  new JazzCashGateway(),
  new EasypaisaGateway(),
  new CardGateway(),
];

export function getPaymentGatewayAdapter(method: PaymentMethodId) {
  return (
    adapters.find((adapter) => adapter.methods.includes(method)) ?? adapters[0]
  );
}

export function listPaymentGatewayAdapters() {
  return adapters.slice();
}
