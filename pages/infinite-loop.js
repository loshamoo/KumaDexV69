import Head from 'next/head'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Header from '../src/components/Header'
import styled from 'styled-components'
import {
  cutoverActive,
  getFeeRecipient,
  LEGACY_FEE_EOA,
  SWAPX_FEE_ROUTER,
} from '../src/config/feeRecipients'
import { SWAPX_FEE_ROUTER_ABI } from '../src/contracts/SwapXFeeRouterABI'

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

const CardTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const Loop = styled.ol`
  margin: 0;
  padding-left: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  line-height: 1.7;

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

const Table = styled.div`
  display: grid;
  gap: 0;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 0.7fr 1.4fr;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const Badge = styled.span`
  display: inline-block;
  width: fit-content;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${({ $live, $partial }) =>
    $live ? '#0d1b12' : $partial ? '#1a1408' : 'rgba(255,255,255,0.85)'};
  background: ${({ $live, $partial, theme }) =>
    $live ? theme.colors.secondary : $partial ? theme.colors.warning : 'rgba(255,255,255,0.12)'};
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

const Meta = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 0.85rem;
  line-height: 1.55;
`

const Warn = styled.p`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.85rem;
  margin: 0 0 12px;
`

const links = {
  swapx: 'https://swap.kumatokens.com',
  breeder: 'https://breeder.kumatokens.com',
  dbreeder: 'https://dbreeder.kumatokens.com',
  dao: 'https://dao.kumatokens.com',
  dexdao: 'https://dexdao.kumatokens.com',
  breederScan: 'https://etherscan.io/address/0xa206D322829e04fb5acD36F289eD5367AC3E73e4',
  dbreederScan: 'https://etherscan.io/address/0x00844Af60e061c30BB8cfF5D5D1637559AE1B682',
  feeScan: 'https://etherscan.io/address/0x15305A9c292B4e38B3154f6bfa54841A84C92922',
  vesselScan: 'https://etherscan.io/address/0x84B92c9BE811E4C86E26a710CC07E3C0d06ca729',
}


