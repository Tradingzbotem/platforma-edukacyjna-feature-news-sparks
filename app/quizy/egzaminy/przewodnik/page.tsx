// Przekierowanie z /quizy/egzaminy/przewodnik na /kursy/egzaminy/przewodnik/egzamin
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/kursy/egzaminy/przewodnik/egzamin');
}
