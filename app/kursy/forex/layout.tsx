import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Forex — spis lekcji | Kursy",
  description: "Pary, pipsy i loty, zlecenia, dźwignia i plan transakcyjny.",
};

export default function ForexLayout({ children }: { children: ReactNode }) {
  return children;
}
