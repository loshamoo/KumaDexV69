import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Copy, Check, ExternalLink, TrendingUp, DollarSign } from 'react-feather'
import Image from 'next/image'
import Web3 from 'web3'
import { ERC20_ABI } from '../contracts/KumaBreederABI'
import priceService from '../services/priceService'

const VaultContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
`

const VaultIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 3px solid rgba(34, 197, 94, 0.4);
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
  background: rgba(25, 27, 31, 0.95);
`

const Title = styled.h1`
  font-size: 36px;
  font-weight: bold;
  background: linear-gradient(135deg, #22c55e, #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px 0;
  text-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
`

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
`

const VaultAddress = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
`

const AddressText = styled.span`
  font-family: 'Courier New', monospace;
  color: #22c55e;
  font-size: 14px;
  font-weight: 600;
`

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`

const StatCard = styled.div`
  background: linear-gradient(135deg, rgba(25, 27, 31, 0.95) 0%, rgba(25, 27, 31, 0.85) 100%);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(34, 197, 94, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
  }
`

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 16px;
    height: 16px;
  }
`

const StatValue = styled.div`
  color: white;
  font-size: 28px;
  font-weight: bold;
`

const StatChange = styled.div`
  color: ${props => props.positive ? '#22c55e' : '#ef4444'};
  font-size: 14px;
  font-weight: 500;
`

const TokensGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
`

const TokenCard = styled.div`
  background: linear-gradient(135deg, rgba(25, 27, 31, 0.95) 0%, rgba(25, 27, 31, 0.85) 100%);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.05) 0%,
      rgba(34, 197, 94, 0.02) 50%,
      rgba(74, 222, 128, 0.02) 100%
    );
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  &:hover {
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
    transform: translateY(-2px);
  }
`

const TokenHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const TokenLogo = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid rgba(34, 197, 94, 0.3);
  object-fit: contain;
  padding: 2px;
  background: rgba(0, 0, 0, 0.2);
`

const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const TokenName = styled.h3`
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin: 0;
`

const TokenSymbol = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
`

const TokenValue = styled.div`
  text-align: right;
`

const TokenBalance = styled.div`
  color: white;
  font-size: 20px;
  font-weight: bold;
`

const TokenUsdValue = styled.div`
  color: #22c55e;
  font-size: 16px;
  font-weight: 600;
`

const TokenMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MetricLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const MetricValue = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${props => props.primary ?
    'linear-gradient(135deg, #22c55e, #4ade80)' :
    'transparent'
  };
  border: 2px solid ${props => props.primary ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
    ${props => !props.primary && 'background: rgba(255, 255, 255, 0.1);'}
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
`

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(34, 197, 94, 0.2);
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const LoadingText = styled.div`
  color: #22c55e;
  font-size: 16px;
  font-weight: 500;
`

// Vessel Vault Address
const VESSEL_VAULT_ADDRESS = '0x84B92c9BE811E4C86E26a710CC07E3C0d06ca729'

// Token configurations
const TRACKED_TOKENS = [
  {
    symbol: 'KUMA',
    name: 'Kuma Token',
    address: '0x48C276e8d03813224bb1e55F953adB6d02FD3E02',
    decimals: 18,
    logo: '/breederlogos/kuma.png'
  },
  {
    symbol: 'dKUMA',
    name: 'dKuma Token',
    address: '0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8',
    decimals: 18,
    logo: '/breederlogos/dkuma.png'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86a33E6Fd8481e5f94a8a6c1B5b1e1d2e78D8',
    decimals: 6,
    logo: '/breederlogos/usdc.png'
  },
  {
    symbol: 'wETH',
    name: 'Wrapped Ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    logo: '/breederlogos/eth.png'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: 'NATIVE',
    decimals: 18,
    logo: '/breederlogos/eth.png'
  }
]

