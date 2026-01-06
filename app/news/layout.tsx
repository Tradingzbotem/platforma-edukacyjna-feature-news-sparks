import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import SlowDataNotice from "@/components/SlowDataNotice";

export default async function NewsLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/logowanie?next=/news");
  }
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
        <SlowDataNotice />
      </div>
      {children}
    </>
  );
}


