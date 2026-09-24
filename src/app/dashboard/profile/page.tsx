import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-sm text-muted-foreground">
        Profile management is available from your account settings.
      </p>
    </div>
  );
}
