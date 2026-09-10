import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '../src/components/Header'
import styled from 'styled-components'

const App = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  color: #e8e8e8;
`
const Main = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px 80px;
`
const H1 = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #f7931a, #e8a847);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`
const Lead = styled.p`
  color: #aaa;
  max-width: 720px;
  line-height: 1.5;
  margin-bottom: 24px;
`
const Card = styled.section`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
`
const Big = styled.div`
  font-size: 2.4rem;
  font-weight: 800;
  color: #00d4aa;
  margin: 8px 0;
`
const Stack = styled.div`
  display: flex;
  height: 36px;
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0 12px;
`
const Seg = styled.div`
  width: ${({ $pct }) => Math.max($pct, $pct > 0 ? 0.15 : 0)}%;
  background: ${({ $color }) => $color};
`
const Legend = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`
const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.88rem;
`
const Dot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  margin-top: 3px;
  flex-shrink: 0;
`
const Table = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 8px;
`
const Row = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.7fr;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.9rem;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`
const A = styled.a`
  color: #00d4aa;
`
const Foot = styled.p`
  font-size: 0.78rem;
  color: #777;
  line-height: 1.45;
  margin-top: 20px;
`

function fmtT(n) {
  if (!Number.isFinite(n)) return '—'
  return (n / 1e12).toFixed(2) + 'T'
}
function fmtPct(n) {
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(2) + '%'
}

const COLORS = {
  burned: '#e74c3c',
  lockedLp: '#c0392b',
  lpOther: '#f7931a',
  breeder: '#00d4aa',
  migrate: '#6c5ce7',
  rest: '#445566'
}

export default function MemeLiquidityPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/meme-liquidity')
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) setErr(j.error || 'Failed')
        setData(j)
      })
      .catch((e) => setErr(String(e.message || e)))
  }, [])

  const b = data?.buckets
  const burned = b?.burnedRaw?.pct || 0
  const lockedLp = b?.lockedViaBurnedLp?.pct || 0
  const inLp = b?.inLpTotal?.pct || 0
  const lpMovable = Math.max(0, inLp - lockedLp)
  const breeder = (b?.breederRaw?.pct || 0) + (b?.breederViaLp?.pct || 0)
  // avoid double counting breederViaLp that's already in lpMovable — for stack use raw buckets carefully
  const migrate = b?.migrate?.pct || 0
  const permanent = b?.permanentCombined?.pct || 0
  const rest = Math.max(0, 100 - permanent - lpMovable - (b?.breederRaw?.pct || 0) - migrate)
  // Note: breederViaLp is subset of lpMovable; breederRaw is separate

  return (
    <App>
      <Head>
        <title>Meme Liquidity | KumaDex</title>
        <meta name="description" content="KUMA V2 supply breakdown: burned, locked via dead LP, Breeder, migrate residual." />
      </Head>
      <Header />
      <Main>
        <H1>Meme Liquidity</H1>
        <Lead>
          Live labeled view of <strong>KUMA V2</strong> supply: how much is permanently burned, how much is locked behind
          burned Uni V2 LP, and what remains in Breeder / migrate / wallets. Supporting permanence context for Kuma&apos;s
          on-chain depth thesis.
        </Lead>

        <Card>
          <div style={{ color: '#aaa', fontSize: '0.9rem' }}>Permanently inaccessible (burn + dead LP)</div>
          <Big>{data ? fmtPct(permanent) : '…'}</Big>
          <div style={{ color: '#888' }}>
            of 1 quadrillion KUMA V2
            {data?.fetchedAt ? ` · as of ${new Date(data.fetchedAt).toLocaleString()}` : ''}
          </div>
          {err && <p style={{ color: '#e8a847' }}>{err}</p>}

          <Stack>
            <Seg $pct={burned} $color={COLORS.burned} title="Raw burn" />
            <Seg $pct={lockedLp} $color={COLORS.lockedLp} title="Dead LP lock" />
            <Seg $pct={lpMovable} $color={COLORS.lpOther} title="LP not burned" />
            <Seg $pct={b?.breederRaw?.pct || 0} $color={COLORS.breeder} title="Breeder raw KUMA" />
            <Seg $pct={migrate} $color={COLORS.migrate} title="Migrate" />
            <Seg $pct={rest} $color={COLORS.rest} title="Other wallets" />
          </Stack>

          <Legend>
            <Item>
              <Dot $color={COLORS.burned} />
              <span>
                <strong>Burned at 0xdead</strong> — {fmtPct(burned)} (~{fmtT(b?.burnedRaw?.human)} KUMA)
              </span>
            </Item>
            <Item>
              <Dot $color={COLORS.lockedLp} />
              <span>
                <strong>Locked via burned LP</strong> — {fmtPct(lockedLp)} (~{fmtT(b?.lockedViaBurnedLp?.human)})
              </span>
            </Item>
            <Item>
              <Dot $color={COLORS.lpOther} />
              <span>
                <strong>In LP (unburned LP shares)</strong> — {fmtPct(lpMovable)}
              </span>
            </Item>
            <Item>
              <Dot $color={COLORS.breeder} />
              <span>
                <strong>Breeder (raw KUMA)</strong> — {fmtPct(b?.breederRaw?.pct)} (+ ~{fmtPct(b?.breederViaLp?.pct)} via
                LP in Breeder)
              </span>
            </Item>
            <Item>
              <Dot $color={COLORS.migrate} />
              <span>
                <strong>KumaMigrate residual</strong> — {fmtPct(migrate)}
              </span>
            </Item>
            <Item>
              <Dot $color={COLORS.rest} />
              <span>
                <strong>Other wallets / unlabeled</strong> — ~{fmtPct(rest)}
              </span>
            </Item>
          </Legend>
        </Card>

        <Card>
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Labeled breakdown</h2>
          <Table>
            <Row style={{ color: '#888', fontSize: '0.8rem' }}>
              <span>Bucket</span>
              <span>Amount</span>
              <span>% supply</span>
            </Row>
            {b &&
              [
                b.burnedRaw,
                b.lockedViaBurnedLp,
                b.permanentCombined,
                b.inLpTotal,
                b.breederRaw,
                b.breederViaLp,
                b.migrate,
                b.ogDeployer,
                b.gateCex
              ].map((row) => (
                <Row key={row.label}>
                  <span>{row.label}</span>
                  <span>{fmtT(row.human)} KUMA</span>
                  <span style={{ color: '#00d4aa', fontWeight: 600 }}>{fmtPct(row.pct)}</span>
                </Row>
              ))}
          </Table>
        </Card>

        <Foot>
          KUMA V2{' '}
          <A href="https://etherscan.io/token/0x48C276e8d03813224bb1e55F953adB6d02FD3E02" target="_blank" rel="noreferrer">
            0x48C276e8…3E02
          </A>
          · Uni V2 LP{' '}
          <A href="https://etherscan.io/address/0xDF60E6416Fcf8C955FdDF01148753A911F7A5905" target="_blank" rel="noreferrer">
            0xDF60…5905
          </A>
          (~{data?.lp?.deadPct?.toFixed?.(2) || '97.5'}% of LP at 0xdead). Raw burn and dead-LP lock do not overlap.
          Known CEX row is a lower bound (Gate hot wallet); unlabeled venues omitted. See also{' '}
          <A href="/flippening">Flippening</A> for Breeder SHIB gravity.
        </Foot>
      </Main>
    </App>
  )
}
