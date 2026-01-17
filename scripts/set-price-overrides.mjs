/* Set admin Override ceny using the public admin API.
   Usage: node scripts/set-price-overrides.mjs [baseUrl]
   Defaults to http://localhost:3000
*/

const baseUrl = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';
const cookieHeader = process.env.COOKIE || process.env.COOKIE_HEADER || '';

const priceMap = {
  // Akcje (USD)
  AMZN: 241.56,
  META: 648.69,
  MSFT: 483.47,
  NVDA: 189.11,
  TSLA: 431.41,
  // Indeksy
  US500: 6920.92,
  US30: 48996.08,
  US100: 25761.0,
  DE40: 25047.66,
  // FX
  EURPLN: 4.20895,
  EURUSD: 1.16715,
  GBPUSD: 1.34469,
  USDPLN: 3.6043,
  USDJPY: 156.69,
  // Ropa
  WTI: 56.82,
  BRENT: 60.84,
  // Metale
  XAUUSD: 4426.88,
  XAGUSD: 74.64, // midpoint of bid/ask
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function putOverride(asset, price) {
  const url = `${baseUrl}/api/panel/price-override/${encodeURIComponent(asset)}`;
  const r = await fetch(url, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({ price }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`PUT ${asset} ${r.status} ${t}`);
  }
}

async function getOverride(asset) {
  const url = `${baseUrl}/api/panel/price-override/${encodeURIComponent(asset)}`;
  const r = await fetch(url, {
    cache: 'no-store',
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });
  if (!r.ok) throw new Error(`GET ${asset} ${r.status}`);
  return r.json();
}

async function main() {
  console.log(`Setting overrides on ${baseUrl}`);
  const entries = Object.entries(priceMap);
  for (const [asset, price] of entries) {
    try {
      if (!Number.isFinite(price) || price <= 0) {
        console.warn(`Skip ${asset}: invalid price ${price}`);
        continue;
      }
      await putOverride(asset, price);
      // slight delay to ensure updated_at granularity and DB commit
      await sleep(50);
      const j = await getOverride(asset);
      console.log(
        `${asset.padEnd(7)} -> ${String(j?.price ?? '').padEnd(10)} updatedAt: ${j?.updatedAt || '—'} source: ${j?.source || 'unknown'}`
      );
    } catch (e) {
      console.error(`Error on ${asset}:`, e?.message || e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


