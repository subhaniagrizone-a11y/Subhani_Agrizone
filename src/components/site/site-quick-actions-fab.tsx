"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp, Mail, Phone, PhoneCall } from "lucide-react";
import { Heart, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/components/site/use-site-settings";
import { toWhatsappLink } from "@/lib/utils";
import {
  getCartCount,
  getWishlistIds,
  subscribeToCommerceStore,
} from "@/lib/commerce-store";

export function SiteQuickActionsFab() {
  const { settings } = useSiteSettings();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setCartCount(getCartCount());
      setWishlistCount(getWishlistIds().length);
    };

    sync();
    return subscribeToCommerceStore(sync);
  }, []);

  if (!settings) return null;

  const { features } = settings;
  const hasAny =
    features.floatingWhatsapp ||
    features.floatingCall ||
    features.floatingEmail ||
    features.floatingBackToTop;

  if (!hasAny) {
    return null;
  }

  const whatsappLink = toWhatsappLink(settings.whatsapp);

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2">
      <Button
        asChild
        size="icon"
        variant="outline"
        className="relative rounded-full shadow-lg"
        title="Wishlist"
      >
        <Link href="/wishlist" aria-label="Open wishlist">
          <Heart className="h-4 w-4" />
          {wishlistCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {wishlistCount > 99 ? "99+" : wishlistCount}
            </span>
          ) : null}
        </Link>
      </Button>

      <Button
        asChild
        size="icon"
        variant="outline"
        className="relative rounded-full shadow-lg"
        title="Cart"
      >
        <Link href="/cart" aria-label="Open cart">
          <ShoppingBag className="h-4 w-4" />
          {cartCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </Link>
      </Button>

      {features.floatingWhatsapp ? (
        <Button
          asChild
          size="icon"
          variant="luxury"
          className="rounded-full shadow-lg"
          title="WhatsApp"
        >
          <Link
            href={whatsappLink}
            target="_blank"
            aria-label="WhatsApp support"
          >
            <PhoneCall className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}

      {features.floatingCall ? (
        <Button
          asChild
          size="icon"
          variant="default"
          className="rounded-full shadow-lg"
          title="Call"
        >
          <Link href={`tel:${settings.supportPhone}`} aria-label="Call support">
            <Phone className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}

      {features.floatingEmail ? (
        <Button
          asChild
          size="icon"
          variant="outline"
          className="rounded-full shadow-lg"
          title="Email"
        >
          <Link
            href={`mailto:${settings.supportEmail}`}
            aria-label="Email support"
          >
            <Mail className="h-4 w-4" />
          </Link>
        </Button>
      ) : null}

      {features.floatingBackToTop ? (
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="rounded-full shadow-lg"
          title="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