const VesselVaultInterface = () => {
  const [loading, setLoading] = useState(true)
  const [tokenBalances, setTokenBalances] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [ethBalance, setEthBalance] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTokenBalances = async () => {
    setRefreshing(true)
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider('https://eth.llamarpc.com'))
      
      // Fetch ETH balance
      const ethBalanceWei = await web3.eth.getBalance(VESSEL_VAULT_ADDRESS)
      const ethBalanceEther = parseFloat(web3.utils.fromWei(ethBalanceWei, 'ether'))
      setEthBalance(ethBalanceEther)
      
      // Fetch token balances
      const balances = []
      let totalUsdValue = 0
      
      // Add ETH to balances
      const ethPrice = await priceService.getETHPrice()
      const ethUsdValue = ethBalanceEther * ethPrice
      totalUsdValue += ethUsdValue
      
      if (ethBalanceEther > 0) {
        balances.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalanceEther,
          usdValue: ethUsdValue,
          price: ethPrice,
          logo: '/breederlogos/eth.png',
          percentage: 0 // Will calculate after
        })
      }
      
      // Fetch ERC20 token balances
      for (const token of TRACKED_TOKENS) {
        if (token.address === 'NATIVE') continue // Skip ETH as we handled it
        
        try {
          const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address)
          const balance = await tokenContract.methods.balanceOf(VESSEL_VAULT_ADDRESS).call()
          
          // Handle different decimal places properly
          let balanceFormatted
          if (token.decimals === 6) {
            balanceFormatted = parseFloat(balance) / Math.pow(10, 6)
          } else {
            balanceFormatted = parseFloat(web3.utils.fromWei(balance, 'ether'))
          }
          
          if (balanceFormatted > 0) {
            // Get token price
            const price = await priceService.getTokenPrice(token.symbol).catch(() => 0)
            const usdValue = balanceFormatted * price
            totalUsdValue += usdValue
            
            balances.push({
              ...token,
              balance: balanceFormatted,
              usdValue: usdValue,
              price: price,
              percentage: 0
            })
          }
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error)
        }
      }
      
      // Calculate percentages
      balances.forEach(token => {
        token.percentage = totalUsdValue > 0 ? (token.usdValue / totalUsdValue * 100) : 0
      })
      
      // Sort by USD value
      balances.sort((a, b) => b.usdValue - a.usdValue)
      
      setTokenBalances(balances)
      setTotalValue(totalUsdValue)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching token balances:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTokenBalances()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchTokenBalances, 60000)
    return () => clearInterval(interval)
  }, [])

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(VESSEL_VAULT_ADDRESS)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toFixed(2)
  }

  const formatUSD = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  if (loading) {
    return (
      <VaultContainer>
        <LoadingContainer>
          <Spinner />
          <LoadingText>Loading Vessel Vault data...</LoadingText>
        </LoadingContainer>
      </VaultContainer>
    )
  }

  return (
    <VaultContainer>
      <HeaderSection>
        <VaultIcon>
          <Image
            src="/breederlogos/kuma.png"
            alt="Vessel Vault"
            width={72}
            height={72}
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </VaultIcon>
        <Title>Vessel Vault</Title>
        <Subtitle>
          Treasury and liquidity holdings secured in the Kuma Vessel Vault
        </Subtitle>
        <VaultAddress>
          <AddressText>{VESSEL_VAULT_ADDRESS}</AddressText>
          <ActionButton onClick={copyAddress}>
            {copiedAddress ? <Check size={16} /> : <Copy size={16} />}
          </ActionButton>
          <ActionButton 
            onClick={() => window.open(`https://etherscan.io/address/${VESSEL_VAULT_ADDRESS}`, '_blank')}
          >
            <ExternalLink size={16} />
          </ActionButton>
        </VaultAddress>
      </HeaderSection>

      <StatsContainer>
        <StatCard>
          <StatLabel>
            <DollarSign />
            Total Value Locked
          </StatLabel>
          <StatValue>{formatUSD(totalValue)}</StatValue>
          <StatChange positive>
            {tokenBalances.length} tokens held
          </StatChange>
        </StatCard>
        
        <StatCard>
          <StatLabel>
            <TrendingUp />
            ETH Balance
          </StatLabel>
          <StatValue>{formatNumber(ethBalance)} ETH</StatValue>
          <StatChange positive>
            {formatUSD(ethBalance * (tokenBalances.find(t => t.symbol === 'ETH')?.price || 0))}
          </StatChange>
        </StatCard>
        
      </StatsContainer>

      <TokensGrid>
        {tokenBalances.map((token) => (
          <TokenCard key={token.symbol}>
            <TokenHeader>
              <TokenInfo>
                <TokenLogo src={token.logo} alt={token.symbol} />
                <TokenDetails>
                  <TokenName>{token.name}</TokenName>
                  <TokenSymbol>{token.symbol}</TokenSymbol>
                </TokenDetails>
              </TokenInfo>
              <TokenValue>
                <TokenBalance>{formatNumber(token.balance)}</TokenBalance>
                <TokenUsdValue>{formatUSD(token.usdValue)}</TokenUsdValue>
              </TokenValue>
            </TokenHeader>
            
            <TokenMetrics>
              <MetricItem>
                <MetricLabel>Price</MetricLabel>
                <MetricValue>{formatUSD(token.price)}</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>Portfolio %</MetricLabel>
                <MetricValue>{token.percentage.toFixed(2)}%</MetricValue>
              </MetricItem>
              <MetricItem>
                <MetricLabel>24h Change</MetricLabel>
                <MetricValue style={{ color: '#22c55e' }}>+0.00%</MetricValue>
              </MetricItem>
            </TokenMetrics>
          </TokenCard>
        ))}
      </TokensGrid>
    </VaultContainer>
  )
}

export default VesselVaultInterface