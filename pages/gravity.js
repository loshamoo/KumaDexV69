import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Header from '../src/components/Header'
import styled, { css } from 'styled-components'

const SHIB_CIRC_DEFAULT = 589.239e12

const MISSIONS = [
  { id: 'K1', code: 'LAUNCH', pctCirc: 0.001, title: 'Ignition', blurb: 'First on-chain gravity well vs CEX-only discovery.' },
  { id: 'K2', code: 'ORBIT', pctCirc: 0.01, title: 'Deep Foothold', blurb: 'Breeder depth as a liquidity marketshare beachhead.' },
  { id: 'K3', code: 'ESCAPE', pctCirc: 0.02, title: 'Escape Velocity', blurb: 'Structural on-chain discovery pressure leaves off-chain books.' },
  { id: 'K4', code: 'CAPTURE', pctCirc: 0.05, title: "Can't Ignore", blurb: 'Material reclaim of float from CEX / institutional SHIB.' },
  { id: 'K5', code: 'DOMINION', pctCirc: 0.1, title: 'Co-Dominance', blurb: 'On-chain gravity rivals off-chain marketmakers.' }
]

const METRIC_KEY = [
  { id: 'delta', label: 'Δ vs live', meaning: 'Simulated Breeder SHIB minus the live on-chain balance.' },
  { id: 'mid', label: 'DEX mid move', meaning: 'Toy √impact in bps if Δ notional hit assumed ETH DEX SHIB LP depth.' },
  { id: 'float', label: '÷ CEX float', meaning: 'Breeder SHIB as a share of assumed CEX / institutional float.' },
  { id: 'dfloat', label: 'Δ float share', meaning: 'Change in that float share versus live Breeder.' },
  { id: 'depth', label: 'Depth ×', meaning: 'Breeder SHIB USD ÷ assumed ETH DEX SHIB LP depth.' },
  { id: 'v', label: '√(2GM/r)', meaning: 'Normalized escape score — M = Breeder USD, r = circ × price.' },
  { id: 'bar', label: 'Supply bar', meaning: 'Orange = Breeder, pink = CEX float proxy, slate = rest of circ.' },
  { id: 'mission', label: 'Mission %', meaning: 'Progress to each circ-marketshare milestone (K1–K5).' }
]

const thumb = (icon, border) => css`
  -webkit-appearance: none;
  appearance: none;
  width: 26px;
  height: 26px;
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
  padding: 14px 20px 12px;
  width: 100%;
`

const Page = styled.div`
  width: 100%;
  max-width: 1180px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const TopBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const Pill = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid ${({ $on, theme }) => ($on ? 'rgba(39,174,96,0.35)' : theme.colors.border.highlight)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.secondary)};
`

const Btn = styled.button`
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
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

const Dash = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: 16px;
`

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
`

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const Suit = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center top;
  border: 1px solid ${({ theme }) => theme.colors.border.highlight};
  flex-shrink: 0;
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Formula = styled.span`
  margin-left: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
`

const Sub = styled.p`
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 12px;
`

const Compare = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`

const Side = styled.div`
  text-align: center;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  strong {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.85rem;
    font-weight: 600;
    margin-right: 6px;
  }
`

const Icon = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
`

const Vs = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const Tile = styled.div`
  padding: 12px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 78px;
`

const TileLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: 4px;
`

const TileValue = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ $tone, theme }) =>
    $tone === 'up' ? theme.colors.success : $tone === 'down' ? theme.colors.error : theme.colors.text.primary};
`

const TileHint = styled.div`
  margin-top: 2px;
  font-size: 0.68rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const Stack = styled.div`
  display: flex;
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.interactive};
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
`

const Seg = styled.div`
  width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  min-width: ${({ $pct }) => ($pct > 0 ? '2px' : '0')};
`

const Controls = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1.2fr;
  gap: 10px;
  align-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`

const Field = styled.div`
  padding: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid ${({ $live, theme }) => ($live ? 'rgba(39,174,96,0.35)' : 'rgba(255,255,255,0.05)')};
`

const FieldTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const LiveTag = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.secondary)};
`

const ResetOne = styled.button`
  font-size: 0.62rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid rgba(39, 174, 96, 0.35);
  background: transparent;
  color: ${({ theme }) => theme.colors.success};
  &:disabled {
    opacity: 0;
    pointer-events: none;
  }
`

const Values = styled.div`
  font-size: 0.68rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
  margin-top: 2px;
`

