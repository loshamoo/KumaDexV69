import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Header from '../src/components/Header'
import styled, { css } from 'styled-components'

const SHIB_CIRC_DEFAULT = 589.239e12

const MISSIONS = [
  { id: 'M1', code: 'LAUNCH', pctCirc: 0.001, title: 'Ignition', blurb: 'First on-chain gravity well vs CEX-only discovery.' },
  { id: 'M2', code: 'ORBIT', pctCirc: 0.01, title: 'Deep Foothold', blurb: 'Breeder depth as a liquidity marketshare beachhead.' },
  { id: 'M3', code: 'ESCAPE', pctCirc: 0.02, title: 'Escape Velocity', blurb: 'Structural on-chain discovery pressure leaves off-chain books.' },
  { id: 'M4', code: 'CAPTURE', pctCirc: 0.05, title: "Can't Ignore", blurb: 'Material reclaim of float from CEX / institutional SHIB.' },
  { id: 'M5', code: 'DOMINION', pctCirc: 0.1, title: 'Co-Dominance', blurb: 'On-chain gravity rivals off-chain marketmakers.' }
]

const METRIC_KEY = [
  { id: 'delta', label: 'Δ vs live', meaning: 'Simulated Breeder SHIB minus the live on-chain balance.' },
  { id: 'mid', label: 'DEX mid move', meaning: 'Toy √impact in bps if Δ notional hit assumed ETH DEX SHIB LP depth.' },
  { id: 'float', label: '÷ CEX float', meaning: 'Breeder SHIB as a share of assumed CEX / institutional float.' },
  { id: 'dfloat', label: 'Δ float share', meaning: 'Change in that float share versus live Breeder.' },
  { id: 'depth', label: 'Depth ×', meaning: 'Breeder SHIB USD ÷ assumed ETH DEX SHIB LP depth.' },
  { id: 'v', label: '√(2GM/r)', meaning: 'Normalized escape score — M = Breeder USD, r = circ × price.' },
  { id: 'bar', label: 'Supply bar', meaning: 'Orange = Breeder, pink = CEX float proxy, slate = rest of circ.' },
  { id: 'mission', label: 'Mission %', meaning: 'Progress to each circ-marketshare milestone (M1–M5).' }
]

const thumb = (icon, border) => css`
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.charcoal} url(${icon}) center / cover no-repeat;
  border: 2px solid ${border};
  cursor: grab;
  margin-top: -11px;
`

const App = styled.div`
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.primary};
`

const Main = styled.main`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 24px 16px;
  width: 100%;
`

const Page = styled.div`
  width: 100%;
  max-width: 1200px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Hero = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
`

const HeroLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
`

const Suit = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center top;
  border: 1px solid ${({ theme }) => theme.colors.border.highlight};
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Formula = styled.span`
  margin-left: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
`

const Sub = styled.p`
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  max-width: 560px;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const Pill = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid ${({ $on, theme }) => ($on ? 'rgba(39,174,96,0.35)' : theme.colors.border.highlight)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.secondary)};
  background: transparent;
`

const Btn = styled.button`
  font-size: 0.8rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  border: 1px solid ${({ $primary }) => ($primary ? 'transparent' : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary }) => ($primary ? '#4d2a52' : 'transparent')};
  color: ${({ $primary, theme }) => ($primary ? '#fff' : theme.colors.text.secondary)};

  &:hover:not(:disabled) {
    background: ${({ $primary }) => ($primary ? '#3f2153' : 'rgba(255,255,255,0.04)')};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const Layout = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 14px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    overflow: auto;
  }
`

const Card = styled.section`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
`

const H2 = styled.h2`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Muted = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.4;
`

const Compare = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`

const Side = styled.div`
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  strong {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: ${({ $align }) => ($align === 'right' ? 'flex-end' : 'flex-start')};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.88rem;
    font-weight: 600;
    margin-bottom: 2px;
  }
`

const Icon = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
`

const Vs = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`

const Tile = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.05);
`

const TileLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: 4px;
`

const TileValue = styled.div`
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ $tone, theme }) =>
    $tone === 'up' ? theme.colors.success : $tone === 'down' ? theme.colors.error : theme.colors.text.primary};
`

const TileHint = styled.div`
  margin-top: 2px;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const Stack = styled.div`
  display: flex;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.interactive};
