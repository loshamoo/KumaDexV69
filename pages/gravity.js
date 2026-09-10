import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Header from '../src/components/Header'
import CoachMarks from '../src/components/CoachMarks'
import styled, { css } from 'styled-components'

const TOKEN_SYMBOLS = ['SHIB', 'LEASH', 'AKITA', 'ELON']

const TOKEN_DEFAULTS = {
  SHIB: {
    title: 'Shiba Inu',
    logo: '/breederlogos/shib.png',
    circ: 589.239e12,
    price: 5.115e-6,
    cex: 87e12,
    lp: 4.03e6,
    breeder: 1.261805487e9,
    priceMin: 1e-7,
    priceMax: 5e-5,
    priceStep: 1e-7
  },
  LEASH: {
    title: 'Doge Killer',
    logo: '/breederlogos/leash.png',
    circ: 107646,
    price: 4.0,
    cex: 107646 * 0.15,
    lp: 1.4e4,
    breeder: 0,
    priceMin: 0.1,
    priceMax: 500,
    priceStep: 0.1
  },
  AKITA: {
    title: 'Akita Inu',
    logo: '/breederlogos/akita.png',
    circ: 92.18e12,
    price: 4.33e-9,
    cex: 92.18e12 * 0.15,
    lp: 2.7e5,
    breeder: 0,
    priceMin: 1e-11,
    priceMax: 1e-6,
    priceStep: 1e-11
  },
  ELON: {
    title: 'Dogelon Mars',
    logo: '/breederlogos/elon.png',
    circ: 1e15,
    price: 3.11e-8,
    cex: 1e15 * 0.15,
    lp: 5.3e6,
    breeder: 0,
    priceMin: 1e-10,
    priceMax: 1e-5,
    priceStep: 1e-10
  }
}

const MISSIONS = [
  { id: 'K1', code: 'LAUNCH', pctCirc: 0.001, title: 'Ignition', blurb: 'First on-chain gravity well vs CEX-only discovery.' },
  { id: 'K2', code: 'ORBIT', pctCirc: 0.01, title: 'Deep Foothold', blurb: 'Breeder depth as a liquidity marketshare beachhead.' },
  { id: 'K3', code: 'ESCAPE', pctCirc: 0.02, title: 'Escape Velocity', blurb: 'Structural on-chain discovery pressure leaves off-chain books.' },
  { id: 'K4', code: 'CAPTURE', pctCirc: 0.05, title: "Can't Ignore", blurb: 'Material reclaim of float from CEX / institutional books.' },
  { id: 'K5', code: 'DOMINION', pctCirc: 0.1, title: 'Co-Dominance', blurb: 'On-chain gravity rivals off-chain marketmakers (~10% circ).' }
]

const METRIC_KEY = [
  { id: 'delta', label: 'Δ vs live', meaning: 'Simulated Breeder balance minus the live on-chain balance.' },
  { id: 'mid', label: 'DEX mid move', meaning: 'Toy √impact as % if Δ notional hit assumed ETH DEX LP depth.' },
  { id: 'zero', label: 'Zero-Gravity', meaning: 'Breeder ÷ assumed CEX / institutional float — on-chain share vs off-chain books.' },
  { id: 'codom', label: 'Co-dom gap', meaning: 'Distance to K5 (10% circ) in token units and % of circ.' },
  { id: 'depth', label: 'Depth ×', meaning: 'Breeder USD ÷ assumed ETH DEX LP depth.' },
  { id: 'v', label: '√(2GM/r)', meaning: 'Normalized escape score — M = Breeder USD, r = circ × price.' },
  { id: 'books', label: 'Books / circ', meaning: 'Assumed CEX float as a share of circulating supply (institutional share estimate).' },
  { id: 'mission', label: 'Mission %', meaning: 'Progress to each circ-marketshare milestone (K1–K5).' }
]