function shortAddr(a) {
  if (!a || a.length < 12) return a || '—'
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

function formatSweepTs(ts) {
  const n = Number(ts)
  if (!n) return 'never'
  try {
    return new Date(n * 1000).toLocaleString()
  } catch {
    return String(n)
  }
}

/** Read-only cutover status + last Swept. No-op UI when router env unset. */
function FeeCutoverPanel() {
  const [state, setState] = useState({
    loading: cutoverActive,
    paused: null,
    lastSweepAt: null,
    lastSwept: null,
    bpsBreeder: null,
    bpsVessel: null,
    error: null,
  })

  useEffect(() => {
    if (!cutoverActive || !SWAPX_FEE_ROUTER) return undefined
    let cancelled = false

    async function load() {
      try {
        const rpc =
          (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_RPC_URL) ||
          'https://ethereum.publicnode.com'
        const provider = new ethers.providers.JsonRpcProvider(rpc)
        const c = new ethers.Contract(SWAPX_FEE_ROUTER, SWAPX_FEE_ROUTER_ABI, provider)
        const [paused, lastSweepAt, bpsBreeder, bpsVessel] = await Promise.all([
          c.paused(),
          c.lastSweepAt(),
          c.bpsBreeder(),
          c.bpsVessel(),
        ])

        let lastSwept = null
        try {
          const latest = await provider.getBlockNumber()
          const fromBlock = Math.max(0, latest - 120_000)
          const filter = c.filters.Swept()
          const logs = await c.queryFilter(filter, fromBlock, latest)
          if (logs.length) {
            const ev = logs[logs.length - 1]
            lastSwept = {
              txHash: ev.transactionHash,
              usdcAmount: ev.args.usdcAmount?.toString?.() ?? String(ev.args[0]),
              toBreeder: ev.args.toBreeder?.toString?.() ?? String(ev.args[1]),
              toVessel: ev.args.toVessel?.toString?.() ?? String(ev.args[2]),
            }
          }
        } catch {
          // queryFilter may fail on some RPCs — getters still useful
        }

        if (!cancelled) {
          setState({
            loading: false,
            paused: Boolean(paused),
            lastSweepAt: lastSweepAt?.toString?.() ?? String(lastSweepAt),
            lastSwept,
            bpsBreeder: Number(bpsBreeder),
            bpsVessel: Number(bpsVessel),
            error: null,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err?.message || 'Failed to read router',
          }))
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const recipient = getFeeRecipient()

  return (
    <Card>
      <CardTitle>SwapX fee cutover</CardTitle>
      {!cutoverActive ? (
        <Meta>
          Router env unset — LiFi fees still go to legacy EOA{' '}
          <A href={`https://etherscan.io/address/${LEGACY_FEE_EOA}`} target="_blank" rel="noreferrer">
            {shortAddr(LEGACY_FEE_EOA)}
          </A>
          . Set <code>NEXT_PUBLIC_SWAPX_FEE_ROUTER</code> after deploy to activate.
        </Meta>
      ) : (
        <>
          <Meta>
            Cutover <strong>active</strong>. Referrer:{' '}
            <A href={`https://etherscan.io/address/${recipient}`} target="_blank" rel="noreferrer">
              {shortAddr(recipient)}
            </A>
            {state.bpsBreeder != null && (
              <>
                {' '}
                · split {state.bpsBreeder}/{state.bpsVessel} bps
              </>
            )}
            {state.paused != null && <> · paused={String(state.paused)}</>}
          </Meta>
          {state.loading && <Meta style={{ marginTop: 8 }}>Loading on-chain status…</Meta>}
          {state.error && <Warn style={{ marginTop: 8 }}>{state.error}</Warn>}
          {!state.loading && !state.error && (
            <Meta style={{ marginTop: 8 }}>
              lastSweepAt: {formatSweepTs(state.lastSweepAt)}
              {state.lastSwept ? (
                <>
                  {' '}
                  · last Swept{' '}
                  <A
                    href={`https://etherscan.io/tx/${state.lastSwept.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {shortAddr(state.lastSwept.txHash)}
                  </A>{' '}
                  (USDC {state.lastSwept.usdcAmount} → breeder {state.lastSwept.toBreeder} / vessel{' '}
                  {state.lastSwept.toVessel})
                </>
              ) : (
                <> · no Swept logs in recent window</>
              )}
            </Meta>
          )}
        </>
      )}
    </Card>
  )
}

export default function InfiniteLoopPage() {
  return (
    <AppContainer>
      <Head>
        <title>Infinite Loop | KumaDex</title>
        <meta
          name="description"
          content="Kuma Inu whitepaper infinite loop: SwapX, Breeder, dBreeder. DEX and Vaults are not deployed. Governance via Snapshot and Timelock."
        />
      </Head>
      <Header />
      <MainContent>
        <PageShell>
          <HeaderBlock>
            <Title>Infinite Loop</Title>
            <Lead>
              Whitepaper V1.7 loop: buy memes on SwapX, farm dKUMA on Breeder, stake dKUMA for USDC
              on dBreeder, rebuy. This page is <strong>educational / status</strong> — it does not
              claim Kuma DEX perps or kToken vaults are live.
            </Lead>
          </HeaderBlock>

          <FeeCutoverPanel />

          <Card>
            <CardTitle>How the loop is supposed to work</CardTitle>
            <Loop>
              <li>
                <strong>Buy</strong> $KUMA or meme coins on{' '}
                <A href={links.swapx} target="_blank" rel="noreferrer">
                  Kuma SwapX
                </A>{' '}
                (cross-chain aggregator, live since 2022).
              </li>
              <li>
                <strong>Stake</strong> those tokens / LPs on{' '}
                <A href={links.breeder} target="_blank" rel="noreferrer">
                  Kuma Breeder
                </A>{' '}
                → earn $dKUMA.
              </li>
              <li>
                <strong>Stake dKUMA</strong> on{' '}
                <A href={links.dbreeder} target="_blank" rel="noreferrer">
                  dKuma Breeder
                </A>{' '}
                → earn $USDC (WP: staking fees + SwapX fees).
              </li>
              <li>
                <strong>Rebuy</strong> memes with USDC and repeat.
              </li>
            </Loop>
            <Foot>
              Live apps can be walked by hand today. The <strong>cash hop</strong> (SwapX fees wallet → dBreeder) is a whitepaper claim —
              on-chain it is <strong>stale / partial</strong> (historic Safe hop; not monthly now).
            </Foot>
          </Card>

          <Card>
            <CardTitle>Product status</CardTitle>
            <Warn>Kuma DEX (vAMM perps) and Kuma Vaults (kTokens) are not built. Do not confuse with unrelated kuma.bid.</Warn>
            <Table>
              <Row style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                <span>Product</span>
                <span>Status</span>
                <span>Where</span>
              </Row>
              <Row>
                <span>Kuma SwapX</span>
                <Badge $live>Live</Badge>
                <span>
                  <A href={links.swapx} target="_blank" rel="noreferrer">
                    swap.kumatokens.com
                  </A>
                </span>
              </Row>
              <Row>
                <span>Kuma Breeder</span>
                <Badge $live>Live</Badge>
                <span>
                  <A href={links.breeder} target="_blank" rel="noreferrer">
                    breeder.kumatokens.com
                  </A>{' '}
                  ·{' '}
                  <A href={links.breederScan} target="_blank" rel="noreferrer">
                    0xa206…73e4
                  </A>
                </span>
              </Row>
              <Row>
                <span>dKuma Breeder</span>
                <Badge $live>Live</Badge>
                <span>
                  <A href={links.dbreeder} target="_blank" rel="noreferrer">
                    dbreeder.kumatokens.com
                  </A>{' '}
                  ·{' '}
                  <A href={links.dbreederScan} target="_blank" rel="noreferrer">
                    0x00844…b682
                  </A>
                </span>
              </Row>
              <Row>
                <span>SwapX → dBreeder fees</span>
                <Badge $partial>Stale</Badge>
                <span>
                  WP wallet{' '}
                  <A href={links.feeScan} target="_blank" rel="noreferrer">
                    0x1530…2922
                  </A>
                </span>
              </Row>
              <Row>
                <span>Kuma DEX vAMM perps</span>
                <Badge>Not built</Badge>
                <span>No ClearingHouse on mainnet · dex.kumatokens.com dead</span>
              </Row>
              <Row>
                <span>Kuma Vault kTokens</span>
                <Badge>Not built</Badge>
                <span>
                  Vessel{' '}
                  <A href={links.vesselScan} target="_blank" rel="noreferrer">
                    0x84B92…a729
                  </A>{' '}
                  is treasury, not a user vault
                </span>
              </Row>
              <Row>
                <span>KUMA DAO</span>
                <Badge $live>Snapshot</Badge>
                <span>
                  <A href={links.dao} target="_blank" rel="noreferrer">
                    dao.kumatokens.com
                  </A>{' '}
                  · Timelock not deployed yet
                </span>
              </Row>
              <Row>
                <span>DEX DAO</span>
                <Badge $partial>Partial</Badge>
                <span>
                  <A href={links.dexdao} target="_blank" rel="noreferrer">
                    dexdao.kumatokens.com
                  </A>{' '}
                  · proposals Coming Soon
                </span>
              </Row>
            </Table>
          </Card>

          <Card>
            <CardTitle>Governance path (how privileged changes ship)</CardTitle>
            <Meta>
              Dual DAO, same Timelock discipline as P0–P7. No EOA admins on future DEX/Vault
              contracts. Delay: <strong>2 days</strong> after queue.
            </Meta>
            <Loop style={{ marginTop: 12 }}>
              <li>
                <strong>KUMA DAO</strong> (Snapshot, $KUMA + Breeder stake) → SafeSnap → Timelock:
                Vessel, ENS, Space Suit, dBreeder ownership, <strong>SwapX fee-wallet routing</strong>,
                whether a Vault product exists.
              </li>
              <li>
                <strong>DEX DAO</strong> ($dKUMA) → Governor (not live) → Timelock: list/pause vAMM
                markets, trading fee %, leverage bounds, index-price oracle. Not built — UI is
                delegate-only.
              </li>
            </Loop>
            <Foot>
              Until Timelock exists, Safe <code>kumatokens.eth</code> can still sign — but fee routing
              and DEX listings must not be treated as a desk decision. InsuranceFund seed (when DEX
              exists) needs a KUMA DAO spend through Vessel V2.5, not the live ETH{' '}
              <code>.transfer</code> vault.
            </Foot>
          </Card>

          <Foot>
            Whitepaper INDEX is the table of contents, not a product. Perp index price is an oracle
            for funding, later. Optional subgraphs are plumbing, not “Kuma Index.” Permanent KUMA/WETH
            LP stays on Uniswap — vAMM has no LP. Public notes: loshamoo.
          </Foot>
        </PageShell>
      </MainContent>
    </AppContainer>
  )
}
