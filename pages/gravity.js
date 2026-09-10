import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Header from '../src/components/Header'
import styled, { keyframes, css } from 'styled-components'

const SHIB_CIRC_DEFAULT = 589.239e12

/** Mission phases = durable Breeder SHIB % of circ — deep on-chain liquidity marketshare vs CEX / institutional books */
const MISSIONS = [
  {
    id: 'M1',
    code: 'LAUNCH',
    pctCirc: 0.001,
    title: 'Ignition',
    blurb: 'First on-chain gravity well — narrative notice vs CEX-only discovery.'
  },
  {
    id: 'M2',
    code: 'ORBIT',
    pctCirc: 0.01,
    title: 'Deep Foothold',
    blurb: 'Breeder depth becomes a real liquidity marketshare beachhead.'
  },
  {
    id: 'M3',
    code: 'ESCAPE',
    pctCirc: 0.02,
    title: 'Escape Velocity',
    blurb: 'Structural on-chain discovery pressure — pull starts leaving off-chain books.'
  },
  {
    id: 'M4',
    code: 'CAPTURE',
    pctCirc: 0.05,
    title: "Can't Ignore",
    blurb: 'Material reclaim of float share from CEX / institutional SHIB holdings.'
  },
  {
    id: 'M5',
    code: 'DOMINION',
    pctCirc: 0.1,
    title: 'Co-Dominance',
    blurb: 'On-chain Breeder gravity rivals off-chain marketmakers for SHIB discovery.'
  }
]

const twinkle = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.9; }
`

const thumb = (icon, border) => css`
  -webkit-appearance: none;
  appearance: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #0d1117 url(${icon}) center / cover no-repeat;
  border: 2px solid ${border};
  box-shadow: 0 0 12px ${border}55;
  cursor: grab;
  margin-top: -12px;
`

const AppContainer = styled.div`
  min-height: 100vh;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.primary};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 80% 45% at 50% -8%, rgba(255, 133, 2, 0.1), transparent 55%),
      radial-gradient(ellipse 40% 30% at 90% 40%, rgba(252, 114, 255, 0.06), transparent 50%);
  }
`

const Stars = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 14% 20%, rgba(255,255,255,0.65), transparent),
    radial-gradient(1px 1px at 42% 14%, rgba(255,255,255,0.5), transparent),
    radial-gradient(2px 2px at 76% 30%, rgba(255,255,255,0.75), transparent),
    radial-gradient(1px 1px at 58% 78%, rgba(255,255,255,0.4), transparent);
  animation: ${twinkle} 7s ease-in-out infinite;
`

const Main = styled.main`
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px 14px;
  width: 100%;
`

const Page = styled.div`
  width: 100%;
  max-width: 1280px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Hero = styled.div`
  display: flex;
  align-items: center;
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
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center top;
  border: 3px solid rgba(255, 133, 2, 0.45);
  box-shadow: ${({ theme }) => theme.shadows.medium};
  background: ${({ theme }) => theme.colors.background.charcoal};
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.15;
`

const Formula = styled.span`
  margin-left: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
`

const Tagline = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  line-height: 1.35;
`

const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`

const LivePill = styled.span`
  padding: 8px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(39, 174, 96, 0.4)' : 'rgba(255, 133, 2, 0.35)')};
  background: ${({ $on, theme }) => ($on ? 'rgba(39, 174, 96, 0.12)' : theme.colors.background.highlight)};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.secondary)};
`

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${({ $active }) => ($active ? '#4d2a52' : '#1a1f2e')};
  color: ${({ $active }) => ($active ? 'white' : '#4d2a52')};

  &:hover {
    border-color: rgba(77, 42, 82, 0.5);
    background: ${({ $active }) => ($active ? '#3f2153' : 'rgba(77, 42, 82, 0.1)')};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const ActionButton = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: #4d2a52;
  color: white;

  &:hover {
    background: #3f2153;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(77, 42, 82, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

const GhostButton = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #4d2a52;
  border: 2px solid #4d2a52;

  &:hover {
    background: rgba(77, 42, 82, 0.1);
  }
`

const Grid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 14px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    overflow: auto;
  }
`

const Card = styled.section`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 18px 20px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const CardSub = styled.p`
  margin: -4px 0 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`