`

const Seg = styled.div`
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  min-width: ${({ $pct }) => ($pct > 0 ? '2px' : '0')};
`

const Key = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 14px;
  padding-top: 4px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`

const KeyItem = styled.div`
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px;
  font-size: 0.72rem;
  line-height: 1.35;
`

const KeyLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
`

const KeyMeaning = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Values = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: right;
`

const Range = styled.input`
  width: 100%;
  height: 4px;
  margin: 8px 0 4px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;

  &::-webkit-slider-runnable-track {
    height: 4px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.background.interactive};
  }
  &::-moz-range-track {
    height: 4px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.background.interactive};
  }

  ${({ $icon, $border }) => css`
    &::-webkit-slider-thumb {
      ${thumb($icon, $border)}
    }
    &::-moz-range-thumb {
      ${thumb($icon, $border)}
      margin-top: 0;
    }
  `}
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Chip = styled.button`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.border.highlight : 'rgba(255,255,255,0.1)')};
  background: ${({ $active, theme }) => ($active ? theme.colors.background.highlight : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.secondary : theme.colors.text.secondary)};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.highlight};
  }
`

const Assumptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`

const Field = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.05);
`

const MissionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const Mission = styled.button`
  text-align: left;
  cursor: pointer;
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ $active, $done, theme }) =>
    $active ? theme.colors.border.highlight : $done ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.06)'};
  background: ${({ $active, theme }) => ($active ? theme.colors.background.highlight : 'transparent')};
  color: inherit;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.highlight};
  }
`

const MissionTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
`

const MissionName = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  span {
    color: ${({ theme }) => theme.colors.secondary};
    margin-right: 6px;
  }
`

const MissionPct = styled.span`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-weight: 600;
`

const MissionBlurb = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.35;
  margin-bottom: 8px;
`

const Track = styled.div`
  height: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.interactive};
  overflow: hidden;
`

const Fill = styled.div`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: ${({ $done, theme }) => ($done ? theme.colors.success : theme.colors.secondary)};
  border-radius: 999px;
`

const Warn = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.warning};
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
  const sign = n < 0 ? '-' : ''
  const a = Math.abs(n)
  if (a >= 1e9) return sign + '$' + (a / 1e9).toFixed(2) + 'B'
  if (a >= 1e6) return sign + '$' + (a / 1e6).toFixed(2) + 'M'
  if (a >= 1e3) return sign + '$' + (a / 1e3).toFixed(1) + 'K'
  return sign + '$' + a.toFixed(2)
}
function fmtPct(n, d = 4) {
  if (!Number.isFinite(n)) return '—'
  return (n * 100).toFixed(d) + '%'
}
function fmtBps(n) {
  if (!Number.isFinite(n)) return '—'
  const bps = n * 10000
  return (bps > 0 ? '+' : '') + bps.toFixed(1) + ' bps'
}

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
  if (score >= 7) return 'Structural reclaim'
  if (score >= 4.5) return 'Deep foothold'
  if (score >= 2) return 'Ignition'
  return 'Pre-launch'
}

function marginImpacts({ effectiveShib, baselineShib, shibPrice, lpDepthUsd, cexFloat, circ }) {
  const deltaShib = effectiveShib - baselineShib
  const deltaUsd = deltaShib * shibPrice
  const usd = effectiveShib * shibPrice
  const depthMultiple = lpDepthUsd > 0 ? usd / lpDepthUsd : 0
  const floatShare = cexFloat > 0 ? effectiveShib / cexFloat : 0
  const k = 0.5
  const dexImpactBps =
    lpDepthUsd > 0 && Math.abs(deltaUsd) > 0
      ? k * Math.sign(deltaUsd) * Math.sqrt(Math.abs(deltaUsd) / lpDepthUsd)
      : 0
  return {
    deltaShib,
    deltaUsd,
    depthMultiple,
    floatShare,
    dexImpactBps,
    deltaVsFloat: cexFloat > 0 ? deltaShib / cexFloat : 0,
    vNorm: Math.sqrt((2 * usd) / Math.max(1, circ * shibPrice)),
    illustrativeMidMoveUsd: shibPrice * dexImpactBps
  }
}

