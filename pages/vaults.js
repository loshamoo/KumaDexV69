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
  grid-template-columns: 1.2fr 1.6fr;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  align-items: start;

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
  infiniteLoop: '/infinite-loop',
  dex: '/dex',
  vessel: '/vessel-vault',
  dbreeder: 'https://dbreeder.kumatokens.com',
  breeder: 'https://breeder.kumatokens.com',
  vesselScan: 'https://etherscan.io/address/0x84B92c9BE811E4C86E26a710CC07E3C0d06ca729',
}

export default function VaultsPage() {
  return (
    <AppContainer>
      <Head>
        <title>Kuma Vaults (kTokens) | KumaDex</title>
        <meta
          name="description"
          content="Kuma Vaults kTokens — whitepaper §2.6. Not built. Stables to kTokens; withdraw same asset; harvest to KUMA. Not Vessel, not dBreeder, not DEX CollateralVault."
        />
      </Head>
      <Header />
      <MainContent>
        <PageShell>
          <HeaderBlock>
            <Title>Kuma Vaults (kTokens)</Title>
            <Lead>
              Yearn-style ERC-4626 vaults from whitepaper §2.6: deposit stables, receive{' '}
              <strong>kTokens</strong>, withdraw the <strong>same asset</strong>. This page is status
              only — the product is <strong>not built</strong>.
            </Lead>
            <BadgeRow>
              <Badge>Not built</Badge>
            </BadgeRow>
          </HeaderBlock>

          <Card>
            <CardTitle>WP §2.6 — intended product</CardTitle>
            <Warn>
              User funds never enter Vessel. Do not confuse with dBreeder or DEX CollateralVault.
            </Warn>
            <Bullets>
              <li>
                <strong>Deposit</strong> stables (MVP: USDC first; DAI/USDT as later vaults) → mint
                kTokens (shares).
              </li>
              <li>
                <strong>Withdraw</strong> always the same asset deposited — share price tracks that
                asset only.
              </li>
              <li>
                <strong>Harvest</strong> strategy rewards → sell for <strong>$KUMA</strong> (sink set
                by Timelock; KUMA must not smuggle into share price).
              </li>
              <li>
                <strong>Optional Breeder</strong> later: stake kTokens for $dKUMA after P7 (Breeder
                Ownable → governance). Vault can exist without a Breeder pid.
              </li>
            </Bullets>
          </Card>

          <Card>
            <CardTitle>What this is not</CardTitle>
            <Table>
              <Row style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                <span>Lookalike</span>
                <span>Difference</span>
              </Row>
              <Row>
                <span>
                  <A href={links.vessel}>Vessel</A> (
                  <A href={links.vesselScan} target="_blank" rel="noreferrer">
                    0x84B92…a729
                  </A>
                  )
                </span>
                <span>Protocol treasury — not a user deposit vault</span>
              </Row>
              <Row>
                <span>
                  <A href={links.dbreeder} target="_blank" rel="noreferrer">
                    dBreeder
                  </A>
                </span>
                <span>Stake dKUMA → USDC rewards (live). Different product.</span>
              </Row>
              <Row>
                <span>
                  DEX <A href={links.dex}>CollateralVault</A>
                </span>
                <span>Perp trader margin USDC — not kToken shares</span>
              </Row>
            </Table>
          </Card>

          <Card>
            <CardTitle>Admin path</CardTitle>
            <Meta>
              Vault existence + strategy + kumaSink = <strong>KUMA DAO → Timelock (2d)</strong>. DEX
              DAO does not pick strategies.
            </Meta>
            <Loop style={{ marginTop: 12 }}>
              <li>
                <strong>KUMA DAO</strong> (
                <A href={links.dao} target="_blank" rel="noreferrer">
                  dao.kumatokens.com
                </A>
                ) Snapshot → SafeSnap → Timelock: deploy vault,{' '}
                <code>transferOwnership(Timelock)</code>, <code>setStrategy</code>,{' '}
                <code>setKumaSink</code> (P-VAULT-0).
              </li>
              <li>
                Keepers may call <code>harvest()</code>; they cannot change strategy.
              </li>
              <li>
                Breeder <code>add(kToken)</code> waits on P7 — see{' '}
                <A href={links.breeder} target="_blank" rel="noreferrer">
                  Breeder
                </A>
                .
              </li>
            </Loop>
            <Foot>
              See <A href={links.infiniteLoop}>Infinite Loop</A> for live vs not-built matrix.
            </Foot>
          </Card>

          <Foot>
            Public notes: loshamoo. Local Hub checkout only until Laurence pins nav under More /
            Gravity. No deposit UI until Timelock owns the vault admin.
          </Foot>
        </PageShell>
      </MainContent>
    </AppContainer>
  )
}
