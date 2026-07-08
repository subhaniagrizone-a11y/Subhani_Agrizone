"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bot,
  Loader2,
  MessageCircle,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSiteSettings } from "@/components/site/use-site-settings";
import { toWhatsappLink } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export function SupportChatbotFab() {
  const { settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Assalam o Alaikum. Main Subhani Agrizone support AI hoon. Aapko weather, crop disease, products, ya order me kis cheez ki help chahiye?",
    },
  ]);

  const whatsappLink = useMemo(() => {
    return toWhatsappLink(settings?.whatsapp ?? "");
  }, [settings?.whatsapp]);

  if (!settings?.features.chatbotEnabled) {
    return null;
  }

  async function handleSend() {
    const prompt = value.trim();
    if (!prompt) return;

    const userMessage: ChatMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setValue("");

    setSending(true);
    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await response.json();
      const reply = String(
        data?.reply ?? "Support service temporarily unavailable. Please retry.",
      );
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Network issue. Please try again in a few seconds.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <Button
          type="button"
          size="lg"
          variant="luxury"
          className="rounded-full px-5 shadow-lg"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <MessageCircle className="h-5 w-5" />
          )}
          {open ? "Close" : "AI Support"}
        </Button>
      </div>

      {open ? (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2rem)] max-w-sm">
          <Card className="border-border/70 bg-card shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-5 w-5 text-primary" />
                AI Support Chatbot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border border-border bg-muted/40 p-3">
                {messages.map((msg, index) => (
                  <div
                    key={`${msg.role}-${index}`}
                    className={msg.role === "user" ? "text-right" : "text-left"}
                  >
                    <span
                      className={
                        msg.role === "user"
                          ? "inline-block rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                          : "inline-block rounded-md bg-background px-3 py-2 text-xs text-foreground"
                      }
                    >
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder="Ask about weather, disease, order, pricing..."
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={sending}
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Smart support active
                </span>
                <Link
                  href={whatsappLink}
                  target="_blank"
                  className="font-semibold text-primary hover:underline"
                >
                  WhatsApp support
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
