/**
 * Gravity live reads — multi-token Zero-Gravity (SHIB | LEASH | AKITA | ELON).
 * Breeder balanceOf + price/circ/LP helpers. Public identity: loshamoo
 *
 * CEX float is an ESTIMATE (heuristic), not an exchange oracle — see cexFloatNote.
 */
const BREEDER = '0xa206D322829e04fb5acD36F289eD5367AC3E73e4'
const RPC =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.MAINNET_RPC_URL ||
  'https://ethereum.publicnode.com'

/** ~15% of circ used as sim baseline for non-SHIB CEX/institutional float (estimate). */
const CEX_FLOAT_RATIO_DEFAULT = 0.15

const CEX_FLOAT_NOTE =
  'CEX/institutional float is an educational estimate, not an exchange custody oracle. SHIB uses a published-ish ~87T baseline; other Breeder memes default to ~15% of circulating supply (UI-overridable).'

/**
 * FALLBACK baselines — estimates only; live CoinGecko / DexScreener / eth_call override when available.
 * Circ approximations from CoinGecko market_data (2026-09); LEASH classic ~107.6k supply.
 */
const TOKEN_DEFS = {
  SHIB: {
    symbol: 'SHIB',
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    decimals: 18,
    logo: '/breederlogos/shib.png',
    coingeckoId: 'shiba-inu',
    fallback: {
      priceUsd: 5.115e-6,
      circ: 589.239e12,
      cexFloat: 87e12,
      ethDexLpUsd: 4.03e6,
      breederBalance: 1.261805487e9
    }
  },
  LEASH: {
    symbol: 'LEASH',
    address: '0x27C70Cd1946795B66be9d954418546998b546634',
    decimals: 18,
    logo: '/breederlogos/leash.png',
    coingeckoId: 'doge-killer',
    fallback: {
      // Classic LEASH circ ~107,646; ETH mainnet spot often thin — price falls back to CG/DS
      priceUsd: 4.0,
      circ: 107646,
      cexFloat: Math.round(107646 * CEX_FLOAT_RATIO_DEFAULT),
      ethDexLpUsd: 1.4e4,
      breederBalance: 0
    }
  },
  AKITA: {
    symbol: 'AKITA',
    address: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6',
    decimals: 18,
    logo: '/breederlogos/akita.png',
    coingeckoId: 'akita-inu',
    fallback: {
      priceUsd: 4.33e-9,
      circ: 92.18e12,
      cexFloat: 92.18e12 * CEX_FLOAT_RATIO_DEFAULT,
      ethDexLpUsd: 2.7e5,
      breederBalance: 0
    }
  },
  ELON: {
    symbol: 'ELON',
    address: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3',
    decimals: 18,
    logo: '/breederlogos/elon.png',
    coingeckoId: 'dogelon-mars',
    fallback: {
      priceUsd: 3.11e-8,
      circ: 1e15,
      cexFloat: 1e15 * CEX_FLOAT_RATIO_DEFAULT,
      ethDexLpUsd: 5.3e6,
      breederBalance: 0
    }
  }
}

const SYMBOLS = Object.keys(TOKEN_DEFS)

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

function balanceOfData(holder) {
  return '0x70a08231000000000000000000000000' + holder.slice(2).toLowerCase()
}

const TOTAL_SUPPLY_DATA = '0x18160ddd'

async function readTokenBalance(tokenAddr, decimals) {
  const raw = await ethCall(tokenAddr, balanceOfData(BREEDER))
  const wei = hexToBigInt(raw)
  const bal = Number(wei) / 10 ** decimals
  return { balance: bal, wei: wei.toString() }
}

async function readTotalSupply(tokenAddr, decimals) {
  try {
    const raw = await ethCall(tokenAddr, TOTAL_SUPPLY_DATA)
    const wei = hexToBigInt(raw)
    return Number(wei) / 10 ** decimals
  } catch (_) {
    return null
  }
}

