/**
 * Flippening live reads — SHIB in Breeder + price helpers.
 * Public identity: loshamoo
 */
const SHIB = '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'
const BREEDER = '0xa206D322829e04fb5acD36F289eD5367AC3E73e4'
const RPC = process.env.NEXT_PUBLIC_RPC_URL || process.env.MAINNET_RPC_URL || 'https://ethereum.publicnode.com'

// Locked baselines (2026-09-10 fact sheet) — fallbacks only
const FALLBACK = {
  shibPrice: 5.115e-6,
  circ: 589.239e12,
  ethDexLpUsd: 4.03e6,
  cexFloat: 87e12,
  asOf: '2026-09-10 (fallback)'
}

async function ethCall(to, data) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to, data }, 'latest']
    })
  })
  const j = await res.json()
  if (j.error) throw new Error(j.error.message || 'eth_call failed')
  return j.result
}

function hexToBigInt(hex) {
  if (!hex || hex === '0x') return 0n
  return BigInt(hex)
}

async function fetchShibPrice() {
  try {
    const url =
      'https://api.coingecko.com/api/v3/simple/price?ids=shiba-inu&vs_currencies=usd'
    const r = await fetch(url, { headers: { accept: 'application/json' } })
    if (r.ok) {
      const j = await r.json()
      const p = j?.['shiba-inu']?.usd
      if (p && p > 0) return { price: p, source: 'CoinGecko', asOf: new Date().toISOString() }
    }
  } catch (_) {}
  try {
    const url =
      'https://api.dexscreener.com/latest/dex/tokens/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'
    const r = await fetch(url)
    if (r.ok) {
      const j = await r.json()
      const pair = (j.pairs || []).find((p) => p.chainId === 'ethereum') || (j.pairs || [])[0]
      const p = parseFloat(pair?.priceUsd)
      if (p && p > 0) return { price: p, source: 'DexScreener', asOf: new Date().toISOString() }
    }
  } catch (_) {}
  return { price: FALLBACK.shibPrice, source: 'fallback-baseline', asOf: FALLBACK.asOf }
}

export default async function handler(req, res) {
  try {
    // balanceOf(Breeder) selector 0x70a08231 + padded address
    const data =
      '0x70a08231000000000000000000000000' + BREEDER.slice(2).toLowerCase()
    const raw = await ethCall(SHIB, data)
    const wei = hexToBigInt(raw)
    const breederShib = Number(wei) / 1e18
    const priceInfo = await fetchShibPrice()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    res.status(200).json({
      ok: true,
      breederShib,
      breederShibWei: wei.toString(),
      shibPriceUsd: priceInfo.price,
      priceSource: priceInfo.source,
      priceAsOf: priceInfo.asOf,
      circFallback: FALLBACK.circ,
      ethDexLpUsdFallback: FALLBACK.ethDexLpUsd,
      cexFloatFallback: FALLBACK.cexFloat,
      contracts: { shib: SHIB, breeder: BREEDER },
      fetchedAt: new Date().toISOString()
    })
  } catch (e) {
    res.status(200).json({
      ok: false,
      error: String(e.message || e),
      breederShib: 1.261805487e9,
      shibPriceUsd: FALLBACK.shibPrice,
      priceSource: 'fallback-baseline',
      priceAsOf: FALLBACK.asOf,
      circFallback: FALLBACK.circ,
      ethDexLpUsdFallback: FALLBACK.ethDexLpUsd,
      cexFloatFallback: FALLBACK.cexFloat,
      note: 'Using 2026-09-10 baselines; live read failed'
    })
  }
}