const Compare = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 1px solid rgba(255, 255, 255, 0.08);
`

const Side = styled.div`
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  strong {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: ${({ $align }) => ($align === 'right' ? 'flex-end' : 'flex-start')};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.95rem;
    margin-bottom: 4px;
  }
`

const MiniIcon = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.15);
`

const Vs = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.secondary};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`

const Tile = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 12px 14px;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.border.highlight};
  }
`

const TileLabel = styled.div`
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
`

const TileValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $tone, theme }) =>
    $tone === 'up' ? theme.colors.success : $tone === 'down' ? theme.colors.error : theme.colors.secondary};
`

const TileHint = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 4px;
  line-height: 1.3;
`

const Stack = styled.div`
  display: flex;
  height: 14px;
  border-radius: 8px;
  overflow: hidden;
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
  gap: 10px 16px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Dot = styled.span`
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  margin-right: 6px;
`

const MissionRail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const MissionCard = styled.button`
  text-align: left;
  cursor: pointer;
  border: 1px solid ${({ $active, $done, theme }) =>
    $active ? theme.colors.border.highlight : $done ? 'rgba(39, 174, 96, 0.35)' : 'rgba(255, 255, 255, 0.1)'};
  background: ${({ $active, theme }) => ($active ? theme.colors.background.highlight : theme.colors.background.module)};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: 10px 12px;
  transition: all ${({ theme }) => theme.transitions.medium};
  color: inherit;

  &:hover {
    border-color: rgba(255, 133, 2, 0.45);
    transform: translateY(-1px);
  }
`

const MissionTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 4px;
`

const MissionId = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.secondary};
`

const MissionTitle = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
`

const MissionPct = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const MissionBlurb = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.35;
  margin-bottom: 6px;
`

const Track = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.background.interactive};
  border-radius: 6px;
  overflow: hidden;
`

const Fill = styled.div`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: ${({ $done, theme }) => ($done ? theme.colors.success : theme.colors.secondary)};
  border-radius: 6px;
  transition: width ${({ theme }) => theme.transitions.medium};
`

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
`

const Values = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: right;
`

