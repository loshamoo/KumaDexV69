import styled from 'styled-components'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useWeb3 } from '../context/Web3Context'
import useBreederContractWeb3 from '../hooks/useBreederContractWeb3'
import { KUMABREEDER_ADDRESS } from '../contracts/KumaBreederABI'
import TransactionNotification from './TransactionNotification'

const Container = styled.div`
  width: 100%;
  max-width: 1600px;
  padding: 0 20px;
  margin: 0 auto;
  border-radius: 25px;
`

const PoolsGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const PoolCard = styled.div`
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 240px;
  box-shadow: ${({ theme }) => theme.shadows.large};

  &:hover {
    border-color: rgba(255, 133, 2, 0.5);
    transform: translateY(-2px);
  }
`

const PoolTopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: calc(100% - 32px);
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 2;
`

const TokenNameSection = styled.div`
  flex-shrink: 0;
  max-width: 50%;
`

const APRSection = styled.div`
  flex-shrink: 0;
  max-width: 100px;
  overflow: hidden;
`

const PoolContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 70px 20px 20px 20px;
  position: relative;
`

const PoolTokenLogoWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
`

const PoolTokenLogo = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);

  img {
    width: 100px;
    height: 100px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const EthBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: #1a1f2e;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
`

const PoolTokenName = styled.h3`
  font-family: 'TargetAcad', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 1.2px;
  text-transform: uppercase;
`


const PoolAPR = styled.div`
  font-size: 12px;
  font-weight: bold;
  background: linear-gradient(135deg, #ff8502, #fc72ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: ${({ theme }) => theme.colors.background.module};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
  text-align: center;
  line-height: 1.2;
`

const PoolActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  width: 100%;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`






const ActionButton = styled.button`
  flex: 1;
  padding: 10px 8px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &.primary {
    background: #4d2a52;
    color: white;

    &:hover {
      background: #3f2153;
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(77, 42, 82, 0.4);
    }
  }

  &.secondary {
    background: transparent;
    color: #4d2a52;
    border: 2px solid #4d2a52;

    &:hover {
      background: rgba(77, 42, 82, 0.1);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`

const DKumaLogo = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  flex-shrink: 0;
`

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #1a1f2e;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  border: 1px solid rgba(255, 255, 255, 0.1);
  gap: 24px;
  width: 50%;
  box-shadow: ${({ theme }) => theme.shadows.large};

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    gap: 16px;
  }
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`

const StatValue = styled.div`
  color: #ff8502;
  font-size: 1.5rem;
  font-weight: bold;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #ff8502;
  font-size: 1.2rem;
`

const SkeletonCard = styled.div`
  background: #1a1f2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 20px;
  min-height: 240px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`

const SkeletonElement = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  height: ${props => props.height || '20px'};
  width: ${props => props.width || '100%'};
  margin: ${props => props.margin || '8px 0'};
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background.charcoal};
  border: 2px solid #ff8502;
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
`

const ModalTitle = styled.h3`
  color: #ff8502;
  margin-bottom: 24px;
  text-align: center;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: #ff8502;
  }
`

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
`

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`

const FilterSection = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`

const FilterLabel = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-right: 8px;
`

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${props => props.active ? '#4d2a52' : '#1a1f2e'};
  color: ${props => props.active ? 'white' : '#4d2a52'};

  &:hover {
    border-color: rgba(77, 42, 82, 0.5);
    background: ${props => props.active ? '#3f2153' : 'rgba(77, 42, 82, 0.1)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

// Token logo mapping (all keys uppercase for consistent lookup)
const TOKEN_LOGOS = {
  'KUMA': '/breederlogos/kuma.png',
  'ETH': '/breederlogos/eth.png',
  'SHIB': '/breederlogos/shib.png',
  'LEASH': '/breederlogos/leash.png',
  'AKITA': '/breederlogos/akita.png',
  'ELON': '/breederlogos/elon.png',
  'DKUMA': '/breederlogos/dkuma.png',
  'WETH': '/breederlogos/eth.png',
  'USDC': '/breederlogos/usdc.png',
  'USDT': '/breederlogos/usdc.png', // Use USDC logo as fallback
  'WBTC': '/breederlogos/eth.png', // Use ETH logo as fallback for WBTC
  'TOKEN': '/breederlogos/kuma.png', // Default fallback
};

// Token contract address mapping
const TOKEN_ADDRESSES = {
  'KUMA': '0x48C276e8d03813224bb1e55F953adB6d02FD3E02',
  'SHIB': '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  'LEASH': '0x27C70Cd1946795B66be9d954418546998b546634',
  'AKITA': '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6',
  'ELON': '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3',
  'DKUMA': '0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8',
  'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'USDC': '0xA0b86a33E6Fd8481e5f94a8a6c1B5b1e1d2e78D8',
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
};

const getTokenLogo = (tokenSymbol) => {
  if (!tokenSymbol) return TOKEN_LOGOS['KUMA']; // Default fallback
  // Clean the symbol and normalize to uppercase
  const cleanSymbol = tokenSymbol.toUpperCase()
    .replace(/-LP.*/, '')
    .replace(/LP.*/, '')
    .replace(/-ETH.*/, '')
    .trim();
  return TOKEN_LOGOS[cleanSymbol] || TOKEN_LOGOS['KUMA']; // Use KUMA as fallback
};

const getTokenAddress = (tokenSymbol) => {
  // Remove any suffix like -LP and convert to uppercase
  const cleanSymbol = tokenSymbol?.toUpperCase().replace(/-LP.*/, '').replace(/LP.*/, '');
  return TOKEN_ADDRESSES[cleanSymbol] || null;
};

export default function BreederPools() {
  const router = useRouter()
  const { isConnected, chainId, account, web3 } = useWeb3()
  const {
    pools,
    loading,
    txPending,
    error,
    deposit,
    withdraw,
    claimRewards,
    emergencyWithdraw,
    refetch,
    networkConfig,
    prices
  } = useBreederContractWeb3()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedPool, setSelectedPool] = useState(null)
  const [amount, setAmount] = useState('')
  const [notification, setNotification] = useState(null)
  const [sortType, setSortType] = useState('apr')
  const [sortDirection, setSortDirection] = useState('desc')

  const openModal = (type, pool) => {
    setModalType(type)
    setSelectedPool(pool)
    setModalOpen(true)
    setAmount('')
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalType('')
    setSelectedPool(null)
    setAmount('')
  }

  const openPoolModal = (pool) => {
    // Navigate to the pool detail page
    if (pool && pool.lpToken) {
      router.push(`/breeder/${pool.lpToken}`)
    }
  }

  const handleAction = async () => {
    if (!selectedPool || !amount) return

    try {
      setNotification({ type: 'pending', message: `Processing ${modalType}...` })
      
      let receipt;
      if (modalType === 'deposit') {
        receipt = await deposit(selectedPool.pid, amount)
      } else if (modalType === 'withdraw') {
        receipt = await withdraw(selectedPool.pid, amount)
      }
      
      setNotification({ 
        type: 'success', 
        message: `${modalType} successful!`,
        txHash: receipt?.transactionHash 
      })
      
      closeModal()
      setTimeout(() => refetch(), 2000) // Refresh pools after 2 seconds
      
    } catch (error) {
      console.error(`${modalType} failed:`, error)
      setNotification({ 
        type: 'error', 
        message: `${modalType} failed: ${error.message}` 
      })
    }
  }

  const handleClaim = async (pool) => {
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
  
  const handleEmergencyWithdraw = async (pool) => {
    if (!window.confirm('Emergency withdraw will forfeit all pending rewards. Continue?')) return;
    
    try {
      setNotification({ type: 'pending', message: 'Emergency withdrawing...' })
      const receipt = await emergencyWithdraw(pool.pid)
      setNotification({ 
        type: 'success', 
        message: 'Emergency withdraw successful!',
        txHash: receipt?.transactionHash 
      })
      setTimeout(() => refetch(), 2000)
    } catch (error) {
      console.error('Emergency withdraw failed:', error)
      setNotification({ 
        type: 'error', 
        message: `Emergency withdraw failed: ${error.message}` 
      })
    }
  }

  const getTokenNames = (symbol) => {
    // Handle various formats: KUMA-ETH, KUMA-ETH-LP, etc.
    const cleanSymbol = symbol?.replace(/-LP.*/, '').replace(/LP.*/, '') || 'LP-TOKEN'
    const tokens = cleanSymbol.split('-')
    return tokens.length >= 2 ? tokens : [cleanSymbol, 'TOKEN']
  }

  const formatNumber = useMemo(() => {
    return (num) => {
      const value = parseFloat(num || 0)
      // Prevent displaying tiny fluctuations
      if (value < 0.01 && value > 0) return '<0.01'
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}M`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}K`
      }
      return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  }, [])
  
  // Format APR with commas (keeps 2 decimal places)
  const formatAPR = useMemo(() => {
    return (num) => {
      const value = parseFloat(num || 0)
      if (value < 0.01 && value > 0) return '<0.01'
      const parts = value.toFixed(2).split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return parts.join('.')
    }
  }, [])

  // Memoized sorted pools to prevent unnecessary re-calculations
  const sortedPools = useMemo(() => {
    const poolsCopy = [...pools]
    
    switch (sortType) {
      case 'apr':
        return poolsCopy.sort((a, b) => {
          const aValue = parseFloat(a.apr || 0)
          const bValue = parseFloat(b.apr || 0)
          return sortDirection === 'desc' ? bValue - aValue : aValue - bValue
        })
      case 'tvl':
        return poolsCopy.sort((a, b) => {
          const aValue = parseFloat(a.tvl || 0)
          const bValue = parseFloat(b.tvl || 0)
          return sortDirection === 'desc' ? bValue - aValue : aValue - bValue
        })
      default:
        return poolsCopy // Original order
    }
  }, [pools, sortType, sortDirection])

  const handleSortChange = (newSortType) => {
    if (sortType === newSortType) {
      // Toggle direction if clicking the same sort button
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
    } else {
      // Set new sort type and default to descending
      setSortType(newSortType)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (type) => {
    if (sortType !== type) return '↕️' // Default icon when not active
    return sortDirection === 'desc' ? '↓' : '↑'
  }

  // Auto-hide notifications
  useEffect(() => {
    if (notification && notification.type !== 'pending') {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Show skeleton only on initial load with no cached data
  if (loading && pools.length === 0) {
    return (
      <Container>
        <StatsContainer>
          <StatsBar>
            <DKumaLogo src="/breederlogos/dkuma.png" alt="dKuma" />
            <StatItem>
              <StatLabel>Total Value Locked</StatLabel>
              <SkeletonElement height="32px" width="120px" />
            </StatItem>
            <StatItem>
              <StatLabel>dKuma Rewards</StatLabel>
              <SkeletonElement height="32px" width="140px" />
            </StatItem>
          </StatsBar>
        </StatsContainer>
        <PoolsGrid>
          {Array.from({ length: 6 }, (_, i) => (
            <SkeletonCard key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
                <SkeletonElement height="16px" width="80px" />
                <SkeletonElement height="24px" width="70px" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <SkeletonElement height="120px" width="120px" style={{ borderRadius: '50%' }} />
              </div>
            </SkeletonCard>
          ))}
        </PoolsGrid>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <LoadingContainer style={{ flexDirection: 'column', gap: '20px' }}>
          <div style={{ color: '#ff8502' }}>Error Loading Pools</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{error}</div>
          {!isConnected && (
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
              Connect your wallet to interact with pools
            </div>
          )}
          {isConnected && chainId !== networkConfig?.chainId && (
            <div style={{ fontSize: '0.9rem', color: '#ff8502' }}>
              Please switch to Ethereum Mainnet
            </div>
          )}
        </LoadingContainer>
      </Container>
    )
  }

  if (!loading && pools.length === 0) {
    return (
      <Container>
        <LoadingContainer style={{ flexDirection: 'column', gap: '20px' }}>
          <div style={{ color: '#ff8502' }}>No Pools Found</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            No pools are currently available in the KumaBreeder contract.
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
            Contract: {KUMABREEDER_ADDRESS}
          </div>
        </LoadingContainer>
      </Container>
    )
  }
  
  const totalTvl = pools.reduce((sum, pool) => sum + parseFloat(pool.tvl || 0), 0)
  // Calculate total dKUMA rewards pending across all pools for the connected user
  const totalPendingRewards = pools.reduce((sum, pool) => sum + parseFloat(pool.pendingReward || 0), 0)
  
  return (
    <Container>
      <StatsContainer id="breeder-stats">
        <StatsBar>
          <DKumaLogo src="/breederlogos/dkuma.png" alt="dKuma" id="breeder-dkuma-logo" />
          <StatItem>
            <StatLabel>Total Value Locked</StatLabel>
            <StatValue>${totalTvl >= 1000 ? formatNumber(totalTvl) : totalTvl.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>dKuma Rewards</StatLabel>
            <StatValue>{formatNumber(totalPendingRewards)} dKUMA</StatValue>
          </StatItem>
        </StatsBar>
      </StatsContainer>

      <FilterContainer id="breeder-filters">
        <div></div> {/* Empty div to push filters to the right */}
        <FilterSection id="breeder-sort-section">
          <FilterLabel>Sort by:</FilterLabel>
          <FilterButton 
            active={sortType === 'apr'}
            onClick={() => handleSortChange('apr')}
          >
            APR% {getSortIcon('apr')}
          </FilterButton>
          <FilterButton 
            active={sortType === 'tvl'}
            onClick={() => handleSortChange('tvl')}
          >
            TVL {getSortIcon('tvl')}
          </FilterButton>
        </FilterSection>
      </FilterContainer>

      <PoolsGrid id="breeder-pools-grid">
        {sortedPools.map((pool, index) => {
          const poolShare = parseFloat(pool.userDeposit) > 0 && parseFloat(pool.tvl) > 0
            ? ((parseFloat(pool.userDeposit) / parseFloat(pool.tvl)) * 100).toFixed(2)
            : '0.00'

          // Use the primaryToken from the hook for logo display
          const primaryToken = pool.primaryToken || getTokenNames(pool.symbol)[0]
          const logo = getTokenLogo(primaryToken)

          return (
            <PoolCard key={pool.pid} id={index === 0 ? 'breeder-first-pool' : undefined} onClick={() => openPoolModal(pool)}>
              <PoolTopRow>
                <TokenNameSection>
                  <PoolTokenName>{pool.symbol}</PoolTokenName>
                </TokenNameSection>
                <APRSection>
                  <PoolAPR>{formatAPR(pool.apr)}% APR</PoolAPR>
                </APRSection>
              </PoolTopRow>

              <PoolContent>
                <PoolTokenLogoWrapper>
                  <PoolTokenLogo>
                    {logo ? (
                      <Image
                        src={logo}
                        alt={primaryToken}
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div style={{
                        background: 'linear-gradient(135deg, #ff8502, #fc72ff)',
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '32px',
                        borderRadius: '50%'
                      }}>
                        {primaryToken?.slice(0, 3)}
                      </div>
                    )}
                  </PoolTokenLogo>
                  {pool.isLP && (
                    <EthBadge>
                      <Image
                        src="/breederlogos/eth.png"
                        alt="ETH"
                        width={32}
                        height={32}
                        style={{ borderRadius: '50%' }}
                      />
                    </EthBadge>
                  )}
                </PoolTokenLogoWrapper>
              </PoolContent>

              <PoolActions onClick={(e) => e.stopPropagation()}>
                <ActionButton 
                  className="primary"
                  onClick={() => openModal('deposit', pool)}
                  disabled={!isConnected}
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  Deposit
                </ActionButton>
                <ActionButton 
                  className="secondary"
                  onClick={() => openModal('withdraw', pool)}
                  disabled={!isConnected || parseFloat(pool.userDeposit) === 0}
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  Withdraw
                </ActionButton>
                <ActionButton 
                  className="secondary"
                  onClick={() => handleClaim(pool)}
                  disabled={!isConnected || parseFloat(pool.pendingReward) === 0}
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                >
                  Claim
                </ActionButton>
              </PoolActions>
            </PoolCard>
          )
        })}
      </PoolsGrid>

      {modalOpen && (
        <ModalOverlay onClick={closeModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>
              {modalType === 'deposit' ? 'Deposit' : 'Withdraw'} {selectedPool?.symbol}
            </ModalTitle>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <ModalActions>
              <ActionButton className="primary" onClick={handleAction}>
                Confirm
              </ActionButton>
              <ActionButton className="secondary" onClick={closeModal}>
                Cancel
              </ActionButton>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}

      <TransactionNotification notification={notification} />
    </Container>
  )
}