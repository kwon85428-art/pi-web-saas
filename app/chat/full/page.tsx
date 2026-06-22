import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';

export default function FullChatPage() {
  return (
    <Suspense>
      <AppShell />
    </Suspense>
  );
}
