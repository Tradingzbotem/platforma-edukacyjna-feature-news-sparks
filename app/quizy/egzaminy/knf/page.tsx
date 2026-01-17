// Przekierowanie z /quizy/egzaminy/knf na /kursy/egzaminy/knf/egzamin
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/kursy/egzaminy/knf/egzamin');
}
