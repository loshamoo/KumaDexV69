import Head from 'next/head'
import Header from '../src/components/Header'
import styled from 'styled-components'
import { useRouter } from 'next/router'

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
`

const PageShell = styled.div`
  width: 100%;
  max-width: 720px;
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
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.12);
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

const Warn = styled.p`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.95rem;
  margin: 0 0 12px;
  line-height: 1.6;
`

const Bullets = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.95rem;
  line-height: 1.7;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`

const ActionBtn = styled.button`
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ $primary, theme }) => ($primary ? theme.colors.secondary : 'rgba(255,255,255,0.08)')};
  color: ${({ $primary }) => ($primary ? '#0d1b12' : '#fff')};
`

const Foot = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  line-height: 1.5;
  margin-top: 8px;
`

export default function KumaDexPerpsStatus() {
  const router = useRouter()

  return (
    <AppContainer>
      <Head>
        <title>KumaDex Perpetuals — not live | KumaDex</title>
        <meta
          name="description"
          content="KumaDex perpetuals are not live. No 1x–25x trading UI. Coming via DAO once contracts exist."
        />
      </Head>
      <Header />
      <MainContent>
        <PageShell>
          <HeaderBlock>
            <Title>KumaDex Perpetuals</Title>
            <Lead>
              Perpetual futures are <strong>not live</strong>. There is no mainnet perps contract,
              no leverage, and no open/close UI on this page.
            </Lead>
            <BadgeRow>
              <Badge>Not live</Badge>
              <Badge>Coming via DAO</Badge>
            </BadgeRow>
          </HeaderBlock>

          <Card>
            <CardTitle>Status</CardTitle>
            <Warn>
              Earlier Hub chrome advertised 1x–25x perpetuals and multiplied the swap preview by
              leverage. That was incorrect: SwapX is spot/cross-chain only (including Robinhood
              Chain and Solana). Leverage is not applied to quotes.
            </Warn>
            <Bullets>
              <li>No tradable long/short or leverage slider.</li>
              <li>No liquidation prices for a market that does not exist.</li>
              <li>
                vAMM / ClearingHouse scaffold (also not deployed): see <code>/dex</code>.
              </li>
              <li>Spot swaps stay on SwapX.</li>
            </Bullets>
            <Actions>
              <ActionBtn $primary type="button" onClick={() => router.push('/swap')}>
                Go to SwapX
              </ActionBtn>
              <ActionBtn type="button" onClick={() => router.push('/dex')}>
                DEX (vAMM) status
              </ActionBtn>
            </Actions>
          </Card>

          <Foot>
            Public notes: loshamoo / Kuma community. Markets, fee %, and leverage bounds would be
            listed by DEX DAO → Timelock if a perps product is ever built.
          </Foot>
        </PageShell>
      </MainContent>
    </AppContainer>
  )
}