const ZERO_GRAVITY_COACH_STEPS = [
  {
    target: '#zg-title',
    title: 'Zero-Gravity Indicator',
    description:
      'Educational escape-velocity model for Breeder-held meme singles reclaiming liquidity from CEX / institutional books. Pick SHIB / LEASH / AKITA / ELON from the CEX-side token menu. Not a price oracle — a mission dashboard.',
    placement: 'bottom'
  },
  {
    target: '#zg-compare',
    title: 'Breeder vs CEX float',
    description:
      'Left is on-chain Breeder balance (supply + TVL). Right is the assumed CEX / institutional float. Open the token menu (logo + name) on the CEX side to switch SHIB / LEASH / AKITA / ELON.',
    placement: 'bottom'
  },
  {
    target: '#zg-metrics',
    title: 'Impact metrics',
    description:
      'Δ vs live, toy DEX mid, Zero-Gravity (vs CEX books), co-dominance gap to K5, depth ×, and √(2GM/r). Supply bar under the tiles shows Breeder / CEX / rest of circ.',
    placement: 'bottom'
  },
  {
    target: '#zg-zero-tile',
    title: 'Zero-Gravity',
    description:
      'Breeder ÷ assumed CEX float — your on-chain share of off-chain books. Hint shows Δ vs the live Breeder snapshot. Aim toward parity (1.0) or early co-dominance of books.',
    placement: 'bottom'
  },
  {
    target: '#zg-controls',
    title: 'Simulate live inputs',
    description:
      'Drag Breeder balance, price, LP depth, or CEX float. LIVE tracks the ~60s API refresh; SIM means you overrode that field. Reset live snaps it back. Switching tokens resets dirty fields.',
    placement: 'top'
  },
  {
    target: '#zg-missions',
    title: 'Mission phases K1–K5',
    description:
      'Tap a mission to jump Breeder balance to that circ-marketshare target — Ignition → Co-Dominance (10% circ).',
    placement: 'top'
  }
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

const TokenDD = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  z-index: 5;
  flex-shrink: 0;
`

const TokenDDBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 7px 2px 2px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: ${({ theme }) => theme.colors.background.module};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1;
  outline: none;
  max-width: 88px;
  &:hover,
  &:focus-visible {
    border-color: rgba(252, 114, 255, 0.45);
  }
`

const TokenDDMeta = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
  text-align: left;
  min-width: 0;
  strong {
    font-size: 0.78rem;
    font-weight: 700;
    white-space: nowrap;
  }
`

const TokenDDChevron = styled.span`
  font-size: 0.58rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  flex-shrink: 0;
`

const TokenDDMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 112px;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: ${({ theme }) => theme.colors.background.charcoal || theme.colors.background.secondary};
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
  z-index: 20;
`

const TokenDDItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: none;
  border-radius: 7px;
  background: ${({ $active }) => ($active ? 'rgba(77, 42, 82, 0.55)' : 'transparent')};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font: inherit;
  text-align: left;
  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  strong {
    font-size: 0.78rem;
    font-weight: 700;
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
  overflow: auto;
`

const HeadRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  flex-shrink: 0;
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.55rem;
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
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
  max-width: 680px;
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Compare = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
`

const Side = styled.div`
  text-align: center;
  min-width: 180px;
`

const SideTitle = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.2;
`

const SideStat = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.45;
  span {
    color: ${({ theme }) => theme.colors.text.tertiary};
    margin-right: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
`

const Icon = styled.img`
  width: ${({ $sm }) => ($sm ? '20px' : '28px')};
  height: ${({ $sm }) => ($sm ? '20px' : '28px')};
  border-radius: 50%;
  object-fit: cover;
`

const Vs = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  @media (max-width: 1000px) {
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

const BottomStack = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
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

function fmtCoef(n, digits = 2) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  })
}

function fmtAmt(n) {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  const s = n < 0 ? '-' : ''
  if (a >= 1e12) return s + fmtCoef(a / 1e12, 2) + 'T'
  if (a >= 1e9) return s + fmtCoef(a / 1e9, 2) + 'B'
  if (a >= 1e6) return s + fmtCoef(a / 1e6, 2) + 'M'
  if (a >= 1e3) return s + fmtCoef(a / 1e3, 2) + 'K'
  if (a >= 1) return s + a.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return s + a.toLocaleString('en-US', { maximumFractionDigits: 4 })
}