async function fetchCoinGeckoPrices(ids) {
  const url =
    'https://api.coingecko.com/api/v3/simple/price?ids=' +
    ids.join(',') +
    '&vs_currencies=usd'
  const r = await fetch(url, { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error('CoinGecko price HTTP ' + r.status)
  return r.json()
}

async function fetchCoinGeckoCircs(ids) {
  // markets endpoint returns circulating_supply in one shot
  const url =
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' +
    ids.join(',') +
    '&per_page=50'
  const r = await fetch(url, { headers: { accept: 'application/json' } })
  if (!r.ok) throw new Error('CoinGecko markets HTTP ' + r.status)
  const arr = await r.json()
  const out = {}
  for (const row of arr || []) {
    if (row?.id && Number.isFinite(row.circulating_supply) && row.circulating_supply > 0) {
      out[row.id] = row.circulating_supply
    }
  }
  return out
}

async function fetchDexScreener(tokenAddr) {
  const url = 'https://api.dexscreener.com/latest/dex/tokens/' + tokenAddr
  const r = await fetch(url)
  if (!r.ok) throw new Error('DexScreener HTTP ' + r.status)
  const j = await r.json()
  const pairs = j.pairs || []
  const eth = pairs.filter((p) => p.chainId === 'ethereum')
  const pool = eth.length
    ? eth.reduce((best, p) => {
        const liq = Number(p?.liquidity?.usd) || 0
        const bestLiq = Number(best?.liquidity?.usd) || 0
        return liq >= bestLiq ? p : best
      }, eth[0])
    : pairs[0]
  if (!pool) return null
  const price = parseFloat(pool.priceUsd)
  const liq = Number(pool?.liquidity?.usd)
  return {
    priceUsd: price > 0 ? price : null,
    ethDexLpUsd: Number.isFinite(liq) && liq > 0 ? liq : null,
    pairAddress: pool.pairAddress || null
  }
}

function cexFloatFor(symbol, circ, fallbackCex) {
  if (symbol === 'SHIB') return fallbackCex
  if (Number.isFinite(circ) && circ > 0) return circ * CEX_FLOAT_RATIO_DEFAULT
  return fallbackCex
}

async function buildToken(symbol, shared) {
  const def = TOKEN_DEFS[symbol]
  const fb = def.fallback
  let breederBalance = fb.breederBalance
  let breederWei = null
  let priceUsd = fb.priceUsd
  let priceSource = 'fallback-baseline'
  let circ = fb.circ
  let circSource = 'fallback-baseline'
  let ethDexLpUsd = fb.ethDexLpUsd
  let lpSource = 'fallback-baseline'
  let errors = []

  // 1) Live Breeder balance
  try {
    if (shared.balances?.[symbol]) {
      breederBalance = shared.balances[symbol].balance
      breederWei = shared.balances[symbol].wei
    } else {
      const b = await readTokenBalance(def.address, def.decimals)
      breederBalance = b.balance
      breederWei = b.wei
    }
  } catch (e) {
    errors.push('balance: ' + (e.message || e))
  }

  // 2) Price: CoinGecko → DexScreener (sanity-checked) → FALLBACK
  const cgPrice = shared.cgPrices?.[def.coingeckoId]?.usd
  if (Number.isFinite(cgPrice) && cgPrice > 0) {
    priceUsd = cgPrice
    priceSource = 'CoinGecko'
  } else if (shared.dex?.[symbol]?.priceUsd) {
    const dexPx = shared.dex[symbol].priceUsd
    // LEASH ETH pairs are often dust/scam quotes; reject absurdly low prices
    const absurd =
      (symbol === 'LEASH' && dexPx < 1e-6) ||
      (symbol !== 'LEASH' && fb.priceUsd > 0 && dexPx < fb.priceUsd / 1e6)
    if (!absurd) {
      priceUsd = dexPx
      priceSource = 'DexScreener'
    } else {
      errors.push('price: DexScreener quote rejected as absurd; using fallback')
    }
  }

  // 3) Circ: CoinGecko circulating_supply → (SHIB: FALLBACK; burns) → sane totalSupply → FALLBACK
  const cgCirc = shared.cgCircs?.[def.coingeckoId]
  if (Number.isFinite(cgCirc) && cgCirc > 0) {
    circ = cgCirc
    circSource = 'CoinGecko'
  } else if (symbol === 'SHIB') {
    // SHIB totalSupply ~1e15 includes burned; circ baseline is the usable market float
    circ = fb.circ
    circSource = 'fallback-baseline'
  } else {
    let ts = shared.totalSupplies?.[symbol]
    if (ts == null) {
      try {
        ts = await readTotalSupply(def.address, def.decimals)
      } catch (e) {
        errors.push('circ: ' + (e.message || e))
      }
    }
    // LEASH classic circ ~107k; reject wildly inflated on-chain totals when CG is unavailable
    const insaneTs =
      Number.isFinite(ts) &&
      ts > 0 &&
      ((symbol === 'LEASH' && ts > fb.circ * 100) || (fb.circ > 0 && ts > fb.circ * 1e6))
    if (Number.isFinite(ts) && ts > 0 && !insaneTs) {
      circ = ts
      circSource = 'totalSupply'
    } else {
      if (insaneTs) errors.push('circ: on-chain totalSupply rejected as inconsistent with known circ baseline')
      circ = fb.circ
      circSource = 'fallback-baseline'
    }
  }

  // 4) ETH DEX LP USD
  const dexLp = shared.dex?.[symbol]?.ethDexLpUsd
  if (Number.isFinite(dexLp) && dexLp > 0) {
    ethDexLpUsd = dexLp
    lpSource = 'DexScreener'
  }

  const cexFloatFallback = cexFloatFor(symbol, circ, fb.cexFloat)

  return {
    symbol: def.symbol,
    address: def.address,
    decimals: def.decimals,
    logo: def.logo,
    breederBalance,
    breederWei,
    priceUsd,
    priceSource,
    circ,
    circSource,
    cexFloatFallback,
    ethDexLpUsd,
    lpSource,
    coingeckoId: def.coingeckoId,
    cexFloatNote: CEX_FLOAT_NOTE,
    cexFloatRatioUsed: symbol === 'SHIB' ? null : CEX_FLOAT_RATIO_DEFAULT,
    ...(errors.length ? { warnings: errors } : {})
  }
}

export default async function handler(req, res) {
  const fetchedAt = new Date().toISOString()
  const ids = SYMBOLS.map((s) => TOKEN_DEFS[s].coingeckoId)

  // Parallel fan-out: balances, CG price, CG circ, DexScreener per token
  const balancePromises = Object.fromEntries(
    SYMBOLS.map((sym) => [
      sym,
      readTokenBalance(TOKEN_DEFS[sym].address, TOKEN_DEFS[sym].decimals).catch((e) => {
        return { error: String(e.message || e) }
      })
    ])
  )
  const dexPromises = Object.fromEntries(
    SYMBOLS.map((sym) => [
      sym,
      fetchDexScreener(TOKEN_DEFS[sym].address).catch(() => null)
    ])
  )
  const totalSupplyPromises = Object.fromEntries(
    SYMBOLS.map((sym) => [
      sym,
      readTotalSupply(TOKEN_DEFS[sym].address, TOKEN_DEFS[sym].decimals).catch(() => null)
    ])
  )

  const [cgPricesSettled, cgCircsSettled, balEntries, dexEntries, tsEntries] = await Promise.all([
    fetchCoinGeckoPrices(ids).catch(() => null),
    fetchCoinGeckoCircs(ids).catch(() => null),
    Promise.all(SYMBOLS.map(async (s) => [s, await balancePromises[s]])),
    Promise.all(SYMBOLS.map(async (s) => [s, await dexPromises[s]])),
    Promise.all(SYMBOLS.map(async (s) => [s, await totalSupplyPromises[s]]))
  ])

  const balances = {}
  for (const [sym, val] of balEntries) {
    if (val && !val.error && Number.isFinite(val.balance)) balances[sym] = val
  }
  const dex = Object.fromEntries(dexEntries)
  const totalSupplies = {}
  for (const [sym, val] of tsEntries) {
    if (Number.isFinite(val) && val > 0) totalSupplies[sym] = val
  }

  const shared = {
    balances,
    cgPrices: cgPricesSettled || {},
    cgCircs: cgCircsSettled || {},
    dex,
    totalSupplies
  }

  try {
    const tokens = {}
    for (const sym of SYMBOLS) {
      tokens[sym] = await buildToken(sym, shared)
    }

    const shib = tokens.SHIB
    const anyLive = SYMBOLS.some((s) => shared.balances[s])
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    res.status(200).json({
      ok: true,
      fetchedAt,
      tokens,
      // Backward-compatible SHIB top-level fields
      breederShib: shib.breederBalance,
      breederShibWei: shib.breederWei,
      shibPriceUsd: shib.priceUsd,
      priceSource: shib.priceSource,
      priceAsOf: fetchedAt,
      circFallback: shib.circ,
      ethDexLpUsdFallback: shib.ethDexLpUsd,
      cexFloatFallback: shib.cexFloatFallback,
      cexFloatNote: CEX_FLOAT_NOTE,
      contracts: {
        breeder: BREEDER,
        tokens: Object.fromEntries(SYMBOLS.map((s) => [s, TOKEN_DEFS[s].address]))
      },
      note: anyLive ? undefined : 'Live eth_call balances unavailable; using fallbacks where needed'
    })
  } catch (e) {
    const fb = TOKEN_DEFS.SHIB.fallback
    res.status(200).json({
      ok: false,
      error: String(e.message || e),
      fetchedAt,
      tokens: Object.fromEntries(
        SYMBOLS.map((s) => {
          const d = TOKEN_DEFS[s]
          const f = d.fallback
          return [
            s,
            {
              symbol: d.symbol,
              address: d.address,
              decimals: d.decimals,
              logo: d.logo,
              breederBalance: f.breederBalance,
              priceUsd: f.priceUsd,
              priceSource: 'fallback-baseline',
              circ: f.circ,
              circSource: 'fallback-baseline',
              cexFloatFallback: f.cexFloat,
              ethDexLpUsd: f.ethDexLpUsd,
              lpSource: 'fallback-baseline',
              coingeckoId: d.coingeckoId,
              cexFloatNote: CEX_FLOAT_NOTE
            }
          ]
        })
      ),
      breederShib: fb.breederBalance,
      shibPriceUsd: fb.priceUsd,
      priceSource: 'fallback-baseline',
      priceAsOf: '2026-09-10 (fallback)',
      circFallback: fb.circ,
      ethDexLpUsdFallback: fb.ethDexLpUsd,
      cexFloatFallback: fb.cexFloat,
      cexFloatNote: CEX_FLOAT_NOTE,
      contracts: {
        breeder: BREEDER,
        tokens: Object.fromEntries(SYMBOLS.map((s) => [s, TOKEN_DEFS[s].address]))
      },
      note: 'Using fallback baselines; live read failed'
    })
  }
}