const IconRange = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  outline: none;
  margin: 8px 0 4px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;

  &::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.background.interactive};
  }
  &::-moz-range-track {
    height: 6px;
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

const PhaseChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Assumptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`

const Assumption = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 10px 12px;
`

const Note = styled.p`
  margin: 0;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.4;
`

const Warn = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.85rem;
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
function fmtPct(n, digits = 4) {
  if (!Number.isFinite(n)) return '—'
  return (n * 100).toFixed(digits) + '%'
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
  const deltaVsFloat = cexFloat > 0 ? deltaShib / cexFloat : 0
  const vNorm = Math.sqrt((2 * usd) / Math.max(1, circ * shibPrice))
  return {
    deltaShib,
    deltaUsd,
    depthMultiple,
    floatShare,
    dexImpactBps,
    deltaVsFloat,
    vNorm,
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
  const baselineShib = liveBreeder
  const shibPrice = simPrice
  const lpDepthUsd = simLpDepth
  const cexFloat = simCexFloat
  const isFullyLive = !dirty.breeder && !dirty.price && !dirty.lp && !dirty.cex

  const pctCirc = circ > 0 ? effectiveShib / circ : 0
  const usd = effectiveShib * shibPrice
  const depthMultiple = lpDepthUsd > 0 ? usd / lpDepthUsd : 0
  const cexPressured = cexFloat > 0 ? effectiveShib / cexFloat : 0
  const band = impactBand({ pctCirc, depthMultiple, cexPressured })

  const margins = useMemo(
    () => marginImpacts({ effectiveShib, baselineShib, shibPrice, lpDepthUsd, cexFloat, circ }),
    [effectiveShib, baselineShib, shibPrice, lpDepthUsd, cexFloat, circ]
  )

  const missions = useMemo(
    () =>
      MISSIONS.map((m) => {
        const target = m.pctCirc * circ
        const pct = target > 0 ? effectiveShib / target : 0
        const gap = Math.max(0, target - effectiveShib)
        return { ...m, target, progress: Math.min(pct, 1), gap, done: pct >= 1 }
      }),
    [circ, effectiveShib]
  )

  const activeMission = missions.find((m) => !m.done) || missions[missions.length - 1]
  const cleared = missions.filter((m) => m.done).map((m) => m.id)

  const breederPctOfCirc = pctCirc * 100
  const cexPctOfCirc = circ > 0 ? (cexFloat / circ) * 100 : 0
  const otherPct = Math.max(0, 100 - cexPctOfCirc - breederPctOfCirc)
  const dexTone = margins.dexImpactBps > 0.00005 ? 'up' : margins.dexImpactBps < -0.00005 ? 'down' : 'flat'
  const maxBreeder = MISSIONS[4].pctCirc * circ

  const jumpMission = (m) => {
    markDirty('breeder')
    setSimBreeder(m.pctCirc * circ)
  }

  return (
    <AppContainer>
      <Stars />
      <Head>
        <title>Gravity | KumaDex</title>
        <meta
          name="description"
          content="Gravity mission phases: reclaim SHIB deep-liquidity marketshare from CEX / institutional books. v = √(2GM/r)."
        />
      </Head>
      <Header />
      <Main>
        <Page>
          <Hero>
            <HeroLeft>
              <Suit src="/gravity/kuma-suit.png" alt="Kuma Space Suit" />
              <div>
                <Title>
                  Gravity
                  <Formula>v = √(2GM/r)</Formula>
                </Title>
                <Tagline>
                  Escape-velocity tracker — mission phases reclaim SHIB deep liquidity from CEX / institutional books.
                </Tagline>
              </div>
            </HeroLeft>
            <HeroActions>
              <LivePill $on={isFullyLive}>{isFullyLive ? 'Live' : 'Simulating'}</LivePill>
              <ActionButton type="button" onClick={resetToLive} disabled={isFullyLive}>
                Reset to live
              </ActionButton>
              <GhostButton type="button" onClick={load}>
                {loading ? '…' : 'Refresh'}
              </GhostButton>
            </HeroActions>
          </Hero>

          {err && <Warn>{err}</Warn>}

          <Grid>
            <Card>
              <div>
                <CardTitle>Simulated metrics</CardTitle>
                <CardSub>
                  Breeder on-chain gravity vs assumed CEX / institutional SHIB float. Educational — not a price oracle.
                </CardSub>
              </div>

              <Compare>
                <Side $align="left">
                  <strong>
                    <MiniIcon src="/gravity/kuma.png" alt="" />
                    Kuma Breeder
                  </strong>
                  {fmtShib(effectiveShib)} SHIB · {fmtUsd(usd)}
                </Side>
                <Vs>VS</Vs>
                <Side $align="right">
                  <strong>
                    CEX / Institution
                    <MiniIcon src="/gravity/shib.png" alt="" />
                  </strong>
                  {fmtShib(cexFloat)} SHIB · {fmtUsd(cexFloat * shibPrice)}
                </Side>
              </Compare>

              <Metrics>
                <Tile>
                  <TileLabel>Δ vs live</TileLabel>
                  <TileValue $tone={margins.deltaShib >= 0 ? 'up' : 'down'}>
                    {margins.deltaShib >= 0 ? '+' : ''}
                    {fmtShib(margins.deltaShib)}
                  </TileValue>
                  <TileHint>{fmtUsd(margins.deltaUsd)} notional</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>DEX mid move</TileLabel>
                  <TileValue $tone={dexTone}>{fmtBps(margins.dexImpactBps)}</TileValue>
                  <TileHint>~{fmtUsd(margins.illustrativeMidMoveUsd)} / SHIB</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>÷ CEX float</TileLabel>
                  <TileValue>{fmtPct(margins.floatShare, 4)}</TileValue>
                  <TileHint>on-chain book control</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>Δ float share</TileLabel>
                  <TileValue $tone={margins.deltaVsFloat >= 0 ? 'up' : 'down'}>
                    {fmtPct(margins.deltaVsFloat, 4)}
                  </TileValue>
                  <TileHint>vs live Breeder</TileHint>
                </Tile>
                <Tile>
                  <TileLabel>Depth multiple</TileLabel>
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
              <Legend>
                <span>
                  <Dot $color="#ff8502" />
                  Breeder {fmtPct(pctCirc, 5)} circ
                </span>
                <span>
                  <Dot $color="#fc72ff" />
                  CEX float {fmtPct(cexFloat / circ, 2)}
                </span>
                <span>
                  <Dot $color="#2a3145" />
                  Remainder
                </span>
                <span>
                  Cleared: {cleared.length ? cleared.join(', ') : 'none'} · Next {activeMission.id} gap{' '}
                  {fmtShib(activeMission.gap)}
                </span>
              </Legend>

              <Controls>
                <div>
                  <LabelRow>
                    <Label>
                      <MiniIcon src="/gravity/kuma.png" alt="" />
                      Kuma Breeder SHIB {dirty.breeder ? '(sim)' : '(live)'}
                    </Label>
                    <Values>
                      {fmtShib(simBreeder)} · {fmtPct(pctCirc, 5)} · live {fmtShib(liveBreeder)}
                    </Values>
                  </LabelRow>
                  <IconRange
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
                  <PhaseChips>
                    <FilterButton
                      type="button"
                      $active={!dirty.breeder}
                      onClick={() => {
                        setSimBreeder(liveBreeder)
                        setDirty((d) => ({ ...d, breeder: false }))
                      }}
                    >
                      Live
                    </FilterButton>
                    {MISSIONS.map((m) => (
                      <FilterButton
                        key={m.id}
                        type="button"
                        $active={
                          dirty.breeder &&
                          Math.abs(simBreeder - m.pctCirc * circ) / (m.pctCirc * circ || 1) < 0.02
                        }
                        onClick={() => jumpMission(m)}
                      >
                        {m.id}
                      </FilterButton>
                    ))}
                  </PhaseChips>
                </div>

                <Assumptions>
                  <Assumption>
                    <LabelRow>
                      <Label>
                        <MiniIcon src="/gravity/shib.png" alt="" />
                        SHIB price
                      </Label>
                      <Values>${simPrice.toExponential(2)}</Values>
                    </LabelRow>
                    <IconRange
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
                  </Assumption>
                  <Assumption>
                    <LabelRow>
                      <Label>
                        <MiniIcon src="/gravity/shib.png" alt="" />
                        SHIB LP depth
                      </Label>
                      <Values>
                        {fmtUsd(simLpDepth)} · {depthMultiple.toFixed(1)}×
                      </Values>
                    </LabelRow>
                    <IconRange
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
                  </Assumption>
                  <Assumption style={{ gridColumn: '1 / -1' }}>
                    <LabelRow>
                      <Label>
                        <MiniIcon src="/gravity/shib.png" alt="" />
                        CEX / institutional SHIB float
                      </Label>
                      <Values>
                        {fmtShib(simCexFloat)} · {fmtPct(cexPressured, 3)} pressured
                      </Values>
                    </LabelRow>
                    <IconRange
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
                  </Assumption>
                </Assumptions>

                <Note>
                  Live defaults refresh ~60s. Dirty knobs stay simulated until Reset. Margin bps = toy √impact vs ETH DEX
                  SHIB LP. {live?.priceSource || '—'} · {live?.priceAsOf || '—'}
                </Note>
              </Controls>
            </Card>

            <Card>
              <div>
                <CardTitle>Mission phases</CardTitle>
                <CardSub>
                  Deep-liquidity marketshare milestones — Breeder % of SHIB circ as the path to reclaim discovery from
                  CEX / off-chain marketmakers.
                </CardSub>
              </div>

              <MissionRail>
                {missions.map((m) => (
                  <MissionCard
                    key={m.id}
                    type="button"
                    $active={activeMission.id === m.id}
                    $done={m.done}
                    onClick={() => jumpMission(m)}
                  >
                    <MissionTop>
                      <span>
                        <MissionId>
                          {m.id} · {m.code}
                        </MissionId>{' '}
                        <MissionTitle>{m.title}</MissionTitle>
                      </span>
                      <MissionPct>
                        {(m.pctCirc * 100).toFixed(m.pctCirc < 0.01 ? 1 : 0)}% circ · {(m.progress * 100).toFixed(0)}%
                      </MissionPct>
                    </MissionTop>
                    <MissionBlurb>
                      {m.blurb}
                      {!m.done ? ` Gap ${fmtShib(m.gap)} SHIB.` : ' Cleared.'}
                    </MissionBlurb>
                    <Track>
                      <Fill $pct={m.progress * 100} $done={m.done} />
                    </Track>
                  </MissionCard>
                ))}
              </MissionRail>
            </Card>
          </Grid>
        </Page>
      </Main>
    </AppContainer>
  )
}