function fmtUsd(n) {
  if (!Number.isFinite(n)) return '—'
  const sign = n < 0 ? '-' : ''
  const a = Math.abs(n)
  if (a >= 1e9) return sign + '$' + fmtCoef(a / 1e9, 2) + 'B'
  if (a >= 1e6) return sign + '$' + a.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (a >= 1e3) return sign + '$' + a.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return sign + '$' + a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct(n, d = 2) {
  if (!Number.isFinite(n)) return '—'
  const pct = n * 100
  return pct.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%'
}

function fmtMovePct(n, d = 2) {
  if (!Number.isFinite(n)) return '—'
  const pct = n * 100
  const sign = pct > 0 ? '+' : ''
  return sign + pct.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%'
}

function fmtPrice(n) {
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  return '$' + n.toExponential(2)
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

function marginImpacts({ effective, baseline, price, lpDepthUsd, cexFloat, circ }) {
  const delta = effective - baseline
  const deltaUsd = delta * price
  const usd = effective * price
  const depthMultiple = lpDepthUsd > 0 ? usd / lpDepthUsd : 0
  const floatShare = cexFloat > 0 ? effective / cexFloat : 0
  const k = 0.5
  const dexImpactBps =
    lpDepthUsd > 0 && Math.abs(deltaUsd) > 0
      ? k * Math.sign(deltaUsd) * Math.sqrt(Math.abs(deltaUsd) / lpDepthUsd)
      : 0
  const k5Target = circ * 0.1
  const coDomGap = Math.max(0, k5Target - effective)
  const coDomGapPct = circ > 0 ? coDomGap / circ : 0
  const booksShare = circ > 0 ? cexFloat / circ : 0
  return {
    delta,
    deltaUsd,
    depthMultiple,
    floatShare,
    dexImpactBps,
    deltaVsFloat: cexFloat > 0 ? delta / cexFloat : 0,
    vNorm: Math.sqrt((2 * usd) / Math.max(1, circ * price)),
    illustrativeMidMoveUsd: price * dexImpactBps,
    coDomGap,
    coDomGapPct,
    booksShare,
    k5Target
  }
}

function pickTokenPayload(live, symbol) {
  const t = live?.tokens?.[symbol]
  const d = TOKEN_DEFAULTS[symbol]
  if (t) {
    return {
      breeder: Number.isFinite(t.breederBalance) ? t.breederBalance : d.breeder,
      price: Number.isFinite(t.priceUsd) ? t.priceUsd : d.price,
      circ: Number.isFinite(t.circ) ? t.circ : d.circ,
      cex: Number.isFinite(t.cexFloatFallback) ? t.cexFloatFallback : d.cex,
      lp: Number.isFinite(t.ethDexLpUsd) ? t.ethDexLpUsd : d.lp,
      logo: t.logo || d.logo,
      priceSource: t.priceSource,
      circSource: t.circSource
    }
  }
  // legacy SHIB top-level fallback
  if (symbol === 'SHIB' && live) {
    return {
      breeder: Number.isFinite(live.breederShib) ? live.breederShib : d.breeder,
      price: Number.isFinite(live.shibPriceUsd) ? live.shibPriceUsd : d.price,
      circ: Number.isFinite(live.circFallback) ? live.circFallback : d.circ,
      cex: Number.isFinite(live.cexFloatFallback) ? live.cexFloatFallback : d.cex,
      lp: Number.isFinite(live.ethDexLpUsdFallback) ? live.ethDexLpUsdFallback : d.lp,
      logo: d.logo,
      priceSource: live.priceSource,
      circSource: 'fallback'
    }
  }
  return { ...d, priceSource: 'fallback', circSource: 'fallback' }
}

export default function GravityPage() {
  const [token, setToken] = useState('SHIB')
  const [tokenMenuOpen, setTokenMenuOpen] = useState(false)
  const tokenMenuRef = useRef(null)
  const [live, setLive] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  const defaults = TOKEN_DEFAULTS.SHIB
  const [liveBreeder, setLiveBreeder] = useState(defaults.breeder)
  const [livePrice, setLivePrice] = useState(defaults.price)
  const [liveLpDepth, setLiveLpDepth] = useState(defaults.lp)
  const [liveCexFloat, setLiveCexFloat] = useState(defaults.cex)
  const [circ, setCirc] = useState(defaults.circ)
  const [tokenLogo, setTokenLogo] = useState(defaults.logo)

  const [simBreeder, setSimBreeder] = useState(defaults.breeder)
  const [simPrice, setSimPrice] = useState(defaults.price)
  const [simLpDepth, setSimLpDepth] = useState(defaults.lp)
  const [simCexFloat, setSimCexFloat] = useState(defaults.cex)
  const [dirty, setDirty] = useState({ breeder: false, price: false, lp: false, cex: false })
  const dirtyRef = useRef(dirty)
  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])

  const applyTokenLive = useCallback((symbol, payload, { resetDirty }) => {
    setLiveBreeder(payload.breeder)
    setLivePrice(payload.price)
    setLiveLpDepth(payload.lp)
    setLiveCexFloat(payload.cex)
    setCirc(payload.circ)
    setTokenLogo(payload.logo)
    if (resetDirty) {
      setSimBreeder(payload.breeder)
      setSimPrice(payload.price)
      setSimLpDepth(payload.lp)
      setSimCexFloat(payload.cex)
      setDirty({ breeder: false, price: false, lp: false, cex: false })
    } else {
      const d = dirtyRef.current
      if (!d.breeder) setSimBreeder(payload.breeder)
      if (!d.price) setSimPrice(payload.price)
      if (!d.lp) setSimLpDepth(payload.lp)
      if (!d.cex) setSimCexFloat(payload.cex)
    }
  }, [])

  const markDirty = (key) => setDirty((d) => ({ ...d, [key]: true }))

  const resetField = (key) => {
    if (key === 'breeder') setSimBreeder(liveBreeder)
    if (key === 'price') setSimPrice(livePrice)
    if (key === 'lp') setSimLpDepth(liveLpDepth)
    if (key === 'cex') setSimCexFloat(liveCexFloat)
    setDirty((d) => ({ ...d, [key]: false }))
  }

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const r = await fetch('/api/gravity')
      const j = await r.json()
      setLive(j)
      const payload = pickTokenPayload(j, token)
      applyTokenLive(token, payload, { resetDirty: false })
      if (!j.ok) setErr(j.error || j.note || 'Live read degraded')
    } catch (e) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }, [token, applyTokenLive])

  useEffect(() => {
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [load])

  const onTokenChange = (sym) => {
    setToken(sym)
    const payload = pickTokenPayload(live, sym)
    applyTokenLive(sym, payload, { resetDirty: true })
  }

  useEffect(() => {
    if (!tokenMenuOpen) return
    const onDoc = (e) => {
      if (tokenMenuRef.current && !tokenMenuRef.current.contains(e.target)) {
        setTokenMenuOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setTokenMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [tokenMenuOpen])

  const selectToken = (sym) => {
    onTokenChange(sym)
    setTokenMenuOpen(false)
  }

  const effective = simBreeder
  const pctCirc = circ > 0 ? effective / circ : 0
  const usd = effective * simPrice
  const depthMultiple = simLpDepth > 0 ? usd / simLpDepth : 0
  const cexPressured = simCexFloat > 0 ? effective / simCexFloat : 0
  const band = impactBand({ pctCirc, depthMultiple, cexPressured })
  const margins = useMemo(
    () =>
      marginImpacts({
        effective,
        baseline: liveBreeder,
        price: simPrice,
        lpDepthUsd: simLpDepth,
        cexFloat: simCexFloat,
        circ
      }),
    [effective, liveBreeder, simPrice, simLpDepth, simCexFloat, circ]
  )
  const missions = useMemo(
    () =>
      MISSIONS.map((m) => {
        const target = m.pctCirc * circ
        const progress = target > 0 ? Math.min(effective / target, 1) : 0
        return { ...m, target, progress, gap: Math.max(0, target - effective), done: progress >= 1 }
      }),
    [circ, effective]
  )
  const activeMission = missions.find((m) => !m.done) || missions[missions.length - 1]
  const breederPctOfCirc = pctCirc * 100
  const cexPctOfCirc = circ > 0 ? (simCexFloat / circ) * 100 : 0
  const otherPct = Math.max(0, 100 - cexPctOfCirc - breederPctOfCirc)
  const dexTone = margins.dexImpactBps > 0.00005 ? 'up' : margins.dexImpactBps < -0.00005 ? 'down' : 'flat'
  const maxBreeder = Math.max(MISSIONS[4].pctCirc * circ, liveBreeder * 1.5, 1)
  const cfg = TOKEN_DEFAULTS[token]
  const cexMax = Math.max(simCexFloat * 3, circ * 0.5, cfg.cex * 2, 1)
  const cexMin = Math.max(circ > 0 ? circ * 0.001 : 0, cfg.cex * 0.01, 1e-6)
  const lpMax = Math.max(simLpDepth * 5, cfg.lp * 5, 1e6)
  const lpMin = Math.max(cfg.lp * 0.01, 100)


  return (
    <App>
      <Head>
        <title>Zero-Gravity Indicator | KumaDex</title>
        <meta
          name="description"
          content="Zero-Gravity — Breeder meme singles vs CEX float marketshare. SHIB LEASH AKITA ELON. v = √(2GM/r)."
        />
      </Head>
      <Header />
      <Main>
        <Page>
          {err && <Warn>{err}</Warn>}

          <Dash>
            <HeadRow id="zg-title">
              <Title>
                Zero-Gravity Indicator
                <Formula>v = √(2GM/r)</Formula>
              </Title>
              <Sub>
                {`Mission phases track Breeder ${token} circ share reclaiming deep liquidity from CEX / institutional books.`}
              </Sub>
            </HeadRow>

              <Body>
                <Compare id="zg-compare">
                  <Side>
                    <SideTitle>
                      <Icon src="/gravity/kuma.png" alt="" />
                      Breeder
                    </SideTitle>
                    <SideStat>
                      <span>Supply</span>
                      {fmtAmt(effective)} {token}
                    </SideStat>
                    <SideStat>
                      <span>TVL</span>
                      {fmtUsd(usd)}
                    </SideStat>
                  </Side>
                  <Vs>VS</Vs>
                  <Side>
                    <SideTitle>
                      <TokenDD ref={tokenMenuRef} id="zg-token-select">
                        <TokenDDBtn
                          type="button"
                          aria-haspopup="listbox"
                          aria-expanded={tokenMenuOpen}
                          onClick={() => setTokenMenuOpen((o) => !o)}
                        >
                          <Icon $sm src={tokenLogo} alt="" />
                          <TokenDDMeta>
                            <strong>{token}</strong>
                          </TokenDDMeta>
                          <TokenDDChevron>{tokenMenuOpen ? '▴' : '▾'}</TokenDDChevron>
                        </TokenDDBtn>
                        {tokenMenuOpen && (
                          <TokenDDMenu role="listbox" aria-label="Compare token">
                            {TOKEN_SYMBOLS.map((s) => (
                              <TokenDDItem
                                key={s}
                                type="button"
                                role="option"
                                $active={s === token}
                                aria-selected={s === token}
                                onClick={() => selectToken(s)}
                              >
                                <Icon $sm src={TOKEN_DEFAULTS[s].logo} alt="" />
                                <strong>{s}</strong>
                              </TokenDDItem>
                            ))}
                          </TokenDDMenu>
                        )}
                      </TokenDD>
                      CEX Float
                    </SideTitle>
                    <SideStat>
                      <span>Supply</span>
                      {fmtAmt(simCexFloat)} {token}
                    </SideStat>
                    <SideStat>
                      <span>TVL</span>
                      {fmtUsd(simCexFloat * simPrice)}
                    </SideStat>
                  </Side>
                </Compare>

                <div>
                  <Metrics id="zg-metrics">
                    <Tile>
                      <TileLabel>Δ vs live</TileLabel>
                      <TileValue $tone={margins.delta >= 0 ? 'up' : 'down'}>
                        {margins.delta >= 0 ? '+' : ''}
                        {fmtAmt(margins.delta)}
                      </TileValue>
                      <TileHint>{fmtUsd(margins.deltaUsd)}</TileHint>
                    </Tile>
                    <Tile>
                      <TileLabel>DEX mid move</TileLabel>
                      <TileValue $tone={dexTone}>{fmtMovePct(margins.dexImpactBps)}</TileValue>
                      <TileHint>~{fmtUsd(margins.illustrativeMidMoveUsd)}/{token}</TileHint>
                    </Tile>
                    <Tile id="zg-zero-tile">
                      <TileLabel>Zero-Gravity</TileLabel>
                      <TileValue>{fmtPct(margins.floatShare, 2)}</TileValue>
                      <TileHint>
                        vs CEX books · Δ {fmtMovePct(margins.deltaVsFloat, 2)}
                      </TileHint>
                    </Tile>
                    <Tile>
                      <TileLabel>Co-dom gap</TileLabel>
                      <TileValue>{fmtAmt(margins.coDomGap)}</TileValue>
                      <TileHint>
                        to K5 · {fmtPct(margins.coDomGapPct, 2)} circ · books {fmtPct(margins.booksShare, 1)}
                      </TileHint>
                    </Tile>
                    <Tile>
                      <TileLabel>Depth ×</TileLabel>
                      <TileValue>{margins.depthMultiple.toFixed(2)}×</TileValue>
                      <TileHint>vs ETH {token} LP</TileHint>
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

                <BottomStack>
                  <Controls id="zg-controls">
                    <Field $live={!dirty.breeder}>
                      <FieldTop>
                        <Label>
                          <Icon src="/gravity/kuma.png" alt="" />
                          Breeder {token}
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
                        step={maxBreeder / 1000 || 1}
                        value={Math.min(simBreeder, maxBreeder)}
                        onChange={(e) => {
                          markDirty('breeder')
                          setSimBreeder(Number(e.target.value))
                        }}
                      />
                      <Values>
                        {fmtAmt(simBreeder)} · {fmtPct(pctCirc, 2)} · live {fmtAmt(liveBreeder)}
                      </Values>
                    </Field>

                    <Field $live={!dirty.price}>
                      <FieldTop>
                        <Label>
                          <Icon src={tokenLogo} alt="" />
                          Price
                          <LiveTag $on={!dirty.price}>{dirty.price ? 'SIM' : 'LIVE'}</LiveTag>
                        </Label>
                        <ResetOne type="button" disabled={!dirty.price} onClick={() => resetField('price')}>
                          Reset live
                        </ResetOne>
                      </FieldTop>
                      <Range
                        type="range"
                        $icon={tokenLogo}
                        $border="#fc72ff"
                        min={cfg.priceMin}
                        max={Math.max(cfg.priceMax, livePrice * 5, simPrice * 2)}
                        step={cfg.priceStep}
                        value={simPrice}
                        onChange={(e) => {
                          markDirty('price')
                          setSimPrice(Number(e.target.value))
                        }}
                      />
                      <Values>
                        {fmtPrice(simPrice)} · live {fmtPrice(livePrice)}
                      </Values>
                    </Field>

                    <Field $live={!dirty.lp}>
                      <FieldTop>
                        <Label>
                          <Icon src={tokenLogo} alt="" />
                          LP depth
                          <LiveTag $on={!dirty.lp}>{dirty.lp ? 'SIM' : 'LIVE'}</LiveTag>
                        </Label>
                        <ResetOne type="button" disabled={!dirty.lp} onClick={() => resetField('lp')}>
                          Reset live
                        </ResetOne>
                      </FieldTop>
                      <Range
                        type="range"
                        $icon={tokenLogo}
                        $border="#fc72ff"
                        min={lpMin}
                        max={lpMax}
                        step={lpMax / 500 || 100}
                        value={Math.min(Math.max(simLpDepth, lpMin), lpMax)}
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
                          <Icon src={tokenLogo} alt="" />
                          CEX float
                          <LiveTag $on={!dirty.cex}>{dirty.cex ? 'SIM' : 'LIVE'}</LiveTag>
                        </Label>
                        <ResetOne type="button" disabled={!dirty.cex} onClick={() => resetField('cex')}>
                          Reset live
                        </ResetOne>
                      </FieldTop>
                      <Range
                        type="range"
                        $icon={tokenLogo}
                        $border="#fc72ff"
                        min={cexMin}
                        max={cexMax}
                        step={cexMax / 500 || 1}
                        value={Math.min(Math.max(simCexFloat, cexMin), cexMax)}
                        onChange={(e) => {
                          markDirty('cex')
                          setSimCexFloat(Number(e.target.value))
                        }}
                      />
                      <Values>
                        {fmtAmt(simCexFloat)} · {fmtPct(cexPressured, 2)} · live {fmtAmt(liveCexFloat)}
                      </Values>
                    </Field>
                  </Controls>

                  <Missions id="zg-missions">
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
                          {(m.pctCirc * 100).toFixed(2)}% circ · {(m.progress * 100).toFixed(2)}%
                          {!m.done ? ` · gap ${fmtAmt(m.gap)}` : ' · cleared'}
                        </MissionPct>
                        <Track>
                          <Fill $pct={m.progress * 100} $done={m.done} />
                        </Track>
                      </Mission>
                    ))}
                  </Missions>
                </BottomStack>
              </Body>

            <Foot>
              Live snapshots refresh ~60s{loading ? ' · refreshing…' : ''} · {live?.tokens?.[token]?.priceSource || live?.priceSource || '—'} · circ{' '}
              {fmtAmt(circ)} {token} · books share {fmtPct(margins.booksShare, 1)} · fetched{' '}
              {live?.fetchedAt ? new Date(live.fetchedAt).toLocaleTimeString() : '—'}
              {live?.cexFloatNote ? ' · CEX float = estimate' : ''}
            </Foot>
          </Dash>
        </Page>
      </Main>

      <CoachMarks
        id="zero-gravity"
        welcomeTitle="Welcome to Zero-Gravity"
        welcomeDescription="Tour Breeder vs CEX books for SHIB, LEASH, AKITA, ELON — switch the token from the CEX-side menu and run K1–K5 missions."
        welcomeLogo="/gravity/kuma.png"
        steps={ZERO_GRAVITY_COACH_STEPS}
      />
    </App>
  )
}
