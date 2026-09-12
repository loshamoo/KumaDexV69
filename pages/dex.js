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

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 16px 0 0;
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

const Bullets = styled.ul`
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
  grid-template-columns: 1.2fr 1fr 1.4fr;
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
  dao: 'https://dao.kumatokens.com',
  dexdao: 'https://dexdao.kumatokens.com',
  infiniteLoop: '/infinite-loop',
  vaults: '/vaults',
  vessel: '/vessel-vault',
}

export default function DexPage() {
  return (
    <AppContainer>
      <Head>
        <title>Kuma DEX (vAMM) | KumaDex</title>
        <meta
          name="description"
          content="Kuma DEX vAMM scaffold: ClearingHouse, Amm, CollateralVault, InsuranceFund. Not deployed. Not live trading. Timelock admin; DEX DAO lists markets."
        />
      </Head>
      <Header />
      <MainContent>
        <PageShell>
          <HeaderBlock>
            <Title>Kuma DEX (vAMM)</Title>
            <Lead>
              Perpetual futures via a virtual constant-product AMM (Perp v1-style). This Hub page is a{' '}
              <strong>scaffold / status stub</strong> — there is no mainnet ClearingHouse and no live
              trading UI wired here.
            </Lead>
            <BadgeRow>
              <Badge>Not deployed</Badge>
              <Badge $partial>Scaffold only</Badge>
            </BadgeRow>
          </HeaderBlock>

          <Card>
            <CardTitle>Stack (whitepaper §2.5)</CardTitle>
            <Warn>
              Do not confuse with Hub spot chrome (/kumadex), Vessel treasury, or unrelated kuma.bid.
              No claim of live perps.
            </Warn>
            <Bullets>
              <li>
                <strong>ClearingHouse</strong> — open / close / liquidate; Timelock-only admin
                (list, pause, fee %, recipients, oracle).
              </li>
              <li>
                <strong>Amm</strong> — virtual <code>x * y = k</code>; stores no tokens; first market{' '}
                <strong>KUMA–USDC</strong>.
              </li>
              <li>
                <strong>CollateralVault</strong> — real USDC collateral for traders (≠ Vessel, ≠ kToken
                vaults).
              </li>
              <li>
                <strong>InsuranceFund</strong> — liquidation remainder; seed (when live) = KUMA DAO
                Vessel spend + DEX DAO accept.
              </li>
            </Bullets>
          </Card>

          <Card>
            <CardTitle>Margin rules (WP locked)</CardTitle>
            <Table>
              <Row style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                <span>Parameter</span>
                <span>Value</span>
                <span>Notes</span>
              </Row>
              <Row>
                <span>Maintenance margin (MM)</span>
                <span>
                  <strong>6.25%</strong>
                </span>
                <span>Liquidation when margin ratio &lt; MM</span>
              </Row>
              <Row>
                <span>Liquidator tip</span>
                <span>
                  <strong>1.25%</strong>
                </span>
                <span>Of remaining notional to liquidator bot</span>
              </Row>
              <Row>
                <span>Fee split (initial)</span>
                <span>50% / 50%</span>
                <span>DEX DAO path / dKUMA buyback-burn</span>
              </Row>
              <Row>
                <span>First market</span>
                <span>KUMA–USDC</span>
                <span>Listed only by DEX DAO → Timelock</span>
              </Row>
            </Table>
          </Card>

          <Card>
            <CardTitle>Governance path</CardTitle>
            <Meta>
              Dual DAO, same Timelock discipline (2d delay). No EOA admins after mainnet announce.
            </Meta>
            <Loop style={{ marginTop: 12 }}>
              <li>
                <strong>KUMA DAO</strong> (
                <A href={links.dao} target="_blank" rel="noreferrer">
                  dao.kumatokens.com
                </A>
                ) — Snapshot → SafeSnap → Timelock: whether treasury funds the DEX, Vessel audit/deploy
                spend (P-DEX-0), InsuranceFund seed.
              </li>
              <li>
                <strong>DEX DAO</strong> (
                <A href={links.dexdao} target="_blank" rel="noreferrer">
                  dexdao.kumatokens.com
                </A>
                ) — dKUMA Governor (not live) → Timelock: list/pause markets, fee %, leverage bounds,
                index-price oracle (P-DEX-1, P-DEX-2).
              </li>
            </Loop>
            <Foot>
              Timelock path only. This page is <strong>≠ Vessel</strong> (treasury) and{' '}
              <strong>≠ kuma.bid</strong>. See{' '}
              <A href={links.infiniteLoop}>Infinite Loop</A> for product status vs live apps.
            </Foot>
          </Card>

          <Card>
            <CardTitle>What you cannot do here yet</CardTitle>
            <Bullets>
              <li>No open/close position — contracts not deployed on mainnet.</li>
              <li>No mock “live” mark prices labeled as mainnet.</li>
              <li>
                Related stubs: <A href={links.vaults}>/vaults</A> (kTokens, not built) ·{' '}
                <A href={links.vessel}>/vessel-vault</A> (treasury, live V1).
              </li>
            </Bullets>
          </Card>

          <Foot>
            Public notes: loshamoo. Local Hub checkout only until Laurence pins nav under More /
            Gravity. Permanent KUMA/WETH LP stays on Uniswap — vAMM has no LPs.
          </Foot>
        </PageShell>
      </MainContent>
    </AppContainer>
  )
}
