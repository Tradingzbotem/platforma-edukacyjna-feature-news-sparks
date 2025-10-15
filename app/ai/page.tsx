import React, { Suspense } from 'react';
import AiClient from './AiClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Ładowanie…</div>}>
      <AiClient />
    </Suspense>
  );
}
