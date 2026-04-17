import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useWeb3 } from '../context/Web3Context'
import Header from '../components/Header'
import Head from 'next/head'
import Image from 'next/image'
import { RefreshCw, Lock, Info } from 'react-feather'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`

const LogoContainer = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 133, 2, 0.5);
  box-shadow: 0 0 20px rgba(255, 133, 2, 0.3);
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0;

  span:first-child {
    color: #ff8502;
  }

  span:last-child {
    color: #22c55e;
    font-size: 16px;
    display: block;
    font-weight: 500;
    letter-spacing: 2px;
  }

  @media (max-width: 480px) {
    font-size: 24px;

    span:last-child {
      font-size: 12px;
    }
  }
`

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div`
  background: rgb(26, 26, 26);
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 20px;
  padding: 28px;

  @media (max-width: 480px) {
    padding: 20px;
  }
`

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #ff8502;
  margin: 0 0 24px 0;
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`

const StatRow = styled.div`
  text-align: center;
  margin-bottom: 20px;
`

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 6px;
`

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};

  span {
    color: #ff8502;
  }
`

const TVLBadge = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 30px;
  padding: 10px 24px;
  text-align: center;
  margin: 16px auto 24px;
  display: inline-block;
  width: 100%;

  span:first-child {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  span:last-child {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
  }
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border.primary};
  margin: 20px 0;
`

const ToggleContainer = styled.div`
  display: flex;
  gap: 32px;
  justify-content: center;
  margin-bottom: 20px;
`

const ToggleOption = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: ${({ $active, theme }) => $active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  transition: all 0.2s ease;
`

const RadioButton = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ $active }) => $active ? '#22c55e' : 'rgba(255, 255, 255, 0.3)'};
  background: ${({ $active }) => $active ? '#22c55e' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $active }) => $active ? 'white' : 'transparent'};
  }
`

const InputContainer = styled.div`
  margin-bottom: 16px;
`

const InputLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13px;
  margin-bottom: 8px;
`

const InputWrapper = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 12px;
  overflow: hidden;

  &:focus-within {
    border-color: #ff8502;
  }
`

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`

const MaxButton = styled.button`
  background: #ff8502;
  color: white;
  border: none;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e67502;
  }
`

const FeeNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  background: rgba(255, 133, 2, 0.08);
  border: 1px solid rgba(255, 133, 2, 0.2);
  border-radius: 10px;
  margin-bottom: 20px;

  svg {
    color: #ff8502;
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.5;
  }
`

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  background: ${({ $variant }) =>
    $variant === 'primary'
      ? 'linear-gradient(135deg, #ff8502, #fc72ff)'
      : 'transparent'
  };
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : '#888'};
  border: ${({ $variant }) =>
    $variant === 'primary'
      ? 'none'
      : '1px solid rgba(255, 255, 255, 0.2)'
  };

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ $variant }) =>
      $variant === 'primary'
        ? '0 6px 20px rgba(255, 0, 255, 0.3)'
        : 'none'
    };
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const CountdownContainer = styled.div`
  margin-bottom: 28px;
`

const CountdownLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 12px;
`

const CountdownDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`

const CountdownSegment = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const CountdownNumber = styled.div`
  background: #22c55e;
  color: #0a0a0a;
  font-size: 36px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  min-width: 70px;
  text-align: center;
  font-family: 'Courier New', monospace;

  @media (max-width: 480px) {
    font-size: 28px;
    min-width: 55px;
    padding: 6px 12px;
  }
`

const CountdownUnit = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  margin-top: 6px;
`

const CountdownSeparator = styled.span`
  color: #22c55e;
  font-size: 36px;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const StatBox = styled.div`
  position: relative;
`

const StatBoxLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13px;
  margin-bottom: 12px;
`

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const StatBoxValue = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`

const StatNumber = styled.span`
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 480px) {
    font-size: 26px;
  }
`

const PoolShareContainer = styled.div`
  margin-bottom: 24px;
`

const PoolShareLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13px;
  margin-bottom: 8px;
`

const PoolShareValue = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 480px) {
    font-size: 36px;
  }
`

