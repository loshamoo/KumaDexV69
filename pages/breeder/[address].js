import Head from 'next/head'
import Header from '../../src/components/Header'
import styled from 'styled-components'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { Copy, Check, ArrowLeft } from 'react-feather'
import { useWeb3 } from '../../src/context/Web3Context'
import useBreederContractWeb3 from '../../src/hooks/useBreederContractWeb3'
import { ERC20_ABI } from '../../src/contracts/KumaBreederABI'
import TransactionNotification from '../../src/components/TransactionNotification'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #ff8502;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  align-self: flex-start;
  margin-bottom: 24px;

  &:hover {
    background: rgba(255, 133, 2, 0.1);
  }
`

const PoolPageContainer = styled.div`
  background: linear-gradient(135deg, rgba(20, 24, 35, 0.98) 0%, rgba(20, 24, 35, 0.95) 100%);
  border: 2px solid rgba(255, 0, 255, 0.4);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);

  @media (max-width: 768px) {
    padding: 24px;
  }
`

const PoolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const PoolTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  font-size: 28px;
  font-weight: bold;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`

const PoolLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 0, 255, 0.4);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
  flex-shrink: 0;
`

const ContractAddressSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`

const ContractAddressLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
`

const ContractAddressText = styled.a`
  font-family: 'Courier New', monospace;
  color: #ff8502;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

const CopyAddressButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$copied ?
    'linear-gradient(135deg, #22c55e, #16a34a)' :
    'linear-gradient(135deg, #ff8502, #fc72ff)'
  };
  border: none;
  border-radius: 8px;
  color: white;
  padding: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 32px;
  min-height: 32px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px ${props => props.$copied ?
      'rgba(34, 197, 94, 0.4)' :
      'rgba(255, 0, 255, 0.4)'
    };
  }

  svg {
    width: 14px;
    height: 14px;
  }
`

const PoolInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`

const PoolInfoCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
`

const PoolInfoLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-bottom: 8px;
`

const PoolInfoValue = styled.div`
  color: white;
  font-size: 20px;
  font-weight: bold;
`

const ToggleSwitch = styled.div`
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
`

const ToggleOption = styled.button`
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #ff8502, #fc72ff)' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: white;
    ${props => !props.$active && 'background: rgba(255, 255, 255, 0.05);'}
  }
`

const InputSection = styled.div`
  margin: 20px 0;
`

const InputLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BalanceText = styled.span`
  color: #ff8502;
  font-size: 12px;
`

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`

const StyledInput = styled.input`
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px 16px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #ff8502;
    background: rgba(0, 0, 0, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`

const MaxButton = styled.button`
  background: linear-gradient(135deg, #ff8502, #fc72ff);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 0, 255, 0.4);
  }
`

const PoolActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`

const ActionButton = styled.button`
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &.primary {
    background: linear-gradient(135deg, #ff8502, #fc72ff);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(255, 0, 255, 0.4);
    }
  }

  &.secondary {
    background: transparent;
    color: #ff8502;
    border: 2px solid #ff8502;

    &:hover {
      background: rgba(255, 0, 255, 0.1);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #ff8502;
  font-size: 1.2rem;
  gap: 16px;
`

// Token logo mapping
const TOKEN_LOGOS = {
  'KUMA': '/breederlogos/kuma.png',
  'ETH': '/breederlogos/eth.png',
  'SHIB': '/breederlogos/shib.png',
  'LEASH': '/breederlogos/leash.png',
  'AKITA': '/breederlogos/akita.png',
  'ELON': '/breederlogos/elon.png',
  'DKUMA': '/breederlogos/dkuma.png',
  'WETH': '/breederlogos/eth.png',
}

const getTokenLogo = (tokenSymbol) => {
  if (!tokenSymbol) return TOKEN_LOGOS['KUMA']
  const cleanSymbol = tokenSymbol.toUpperCase()
    .replace(/-LP.*/, '')
    .replace(/LP.*/, '')
    .replace(/-ETH.*/, '')
    .trim()
  return TOKEN_LOGOS[cleanSymbol] || TOKEN_LOGOS['KUMA']
}

const getTokenNames = (symbol) => {
  const cleanSymbol = symbol?.replace(/-LP.*/, '').replace(/LP.*/, '') || 'LP-TOKEN'
  const tokens = cleanSymbol.split('-')
  return tokens.length >= 2 ? tokens : [cleanSymbol, 'TOKEN']
}

export default function PoolPage() {
  const router = useRouter()
  const { address } = router.query
  const { isConnected, account, web3 } = useWeb3()
  const {
    pools,
    loading,
    txPending,
    deposit,
    withdraw,
    claimRewards,
    refetch
  } = useBreederContractWeb3()

  const [notification, setNotification] = useState(null)
  const [inputAmount, setInputAmount] = useState('')
  const [inputMode, setInputMode] = useState('stake')
  const [userLPBalance, setUserLPBalance] = useState('0')
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Find pool by lpToken address
  const pool = useMemo(() => {
    if (!address || !pools.length) return null
    return pools.find(p => p.lpToken?.toLowerCase() === address.toLowerCase())
  }, [address, pools])

  // Fetch user's LP token balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!isConnected || !account || !web3 || !pool?.lpToken) {
        setUserLPBalance('0')
        return
      }

      try {
        const lpContract = new web3.eth.Contract(ERC20_ABI, pool.lpToken)
        const balance = await lpContract.methods.balanceOf(account).call()
        setUserLPBalance(web3.utils.fromWei(balance, 'ether'))
      } catch (error) {
        console.warn('Error fetching LP balance:', error.message)
        setUserLPBalance('0')
      }
    }

    fetchBalance()
  }, [isConnected, account, web3, pool])

  // Auto-hide notifications
  useEffect(() => {
    if (notification && notification.type !== 'pending') {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const formatNumber = (num) => {
    const value = parseFloat(num || 0)
    if (value < 0.01 && value > 0) return '<0.01'
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
    return value.toFixed(2)
  }

  const formatNumberWithCommas = (num) => {
    const value = parseFloat(num || 0)
    const parts = value.toFixed(4).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }

  const formatAPR = (num) => {
    const value = parseFloat(num || 0)
    if (value < 0.01 && value > 0) return '<0.01'
    const parts = value.toFixed(2).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }

  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyContractAddress = async () => {
    if (!pool?.lpToken) return
    try {
      await navigator.clipboard.writeText(pool.lpToken)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const handleStakeUnstake = async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount' })
      return
    }

    try {
      const action = inputMode === 'stake' ? 'Staking' : 'Unstaking'
      setNotification({ type: 'pending', message: `${action}...` })

      let receipt
      if (inputMode === 'stake') {
        receipt = await deposit(pool.pid, inputAmount)
      } else {
        receipt = await withdraw(pool.pid, inputAmount)
      }

      setNotification({
        type: 'success',
        message: `${action.replace('ing', '')} successful!`,
        txHash: receipt?.transactionHash
      })

      setInputAmount('')
      setTimeout(() => refetch(), 2000)
    } catch (error) {
      console.error('Transaction failed:', error)
      setNotification({
        type: 'error',
        message: `Transaction failed: ${error.message}`
      })
    }
  }

  const handleClaim = async () => {
    try {
      setNotification({ type: 'pending', message: 'Claiming rewards...' })
      const receipt = await claimRewards(pool.pid)
      setNotification({
        type: 'success',
        message: 'Rewards claimed successfully!',
        txHash: receipt?.transactionHash
      })
      setTimeout(() => refetch(), 2000)
    } catch (error) {
      console.error('Claim failed:', error)
      setNotification({
        type: 'error',
        message: `Claim failed: ${error.message}`
      })
    }
  }

  const poolShare = pool && parseFloat(pool.userDeposit) > 0 && parseFloat(pool.tvl) > 0
    ? ((parseFloat(pool.userDeposit) / parseFloat(pool.tvl)) * 100).toFixed(2)
    : '0.00'

  if (loading && !pool) {
    return (
      <>
        <Head>
          <title>Loading Pool - KumaDEX</title>
        </Head>
        <AppContainer>
          <Header />
          <MainContent>
            <LoadingContainer>
              <div>Loading pool data...</div>
            </LoadingContainer>
          </MainContent>
        </AppContainer>
      </>
    )
  }

  if (!loading && !pool) {
    return (
      <>
        <Head>
          <title>Pool Not Found - KumaDEX</title>
        </Head>
        <AppContainer>
          <Header />
          <MainContent>
            <BackButton onClick={() => router.push('/breeder')}>
              <ArrowLeft size={18} />
              Back to Pools
            </BackButton>
            <LoadingContainer>
              <div>Pool Not Found</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                No pool found with address: {address}
              </div>
            </LoadingContainer>
          </MainContent>
        </AppContainer>
      </>
    )
  }

  const [token1] = getTokenNames(pool.symbol)
  const logo = getTokenLogo(token1)

  return (
    <>
      <Head>
        <title>{pool.symbol} Pool - KumaDEX</title>
      </Head>
      <AppContainer>
        <Header />
        <MainContent>
          <BackButton onClick={() => router.push('/breeder')}>
            <ArrowLeft size={18} />
            Back to Pools
          </BackButton>

          <PoolPageContainer>
            <PoolHeader>
              <PoolTitle>
                <PoolLogo>
                  {logo ? (
                    <Image
                      src={logo}
                      alt={token1}
                      width={60}
                      height={60}
                      style={{ borderRadius: '50%' }}
                    />
                  ) : (
                    <div style={{
                      background: 'linear-gradient(135deg, #ff8502, #fc72ff)',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '20px'
                    }}>
                      {token1?.slice(0, 3)}
                    </div>
                  )}
                </PoolLogo>
                {pool.symbol} Pool
              </PoolTitle>

              {pool.lpToken && (
                <ContractAddressSection>
                  <ContractAddressLabel>Contract:</ContractAddressLabel>
                  <ContractAddressText
                    href={`https://etherscan.io/address/${pool.lpToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {truncateAddress(pool.lpToken)}
                  </ContractAddressText>
                  <CopyAddressButton
                    $copied={copiedAddress}
                    onClick={copyContractAddress}
                    title="Copy contract address"
                  >
                    {copiedAddress ? <Check /> : <Copy />}
                  </CopyAddressButton>
                </ContractAddressSection>
              )}
            </PoolHeader>

            <PoolInfo>
              <PoolInfoCard>
                <PoolInfoLabel>APR</PoolInfoLabel>
                <PoolInfoValue style={{ color: '#ff8502' }}>
                  {formatAPR(pool.apr)}%
                </PoolInfoValue>
              </PoolInfoCard>

              <PoolInfoCard>
                <PoolInfoLabel>Total Value Locked</PoolInfoLabel>
                <PoolInfoValue>
                  ${formatNumber(pool.tvl)}
                </PoolInfoValue>
              </PoolInfoCard>

              <PoolInfoCard>
                <PoolInfoLabel>Your Deposit</PoolInfoLabel>
                <PoolInfoValue>
                  {formatNumberWithCommas(pool.userDeposit || 0)} LP
                </PoolInfoValue>
              </PoolInfoCard>

              <PoolInfoCard>
                <PoolInfoLabel>Pending Rewards</PoolInfoLabel>
                <PoolInfoValue>
                  {formatNumberWithCommas(pool.pendingReward || 0)} dKUMA
                </PoolInfoValue>
              </PoolInfoCard>

              <PoolInfoCard>
                <PoolInfoLabel>Pool Share</PoolInfoLabel>
                <PoolInfoValue>
                  {poolShare}%
                </PoolInfoValue>
              </PoolInfoCard>

              <PoolInfoCard>
                <PoolInfoLabel>Allocation Points</PoolInfoLabel>
                <PoolInfoValue>
                  {pool.allocPoint}
                </PoolInfoValue>
              </PoolInfoCard>
            </PoolInfo>

            <ToggleSwitch>
              <ToggleOption
                $active={inputMode === 'stake'}
                onClick={() => setInputMode('stake')}
              >
                Stake
              </ToggleOption>
              <ToggleOption
                $active={inputMode === 'unstake'}
                onClick={() => setInputMode('unstake')}
              >
                Unstake
              </ToggleOption>
            </ToggleSwitch>

            <InputSection>
              <InputLabel>
                <span>{inputMode === 'stake' ? 'Amount to Stake' : 'Amount to Unstake'}</span>
                <BalanceText>
                  Balance: {inputMode === 'stake' ?
                    formatNumberWithCommas(userLPBalance) :
                    formatNumberWithCommas(pool.userDeposit || 0)
                  } {pool.symbol}
                </BalanceText>
              </InputLabel>
              <InputWrapper>
                <StyledInput
                  type="number"
                  placeholder="0.0"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <MaxButton
                  onClick={() => {
                    const maxAmount = inputMode === 'stake' ?
                      userLPBalance :
                      (pool.userDeposit || '0')
                    setInputAmount(maxAmount)
                  }}
                >
                  MAX
                </MaxButton>
              </InputWrapper>
            </InputSection>

            <PoolActions>
              <ActionButton
                className="primary"
                onClick={handleStakeUnstake}
                disabled={!isConnected || !inputAmount || parseFloat(inputAmount) <= 0 || txPending}
              >
                {inputMode === 'stake' ? 'Stake' : 'Unstake'}
              </ActionButton>
              <ActionButton
                className="secondary"
                onClick={handleClaim}
                disabled={!isConnected || parseFloat(pool.pendingReward) === 0 || txPending}
              >
                Claim Rewards
              </ActionButton>
            </PoolActions>
          </PoolPageContainer>
        </MainContent>
      </AppContainer>

      <TransactionNotification notification={notification} />
    </>
  )
}