const Range = styled.input`
  width: 100%;
  height: 4px;
  margin: 8px 0 2px;
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

const Missions = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  flex-shrink: 0;
  @media (max-width: 800px) {
    grid-template-columns: repeat(5, minmax(120px, 1fr));
    overflow-x: auto;
  }
`

const Mission = styled.button`
  text-align: center;
  cursor: pointer;
  padding: 10px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ $active, $done, theme }) =>
    $active ? theme.colors.border.highlight : $done ? 'rgba(39,174,96,0.3)' : 'rgba(255,255,255,0.06)'};
  background: ${({ $active, theme }) => ($active ? theme.colors.background.highlight : theme.colors.background.module)};
  color: inherit;
  min-width: 0;
`

const MissionId = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
  letter-spacing: 0.04em;
`

const MissionTitle = styled.div`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 2px 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MissionPct = styled.div`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-bottom: 6px;
`

const Track = styled.div`
  height: 3px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.interactive};
  overflow: hidden;
`

const Fill = styled.div`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: ${({ $done, theme }) => ($done ? theme.colors.success : theme.colors.secondary)};
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: 20px;
`

const Modal = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.background.charcoal};
  border: 1px solid ${({ theme }) => theme.colors.border.highlight};
  border-radius: 16px;
  padding: 20px;
  max-height: 80vh;
  overflow: auto;
`

const ModalTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-align: center;
`

const KeyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const KeyRow = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  font-size: 0.8rem;
  line-height: 1.35;
`

const KeyLabel = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`

const KeyMeaning = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Warn = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.warning};
  text-align: center;
