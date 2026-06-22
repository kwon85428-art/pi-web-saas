import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";

export default function ChatPage() {
  return (
    <Suspense>
      <AppShell />
    </Suspense>
  );
}
