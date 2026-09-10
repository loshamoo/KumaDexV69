import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '../src/components/Header'
import styled from 'styled-components'

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
  max-width: 1000px;
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

const Lead = styled.p`
  margin: 0 auto;
  max-width: 640px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.6;
`

const Card = styled.section`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 22px;
  box-shadow: ${({ theme }) => theme.shadows.large};
  margin-bottom: 16px;
`

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`

const Big = styled.div`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
  margin: 8px 0 4px;
`

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 0.85rem;
`

const Warn = styled.p`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.85rem;
`

const Stack = styled.div`
  display: flex;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  margin: 18px 0 14px;
  background: ${({ theme }) => theme.colors.background.interactive};
`

const Seg = styled.div`
  width: ${({ $pct }) => Math.max($pct, $pct > 0 ? 0.15 : 0)}%;
  background: ${({ $color }) => $color};
`

const Legend = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const Dot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  margin-top: 3px;
  flex-shrink: 0;
`

const CardTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Table = styled.div`
  display: grid;
  gap: 0;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.7fr;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const Pct = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 700;
`

const A = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Foot = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.5;
  margin-top: 8px;
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
  burned: '#FF6871',
  lockedLp: '#c0392b',
  lpOther: '#ff8502',
  breeder: '#fc72ff',
  migrate: '#6C7284',
  rest: '#2a3145'
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
  const migrate = b?.migrate?.pct || 0
  const permanent = b?.permanentCombined?.pct || 0
  const rest = Math.max(0, 100 - permanent - lpMovable - (b?.breederRaw?.pct || 0) - migrate)

  return (
    <AppContainer>
      <Head>
        <title>Meme Liquidity | KumaDex</title>
        <meta name="description" content="KUMA V2 supply breakdown: burned, locked via dead LP, Breeder, migrate residual." />
      </Head>
      <Header />
      <MainContent>
        <PageShell>
          <HeaderBlock>
            <Title>Meme Liquidity</Title>
            <Lead>
              Live labeled view of <strong>KUMA V2</strong> supply: how much is permanently burned, how much is locked behind
              burned Uni V2 LP, and what remains in Breeder / migrate / wallets. Supporting permanence context for Kuma&apos;s
              on-chain depth thesis.
            </Lead>
          </HeaderBlock>

          <Card>
            <StatLabel>Permanently inaccessible (burn + dead LP)</StatLabel>
            <Big>{data ? fmtPct(permanent) : '…'}</Big>
            <Meta>
              of 1 quadrillion KUMA V2
              {data?.fetchedAt ? ` · as of ${new Date(data.fetchedAt).toLocaleString()}` : ''}
            </Meta>
            {err && <Warn>{err}</Warn>}

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
            <CardTitle>Labeled breakdown</CardTitle>
            <Table>
              <Row style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
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
                    <Pct>{fmtPct(row.pct)}</Pct>
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
            <A href="/gravity">Gravity</A> for Breeder SHIB escape velocity.
          </Foot>
        </PageShell>
      </MainContent>
    </AppContainer>
  )
}
