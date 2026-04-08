import { redirect } from 'next/navigation';

/** Alias URL z panelu admina (`/admin/redakcja/new` → istniejący formularz). */
export default function AdminRedakcjaNewAliasPage() {
  redirect('/admin/redakcja/nowy');
}