export default function GravityPage() {
  const [live, setLive] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [liveBreeder, setLiveBreeder] = useState(1.261805487e9)
  const [livePrice, setLivePrice] = useState(5.115e-6)
  const [liveLpDepth, setLiveLpDepth] = useState(4.03e6)
  const [liveCexFloat, setLiveCexFloat] = useState(87e12)
  const [circ, setCirc] = useState(SHIB_CIRC_DEFAULT)
  const [simBreeder, setSimBreeder] = useState(1.261805487e9)
  const [simPrice, setSimPrice] = useState(5.115e-6)
  const [simLpDepth, setSimLpDepth] = useState(4.03e6)
  const [simCexFloat, setSimCexFloat] = useState(87e12)
  const [dirty, setDirty] = useState({ breeder: false, price: false, lp: false, cex: false })
  const dirtyRef = useRef(dirty)
  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])

  const markDirty = (key) => setDirty((d) => ({ ...d, [key]: true }))
  const resetToLive = () => {
    setSimBreeder(liveBreeder)
    setSimPrice(livePrice)
    setSimLpDepth(liveLpDepth)
    setSimCexFloat(liveCexFloat)
    setDirty({ breeder: false, price: false, lp: false, cex: false })
  }

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const r = await fetch('/api/gravity')
      const j = await r.json()
      setLive(j)
      const breeder = j.breederShib != null ? j.breederShib : null
      const price = j.shibPriceUsd != null ? j.shibPriceUsd : null
      const lp = j.ethDexLpUsdFallback != null ? j.ethDexLpUsdFallback : null
      const cex = j.cexFloatFallback != null ? j.cexFloatFallback : null
      if (breeder != null) setLiveBreeder(breeder)
      if (price != null) setLivePrice(price)
      if (lp != null) setLiveLpDepth(lp)
      if (cex != null) setLiveCexFloat(cex)
      if (j.circFallback) setCirc(j.circFallback)
      const d = dirtyRef.current
      if (breeder != null && !d.breeder) setSimBreeder(breeder)
      if (price != null && !d.price) setSimPrice(price)
      if (lp != null && !d.lp) setSimLpDepth(lp)
      if (cex != null && !d.cex) setSimCexFloat(cex)
      if (!j.ok) setErr(j.error || j.note || 'Live read degraded')
    } catch (e) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [load])

  const effectiveShib = simBreeder
  const isFullyLive = !dirty.breeder && !dirty.price && !dirty.lp && !dirty.cex
  const pctCirc = circ > 0 ? effectiveShib / circ : 0
  const usd = effectiveShib * simPrice
  const depthMultiple = simLpDepth > 0 ? usd / simLpDepth : 0
  const cexPressured = simCexFloat > 0 ? effectiveShib / simCexFloat : 0
  const band = impactBand({ pctCirc, depthMultiple, cexPressured })
  const margins = useMemo(
    () =>
      marginImpacts({
        effectiveShib,
        baselineShib: liveBreeder,
        shibPrice: simPrice,
        lpDepthUsd: simLpDepth,
        cexFloat: simCexFloat,
        circ
      }),
    [effectiveShib, liveBreeder, simPrice, simLpDepth, simCexFloat, circ]
  )
  const missions = useMemo(
    () =>
      MISSIONS.map((m) => {
        const target = m.pctCirc * circ
        const progress = target > 0 ? Math.min(effectiveShib / target, 1) : 0
        return { ...m, target, progress, gap: Math.max(0, target - effectiveShib), done: progress >= 1 }
      }),
    [circ, effectiveShib]
  )
  const activeMission = missions.find((m) => !m.done) || missions[missions.length - 1]
  const breederPctOfCirc = pctCirc * 100
  const cexPctOfCirc = circ > 0 ? (simCexFloat / circ) * 100 : 0
  const otherPct = Math.max(0, 100 - cexPctOfCirc - breederPctOfCirc)
  const dexTone = margins.dexImpactBps > 0.00005 ? 'up' : margins.dexImpactBps < -0.00005 ? 'down' : 'flat'
  const maxBreeder = MISSIONS[4].pctCirc * circ

  return (
    <App>
      <Head>
        <title>Gravity | KumaDex</title>
        <meta name="description" content="Gravity mission phases — reclaim SHIB deep liquidity from CEX books. v = √(2GM/r)." />
      </Head>
      <Header />
      <Main>
        <Page>
          <Hero>
            <HeroLeft>
              <Suit src="/gravity/kuma-suit.png" alt="" />
              <div>
                <Title>
                  Gravity
                  <Formula>v = √(2GM/r)</Formula>
                </Title>
                <Sub>Mission phases track Breeder SHIB circ share reclaiming deep liquidity from CEX / institutional books.</Sub>
              </div>
            </HeroLeft>
            <Actions>
              <Pill $on={isFullyLive}>{isFullyLive ? 'Live' : 'Simulating'}</Pill>
              <Btn $primary type="button" onClick={resetToLive} disabled={isFullyLive}>
                Reset
              </Btn>
              <Btn type="button" onClick={load}>
                {loading ? '…' : 'Refresh'}
              </Btn>
            </Actions>
          </Hero>

          {err && <Warn>{err}</Warn>}

          <Layout>
            <Card>
              <div>
                <H2>Metrics</H2>
                <Muted>Simulated Breeder gravity vs assumed CEX float. Educational model — not a price oracle.</Muted>
              </div>

              <Compare>
                <Side>
                  <strong>
                    <Icon src="/gravity/kuma.png" alt="" />
                    Breeder
                  </strong>
                  {fmtShib(effectiveShib)} · {fmtUsd(usd)}
                </Side>
                <Vs>VS</Vs>
                <Side $align="right">
                  <strong>
                    CEX float
                    <Icon src="/gravity/shib.png" alt="" />
                  </strong>
                  {fmtShib(simCexFloat)} · {fmtUsd(simCexFloat * simPrice)}
                </Side>
              </Compare>

              <Metrics>
                <Tile>
                  <TileLabel>Δ vs live</TileLabel>
                  <TileValue $tone={margins.deltaShib >= 0 ? 'up' : 'down'}>
                    {margins.deltaShib >= 0 ? '+' : ''}
                    {fmtShib(margins.deltaShib)}
                  </TileValue>
                  <TileHint>{fmtUsd(margins.deltaUsd)}</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>DEX mid move</TileLabel>
                  <TileValue $tone={dexTone}>{fmtBps(margins.dexImpactBps)}</TileValue>
                  <TileHint>~{fmtUsd(margins.illustrativeMidMoveUsd)}/SHIB</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>÷ CEX float</TileLabel>
                  <TileValue>{fmtPct(margins.floatShare, 4)}</TileValue>
                  <TileHint>book control</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>Δ float share</TileLabel>
                  <TileValue $tone={margins.deltaVsFloat >= 0 ? 'up' : 'down'}>
                    {fmtPct(margins.deltaVsFloat, 4)}
                  </TileValue>
                  <TileHint>vs live</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>Depth ×</TileLabel>
                  <TileValue>{margins.depthMultiple.toFixed(2)}×</TileValue>
                  <TileHint>vs ETH SHIB LP</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>√(2GM/r)</TileLabel>
                  <TileValue>{margins.vNorm.toFixed(4)}</TileValue>
                  <TileHint>{band}</TileHint>
                </Tile>
              </Metrics>

              <Stack>
                <Seg $pct={breederPctOfCirc} $color="#ff8502" />
                <Seg $pct={cexPctOfCirc} $color="#fc72ff" />
                <Seg $pct={otherPct} $color="#2a3145" />
              </Stack>

              <div>
                <H2 style={{ marginBottom: 8, fontSize: '0.85rem' }}>Metric key</H2>
                <Key>
                  {METRIC_KEY.map((k) => (
                    <KeyItem key={k.id}>
                      <KeyLabel>{k.label}</KeyLabel>
                      <KeyMeaning>{k.meaning}</KeyMeaning>
                    </KeyItem>
                  ))}
                </Key>
              </div>

              <Controls>
                <div>
                  <LabelRow>
                    <Label>
                      <Icon src="/gravity/kuma.png" alt="" />
                      Breeder SHIB {dirty.breeder ? '(sim)' : '(live)'}
                    </Label>
                    <Values>
                      {fmtShib(simBreeder)} · {fmtPct(pctCirc, 5)} · live {fmtShib(liveBreeder)}
                    </Values>
                  </LabelRow>
                  <Range
                    type="range"
                    $icon="/gravity/kuma.png"
                    $border="#ff8502"
                    min={0}
                    max={maxBreeder}
                    step={maxBreeder / 1000}
                    value={Math.min(simBreeder, maxBreeder)}
                    onChange={(e) => {
                      markDirty('breeder')
                      setSimBreeder(Number(e.target.value))
                    }}
                  />
                  <Chips>
                    <Chip
                      type="button"
                      $active={!dirty.breeder}
                      onClick={() => {
                        setSimBreeder(liveBreeder)
                        setDirty((d) => ({ ...d, breeder: false }))
                      }}
                    >
                      Live
                    </Chip>
                    {MISSIONS.map((m) => (
                      <Chip
                        key={m.id}
                        type="button"
                        $active={dirty.breeder && Math.abs(simBreeder - m.pctCirc * circ) / (m.pctCirc * circ || 1) < 0.02}
                        onClick={() => {
                          markDirty('breeder')
                          setSimBreeder(m.pctCirc * circ)
                        }}
                      >
                        {m.id}
                      </Chip>
                    ))}
                  </Chips>
                </div>

                <Assumptions>
                  <Field>
                    <LabelRow>
                      <Label>
                        <Icon src="/gravity/shib.png" alt="" />
                        Price
                      </Label>
                      <Values>${simPrice.toExponential(2)}</Values>
                    </LabelRow>
                    <Range
                      type="range"
                      $icon="/gravity/shib.png"
                      $border="#fc72ff"
                      min={1e-7}
                      max={5e-5}
                      step={1e-7}
                      value={simPrice}
                      onChange={(e) => {
                        markDirty('price')
                        setSimPrice(Number(e.target.value))
                      }}
                    />
                  </Field>
                  <Field>
                    <LabelRow>
                      <Label>
                        <Icon src="/gravity/shib.png" alt="" />
                        LP depth
                      </Label>
                      <Values>
                        {fmtUsd(simLpDepth)} · {depthMultiple.toFixed(1)}×
                      </Values>
                    </LabelRow>
                    <Range
                      type="range"
                      $icon="/gravity/shib.png"
                      $border="#fc72ff"
                      min={1e5}
                      max={5e7}
                      step={1e5}
                      value={simLpDepth}
                      onChange={(e) => {
                        markDirty('lp')
                        setSimLpDepth(Number(e.target.value))
                      }}
                    />
                  </Field>
                  <Field style={{ gridColumn: '1 / -1' }}>
                    <LabelRow>
                      <Label>
                        <Icon src="/gravity/shib.png" alt="" />
                        CEX float
                      </Label>
                      <Values>
                        {fmtShib(simCexFloat)} · {fmtPct(cexPressured, 3)}
                      </Values>
                    </LabelRow>
                    <Range
                      type="range"
                      $icon="/gravity/shib.png"
                      $border="#fc72ff"
                      min={1e12}
                      max={200e12}
                      step={1e12}
                      value={simCexFloat}
                      onChange={(e) => {
                        markDirty('cex')
                        setSimCexFloat(Number(e.target.value))
                      }}
                    />
                  </Field>
                </Assumptions>

                <Muted>
                  Live defaults refresh ~60s. {live?.priceSource || '—'} · {live?.priceAsOf || '—'} · next {activeMission.id}{' '}
                  gap {fmtShib(activeMission.gap)}
                </Muted>
              </Controls>
            </Card>

            <Card>
              <div>
                <H2>Mission phases</H2>
                <Muted>Circ-marketshare milestones reclaiming discovery from CEX / off-chain marketmakers.</Muted>
              </div>
              <MissionList>
                {missions.map((m) => (
                  <Mission
                    key={m.id}
                    type="button"
                    $active={activeMission.id === m.id}
                    $done={m.done}
                    onClick={() => {
                      markDirty('breeder')
                      setSimBreeder(m.pctCirc * circ)
                    }}
                  >
                    <MissionTop>
                      <MissionName>
                        <span>
                          {m.id} {m.code}
                        </span>
                        {m.title}
                      </MissionName>
                      <MissionPct>
                        {(m.pctCirc * 100).toFixed(m.pctCirc < 0.01 ? 1 : 0)}% · {(m.progress * 100).toFixed(0)}%
                      </MissionPct>
                    </MissionTop>
                    <MissionBlurb>
                      {m.blurb}
                      {!m.done ? ` Gap ${fmtShib(m.gap)}.` : ' Cleared.'}
                    </MissionBlurb>
                    <Track>
                      <Fill $pct={m.progress * 100} $done={m.done} />
                    </Track>
                  </Mission>
                ))}
              </MissionList>
            </Card>
          </Layout>
        </Page>
      </Main>
    </App>
  )
}
