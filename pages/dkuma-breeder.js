import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useWeb3 } from '../src/context/Web3Context'
import useDKumaBreeder from '../src/hooks/useDKumaBreeder'
import Header from '../src/components/Header'
import Head from 'next/head'
import Image from 'next/image'
import { RefreshCw, Lock, Info, CheckCircle, AlertCircle, Loader } from 'react-feather'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`

const LogoContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1f2e;

  img {
    width: 68px;
    height: 68px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-align: center;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 480px) {
    font-size: 22px;
  }
`

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div`
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 28px;
  box-shadow: ${({ theme }) => theme.shadows.large};

  @media (max-width: 480px) {
    padding: 20px;
  }
`

const CardTitle = styled.h2`
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 24px 0;
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const StatRow = styled.div`
  text-align: center;
  margin-bottom: 20px;
`

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 8px;
`

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: white;

  span {
    color: #22c55e;
  }
`

const TVLBadge = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 12px 24px;
  text-align: center;
  margin: 16px auto 24px;
  display: inline-block;
  width: 100%;

  span:first-child {
    color: rgba(255, 255, 255, 0.6);
  }

  span:last-child {
    color: #22c55e;
    font-weight: 600;
  }
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
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
  color: ${({ $active }) => $active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
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
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-bottom: 8px;
`

const InputWrapper = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;

  &:focus-within {
    border-color: #22c55e;
  }
`

const Input = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px 16px;
  color: white;
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`

const MaxButton = styled.button`
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);

  span:last-child {
    color: white;
    font-weight: 500;
  }
`

const FeeNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 20px;

  svg {
    color: #22c55e;
    flex-shrink: 0;
    margin-top: 2px;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }
`

const ActionButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;

  background: ${({ $variant }) =>
    $variant === 'primary'
      ? '#4d2a52'
      : 'transparent'
  };
  color: ${({ $variant }) => $variant === 'primary' ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  border: ${({ $variant }) =>
    $variant === 'primary'
      ? 'none'
      : '2px solid rgba(255, 255, 255, 0.2)'
  };

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: ${({ $variant }) =>
      $variant === 'primary'
        ? '#3f2153'
        : 'rgba(77, 42, 82, 0.1)'
    };
    box-shadow: ${({ $variant }) =>
      $variant === 'primary'
        ? '0 4px 20px rgba(77, 42, 82, 0.4)'
        : 'none'
    };
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const ApproveButton = styled(ActionButton)`
  background: #4d2a52;
  margin-bottom: 12px;

  &:hover:not(:disabled) {
    background: #3f2153;
    box-shadow: 0 4px 20px rgba(77, 42, 82, 0.4);
  }
`

const CountdownContainer = styled.div`
  margin-bottom: 28px;
`

const CountdownLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
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
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  font-size: 32px;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 10px;
  min-width: 65px;
  text-align: center;
  font-family: 'Courier New', monospace;

  @media (max-width: 480px) {
    font-size: 24px;
    min-width: 50px;
    padding: 8px 12px;
  }
`

const CountdownUnit = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const CountdownSeparator = styled.span`
  color: #22c55e;
  font-size: 32px;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 24px;
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
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
`

const StatBoxLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: #22c55e;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  &.spinning svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const StatBoxValue = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const StatIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.1);

  img {
    width: 36px;
    height: 36px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const StatNumber = styled.span`
  font-size: 26px;
  font-weight: 600;
  color: white;

  @media (max-width: 480px) {
    font-size: 22px;
  }
`

const PoolShareContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`

const PoolShareLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const PoolShareValue = styled.div`
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 480px) {
    font-size: 32px;
  }
`

const NotificationContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Notification = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${({ $type }) =>
    $type === 'success' ? 'rgba(34, 197, 94, 0.1)' :
    $type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(59, 130, 246, 0.1)'
  };
  border: 1px solid ${({ $type }) =>
    $type === 'success' ? '#22c55e' :
    $type === 'error' ? '#ef4444' :
    '#3b82f6'
  };
  border-radius: 12px;
  color: white;
  font-size: 14px;
  animation: slideIn 0.3s ease;

  svg {
    flex-shrink: 0;
    color: ${({ $type }) =>
      $type === 'success' ? '#22c55e' :
      $type === 'error' ? '#ef4444' :
      '#3b82f6'
    };
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  svg {
    animation: spin 1s linear infinite;
  }
`

const ContractLink = styled.a`
  display: block;
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;

  &:hover {
    color: #22c55e;
  }
`

