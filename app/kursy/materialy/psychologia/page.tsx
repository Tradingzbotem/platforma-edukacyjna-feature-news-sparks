import { redirect } from "next/navigation";

/** Stary URL materiału — moduł wielolekcyjny pod nową ścieżką. */
export default function Page() {
  redirect("/kursy/materialy/psychologia-inwestowania");
}