export default function DKumaBreeder() {
  const { account, isConnected } = useWeb3()
  const [mode, setMode] = useState('stake') // 'stake' or 'unstake'
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Mock data - replace with actual contract calls
  const [breederData, setBreederData] = useState({
    totalStaked: '43168218.4349',
    tvl: '863.36',
    userStaked: '0.00',
    userRewards: '0.00',
    poolShare: '0',
    nextClaimTime: Date.now() + 86400000 // 24 hours from now
  })

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now()
      const diff = Math.max(0, breederData.nextClaimTime - now)

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [breederData.nextClaimTime])

  const formatNumber = (num) => {
    const value = parseFloat(num || 0)
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const padZero = (num) => String(num).padStart(2, '0')

  const handleMaxClick = () => {
    // Set max balance based on mode
    if (mode === 'stake') {
      // Get user's dKUMA balance
      setAmount('0.00') // Replace with actual balance
    } else {
      setAmount(breederData.userStaked)
    }
  }

  const handleStakeUnstake = async () => {
    if (!isConnected || !amount) return
    setLoading(true)
    try {
      if (mode === 'stake') {
        console.log('Staking', amount, 'dKUMA')
      } else {
        console.log('Unstaking', amount, 'dKUMA')
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAmount('')
    } catch (error) {
      console.error('Transaction error:', error)
    }
    setLoading(false)
  }

  const handleClaim = async () => {
    if (!isConnected) return
    setLoading(true)
    try {
      console.log('Claiming rewards')
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Claim error:', error)
    }
    setLoading(false)
  }

  const handleRefresh = useCallback(() => {
    // Refresh user data
    console.log('Refreshing data...')
  }, [])

  return (
    <>
      <Head>
        <title>dKuma Breeder | KumaDEX</title>
        <meta name="description" content="Stake dKUMA tokens to earn rewards" />
      </Head>
      <AppContainer>
        <Header />
        <MainContent>
          <PageHeader>
            <LogoContainer>
              <Image
                src="/breederlogos/dkuma.png"
                alt="dKUMA"
                width={56}
                height={56}
              />
            </LogoContainer>
            <PageTitle>
              <span>dKUMA</span>
              <span>BREEDER</span>
            </PageTitle>
          </PageHeader>

          <ContentGrid>
            {/* Left Card - Staking */}
            <Card>
              <CardTitle>Staking</CardTitle>

              <StatRow>
                <StatLabel>Total staked</StatLabel>
                <StatValue>
                  {formatNumber(breederData.totalStaked)} <span>dKUMA</span>
                </StatValue>
              </StatRow>

              <TVLBadge>
                <span>TVL: </span>
                <span>${formatNumber(breederData.tvl)}</span>
              </TVLBadge>

              <Divider />

              <ToggleContainer>
                <ToggleOption
                  $active={mode === 'stake'}
                  onClick={() => setMode('stake')}
                >
                  <RadioButton $active={mode === 'stake'} />
                  Stake
                </ToggleOption>
                <ToggleOption
                  $active={mode === 'unstake'}
                  onClick={() => setMode('unstake')}
                >
                  <RadioButton $active={mode === 'unstake'} />
                  Unstake
                </ToggleOption>
              </ToggleContainer>

              <InputContainer>
                <InputLabel>Amount</InputLabel>
                <InputWrapper>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!isConnected || loading}
                  />
                  <MaxButton onClick={handleMaxClick} disabled={!isConnected}>
                    MAX
                  </MaxButton>
                </InputWrapper>
              </InputContainer>

              <FeeNotice>
                <Info size={16} />
                <p>
                  Please note that 3% fee is taken when you stake, and 5% fee is taken when you unstake.
                  These fees are further distributed as staking rewards.
                </p>
              </FeeNotice>

              <ActionButton
                $variant={isConnected ? 'primary' : 'secondary'}
                onClick={handleStakeUnstake}
                disabled={!isConnected || !amount || loading}
              >
                <Lock size={16} />
                {loading ? 'Processing...' : mode === 'stake' ? 'STAKE' : 'UNSTAKE'}
              </ActionButton>
            </Card>

            {/* Right Card - Rewards */}
            <Card>
              <CountdownContainer>
                <CountdownLabel>Next claim in</CountdownLabel>
                <CountdownDisplay>
                  <CountdownSegment>
                    <CountdownNumber>{padZero(countdown.days)}</CountdownNumber>
                    <CountdownUnit>days</CountdownUnit>
                  </CountdownSegment>
                  <CountdownSegment>
                    <CountdownNumber>{padZero(countdown.hours)}</CountdownNumber>
                    <CountdownUnit>hours</CountdownUnit>
                  </CountdownSegment>
                  <CountdownSeparator>:</CountdownSeparator>
                  <CountdownSegment>
                    <CountdownNumber>{padZero(countdown.minutes)}</CountdownNumber>
                    <CountdownUnit>min</CountdownUnit>
                  </CountdownSegment>
                  <CountdownSeparator>:</CountdownSeparator>
                  <CountdownSegment>
                    <CountdownNumber>{padZero(countdown.seconds)}</CountdownNumber>
                    <CountdownUnit>sec</CountdownUnit>
                  </CountdownSegment>
                </CountdownDisplay>
              </CountdownContainer>

              <StatsRow>
                <StatBox>
                  <StatBoxLabel>You staked</StatBoxLabel>
                  <StatBoxValue>
                    <StatIcon>
                      <Image
                        src="/breederlogos/dkuma.png"
                        alt="dKUMA"
                        width={48}
                        height={48}
                      />
                    </StatIcon>
                    <StatNumber>{formatNumber(breederData.userStaked)}</StatNumber>
                  </StatBoxValue>
                </StatBox>

                <StatBox>
                  <StatBoxLabel>
                    Your current rewards
                    <RefreshButton onClick={handleRefresh}>
                      <RefreshCw />
                    </RefreshButton>
                  </StatBoxLabel>
                  <StatBoxValue>
                    <StatIcon style={{
                      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '24px', color: 'white', fontWeight: 'bold' }}>$</span>
                    </StatIcon>
                    <StatNumber>{formatNumber(breederData.userRewards)}</StatNumber>
                  </StatBoxValue>
                </StatBox>
              </StatsRow>

              <PoolShareContainer>
                <PoolShareLabel>Your % of the pool</PoolShareLabel>
                <PoolShareValue>{breederData.poolShare}%</PoolShareValue>
              </PoolShareContainer>

              <ActionButton
                $variant={isConnected && parseFloat(breederData.userRewards) > 0 ? 'primary' : 'secondary'}
                onClick={handleClaim}
                disabled={!isConnected || parseFloat(breederData.userRewards) === 0 || loading}
              >
                <Lock size={16} />
                {loading ? 'Processing...' : 'CLAIM'}
              </ActionButton>
            </Card>
          </ContentGrid>
        </MainContent>
      </AppContainer>
    </>
  )
}
