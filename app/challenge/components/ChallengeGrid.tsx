'use client';

import React, { useMemo } from 'react';
import ChallengeCard, { type ChallengeCardProps } from './ChallengeCard';
import { REFRESH_WINDOW_MS } from '../config';

/** proste helpery czasu */
const H = 60 * 60 * 1000;
const D = 24 * H;

function endIn(msFromNow: number) {
  return Date.now() + msFromNow;
}

/** deadline → „nowa runda ≤30s” */
function refreshBy(deadlineMs: number) {
  return deadlineMs + REFRESH_WINDOW_MS;
}

type CardData = Omit<ChallengeCardProps, 'userId' | 'onPick'>;

function useChallengeData(): CardData[] {
  const eod = endIn(8 * H);
  const h48 = endIn(48 * H);
  const h24 = endIn(24 * H);
  const d5  = endIn(5 * D);

  const showTest = process.env.NEXT_PUBLIC_CHALLENGE_TEST === '1';

  return [
    ...(showTest
      ? [{
          title: 'EURUSD — TEST (60s)',
          ticker: 'EURUSD',
          horizon: 'TEST-60s',
          deadlineMs: Date.now() + 60_000,
          nextRefreshByMs: Date.now() + 90_000, // 30s na rozliczanie
          autoNewsFor: ['EURUSD', 'EUR/USD', 'EUR', 'USD'],
        }]
      : []),
    {
      title: 'Ropa WTI — EOD',
      ticker: 'OIL.WTI',
      horizon: 'EOD',
      deadlineMs: eod,
      nextRefreshByMs: refreshBy(eod),
      autoNewsFor: ['WTI', 'OIL', 'OIL.WTI', 'Crude'],
    },
    {
      title: 'DAX — 5 sesji',
      ticker: 'DE40',
      horizon: '5 sesji',
      deadlineMs: d5,
      nextRefreshByMs: refreshBy(d5),
      autoNewsFor: ['DE40', 'DAX', 'GER40'],
    },
    {
      title: 'GOLD — 5 dni',
      ticker: 'XAUUSD',
      horizon: '5 dni',
      deadlineMs: d5,
      nextRefreshByMs: refreshBy(d5),
      autoNewsFor: ['XAUUSD', 'GOLD', 'Złoto'],
    },
    {
      title: 'TESLA — 5 dni',
      ticker: 'TSLA',
      horizon: '5 dni',
      deadlineMs: d5,
      nextRefreshByMs: refreshBy(d5),
      autoNewsFor: ['TSLA', 'Tesla'],
    },
    {
      title: 'NVDA — 5 dni',
      ticker: 'NVDA',
      horizon: '5 dni',
      deadlineMs: d5,
      nextRefreshByMs: refreshBy(d5),
      autoNewsFor: ['NVDA', 'NVIDIA'],
    },
    {
      title: 'AAPL — 5 dni',
      ticker: 'AAPL',
      horizon: '5 dni',
      deadlineMs: d5,
      nextRefreshByMs: refreshBy(d5),
      autoNewsFor: ['AAPL', 'Apple'],
    },
    {
      title: 'EURUSD — 48h',
      ticker: 'EURUSD',
      horizon: '48h',
      deadlineMs: h48,
      nextRefreshByMs: refreshBy(h48),
      autoNewsFor: ['EURUSD', 'EUR/USD', 'EUR', 'USD'],
    },
    {
      title: 'USDJPY — 48h',
      ticker: 'USDJPY',
      horizon: '48h',
      deadlineMs: h48,
      nextRefreshByMs: refreshBy(h48),
      autoNewsFor: ['USDJPY', 'USD/JPY', 'JPY'],
    },
    {
      title: 'BTCUSD — 24h',
      ticker: 'BTCUSD',
      horizon: '24h',
      deadlineMs: h24,
      nextRefreshByMs: refreshBy(h24),
      autoNewsFor: ['BTCUSD', 'BTC', 'Bitcoin'],
    },
    {
      title: 'NATGAS — 5 dni',
      ticker: 'NG',
      horizon: '5 dni',
      deadlineMs: d5,
      nextRefreshByMs: refreshBy(d5),
      autoNewsFor: ['NG', 'NATGAS', 'Natural Gas'],
    },
  ];
}

export default function ChallengeGrid({ userId }: { userId: string }) {
  const items = useChallengeData();

  const grid = useMemo(
    () =>
      items.map((props, i) => (
        <ChallengeCard
          key={`${props.ticker}-${i}`}
          {...props}
          userId={userId}
          onPick={undefined}
        />
      )),
    [items]
  );

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">{grid}</div>
    </div>
  );
}
