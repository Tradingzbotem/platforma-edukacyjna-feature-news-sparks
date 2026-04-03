import { redirect } from "next/navigation";

/** Subskrypcja miesięczna nie jest już oferowana — zachowujemy URL dla starych odnośników. */
export default function SubskrypcjaRedirectPage() {
  redirect("/prawne/nft");
}
