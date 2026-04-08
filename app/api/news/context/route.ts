// app/api/news/context/route.ts — żywe nagłówki RSS dla kontekstu briefów (logika w lib/brief/liveNewsContext.ts)
import { NextResponse } from "next/server";
import { loadLiveNewsContextItemsFromRss } from "@/lib/brief/liveNewsContext";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await loadLiveNewsContextItemsFromRss();
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