export default function DKumaBreeder() {
  const { isConnected } = useWeb3()
  const {
    breederData,
    loading,
    txPending,
    stake,
    unstake,
    claim,
    approve,
    refreshData,
    needsApproval,
    breederAddress
  } = useDKumaBreeder()

  const [mode, setMode] = useState('stake')
  const [amount, setAmount] = useState('')
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [notifications, setNotifications] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000)
      const diff = Math.max(0, breederData.poolEndTime - now)

      const days = Math.floor(diff / (60 * 60 * 24))
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60))
      const minutes = Math.floor((diff % (60 * 60)) / 60)
      const seconds = diff % 60

      setCountdown({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [breederData.poolEndTime])

  const formatNumber = (num, decimals = 2) => {
    const value = parseFloat(num || 0)
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M'
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K'
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  const padZero = (num) => String(num).padStart(2, '0')

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const handleMaxClick = () => {
    if (mode === 'stake') {
      setAmount(breederData.userDkumaBalance)
    } else {
      setAmount(breederData.userStaked)
    }
  }

  const handleApprove = async () => {
    if (!isConnected || !amount) return
    try {
      addNotification('Approving dKUMA...', 'info')
      await approve(amount)
      addNotification('dKUMA approved successfully!', 'success')
    } catch (err) {
      addNotification(err.message || 'Approval failed', 'error')
    }
  }

  const handleStakeUnstake = async () => {
    if (!isConnected || !amount || parseFloat(amount) <= 0) return

    try {
      if (mode === 'stake') {
        addNotification('Staking dKUMA...', 'info')
        await stake(amount)
        addNotification('Successfully staked dKUMA!', 'success')
      } else {
        addNotification('Unstaking dKUMA...', 'info')
        await unstake(amount)
        addNotification('Successfully unstaked dKUMA!', 'success')
      }
      setAmount('')
    } catch (err) {
      addNotification(err.message || 'Transaction failed', 'error')
    }
  }

  const handleClaim = async () => {
    if (!isConnected) return
    try {
      addNotification('Claiming rewards...', 'info')
      await claim()
      addNotification('Rewards claimed successfully!', 'success')
    } catch (err) {
      addNotification(err.message || 'Claim failed', 'error')
    }
  }

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refreshData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [refreshData])

  const showApproveButton = mode === 'stake' && amount && parseFloat(amount) > 0 && needsApproval(amount)

  return (
    <>
      <Head>
        <title>dKuma Breeder | KumaDEX</title>
        <meta name="description" content="Stake dKUMA tokens to earn USDC rewards" />
      </Head>
      <AppContainer>
        <Header />
        <MainContent>
          <PageHeader>
            <LogoContainer>
              <Image
                src="/breederlogos/dkuma.png"
                alt="dKUMA"
                width={72}
                height={72}
              />
            </LogoContainer>
            <PageTitle>Staking</PageTitle>
          </PageHeader>

          <ContentGrid>
            {/* Left Card - Staking */}
            <Card>
              <StatRow>
                <StatLabel>APY</StatLabel>
                <StatValue style={{ fontSize: '32px' }}>
                  <span>{loading ? '...' : `${breederData.apy}%`}</span>
                </StatValue>
              </StatRow>

              <StatRow>
                <StatLabel>Total staked</StatLabel>
                <StatValue>
                  {loading ? '...' : formatNumber(breederData.totalStaked, 4)} <span>dKUMA</span>
                </StatValue>
              </StatRow>

              <TVLBadge>
                <span>TVL: </span>
                <span>${loading ? '...' : formatNumber(breederData.tvl)}</span>
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

              <BalanceRow>
                <span>{mode === 'stake' ? 'Wallet Balance:' : 'Staked Balance:'}</span>
                <span>
                  {mode === 'stake'
                    ? formatNumber(breederData.userDkumaBalance, 4)
                    : formatNumber(breederData.userStaked, 4)
                  } dKUMA
                </span>
              </BalanceRow>

              <InputContainer>
                <InputLabel>Amount</InputLabel>
                <InputWrapper>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!isConnected || txPending}
                  />
                  <MaxButton onClick={handleMaxClick} disabled={!isConnected || txPending}>
                    MAX
                  </MaxButton>
                </InputWrapper>
              </InputContainer>

              <FeeNotice>
                <Info size={16} />
                <p>
                  Please note that {breederData.stakingFees}% fee is taken when you stake, and {breederData.unstakingFees}% fee is taken when you unstake.
                  These fees are further distributed as staking rewards.
                </p>
              </FeeNotice>

              {showApproveButton && (
                <ApproveButton
                  $variant="primary"
                  onClick={handleApprove}
                  disabled={!isConnected || txPending}
                >
                  {txPending ? (
                    <LoadingOverlay>
                      <Loader size={16} />
                      Approving...
                    </LoadingOverlay>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      APPROVE dKUMA
                    </>
                  )}
                </ApproveButton>
              )}

              <ActionButton
                $variant={isConnected && amount && parseFloat(amount) > 0 && !showApproveButton ? 'primary' : 'secondary'}
                onClick={handleStakeUnstake}
                disabled={!isConnected || !amount || parseFloat(amount) <= 0 || txPending || showApproveButton}
              >
                {txPending ? (
                  <LoadingOverlay>
                    <Loader size={16} />
                    Processing...
                  </LoadingOverlay>
                ) : (
                  <>
                    <Lock size={16} />
                    {mode === 'stake' ? 'STAKE' : 'UNSTAKE'}
                  </>
                )}
              </ActionButton>

              <ContractLink
                href={`https://etherscan.io/address/${breederAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Contract on Etherscan
              </ContractLink>
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
                        width={40}
                        height={40}
                      />
                    </StatIcon>
                    <StatNumber>{formatNumber(breederData.userStaked, 2)}</StatNumber>
                  </StatBoxValue>
                </StatBox>

                <StatBox>
                  <StatBoxLabel>
                    Your current rewards
                    <RefreshButton
                      onClick={handleRefresh}
                      className={isRefreshing ? 'spinning' : ''}
                    >
                      <RefreshCw />
                    </RefreshButton>
                  </StatBoxLabel>
                  <StatBoxValue>
                    <StatIcon>
                      <Image
                        src="/breederlogos/usdc.png"
                        alt="USDC"
                        width={40}
                        height={40}
                      />
                    </StatIcon>
                    <StatNumber>{formatNumber(breederData.userRewards, 2)}</StatNumber>
                  </StatBoxValue>
                </StatBox>
              </StatsRow>

              <PoolShareContainer>
                <PoolShareLabel>Your % of the pool</PoolShareLabel>
                <PoolShareValue>{breederData.poolShare || '0'}%</PoolShareValue>
              </PoolShareContainer>

              <StatsRow style={{ marginBottom: 0 }}>
                <StatBox>
                  <StatBoxLabel>Total Rewards Paid</StatBoxLabel>
                  <StatBoxValue>
                    <StatIcon>
                      <Image
                        src="/breederlogos/usdc.png"
                        alt="USDC"
                        width={40}
                        height={40}
                      />
                    </StatIcon>
                    <StatNumber style={{ fontSize: '18px' }}>{formatNumber(breederData.totalRewardsPaid, 2)}</StatNumber>
                  </StatBoxValue>
                </StatBox>

                <StatBox>
                  <StatBoxLabel>Reward Balance</StatBoxLabel>
                  <StatBoxValue>
                    <StatIcon>
                      <Image
                        src="/breederlogos/usdc.png"
                        alt="USDC"
                        width={40}
                        height={40}
                      />
                    </StatIcon>
                    <StatNumber style={{ fontSize: '18px' }}>{formatNumber(breederData.rewardBalance, 2)}</StatNumber>
                  </StatBoxValue>
                </StatBox>
              </StatsRow>

              <ActionButton
                $variant={isConnected && parseFloat(breederData.userRewards) > 0 ? 'primary' : 'secondary'}
                onClick={handleClaim}
                disabled={!isConnected || parseFloat(breederData.userRewards) === 0 || txPending}
              >
                {txPending ? (
                  <LoadingOverlay>
                    <Loader size={16} />
                    Claiming...
                  </LoadingOverlay>
                ) : (
                  <>
                    <Lock size={16} />
                    CLAIM
                  </>
                )}
              </ActionButton>
            </Card>
          </ContentGrid>
        </MainContent>

        {/* Notifications */}
        <NotificationContainer>
          {notifications.map(notification => (
            <Notification key={notification.id} $type={notification.type}>
              {notification.type === 'success' && <CheckCircle size={18} />}
              {notification.type === 'error' && <AlertCircle size={18} />}
              {notification.type === 'info' && <Loader size={18} />}
              {notification.message}
            </Notification>
          ))}
        </NotificationContainer>
      </AppContainer>
    </>
  )
}