`

const Foot = styled.div`
  font-size: 0.68rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
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
  const [keyOpen, setKeyOpen] = useState(false)

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

  const resetField = (key) => {
    if (key === 'breeder') setSimBreeder(liveBreeder)
    if (key === 'price') setSimPrice(livePrice)
    if (key === 'lp') setSimLpDepth(liveLpDepth)
    if (key === 'cex') setSimCexFloat(liveCexFloat)
    setDirty((d) => ({ ...d, [key]: false }))
  }

  const resetAll = () => {
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

      const breeder = Number.isFinite(j.breederShib) ? j.breederShib : null
      const price = Number.isFinite(j.shibPriceUsd) ? j.shibPriceUsd : null
      const lp = Number.isFinite(j.ethDexLpUsdFallback) ? j.ethDexLpUsdFallback : null
      const cex = Number.isFinite(j.cexFloatFallback) ? j.cexFloatFallback : null
      const circVal = Number.isFinite(j.circFallback) ? j.circFallback : null

      // Always refresh live snapshots
      if (breeder != null) setLiveBreeder(breeder)
      if (price != null) setLivePrice(price)
      if (lp != null) setLiveLpDepth(lp)
      if (cex != null) setLiveCexFloat(cex)
      if (circVal != null) setCirc(circVal)

      // Sync sims only when that field is still live-tracking
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
          <TopBar>
            <Pill $on={isFullyLive}>{isFullyLive ? 'All live' : 'Simulating'}</Pill>
            <Btn type="button" onClick={() => setKeyOpen(true)}>
              Metric key
            </Btn>
            <Btn $primary type="button" onClick={resetAll} disabled={isFullyLive}>
              Reset all
            </Btn>
            <Btn type="button" onClick={load}>
              {loading ? '…' : 'Refresh live'}
            </Btn>
          </TopBar>

          {err && <Warn>{err}</Warn>}

          <Dash>
            <HeadRow>
              <TitleBlock>
                <Suit src="/gravity/kuma-suit.png" alt="" />
                <div>
                  <Title>
                    Gravity
                    <Formula>v = √(2GM/r)</Formula>
                  </Title>
                  <Sub>
                    Mission phases track Breeder SHIB circ share reclaiming deep liquidity from CEX / institutional books.
                  </Sub>
                </div>
              </TitleBlock>
            </HeadRow>

            <Body>
              <Compare>
                <Side>
                  <strong>
                    <Icon src="/gravity/kuma.png" alt="" />
                    Breeder
                  </strong>
                  {fmtShib(effectiveShib)} · {fmtUsd(usd)}
                </Side>
                <Vs>VS</Vs>
                <Side>
                  <strong>
                    <Icon src="/gravity/shib.png" alt="" />
                    CEX float
                  </strong>
                  {fmtShib(simCexFloat)} · {fmtUsd(simCexFloat * simPrice)}
                </Side>
              </Compare>

              <div>
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
                <div style={{ marginTop: 8 }}>
                  <Stack>
                    <Seg $pct={breederPctOfCirc} $color="#ff8502" />
                    <Seg $pct={cexPctOfCirc} $color="#fc72ff" />
                    <Seg $pct={otherPct} $color="#2a3145" />
                  </Stack>
                </div>
              </div>

              <Controls>
                <Field $live={!dirty.breeder}>
                  <FieldTop>
                    <Label>
                      <Icon src="/gravity/kuma.png" alt="" />
                      Breeder SHIB
                      <LiveTag $on={!dirty.breeder}>{dirty.breeder ? 'SIM' : 'LIVE'}</LiveTag>
                    </Label>
                    <ResetOne type="button" disabled={!dirty.breeder} onClick={() => resetField('breeder')}>
                      Reset live
                    </ResetOne>
                  </FieldTop>
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
                  <Values>
                    {fmtShib(simBreeder)} · {fmtPct(pctCirc, 5)} · live {fmtShib(liveBreeder)}
                  </Values>
                </Field>

                <Field $live={!dirty.price}>
                  <FieldTop>
                    <Label>
                      <Icon src="/gravity/shib.png" alt="" />
                      Price
                      <LiveTag $on={!dirty.price}>{dirty.price ? 'SIM' : 'LIVE'}</LiveTag>
                    </Label>
                    <ResetOne type="button" disabled={!dirty.price} onClick={() => resetField('price')}>
                      Reset live
                    </ResetOne>
                  </FieldTop>
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
                  <Values>
                    ${simPrice.toExponential(2)} · live ${livePrice.toExponential(2)}
                  </Values>
                </Field>

                <Field $live={!dirty.lp}>
                  <FieldTop>
                    <Label>
                      <Icon src="/gravity/shib.png" alt="" />
                      LP depth
                      <LiveTag $on={!dirty.lp}>{dirty.lp ? 'SIM' : 'LIVE'}</LiveTag>
                    </Label>
                    <ResetOne type="button" disabled={!dirty.lp} onClick={() => resetField('lp')}>
                      Reset live
                    </ResetOne>
                  </FieldTop>
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
                  <Values>
                    {fmtUsd(simLpDepth)} · {depthMultiple.toFixed(1)}× · live {fmtUsd(liveLpDepth)}
                  </Values>
                </Field>

                <Field $live={!dirty.cex}>
                  <FieldTop>
                    <Label>
                      <Icon src="/gravity/shib.png" alt="" />
                      CEX float
                      <LiveTag $on={!dirty.cex}>{dirty.cex ? 'SIM' : 'LIVE'}</LiveTag>
                    </Label>
                    <ResetOne type="button" disabled={!dirty.cex} onClick={() => resetField('cex')}>
                      Reset live
                    </ResetOne>
                  </FieldTop>
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
                  <Values>
                    {fmtShib(simCexFloat)} · {fmtPct(cexPressured, 3)} · live {fmtShib(liveCexFloat)}
                  </Values>
                </Field>
              </Controls>

              <Missions>
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
                    title={m.blurb}
                  >
                    <MissionId>
                      {m.id} · {m.code}
                    </MissionId>
                    <MissionTitle>{m.title}</MissionTitle>
                    <MissionPct>
                      {(m.pctCirc * 100).toFixed(m.pctCirc < 0.01 ? 1 : 0)}% circ · {(m.progress * 100).toFixed(0)}%
                      {!m.done ? ` · gap ${fmtShib(m.gap)}` : ' · cleared'}
                    </MissionPct>
                    <Track>
                      <Fill $pct={m.progress * 100} $done={m.done} />
                    </Track>
                  </Mission>
                ))}
              </Missions>
            </Body>

            <Foot>
              Live snapshots refresh ~60s · {live?.priceSource || '—'} · {live?.priceAsOf || '—'} · circ {fmtShib(circ)} ·
              fetched {live?.fetchedAt ? new Date(live.fetchedAt).toLocaleTimeString() : '—'}
            </Foot>
          </Dash>
        </Page>
      </Main>

      {keyOpen && (
        <Overlay onClick={() => setKeyOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Metric key</ModalTitle>
            <KeyList>
              {METRIC_KEY.map((k) => (
                <KeyRow key={k.id}>
                  <KeyLabel>{k.label}</KeyLabel>
                  <KeyMeaning>{k.meaning}</KeyMeaning>
                </KeyRow>
              ))}
            </KeyList>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Btn $primary type="button" onClick={() => setKeyOpen(false)}>
                Close
              </Btn>
            </div>
          </Modal>
        </Overlay>
      )}
    </App>
  )
}
