import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Header from '../src/components/Header'
import styled, { keyframes, css } from 'styled-components'

const SHIB_CIRC_DEFAULT = 589.239e12
const TIERS = [
  { id: 'T1', name: 'Narrative', pctCirc: 0.001 },
  { id: 'T2', name: 'Depth', pctCirc: 0.01 },
  { id: 'T3', name: 'Structural', pctCirc: 0.02 },
  { id: 'T4', name: "Can't-ignore", pctCirc: 0.05 },
  { id: 'T5', name: 'Co-dominance', pctCirc: 0.1 }
]

const twinkle = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.85; }
`

const thumb = (icon, border) => css`
  -webkit-appearance: none;
  appearance: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #0d1117 url(${icon}) center / cover no-repeat;
  border: 2px solid ${border};
  box-shadow: 0 0 10px ${border}66;
  cursor: grab;
  margin-top: -10px;
`

const AppContainer = styled.div`
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
      radial-gradient(ellipse 70% 40% at 50% -5%, rgba(255, 133, 2, 0.1), transparent 55%),
      linear-gradient(180deg, #0a0d14 0%, #141823 50%, #0d1117 100%);
  }
`

const Stars = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.6), transparent),
    radial-gradient(1px 1px at 47% 12%, rgba(255,255,255,0.5), transparent),
    radial-gradient(1.5px 1.5px at 78% 28%, rgba(255,255,255,0.7), transparent),
    radial-gradient(1px 1px at 35% 78%, rgba(255,255,255,0.4), transparent);
  animation: ${twinkle} 7s ease-in-out infinite;
`

const Shell = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 8px 16px 10px;
  gap: 8px;
`

const TopRow = styled.div`
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

const SuitThumb = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center top;
  border: 2px solid rgba(255, 133, 2, 0.5);
  flex-shrink: 0;
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.1;
`

const Formula = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
  white-space: nowrap;
`

const Sub = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`

const LivePill = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 999px;
  background: ${({ $on }) => ($on ? 'rgba(39, 174, 96, 0.15)' : 'rgba(255, 133, 2, 0.12)')};
  color: ${({ $on, theme }) => ($on ? theme.colors.success : theme.colors.secondary)};
  border: 1px solid ${({ $on }) => ($on ? 'rgba(39, 174, 96, 0.35)' : 'rgba(255, 133, 2, 0.3)')};
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const Btn = styled.button`
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: ${({ theme }) => theme.colors.background.module};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 0.72rem;
  font-weight: 600;
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.secondary};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const LinkBtn = styled.button`
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 0.72rem;
  font-weight: 600;
  &:hover { text-decoration: underline; }
`

const Panel = styled.section`
  background: rgba(26, 31, 46, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  flex-shrink: 0;
`

const MetricsPanel = styled(Panel)`
  flex: 1.1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
`

const ControlsPanel = styled(Panel)`
  flex: 0.95;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
`

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const CompareBar = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
`

const Side = styled.div`
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  strong {
    display: flex;
    align-items: center;
    gap: 6px;
    justify-content: ${({ $align }) => ($align === 'right' ? 'flex-end' : 'flex-start')};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.78rem;
    margin-bottom: 1px;
  }
`

const MiniIcon = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
`

const Vs = styled.div`
  font-size: 0.65rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.secondary};
`

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const Tile = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 6px 8px;
`

const TileLabel = styled.div`
  font-size: 0.58rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TileValue = styled.div`
  font-size: 0.92rem;
  font-weight: 700;
  color: ${({ $tone, theme }) =>
    $tone === 'up' ? theme.colors.success : $tone === 'down' ? theme.colors.error : theme.colors.secondary};
  line-height: 1.15;
`

const TileHint = styled.div`
  font-size: 0.58rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 2px;
  line-height: 1.25;
`

const Stack = styled.div`
  display: flex;
  height: 10px;
  border-radius: 6px;
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
  gap: 8px 12px;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const Dot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  margin-right: 4px;
`

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
`

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.65);
`

const Values = styled.div`
  font-size: 0.68rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: right;
`

const IconRange = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.interactive};
  outline: none;
  margin: 4px 0 2px;
  -webkit-appearance: none;
  appearance: none;

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

const Assumptions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 2px;
`

const Assumption = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 6px 8px;
`

const TierChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
`

const TierChip = styled.button`
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 133, 2, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(255, 133, 2, 0.15)' : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.secondary : theme.colors.text.secondary)};
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 0.65rem;
  font-weight: 600;
`

const Warn = styled.p`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.7rem;
  margin: 0;
