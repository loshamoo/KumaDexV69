import Header from '../src/components/Header'
import DAOInterface from '../src/components/DAOInterface'
import CoachMarks from '../src/components/CoachMarks'
import styled from 'styled-components'
import Image from 'next/image'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 80px;

  @media (max-width: 768px) {
    padding: 30px 16px 40px;
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`

const BrandLogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
`

const BrandLogoIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`

const BrandLogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const BrandLogoMain = styled.span`
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(135deg, #f7931a, #c77b15, #e8a847);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
`

const BrandLogoSub = styled.span`
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #00d4aa, #00b894);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  padding-top: 2px;
  border-top: 2px solid #00d4aa;
  display: inline-block;
`

// Coach mark steps for DAO voting (Yam Finance style)
const DAO_COACH_STEPS = [
  {
    target: '#dao-delegate-card',
    title: 'Become a Delegate',
    description: 'To participate in governance, you first need to become a delegate. This enables your dKUMA tokens to be used for voting on proposals.',
    placement: 'right'
  },
  {
    target: '#dao-voting-power',
    title: 'Your Voting Power',
    description: 'Your voting power is determined by your dKUMA balance. The more dKUMA you hold, the more weight your vote carries in governance decisions.',
    placement: 'bottom'
  },
  {
    target: '#dao-delegate-button',
    title: 'Activate Delegation',
    description: 'Click this button to delegate voting power to yourself. This is required before you can vote on any proposals. You only need to do this once.',
    placement: 'top'
  },
  {
    target: '#dao-proposal-card',
    title: 'Active Proposals',
    description: 'Once you are a delegate, you can view and vote on active governance proposals here. Each proposal affects the future direction of KumaDEX.',
    placement: 'left'
  },
  {
    target: '#dao-proposal-dropdown',
    title: 'Select a Proposal',
    description: 'Choose from the list of active proposals. Review each proposal carefully before casting your vote.',
    placement: 'bottom'
  },
  {
    target: '#dao-sign-paw',
    title: 'Sign Your Paw',
    description: 'Before voting, you must check this box to confirm you have read and understood the proposal. This is your digital signature.',
    placement: 'bottom'
  },
  {
    target: '#dao-vote-buttons',
    title: 'Cast Your Vote',
    description: 'Vote FOR to support the proposal or AGAINST to oppose it. Your vote is weighted by your dKUMA balance and is recorded on-chain.',
    placement: 'top'
  }
]

export default function DAO() {
  return (
    <AppContainer>
      <Header />
      <MainContent>
        <BrandLogoContainer>
          <BrandLogoIcon>
            <Image
              src="/breederlogos/kuma.png"
              alt="KUMA"
              width={56}
              height={56}
              style={{ borderRadius: '50%' }}
            />
          </BrandLogoIcon>
          <BrandLogoText>
            <BrandLogoMain>KUMA</BrandLogoMain>
            <BrandLogoSub>DAO</BrandLogoSub>
          </BrandLogoText>
        </BrandLogoContainer>

        <DAOInterface />
      </MainContent>

      <CoachMarks
        id="dao-voting"
        welcomeTitle="Welcome to KumaDEX Governance"
        welcomeDescription="Learn how to participate in DAO governance using your dKUMA tokens. Vote on proposals that shape the future of KumaDEX, just like Yam Finance!"
        welcomeLogo="/breederlogos/dkuma.png"
        steps={DAO_COACH_STEPS}
      />
    </AppContainer>
  )
}
