// Przekierowanie z /quizy/egzaminy/cysec na /kursy/egzaminy/cysec/egzamin
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/kursy/egzaminy/cysec/egzamin');
}
