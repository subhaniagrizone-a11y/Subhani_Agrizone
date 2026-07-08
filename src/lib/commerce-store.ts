const WISHLIST_KEY = "subhani:wishlist";
const COMPARE_KEY = "subhani:compare";
const CART_KEY = "subhani:cart";

type ProductId = string;

type CartMap = Record<ProductId, number>;

type StoreKey = typeof WISHLIST_KEY | typeof COMPARE_KEY | typeof CART_KEY;

function isBrowser() {
  return typeof window !== "undefined";
}

function readArray(key: StoreKey) {
  if (!isBrowser()) return [] as string[];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeArray(key: StoreKey, values: string[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(values));
}

function readCart() {
  if (!isBrowser()) return {} as CartMap;

  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as CartMap) : {};
  } catch {
    return {};
  }
}

function writeCart(cart: CartMap) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function broadcast() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event("commerce-store-updated"));
}

export function getWishlistIds() {
  return readArray(WISHLIST_KEY);
}

export function toggleWishlist(productId: string) {
  const items = readArray(WISHLIST_KEY);
  const next = items.includes(productId)
    ? items.filter((item) => item !== productId)
    : [...items, productId];
  writeArray(WISHLIST_KEY, next);
  broadcast();
  return next.includes(productId);
}

export function getCompareIds() {
  return readArray(COMPARE_KEY);
}

export function toggleCompare(productId: string) {
  const items = readArray(COMPARE_KEY);
  const next = items.includes(productId)
    ? items.filter((item) => item !== productId)
    : [...items, productId];
  writeArray(COMPARE_KEY, next);
  broadcast();
  return next.includes(productId);
}

export function getCart() {
  return readCart();
}

export function getCartCount() {
  return Object.values(readCart()).reduce((sum, quantity) => sum + quantity, 0);
}

export function addToCart(productId: string, quantity = 1) {
  const cart = readCart();
  cart[productId] = Math.max(1, (cart[productId] ?? 0) + quantity);
  writeCart(cart);
  broadcast();
  return cart[productId];
}

export function setCartQuantity(productId: string, quantity: number) {
  const cart = readCart();
  if (quantity <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = Math.max(1, Math.floor(quantity));
  }
  writeCart(cart);
  broadcast();
  return cart[productId] ?? 0;
}

export function removeFromCart(productId: string) {
  const cart = readCart();
  delete cart[productId];
  writeCart(cart);
  broadcast();
}

export function clearCart() {
  writeCart({});
  broadcast();
}

export function subscribeToCommerceStore(callback: () => void) {
  if (!isBrowser()) return () => undefined;

  const listener = () => callback();
  window.addEventListener("commerce-store-updated", listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener("commerce-store-updated", listener);
    window.removeEventListener("storage", listener);
  };
}
