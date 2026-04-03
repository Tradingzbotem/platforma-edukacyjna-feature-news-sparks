import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { getFoundersTokenForUser, getTransferHistoryForToken } from '@/lib/founders-token/service';
import FoundersTokenTransferForm from './FoundersTokenTransferForm';

export const dynamic = 'force-dynamic';

function BenefitsList({ benefits }: { benefits: unknown }) {
  if (benefits == null) {
    return <p className="text-sm text-white/60">Brak listy benefitów w konfiguracji.</p>;
  }
  if (Array.isArray(benefits)) {
    return (
      <ul className="mt-2 list-disc pl-5 text-sm text-white/85 space-y-1">
        {benefits.map((b, i) => (
          <li key={i}>{typeof b === 'string' ? b : JSON.stringify(b)}</li>
        ))}
      </ul>
    );
  }
  if (typeof benefits === 'object') {
    return (
      <pre className="mt-2 text-xs text-white/80 overflow-x-auto rounded-lg border border-white/10 bg-black/20 p-3">
        {JSON.stringify(benefits, null, 2)}
      </pre>
    );
  }
  return <p className="text-sm text-white/85">{String(benefits)}</p>;
}

export default async function FoundersTokenPage() {
  const session = await getSession();
  if (!session.userId) {
    redirect('/logowanie?next=/konto/founders-token');
  }

  const prisma = getPrisma();
  const token = prisma ? await getFoundersTokenForUser(session.userId) : null;
  const transfers = token && prisma ? await getTransferHistoryForToken(token.id) : [];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Founders</h1>
          <p className="mt-1 text-sm text-white/70">
            Członkostwo zarządzane przez FXEduLab — bez łączenia portfela i bez automatycznej weryfikacji on-chain.
          </p>
        </div>
        <Link href="/konto/plan" className="text-sm text-white/70 hover:text-white underline">
          ← Mój dostęp
        </Link>
      </div>

      {!prisma ? (
        <p className="text-sm text-amber-200/90">
          Baza danych jest niedostępna w tym środowisku — dane Founders nie mogą być wczytane.
        </p>
      ) : !token ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-8 text-center">
          <p className="text-lg font-semibold text-white/90">Brak przypisanego członkostwa Founders</p>
          <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">
            Po nadaniu dostępu przez zespół zobaczysz tu status, identyfikator wewnętrzny oraz — gdy to dozwolone —
            możliwość przeniesienia na inne konto na platformie (transfer obsługiwany zgodnie z zasadami projektu).
          </p>
          <Link
            href="/kontakt"
            className="mt-6 inline-flex rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            Kontakt z zespołem
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-wide text-white/50">Kod</div>
              <div className="mt-1 font-mono text-lg font-semibold text-white">{token.code}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-wide text-white/50">Status</div>
              <div className="mt-1 text-lg font-semibold capitalize text-white">{token.status}</div>
              {token.allowAccessWithoutNft ? (
                <p className="mt-2 text-[11px] text-amber-200/90">
                  Aktywowany wyjątek dostępu (trial / promocja / decyzja admina) — bez pełnego powiązania z NFT w rozumieniu
                  biznesowym.
                </p>
              ) : null}
              {!token.accessActive ? (
                <p className="mt-2 text-[11px] text-white/55">
                  Brak aktywnego dostępu aplikacyjnego Founders przy tym statusie. W razie pytań skontaktuj się z zespołem.
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white/90">{token.title}</h2>
            {token.description ? (
              <p className="mt-2 text-sm text-white/75 whitespace-pre-wrap">{token.description}</p>
            ) : null}
          </div>

          {token.imageUrl ? (
            <div className="rounded-xl border border-white/10 overflow-hidden max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={token.imageUrl} alt="" className="w-full h-auto object-cover" />
            </div>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-white/90">Benefity</h3>
            <BenefitsList benefits={token.benefits} />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold text-white/90">Transfer</div>
            <p className="mt-1 text-xs text-white/60">
              {token.status !== 'active'
                ? 'Transfer jest możliwy tylko przy statusie aktywnym.'
                : token.transferLocked
                  ? 'Transfer został zablokowany administracyjnie.'
                  : token.transferable
                    ? 'Możesz przenieść członkostwo na innego użytkownika zarejestrowanego na tej samej platformie (zgodnie z zasadami FXEduLab).'
                    : 'To członkostwo nie podlega samodzielnemu transferowi (ustawienie administracyjne).'}
            </p>
            {token.status === 'active' && token.transferable && !token.transferLocked ? (
              <FoundersTokenTransferForm />
            ) : null}
          </div>

          {transfers.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-white/90">Ostatnie transfery</h3>
              <ul className="mt-2 space-y-2 text-xs text-white/70">
                {transfers.map((t) => (
                  <li key={t.id} className="rounded-lg border border-white/10 bg-black/15 px-3 py-2 font-mono">
                    <span className="text-white/50">{t.createdAt}</span>
                    {' · '}
                    {t.fromUserId ?? '—'} → {t.toUserId ?? '—'}
                    {t.note ? ` · ${t.note}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
