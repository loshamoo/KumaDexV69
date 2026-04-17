import Head from 'next/head'
import Header from '../src/components/Header'
import BreederPools from '../src/components/BreederPools'
import CoachMarks from '../src/components/CoachMarks'
import styled from 'styled-components'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`

// Coach mark steps for Kuma Breeder staking
const BREEDER_COACH_STEPS = [
  {
    target: '#breeder-stats',
    title: 'Breeder Overview',
    description: 'View the total value locked (TVL) across all pools and your pending dKUMA rewards. Stake your tokens to earn dKUMA rewards over time.',
    placement: 'bottom'
  },
  {
    target: '#breeder-dkuma-logo',
    title: 'Earn dKUMA Rewards',
    description: 'dKUMA is the reward token for staking in Kuma Breeder pools. Use dKUMA for governance voting and exclusive ecosystem benefits.',
    placement: 'right'
  },
  {
    target: '#breeder-sort-section',
    title: 'Sort Pools',
    description: 'Sort pools by APR (Annual Percentage Rate) or TVL (Total Value Locked) to find the best staking opportunities.',
    placement: 'bottom'
  },
  {
    target: '#breeder-first-pool',
    title: 'Select a Pool',
    description: 'Click on any pool card to open the staking modal. Each pool shows the token, current APR, and your staked balance.',
    placement: 'right'
  },
  {
    target: '#breeder-pools-grid',
    title: 'Available Pools',
    description: 'Choose from single-token pools (KUMA, SHIB, etc.) or LP pools (KUMA-ETH, SHIB-ETH) for higher rewards. LP pools require liquidity provider tokens.',
    placement: 'top'
  }
]

export default function Breeder() {
  return (
    <>
      <Head>
        <title>Breeder Pools - KumaDEX</title>
      </Head>
      <AppContainer>
        <Header />
        <MainContent>
          <BreederPools />
        </MainContent>

        <CoachMarks
          id="kuma-breeder"
          welcomeTitle="Welcome to Kuma Breeder"
          welcomeDescription="Learn how to stake your tokens and earn dKUMA rewards. Kuma Breeder lets you farm rewards by depositing tokens or LP positions."
          welcomeLogo="/breederlogos/kuma.png"
          steps={BREEDER_COACH_STEPS}
        />
      </AppContainer>
    </>
  )
}
