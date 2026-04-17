import { useState, useEffect, useCallback, useRef } from 'react'
import styled from 'styled-components'
import Header from '../src/components/Header'
import Head from 'next/head'
import Image from 'next/image'
import { ChevronDown, RefreshCw, ExternalLink, Loader } from 'react-feather'

// Wallet addresses configuration
const REVENUE_WALLETS = [
  {
    name: 'Kuma SwapX Fees',
    address: '0x15305A9c292B4e38B3154f6bfa54841A84C92922',
    description: 'Trading fees from SwapX'
  },
  {
    name: 'kumatokens.eth',
    address: '0xcB8614219dAFB6D04fD2A4f360551a014da2CEc3',
    description: 'Main Kuma Tokens wallet'
  },
  {
    name: 'Kuma DEX Donations',
    address: '0xCC2C4714894c142D5d240F068d5502EAc0963Bf5',
    description: 'Community donations'
  },
  {
    name: 'Marketing/Development',
    address: '0xA6A7A7B3C3957E82A66F3ADDD8f47E17B5414e05',
    description: 'Marketing and development funds'
  },
  {
    name: 'Community Team Donations',
    address: '0xf35a523f6FEE161aE0fF3873C51dEEF07afDdA4c',
    description: 'Community team wallet'
  },
]

// KumaDex token logos mapping
const KUMADEX_LOGOS = {
  'KUMA': '/breederlogos/kuma.png',
  'dKUMA': '/breederlogos/dkuma.png',
  'DKUMA': '/breederlogos/dkuma.png',
  'SHIB': '/breederlogos/shib.png',
  'LEASH': '/breederlogos/leash.png',
  'ELON': '/breederlogos/elon.png',
  'AKITA': '/breederlogos/akita.png',
  'USDC': '/breederlogos/usdc.png',
  'ETH': '/breederlogos/eth.png',
  'WETH': '/breederlogos/eth.png',
  'BONE': '/breederlogos/shib.png',
}

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`

const TitleIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const WalletSelectorContainer = styled.div`
  position: relative;
`

const WalletSelector = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 280px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background.tertiary || theme.colors.background.secondary};
  }
`

const WalletSelectorInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`

const WalletSelectorName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const WalletSelectorAddress = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: monospace;
`

const WalletDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  overflow: hidden;
`

const WalletOption = styled.div`
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  ${({ $active }) => $active && `
    background: rgba(34, 197, 94, 0.1);
  `}
`

const WalletOptionName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`

const WalletOptionAddress = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: monospace;
`

const WalletOptionDesc = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 4px;
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
  padding: 24px;
`

const StatLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
`

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 480px) {
    font-size: 24px;
  }
`

const StatSubtext = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-top: 4px;
`

const SectionContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
`

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

const SectionSubtitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const RefreshButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 8px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    animation: ${({ $loading }) => $loading ? 'spin 1s linear infinite' : 'none'};
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;

  @media (max-width: 600px) {
    grid-template-columns: 2fr 1fr 1fr;

    > div:nth-child(2) {
      display: none;
    }
  }
`

const TokenRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    grid-template-columns: 2fr 1fr 1fr;

    > div:nth-child(2) {
      display: none;
    }
  }
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.interactive};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
`

