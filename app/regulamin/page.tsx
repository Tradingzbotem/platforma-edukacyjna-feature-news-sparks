import { redirect } from "next/navigation";

/** Alias — linki z rejestracji i zewnętrzne mogą wskazywać /regulamin */
export default function RegulaminRedirectPage() {
  redirect("/prawne/warunki");
}
