import { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Header from '../src/components/Header'
import styled from 'styled-components'

const SHIB_CIRC_DEFAULT = 589.239e12
const TIERS = [
  { id: 'T1', name: 'Narrative', pctCirc: 0.001, shib: 589.239e9 },
  { id: 'T2', name: 'Depth', pctCirc: 0.01, shib: 5.89239e12 },
  { id: 'T3', name: 'Structural', pctCirc: 0.02, shib: 11.78478e12 },
  { id: 'T4', name: "Can't-ignore", pctCirc: 0.05, shib: 29.46195e12 },
  { id: 'T5', name: 'Co-dominance', pctCirc: 0.1, shib: 58.9239e12 }
]

const App = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  color: #e8e8e8;
`
const Main = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 80px;
`
const H1 = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #f7931a, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`
const Lead = styled.p`
  color: #aaa;
  line-height: 1.5;
  margin: 0 0 24px;
  max-width: 720px;
`
const Banner = styled.div`
  background: rgba(247, 147, 26, 0.12);
  border: 1px solid rgba(247, 147, 26, 0.35);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 24px;
  font-size: 0.9rem;
  color: #f0d9a8;
`
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`
const Card = styled.section`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 18px 20px;
`
const CardTitle = styled.h2`
  font-size: 1.05rem;
  margin: 0 0 12px;
  color: #fff;
`
const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.92rem;
  span:last-child {
    font-weight: 600;
    color: #00d4aa;
    text-align: right;
  }
`
const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  color: #999;
  margin: 12px 0 4px;
`
const Range = styled.input`
  width: 100%;
`
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #bbb;
`
const TierBar = styled.div`
  margin: 10px 0;
`
const TierHead = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 4px;
`
const Track = styled.div`
  height: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: hidden;
`
const Fill = styled.div`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: linear-gradient(90deg, #f7931a, #00d4aa);
`
const Stack = styled.div`
  display: flex;
  height: 28px;
  border-radius: 8px;
  overflow: hidden;
  margin: 12px 0;
`
const Seg = styled.div`
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  min-width: ${({ $pct }) => ($pct > 0 ? '2px' : '0')};
`
const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.8rem;
  color: #aaa;
`
const Dot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  margin-right: 6px;
`
const Foot = styled.p`
  margin-top: 28px;
  font-size: 0.78rem;
  color: #777;
  line-height: 1.45;
`
const LinkA = styled.a`
  color: #00d4aa;
`
const Band = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(0, 212, 170, 0.08);
  border: 1px solid rgba(0, 212, 170, 0.25);
  font-size: 0.9rem;
`

function fmtShib(n) {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}
function fmtUsd(n) {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K'
  return '$' + n.toFixed(2)
}
function fmtPct(n, digits = 4) {
  if (!Number.isFinite(n)) return '—'
  return (n * 100).toFixed(digits) + '%'
}

/** MODEL heuristic — educational only, never a price promise */
function impactBand({ pctCirc, depthMultiple, cexPressured }) {
  // Combine durable % circ with depth vs assumed ETH DEX LP and CEX-float pressure
  let score = 0
  if (pctCirc >= 0.1) score += 5
  else if (pctCirc >= 0.05) score += 4
  else if (pctCirc >= 0.02) score += 3
  else if (pctCirc >= 0.01) score += 2
  else if (pctCirc >= 0.001) score += 1
  if (depthMultiple >= 10) score += 2
  else if (depthMultiple >= 5) score += 1.5
  else if (depthMultiple >= 2) score += 1
  if (cexPressured >= 0.3) score += 2
  else if (cexPressured >= 0.1) score += 1
  else if (cexPressured >= 0.05) score += 0.5

  if (score >= 7) return { id: 'structural-discovery', label: 'Structural on-chain discovery pressure (model)', detail: 'High % circ + depth/CEX-float pressure in this toy model.' }
  if (score >= 4.5) return { id: 'depth', label: 'Meaningful depth / discovery band (model)', detail: 'Breeder gravity is material vs assumed on-chain LP depth.' }
  if (score >= 2) return { id: 'narrative', label: 'Narrative notice band (model)', detail: 'Enough to cite on-chain gravity; still far from CEX-scale float.' }
  return { id: 'seed', label: 'Seed / early gravity (model)', detail: 'Live Breeder stake is still tiny vs circ and CEX float proxies.' }
}

export default function FlippeningPage() {
  const [live, setLive] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  // Sliders (initialized from fallbacks; overwritten when live loads)
  const [breederShib, setBreederShib] = useState(1.261805487e9)
  const [shibPrice, setShibPrice] = useState(5.115e-6)
  const [circ, setCirc] = useState(SHIB_CIRC_DEFAULT)
  const [lpDepthUsd, setLpDepthUsd] = useState(4.03e6)
  const [cexFloat, setCexFloat] = useState(87e12)
  const [usePublishedCex, setUsePublishedCex] = useState(true)
  const [extraShib, setExtraShib] = useState(0)
  const [targetTier, setTargetTier] = useState(1) // 1..5 seek

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const r = await fetch('/api/flippening')
      const j = await r.json()
      setLive(j)
      if (j.breederShib != null) setBreederShib(j.breederShib)
      if (j.shibPriceUsd != null) setShibPrice(j.shibPriceUsd)
      if (j.circFallback) setCirc(j.circFallback)
      if (j.ethDexLpUsdFallback) setLpDepthUsd(j.ethDexLpUsdFallback)
      if (j.cexFloatFallback) setCexFloat(j.cexFloatFallback)
      if (!j.ok) setErr(j.error || j.note || 'Live read degraded')
    } catch (e) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const effectiveShib = breederShib + extraShib
  const pctCirc = circ > 0 ? effectiveShib / circ : 0
  const usd = effectiveShib * shibPrice
  const depthMultiple = lpDepthUsd > 0 ? usd / lpDepthUsd : 0
  const cexPressured = cexFloat > 0 ? effectiveShib / cexFloat : 0
  const onchainFloatProxy = Math.max(0, circ - cexFloat)
  const band = impactBand({ pctCirc, depthMultiple, cexPressured })

  const tierProgress = useMemo(
    () =>
      TIERS.map((t) => {
        const target = t.pctCirc * circ
        const pct = target > 0 ? effectiveShib / target : 0
        const gap = Math.max(0, target - effectiveShib)
        return { ...t, target, pct: Math.min(pct, 1), gap, usdTarget: target * shibPrice }
      }),
    [circ, effectiveShib, shibPrice]
  )

  const seek = TIERS[Math.min(4, Math.max(0, targetTier - 1))]
  const seekGap = Math.max(0, seek.pctCirc * circ - effectiveShib)

  const stackBreederPct = Math.min(40, pctCirc * 100 * 50) // visual exaggerate tiny % for bar readability? NO - use real proportions with log note
  // Real proportions: breeder is tiny — show CEX vs rest of circ, with Breeder as thin highlight
  const breederPctOfCirc = pctCirc * 100
  const cexPctOfCirc = circ > 0 ? (cexFloat / circ) * 100 : 0
  const otherPct = Math.max(0, 100 - cexPctOfCirc - breederPctOfCirc)

  return (
    <App>
      <Head>
        <title>Flippening | KumaDex</title>
        <meta
          name="description"
          content="Flippening: model on-chain SHIB gravity in Kuma Breeder vs CEX-dominated discovery. Educational — not a price promise."
        />
      </Head>
      <Header />
      <Main>
        <H1>Flippening</H1>
        <Lead>
          Interactive dashboard for on-chain gravity: how much SHIB in{' '}
          <LinkA href="https://breeder.kumatokens.com" target="_blank" rel="noreferrer">
            Kuma Breeder
          </LinkA>{' '}
          deepens liquidity depth and price <strong>discovery</strong> versus CEX-only flow. Product name only — not a
          &quot;Shib killer&quot; claim.
        </Lead>

        <Banner>
          <strong>MODEL / educational.</strong> Sliders explore illustrative discovery bands. They do{' '}
          <em>not</em> claim staking moves SHIB price. Refresh live reads on load. % of circulating supply is the durable
          milestone bar; USD moves with price.
        </Banner>

        <Grid>
          <Card>
            <CardTitle>Live / modeled Breeder SHIB</CardTitle>
            {loading && <p style={{ color: '#888' }}>Loading…</p>}
            {err && <p style={{ color: '#e8a847', fontSize: '0.85rem' }}>{err}</p>}
            <Stat>
              <span>SHIB in Breeder (effective)</span>
              <span>{fmtShib(effectiveShib)}</span>
            </Stat>
            <Stat>
              <span>% of circ supply</span>
              <span>{fmtPct(pctCirc, 6)}</span>
            </Stat>
            <Stat>
              <span>USD (at assumed price)</span>
              <span>{fmtUsd(usd)}</span>
            </Stat>
            <Stat>
              <span>vs assumed ETH DEX SHIB LP</span>
              <span>{depthMultiple.toFixed(2)}×</span>
            </Stat>
            <Stat>
              <span>% of assumed CEX float</span>
              <span>{fmtPct(cexPressured, 4)}</span>
            </Stat>
            <Band>
              <strong>{band.label}</strong>
              <div style={{ color: '#aaa', marginTop: 4 }}>{band.detail}</div>
            </Band>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: 10 }}>
              Price: {live?.priceSource || '—'} · {live?.priceAsOf || '—'} ·{' '}
              <button type="button" onClick={load} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#00d4aa' }}>
                Refresh
              </button>
            </p>
          </Card>

          <Card>
            <CardTitle>On-chain vs CEX float (model)</CardTitle>
            <Stack>
              <Seg $pct={breederPctOfCirc} $color="#00d4aa" title="Breeder" />
              <Seg $pct={cexPctOfCirc} $color="#f7931a" title="CEX float proxy" />
              <Seg $pct={otherPct} $color="#445" title="Rest of circ (wallets/DEX/etc.)" />
            </Stack>
            <Legend>
              <span>
                <Dot $color="#00d4aa" />
                Breeder {fmtPct(pctCirc, 5)}
              </span>
              <span>
                <Dot $color="#f7931a" />
                CEX float proxy {fmtPct(cexFloat / circ, 2)}
              </span>
              <span>
                <Dot $color="#445" />
                Remainder of circ
              </span>
            </Legend>
            <Stat>
              <span>Assumed CEX float</span>
              <span>{fmtShib(cexFloat)}</span>
            </Stat>
            <Stat>
              <span>Implied non-CEX circ</span>
              <span>{fmtShib(onchainFloatProxy)}</span>
            </Stat>
            <p style={{ fontSize: '0.75rem', color: '#888', marginTop: 10 }}>
              <strong>Source badge:</strong> CEX float default ~87T SHIB ≈ late-Aug 2026 CryptoQuant-via-press proxy
              (med confidence). Refresh before big campaigns. Not live labeled wallet sum.
            </p>
          </Card>
        </Grid>

        <Card style={{ marginTop: 16 }}>
          <CardTitle>Sliders</CardTitle>
          <Label>Live Breeder SHIB (tokens) — seed from chain, then scrub</Label>
          <Range
            type="range"
            min={0}
            max={TIERS[4].shib}
            step={TIERS[4].shib / 1000}
            value={Math.min(breederShib, TIERS[4].shib)}
            onChange={(e) => setBreederShib(Number(e.target.value))}
          />
          <Row>
            <span>{fmtShib(breederShib)}</span>
            <span>or % circ {( (breederShib / circ) * 100 ).toFixed(4)}%</span>
          </Row>

          <Label>What-if extra SHIB enters Breeder</Label>
          <Range
            type="range"
            min={0}
            max={TIERS[4].shib}
            step={TIERS[4].shib / 500}
            value={extraShib}
            onChange={(e) => setExtraShib(Number(e.target.value))}
          />
          <Row>
            <span>+{fmtShib(extraShib)}</span>
            <span>{fmtUsd(extraShib * shibPrice)}</span>
          </Row>

          <Label>Assumed SHIB price (USD)</Label>
          <Range
            type="range"
            min={1e-7}
            max={5e-5}
            step={1e-7}
            value={shibPrice}
            onChange={(e) => setShibPrice(Number(e.target.value))}
          />
          <Row>
            <span>${shibPrice.toExponential(3)}</span>
            <span>circ {fmtShib(circ)}</span>
          </Row>

          <Label>Assumed ETH DEX SHIB LP depth (USD) — impact sensitivity</Label>
          <Range
            type="range"
            min={1e5}
            max={5e7}
            step={1e5}
            value={lpDepthUsd}
            onChange={(e) => setLpDepthUsd(Number(e.target.value))}
          />
          <Row>
            <span>{fmtUsd(lpDepthUsd)}</span>
            <span>depth multiple {depthMultiple.toFixed(2)}×</span>
          </Row>

          <Label>
            Assumed CEX float (SHIB){' '}
            <label style={{ marginLeft: 8 }}>
              <input
                type="checkbox"
                checked={usePublishedCex}
                onChange={(e) => {
                  setUsePublishedCex(e.target.checked)
                  if (e.target.checked) setCexFloat(live?.cexFloatFallback || 87e12)
                }}
              />{' '}
              use published ~87T estimate
            </label>
          </Label>
          <Range
            type="range"
            min={1e12}
            max={200e12}
            step={1e12}
            value={cexFloat}
            disabled={usePublishedCex}
            onChange={(e) => setCexFloat(Number(e.target.value))}
          />
          <Row>
            <span>{fmtShib(cexFloat)}</span>
            <span>{fmtPct(cexPressured, 3)} of float &quot;pressured&quot;</span>
          </Row>

          <Label>Seek tier (1–5)</Label>
          <Range type="range" min={1} max={5} step={1} value={targetTier} onChange={(e) => setTargetTier(Number(e.target.value))} />
          <Row>
            <span>
              {seek.id} {seek.name} ({(seek.pctCirc * 100).toFixed(1)}% circ)
            </span>
            <span>gap {fmtShib(seekGap)}</span>
          </Row>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <CardTitle>Locked ladder T1–T5 (% circ durable)</CardTitle>
          {tierProgress.map((t) => (
            <TierBar key={t.id}>
              <TierHead>
                <span>
                  {t.id} {t.name} — {(t.pctCirc * 100).toFixed(1)}% circ ({fmtShib(t.target)})
                </span>
                <span>
                  {(t.pct * 100).toFixed(1)}% · gap {fmtShib(t.gap)} · {fmtUsd(t.usdTarget)} @ price
                </span>
              </TierHead>
              <Track>
                <Fill $pct={t.pct * 100} />
              </Track>
            </TierBar>
          ))}
        </Card>

        <Foot>
          Contracts: SHIB{' '}
          <LinkA href="https://etherscan.io/token/0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE" target="_blank" rel="noreferrer">
            0x95aD…C4cE
          </LinkA>
          · Breeder{' '}
          <LinkA href="https://etherscan.io/address/0xa206D322829e04fb5acD36F289eD5367AC3E73e4" target="_blank" rel="noreferrer">
            0xa206…73e4
          </LinkA>
          · Breeder app{' '}
          <LinkA href="https://breeder.kumatokens.com" target="_blank" rel="noreferrer">
            breeder.kumatokens.com
          </LinkA>
          . KUMA/WETH LP ~97.5% burned at 0xdead is supporting permanence context, not this calculator&apos;s primary
          input.
          <br />
          <br />
          <strong>Impact heuristic (PR note):</strong> score from (1) % of SHIB circ in Breeder against T1–T5 thresholds,
          (2) Breeder SHIB USD ÷ assumed ETH DEX SHIB LP depth (depth multiple), (3) Breeder SHIB ÷ assumed CEX float.
          Maps to seed / narrative / depth / structural-discovery bands. Explicitly not a price oracle.
        </Foot>
      </Main>
    </App>
  )
}