`

const Note = styled.p`
  margin: 0;
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.3;
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
  const sign = bps > 0 ? '+' : ''
  return sign + bps.toFixed(1) + ' bps'
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
  if (score >= 7) return 'Structural discovery'
  if (score >= 4.5) return 'Depth band'
  if (score >= 2) return 'Narrative'
  return 'Seed gravity'
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
  return { deltaShib, deltaUsd, depthMultiple, floatShare, dexImpactBps, deltaVsFloat, vNorm, illustrativeMidMoveUsd: shibPrice * dexImpactBps }
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

  const breederPctOfCirc = pctCirc * 100
  const cexPctOfCirc = circ > 0 ? (cexFloat / circ) * 100 : 0
  const otherPct = Math.max(0, 100 - cexPctOfCirc - breederPctOfCirc)
  const dexTone = margins.dexImpactBps > 0.00005 ? 'up' : margins.dexImpactBps < -0.00005 ? 'down' : 'flat'
  const maxBreeder = TIERS[4].pctCirc * circ

  return (
    <AppContainer>
      <Stars />
      <Head>
        <title>Gravity | KumaDex</title>
        <meta
          name="description"
          content="Gravity: escape-velocity tracker for on-chain SHIB in Kuma Breeder. Branded v = √(2GM/r)."
        />
      </Head>
      <Header />
      <Shell>
        <TopRow>
          <TitleBlock>
            <SuitThumb src="/gravity/kuma-suit.png" alt="Kuma Space Suit" />
            <div>
              <Title>
                Gravity <Formula>v = √(2GM/r)</Formula>
              </Title>
              <Sub>Escape velocity tracker · educational model</Sub>
            </div>
          </TitleBlock>
          <Actions>
            <LivePill $on={isFullyLive}>{isFullyLive ? 'Live' : 'Simulating'}</LivePill>
            <Btn type="button" onClick={resetToLive} disabled={isFullyLive}>
              Reset to live
            </Btn>
            <LinkBtn type="button" onClick={load}>
              {loading ? '…' : 'Refresh'}
            </LinkBtn>
          </Actions>
        </TopRow>

        {err && <Warn>{err}</Warn>}

        <MetricsPanel>
          <PanelTitle>Simulated metrics · Breeder vs institutional books</PanelTitle>
          <CompareBar>
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
          </CompareBar>

          <ImpactGrid>
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
              <TileHint>vs live Breeder</TileHint>
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
          </ImpactGrid>

          <Stack>
            <Seg $pct={breederPctOfCirc} $color="#ff8502" />
            <Seg $pct={cexPctOfCirc} $color="#fc72ff" />
            <Seg $pct={otherPct} $color="#2a3145" />
          </Stack>
          <Legend>
            <span>
              <Dot $color="#ff8502" />
              Breeder {fmtPct(pctCirc, 5)}
            </span>
            <span>
              <Dot $color="#fc72ff" />
              CEX float {fmtPct(cexFloat / circ, 2)}
            </span>
            <span>
              <Dot $color="#2a3145" />
              Remainder
            </span>
          </Legend>
        </MetricsPanel>

        <ControlsPanel>
          <PanelTitle>Adjust simulation</PanelTitle>

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
            <TierChips>
              <TierChip
                type="button"
                $active={!dirty.breeder}
                onClick={() => {
                  setSimBreeder(liveBreeder)
                  setDirty((d) => ({ ...d, breeder: false }))
                }}
              >
                Live
              </TierChip>
              {TIERS.map((t) => (
                <TierChip
                  key={t.id}
                  type="button"
                  $active={dirty.breeder && Math.abs(simBreeder - t.pctCirc * circ) / (t.pctCirc * circ || 1) < 0.02}
                  onClick={() => {
                    markDirty('breeder')
                    setSimBreeder(t.pctCirc * circ)
                  }}
                >
                  {t.id}
                </TierChip>
              ))}
            </TierChips>
          </div>

          <Assumptions>
            <Assumption>
              <LabelRow>
                <Label>
                  <MiniIcon src="/gravity/shib.png" alt="" />
                  SHIB price {dirty.price ? '(sim)' : '(live)'}
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
                  SHIB LP depth {dirty.lp ? '(sim)' : '(base)'}
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
                  CEX / inst. SHIB float {dirty.cex ? '(sim)' : '(base)'}
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
            Defaults track live (~60s). Dirty knobs stay simulated until Reset. Margin bps = toy √impact vs ETH DEX SHIB
            LP — not a price oracle. {live?.priceSource || '—'} · {live?.priceAsOf || '—'}
          </Note>
        </ControlsPanel>
      </Shell>
    </AppContainer>
  )
}