const TokenName = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`

const TokenSymbol = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const EtherscanLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-size: 13px;
  margin-top: 8px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

export default function MonthlyRevenue() {
  const [selectedWallet, setSelectedWallet] = useState(REVENUE_WALLETS[0])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const [tokenCount, setTokenCount] = useState(0)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch wallet balances
  const fetchWalletBalances = useCallback(async (address) => {
    setLoading(true)
    try {
      // Use multiple APIs for better coverage
      const [ethBalance, tokenBalances] = await Promise.all([
        fetchEthBalance(address),
        fetchTokenBalances(address)
      ])

      // Combine ETH and token balances
      const allTokens = []

      // Add ETH if value > $1
      if (ethBalance.value >= 1) {
        allTokens.push(ethBalance)
      }

      // Add tokens with value > $1
      tokenBalances.forEach(token => {
        if (token.value >= 1) {
          allTokens.push(token)
        }
      })

      // Sort by value descending
      allTokens.sort((a, b) => b.value - a.value)

      setTokens(allTokens)
      setTotalValue(allTokens.reduce((sum, t) => sum + t.value, 0))
      setTokenCount(allTokens.length)
    } catch (err) {
      console.error('Error fetching balances:', err)
      setTokens([])
      setTotalValue(0)
      setTokenCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch ETH balance
  const fetchEthBalance = async (address) => {
    try {
      // Get ETH balance from public RPC
      const response = await fetch('https://ethereum.publicnode.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      })
      const data = await response.json()
      const balanceWei = parseInt(data.result, 16)
      const balance = balanceWei / 1e18

      // Get ETH price
      const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const priceData = await priceRes.json()
      const price = priceData.ethereum?.usd || 0

      return {
        symbol: 'ETH',
        name: 'Ethereum',
        balance,
        price,
        value: balance * price,
        logo: '/breederlogos/eth.png',
        address: null
      }
    } catch (err) {
      console.error('Error fetching ETH balance:', err)
      return { symbol: 'ETH', name: 'Ethereum', balance: 0, price: 0, value: 0, logo: '/breederlogos/eth.png', address: null }
    }
  }

  // Fetch token balances using DexScreener and direct contract calls
  const fetchTokenBalances = async (address) => {
    try {
      // Known tokens to check
      const knownTokens = [
        { symbol: 'KUMA', address: '0x48C276e8d03813224bb1e55F953adB6d02FD3E02', decimals: 18, name: 'Kuma Inu' },
        { symbol: 'dKUMA', address: '0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8', decimals: 18, name: 'dKuma' },
        { symbol: 'SHIB', address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', decimals: 18, name: 'Shiba Inu' },
        { symbol: 'LEASH', address: '0x27C70Cd1946795B66be9d954418546998b546634', decimals: 18, name: 'Doge Killer' },
        { symbol: 'BONE', address: '0x9813037ee2218799597d83D4a5B6F3b6778218d9', decimals: 18, name: 'Bone ShibaSwap' },
        { symbol: 'ELON', address: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3', decimals: 18, name: 'Dogelon Mars' },
        { symbol: 'AKITA', address: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6', decimals: 18, name: 'Akita Inu' },
        { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, name: 'USD Coin' },
        { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, name: 'Tether USD' },
        { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18, name: 'Wrapped Ether' },
        { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, name: 'Dai Stablecoin' },
        { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', decimals: 18, name: 'Chainlink' },
        { symbol: 'UNI', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', decimals: 18, name: 'Uniswap' },
        { symbol: 'PEPE', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933', decimals: 18, name: 'Pepe' },
      ]

      // Fetch balances in parallel
      const balancePromises = knownTokens.map(async (token) => {
        try {
          // Call balanceOf
          const balanceData = '0x70a08231000000000000000000000000' + address.slice(2).toLowerCase()
          const response = await fetch('https://ethereum.publicnode.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{ to: token.address, data: balanceData }, 'latest'],
              id: 1
            })
          })
          const data = await response.json()

          if (data.result && data.result !== '0x') {
            const rawBalance = BigInt(data.result)
            const balance = Number(rawBalance) / Math.pow(10, token.decimals)

            if (balance > 0) {
              return { ...token, balance }
            }
          }
          return null
        } catch (err) {
          return null
        }
      })

      const balanceResults = await Promise.all(balancePromises)
      const tokensWithBalance = balanceResults.filter(t => t !== null && t.balance > 0)

      // Fetch prices for tokens with balances
      const pricesPromises = tokensWithBalance.map(async (token) => {
        try {
          // Try DexScreener first
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`)
          const data = await response.json()

          if (data.pairs && data.pairs.length > 0) {
            const ethPair = data.pairs.find(p => p.chainId === 'ethereum')
            if (ethPair?.priceUsd) {
              const price = parseFloat(ethPair.priceUsd)
              return {
                ...token,
                price,
                value: token.balance * price,
                logo: KUMADEX_LOGOS[token.symbol] || ethPair.info?.imageUrl || null
              }
            }
          }

          // Fallback: stablecoins are $1
          if (['USDC', 'USDT', 'DAI'].includes(token.symbol)) {
            return {
              ...token,
              price: 1,
              value: token.balance,
              logo: KUMADEX_LOGOS[token.symbol] || null
            }
          }

          return {
            ...token,
            price: 0,
            value: 0,
            logo: KUMADEX_LOGOS[token.symbol] || null
          }
        } catch (err) {
          return {
            ...token,
            price: 0,
            value: 0,
            logo: KUMADEX_LOGOS[token.symbol] || null
          }
        }
      })

      const tokensWithPrices = await Promise.all(pricesPromises)
      return tokensWithPrices
    } catch (err) {
      console.error('Error fetching token balances:', err)
      return []
    }
  }

  // Fetch data when wallet changes
  useEffect(() => {
    fetchWalletBalances(selectedWallet.address)
  }, [selectedWallet, fetchWalletBalances])

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet)
    setDropdownOpen(false)
  }

  const formatBalance = (balance) => {
    if (balance === 0) return '0'
    if (balance < 0.0001) return balance.toExponential(2)
    if (balance < 1) return balance.toFixed(6)
    if (balance < 1000) return balance.toFixed(4)
    if (balance < 1000000) return balance.toLocaleString(undefined, { maximumFractionDigits: 2 })
    return (balance / 1000000).toFixed(2) + 'M'
  }

  const formatUSD = (value) => {
    if (value === 0) return '$0.00'
    if (value < 0.01) return '<$0.01'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPrice = (price) => {
    if (!price || price === 0) return '$0.00'
    if (price < 0.00001) return `$${price.toExponential(2)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <>
      <Head>
        <title>Monthly Revenue | KumaDEX</title>
        <meta name="description" content="View KumaDEX revenue and wallet holdings" />
      </Head>
      <AppContainer>
        <Header />
        <MainContent>
          <PageHeader>
            <PageTitle>
              <TitleIcon>
                <Image
                  src="/breederlogos/kuma.png"
                  alt="KUMA"
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%' }}
                />
              </TitleIcon>
              Monthly Revenue
            </PageTitle>

            <WalletSelectorContainer ref={dropdownRef}>
              <WalletSelector onClick={() => setDropdownOpen(!dropdownOpen)}>
                <WalletSelectorInfo>
                  <WalletSelectorName>{selectedWallet.name}</WalletSelectorName>
                  <WalletSelectorAddress>{formatAddress(selectedWallet.address)}</WalletSelectorAddress>
                </WalletSelectorInfo>
                <ChevronDown
                  size={18}
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </WalletSelector>

              {dropdownOpen && (
                <WalletDropdown>
                  {REVENUE_WALLETS.map((wallet) => (
                    <WalletOption
                      key={wallet.address}
                      $active={selectedWallet.address === wallet.address}
                      onClick={() => handleWalletSelect(wallet)}
                    >
                      <WalletOptionName>{wallet.name}</WalletOptionName>
                      <WalletOptionAddress>{formatAddress(wallet.address)}</WalletOptionAddress>
                      <WalletOptionDesc>{wallet.description}</WalletOptionDesc>
                    </WalletOption>
                  ))}
                </WalletDropdown>
              )}
            </WalletSelectorContainer>
          </PageHeader>

          <StatsRow>
            <StatCard>
              <StatLabel>Total Value</StatLabel>
              <StatValue>{loading ? '...' : formatUSD(totalValue)}</StatValue>
              <StatSubtext>{selectedWallet.name}</StatSubtext>
            </StatCard>
            <StatCard>
              <StatLabel>Tokens Held</StatLabel>
              <StatValue>{loading ? '...' : tokenCount}</StatValue>
              <StatSubtext>With value &gt; $1</StatSubtext>
            </StatCard>
            <StatCard>
              <StatLabel>Wallet</StatLabel>
              <StatValue style={{ fontSize: '16px', fontFamily: 'monospace' }}>
                {formatAddress(selectedWallet.address)}
              </StatValue>
              <EtherscanLink
                href={`https://etherscan.io/address/${selectedWallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Etherscan <ExternalLink size={12} />
              </EtherscanLink>
            </StatCard>
          </StatsRow>

          <SectionContainer>
            <SectionHeader>
              <div>
                <SectionTitle>Token Holdings</SectionTitle>
              </div>
              <RefreshButton
                onClick={() => fetchWalletBalances(selectedWallet.address)}
                disabled={loading}
                $loading={loading}
                title="Refresh balances"
              >
                <RefreshCw size={18} />
              </RefreshButton>
            </SectionHeader>

            {loading ? (
              <LoadingContainer>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ marginLeft: 12 }}>Loading token balances...</span>
              </LoadingContainer>
            ) : tokens.length === 0 ? (
              <EmptyState>
                No tokens with value greater than $1 found in this wallet.
              </EmptyState>
            ) : (
              <>
                <TableHeader>
                  <div>Token</div>
                  <div>Price</div>
                  <div>Balance</div>
                  <div>Value</div>
                </TableHeader>

                {tokens.map((token) => (
                  <TokenRow key={token.symbol}>
                    <TokenInfo>
                      <TokenIconWrapper>
                        {token.logo ? (
                          token.logo.startsWith('/') ? (
                            <Image
                              src={token.logo}
                              alt={token.symbol}
                              width={32}
                              height={32}
                              style={{ borderRadius: '50%' }}
                            />
                          ) : (
                            <img
                              src={token.logo}
                              alt={token.symbol}
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          )
                        ) : (
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>
                            {token.symbol.slice(0, 2)}
                          </span>
                        )}
                      </TokenIconWrapper>
                      <TokenDetails>
                        <TokenName>{token.name}</TokenName>
                        <TokenSymbol>{token.symbol}</TokenSymbol>
                      </TokenDetails>
                    </TokenInfo>
                    <div style={{ color: '#888' }}>{formatPrice(token.price)}</div>
                    <div>{formatBalance(token.balance)}</div>
                    <div style={{ fontWeight: 500, color: '#22c55e' }}>{formatUSD(token.value)}</div>
                  </TokenRow>
                ))}
              </>
            )}
          </SectionContainer>
        </MainContent>
      </AppContainer>
    </>
  )
}
