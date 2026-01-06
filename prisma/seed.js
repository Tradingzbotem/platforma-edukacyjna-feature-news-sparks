// prisma/seed.js — minimal JS seed to avoid adding TS seed tooling.
// Upserts two published articles mirroring mockArticles content.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const articles = [
    {
      slug: 'wenezuela-usa-ryzyko-dla-ropy',
      title: 'Wenezuela vs USA: rosnące napięcia, sankcje i ryzyko dla ropy',
      excerpt:
        'Napięcia między USA a Wenezuelą ponownie kierują uwagę rynku na ryzyko podażowe w ropie. Oto co warto wiedzieć i jak uporządkować myślenie.',
      content: `**Lead:** Rosnące tarcia dyplomatyczne oraz ryzyko powrotu ostrzejszych sankcji wobec Wenezueli zwiększają niepewność w segmencie ropy ciężkiej. Rynki wyceniają nie tylko wolumeny, ale też logistykę i mieszanki.

## Co się dzieje…
- Sygnały o możliwym zaostrzeniu sankcji zwiększają zmienność na krzywej ropy.
- Dyskusja dotyczy zarówno wolumenów eksportowych, jak i jakości surowca trafiającego na rynek.
- Firmy rafineryjne w USA i na Karaibach monitorują dostępność mieszanki do przerobu.

## Dlaczego rynki reagują
- Wenezuela dostarczała komponenty do mieszanek ważnych dla niektórych konfiguracji rafinerii.
- Ograniczenia podażowe często rozlewają się przez arbitraż i koszty transportu.
- Wrażliwość rośnie przy niskich zapasach i ciasnych marżach rafineryjnych.

## Scenariusze
1. **Bazowy:** Utrzymanie retoryki i okresowych ograniczeń → umiarkowana premia ryzyka w cenie.
2. **Zaostrzenie:** Silniejsze sankcje i utrudnienia logistyczne → presja wzrostowa na wybrane grade'y.
3. **Deeskalacja:** Słabnięcie napięć po rozmowach → krótkoterminowe zbieranie premii ryzyka z ceny.

## Checklist (dla czytającego rynek)
- [ ] Czy pojawiły się twarde decyzje regulacyjne, czy tylko komunikaty?
- [ ] Jak reagują crack spready i różnice między grade’ami?
- [ ] Co mówią dane o zapasach (zwłaszcza cięższych frakcji)?
- [ ] Czy arbitraż na Atlantyku się domyka?

## Mapa wpływu
- **Bezpośrednio:** wycena wybranych miksów, koszty frachtu, marże rafineryjne.
- **Pośrednio:** sentyment do energii, koszyk surowcowy, niektóre waluty surowcowe.

> Uwaga metodologiczna: patrz na łańcuch przyczynowy (sankcje → logistyka → miks → marże), unikaj prostych skrótów.

---
_Niniejszy materiał ma charakter wyłącznie edukacyjny (FX•EDU). Nie stanowi rekomendacji inwestycyjnej ani porady finansowej._`,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-01-06T00:00:00.000Z'),
      coverImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
      coverImageAlt: 'Ropa naftowa – infrastruktura',
      readingTime: 6,
      tags: ['Geopolityka', 'Ropa', 'USA'],
      seoTitle: 'Wenezuela vs USA — ryzyko dla ropy | FX•EDU',
      seoDescription: 'Edukacyjny przegląd ryzyka podażowego w ropie w kontekście sankcji i napięć.',
    },
    {
      slug: 'jak-czytac-naglowki-makro',
      title: 'Jak czytać nagłówki makro bez paniki: 5 zasad dla inwestora edukacyjnego',
      excerpt:
        'Nagłówki makro bywają głośne i mylące. Oto pięć prostych zasad, które pomagają zachować dyscyplinę i ramy interpretacji.',
      content: `## Dlaczego nagłówki mylą
Krótkie formy upraszczają złożoność i akcentują sensację. Potrzebujesz własnego filtra.

## 5 zasad
- **Kontekst:** Zawsze sprawdź bazę porównawczą i trend, nie tylko pojedynczy odczyt.
- **Źródło:** Weryfikuj metodologię i rewizje – pierwsza publikacja to często dopiero wersja robocza.
- **Mechanizm:** Zastanów się nad kanałem transmisji (np. popyt → ceny → oczekiwania).
- **Wrażliwość portfela:** Co to znaczy konkretnie dla Twojej ekspozycji? Mierz, nie zgaduj.
- **Horyzont:** Oddziel reakcję intraday od tezy średnioterminowej.

> „Najgłośniejszy nagłówek rzadko bywa najważniejszy. Najważniejszy bywa najcichszy wykres.”

## Jak trenować
- Prowadź dziennik decyzji i notuj, co naprawdę zmieniło Twoją tezę.
- Czytaj komunikaty źródłowe (bank centralny, urząd statystyczny), nie tylko skróty.
- Zanim zareagujesz – policz warianty i proste scenariusze.

---
_Materiał ma charakter edukacyjny (FX•EDU). To nie jest porada inwestycyjna._`,
      status: 'PUBLISHED',
      publishedAt: new Date('2026-01-03T00:00:00.000Z'),
      coverImageUrl: null,
      coverImageAlt: null,
      readingTime: 5,
      tags: ['Makro', 'Psychologia', 'Ryzyko'],
      seoTitle: 'Jak czytać nagłówki makro — 5 zasad | FX•EDU',
      seoDescription: 'Pięć zasad, które pomagają interpretować nagłówki makro bez paniki.',
    },
  ];

  for (const a of articles) {
    await prisma.article.upsert({
      where: { slug: a.slug },
      create: a,
      update: {
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        status: a.status,
        publishedAt: a.publishedAt,
        coverImageUrl: a.coverImageUrl,
        coverImageAlt: a.coverImageAlt,
        readingTime: a.readingTime,
        tags: a.tags,
        seoTitle: a.seoTitle,
        seoDescription: a.seoDescription,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


