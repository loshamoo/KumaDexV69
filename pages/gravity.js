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

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px 80px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 20px 16px 60px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px 48px;
  }
`

const PageShell = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`

const HeaderBlock = styled.div`
  text-align: center;
  margin-bottom: 28px;
`

const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 1.65rem;
  }
`


const Formula = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  margin: 4px 0 10px;
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.highlight};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
  letter-spacing: 0.02em;

  .eq {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: 500;
  }

  .sqrt {
    font-size: 1.35rem;
    line-height: 1;
  }

  .frac {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const Tagline = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 8px;
`

const Lead = styled.p`
  margin: 0 auto;
  max-width: 640px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
`

const Banner = styled.div`
  background: ${({ theme }) => theme.colors.background.highlight};
  border: 1px solid ${({ theme }) => theme.colors.border.highlight};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: 14px 18px;
  margin-bottom: 24px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;

  strong {
    color: ${({ theme }) => theme.colors.secondary};
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.section`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 20px 22px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  margin-bottom: ${({ $flush }) => ($flush ? '0' : '16px')};
`

const CardTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.92rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  span:last-child {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.secondary};
    text-align: right;
  }

  &:last-of-type {
    border-bottom: none;
  }
`

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 14px 0 6px;
`

const Range = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const TierBar = styled.div`
  margin: 12px 0;
`

const TierHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.85rem;
  margin-bottom: 6px;
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 4px;
  }
`

const Track = styled.div`
  height: 10px;
  background: ${({ theme }) => theme.colors.background.interactive};
  border-radius: 6px;
  overflow: hidden;
`

const Fill = styled.div`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 6px;
  transition: width ${({ theme }) => theme.transitions.medium};
`

const Stack = styled.div`
  display: flex;
  height: 28px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  margin: 12px 0;
  background: ${({ theme }) => theme.colors.background.interactive};
`

const Seg = styled.div`
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  min-width: ${({ $pct }) => ($pct > 0 ? '2px' : '0')};
`

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
`

const Dot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  margin-right: 6px;
`

const Foot = styled.p`
  margin-top: 8px;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.5;
`

const LinkA = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Band = styled.div`
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background.highlight};
  border: 1px solid ${({ theme }) => theme.colors.border.highlight};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Meta = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 12px;
`

const RefreshBtn = styled.button`
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.secondary};
  font: inherit;

  &:hover {
    text-decoration: underline;
  }
`

const Muted = styled.p`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 0.9rem;
  margin: 0 0 8px;
`

const Warn = styled.p`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.85rem;
  margin: 0 0 8px;
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

export default function GravityPage() {
  const [live, setLive] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const [breederShib, setBreederShib] = useState(1.261805487e9)
  const [shibPrice, setShibPrice] = useState(5.115e-6)
  const [circ, setCirc] = useState(SHIB_CIRC_DEFAULT)
  const [lpDepthUsd, setLpDepthUsd] = useState(4.03e6)
  const [cexFloat, setCexFloat] = useState(87e12)
  const [usePublishedCex, setUsePublishedCex] = useState(true)
  const [extraShib, setExtraShib] = useState(0)
  const [targetTier, setTargetTier] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const r = await fetch('/api/gravity')
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

  const breederPctOfCirc = pctCirc * 100
  const cexPctOfCirc = circ > 0 ? (cexFloat / circ) * 100 : 0
  const otherPct = Math.max(0, 100 - cexPctOfCirc - breederPctOfCirc)

  return (
    <AppContainer>
      <Head>
        <title>Gravity | KumaDex</title>
        <meta
          name="description"
          content="Gravity: escape-velocity tracker for on-chain SHIB in Kuma Breeder. Branded v = √(2GM/r). Educational — not a price promise."
        />
      </Head>
      <Header />
      <MainContent>
        <PageShell>
          <HeaderBlock>
            <Title>Gravity</Title>
            <Formula aria-label="escape velocity">
              <span>v</span>
              <span className="eq">=</span>
              <span className="sqrt">√</span>
              <span className="frac">(2GM / r)</span>
            </Formula>
            <Tagline>Escape velocity tracker</Tagline>
            <Lead>
              Track whether Breeder SHIB mass reaches <strong>escape velocity</strong> — enough on-chain gravity to pull discovery
              off CEX-dominated flow. Branded as{' '}
              <strong>
                v = √(2GM/r)
              </strong>
              : mass in{' '}
              <LinkA href="https://breeder.kumatokens.com" target="_blank" rel="noreferrer">
                Kuma Breeder
              </LinkA>
              {' '}
              (M) against circulating radius (r). Educational model — not a price promise.
            </Lead>
          </HeaderBlock>

          <Banner>
            <strong>MODEL / educational.</strong> Escape-velocity ladder (T1–T5) measures durable % of SHIB circ in Breeder.
            Sliders explore illustrative bands — they do <em>not</em> claim staking moves SHIB price. Live reads refresh on load.
          </Banner>

          <Grid>
            <Card $flush>
              <CardTitle>Live / modeled Breeder SHIB</CardTitle>
              {loading && <Muted>Loading…</Muted>}
              {err && <Warn>{err}</Warn>}
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
                <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{band.detail}</div>
              </Band>
              <Meta>
                Price: {live?.priceSource || '—'} · {live?.priceAsOf || '—'} ·{' '}
                <RefreshBtn type="button" onClick={load}>
                  Refresh
                </RefreshBtn>
              </Meta>
            </Card>

            <Card $flush>
              <CardTitle>On-chain vs CEX float (model)</CardTitle>
              <Stack>
                <Seg $pct={breederPctOfCirc} $color="#ff8502" title="Breeder" />
                <Seg $pct={cexPctOfCirc} $color="#fc72ff" title="CEX float proxy" />
                <Seg $pct={otherPct} $color="#2a3145" title="Rest of circ (wallets/DEX/etc.)" />
              </Stack>
              <Legend>
                <span>
                  <Dot $color="#ff8502" />
                  Breeder {fmtPct(pctCirc, 5)}
                </span>
                <span>
                  <Dot $color="#fc72ff" />
                  CEX float proxy {fmtPct(cexFloat / circ, 2)}
                </span>
                <span>
                  <Dot $color="#2a3145" />
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
              <Meta>
                <strong>Source badge:</strong> CEX float default ~87T SHIB ≈ late-Aug 2026 CryptoQuant-via-press proxy
                (med confidence). Refresh before big campaigns. Not live labeled wallet sum.
              </Meta>
            </Card>
          </Grid>

          <Card>
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
              <span>or % circ {((breederShib / circ) * 100).toFixed(4)}%</span>
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

          <Card>
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
            <strong>Impact heuristic:</strong> score from (1) % of SHIB circ in Breeder against T1–T5 thresholds,
            (2) Breeder SHIB USD ÷ assumed ETH DEX SHIB LP depth (depth multiple), (3) Breeder SHIB ÷ assumed CEX float.
            Maps to seed / narrative / depth / structural-discovery bands. Explicitly not a price oracle.
          </Foot>
        </PageShell>
      </MainContent>
    </AppContainer>
  )
}
