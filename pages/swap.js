import Head from 'next/head'
import Header from '../src/components/Header'
import SwapInterface from '../src/components/SwapInterface'
import styled from 'styled-components'
import Image from 'next/image'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import { KUMABREEDER_TOKENS } from '../src/data/tokens'

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  padding: 40px 48px;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 40px 24px;
  }

  @media (max-width: 480px) {
    padding: 20px 16px;
  }
`

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  gap: 24px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  max-width: 480px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    align-items: center;
  }
`

const RightColumn = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
`

const ChartContainer = styled.div`
  background: #131722;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.large};
  flex: 1;
  min-height: 450px;
  height: 450px;
  width: 100%;
  position: relative;

  @media (max-width: 1024px) {
    min-height: 380px;
    height: 380px;
  }

  iframe {
    position: absolute;
    top: -1px;
    left: 0;
    width: 100%;
    height: calc(100% + 50px);
    border: none;
    background: #131722;
  }
`

const ChartLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #131722;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.5s ease;
`

const ChartLoadingText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #fc72ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const TransactionsPanel = styled.div`
  background: #1a1f2e;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 16px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.large};
`

const TransactionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`

const TransactionsTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const TransactionRow = styled.div`
  display: grid;
  grid-template-columns: 70px 1fr 1fr 100px 80px;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: 10px;
  font-size: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 60px 1fr 1fr 70px;
    gap: 8px;
  }
`

const TxType = styled.span`
  font-weight: 600;
  color: ${({ $type }) => $type === 'buy' ? '#22c55e' : $type === 'sell' ? '#ef4444' : '#f59e0b'};
  text-transform: uppercase;
  font-size: 11px;
`

const TxAmount = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`

const TxValue = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`

const TxAddress = styled.a`
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-decoration: none;
  font-family: monospace;
  font-size: 11px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    display: none;
  }
`

const TxTime = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: right;
  font-size: 11px;
`

const TokenDetailsPanel = styled.div`
  background: #1a1f2e;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 16px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.large};
  display: flex;
  flex-direction: column;
  align-items: center;
`

const TokenHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`

const TokenIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.module};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`

const TokenName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`

const TokenTicker = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`

const TokenStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: 12px;
  margin-bottom: 12px;
  width: 100%;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`

const StatLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  text-align: center;
`

const StatValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`

const TokenLinks = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
`

const SocialIconLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s ease;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.background.interactive};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const TokenDescription = styled.p`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin: 0 0 12px 0;
  padding: 0 8px;
`

const UpdateSocialsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.colors.background.module};
  border: 1px dashed ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.interactive};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

// Edit/Pencil Icon for Update Socials
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: rgb(38, 39, 43);
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 12px 0;
`

const ModalText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 20px 0;
  line-height: 1.5;
`

const TelegramContactButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: #0088cc;
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: #0077b5;
    transform: translateY(-1px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const ModalCloseButton = styled.button`
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 16px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.interactive};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

// X (Twitter) Icon
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Telegram Icon
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

// Etherscan Icon
const EtherscanIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.9 10.6c0-.4.3-.6.6-.6h1.6c.4 0 .6.3.6.6v6.7c0 .4-.3.6-.6.6H6.5c-.4 0-.6-.3-.6-.6v-6.7zm4.3-3.5c0-.4.3-.6.6-.6h1.6c.4 0 .6.3.6.6v10.2c0 .4-.3.6-.6.6h-1.6c-.4 0-.6-.3-.6-.6V7.1zm4.3 5.3c0-.4.3-.6.6-.6h1.6c.4 0 .6.3.6.6v4.9c0 .4-.3.6-.6.6h-1.6c-.4 0-.6-.3-.6-.6v-4.9z" />
    <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zm0 19.3c-4.9 0-8.8-3.9-8.8-8.8S7.1 3.2 12 3.2s8.8 3.9 8.8 8.8-3.9 8.8-8.8 8.8z" />
  </svg>
)

// Bubblemaps Icon
const BubblemapsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="4" />
    <circle cx="6" cy="16" r="3" />
    <circle cx="18" cy="16" r="3" />
    <line x1="12" y1="12" x2="6" y2="13" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="12" x2="18" y2="13" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

// Website/Globe Icon
const WebsiteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

// Token market data with social links and descriptions
const TOKEN_MARKET_DATA = {
  'KUMA': {
    twitter: 'officialkumainu',
    telegram: 'KumaInuCommunity',
    website: 'https://kumainu.com',
    description: 'Kuma Inu is a community-driven DeFi ecosystem featuring the Kuma Breeder staking platform and KumaDEX perpetual trading.'
  },
  'dKUMA': {
    twitter: 'officialkumainu',
    telegram: 'KumaInuCommunity',
    website: 'https://kumainu.com',
    description: 'dKUMA is the governance and rewards token for the Kuma Inu ecosystem, earned through staking in Kuma Breeder pools.'
  },
  'SHIB': {
    twitter: 'Shibtoken',
    telegram: 'ShibaInuCommunity',
    website: 'https://shibatoken.com',
    description: 'Shiba Inu is a decentralized meme token that evolved into a vibrant ecosystem with its own DEX, NFTs, and metaverse.'
  },
  'LEASH': {
    twitter: 'Shibtoken',
    telegram: 'ShibaInuCommunity',
    website: 'https://shibatoken.com',
    description: 'LEASH is the limited supply store of value token in the Shiba Inu ecosystem, originally designed as a rebase token.'
  },
  'ELON': {
    twitter: 'DogelonMars',
    telegram: 'DogelonMars',
    website: 'https://dogelon.io',
    description: 'Dogelon Mars is a dog-themed meme coin with an interplanetary mission, building a community focused on space exploration.'
  },
  'AKITA': {
    twitter: 'AkitaInuToken',
    telegram: 'AkitaInuCommunity',
    website: 'https://akitatoken.net',
    description: 'Akita Inu is a 100% decentralized community-owned meme token inspired by the Japanese Akita dog breed.'
  },
  'ETH': {
    twitter: 'ethereum',
    telegram: 'ethereumproject',
    website: 'https://ethereum.org',
    description: 'Ethereum is a decentralized blockchain platform that enables smart contracts and serves as the foundation for DeFi and NFTs.'
  },
}

// Format time ago from timestamp
const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Format large numbers
const formatNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  if (num < 0.0001) return num.toExponential(2)
  return num.toFixed(4)
}

// Truncate address
const truncateAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function Home() {
  const router = useRouter()
  const [selectedToken, setSelectedToken] = useState(KUMABREEDER_TOKENS[2]) // Default to KUMA (index 2)
  const [chartToken, setChartToken] = useState(KUMABREEDER_TOKENS[2]) // Separate state for chart to prevent re-renders
  const [transactions, setTransactions] = useState([])
  const [pairData, setPairData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(true) // Start true for initial load
  const [customToken, setCustomToken] = useState(null)
  const [showUpdateSocialsModal, setShowUpdateSocialsModal] = useState(false)
  const [chartReady, setChartReady] = useState(false)

  // Only update chart token when the actual token address changes (with debounce)
  useEffect(() => {
    if (selectedToken?.address !== chartToken?.address) {
      setChartLoading(true)
      // Debounce chart updates to prevent rapid re-renders
      const timeoutId = setTimeout(() => {
        setChartToken(selectedToken)
      }, 150)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedToken?.address])

  // Check if token is part of Kuma ecosystem (has market data)
  const isKumaEcosystem = TOKEN_MARKET_DATA.hasOwnProperty(selectedToken.symbol)

  // Handle token from URL query parameter
  useEffect(() => {
    const loadTokenFromQuery = async () => {
      const { token: tokenAddress } = router.query

      if (tokenAddress && typeof tokenAddress === 'string') {
        // Check if it's one of our known tokens
        const knownToken = KUMABREEDER_TOKENS.find(
          t => t.address.toLowerCase() === tokenAddress.toLowerCase()
        )

        if (knownToken) {
          setSelectedToken(knownToken)
          setCustomToken(null)
        } else {
          // Fetch token info from DexScreener
          try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
            const data = await response.json()

            if (data.pairs && data.pairs.length > 0) {
              const ethPair = data.pairs
                .filter(p => p.chainId === 'ethereum')
                .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0]

              if (ethPair) {
                const tokenInfo = {
                  symbol: ethPair.baseToken.symbol,
                  name: ethPair.baseToken.name,
                  address: ethPair.baseToken.address,
                  logo: ethPair.info?.imageUrl || '/breederlogos/unknown.png',
                  decimals: 18
                }
                setCustomToken(tokenInfo)
                setSelectedToken(tokenInfo)
              }
            }
          } catch (error) {
            console.error('Error fetching token info:', error)
          }
        }
      }
    }

    if (router.isReady) {
      loadTokenFromQuery()
    }
  }, [router.isReady, router.query])

  const marketData = TOKEN_MARKET_DATA[selectedToken.symbol] || { twitter: '', telegram: '', website: '', description: '' }

  // Fetch real transactions from APIs
  const fetchTransactions = async (token) => {
    if (token.address === '0x0000000000000000000000000000000000000000') {
      setTransactions([])
      setPairData(null)
      return
    }

    setLoading(true)
    try {
      // Fetch pair data from DexScreener for price info
      const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`)
      const dexData = await dexResponse.json()

      let tokenPrice = 0
      if (dexData.pairs && dexData.pairs.length > 0) {
        const ethPair = dexData.pairs
          .filter(p => p.chainId === 'ethereum')
          .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0]

        if (ethPair) {
          setPairData(ethPair)
          tokenPrice = parseFloat(ethPair.priceUsd) || 0
        }
      }

      // Fetch real transactions for this specific token (limit to 5)
      const txResponse = await fetch(`/api/token-transactions?address=${token.address}&limit=5`)
      const txData = await txResponse.json()

      if (txData.success && txData.transactions) {
        const tokenTxs = txData.transactions.map((tx, index) => ({
          id: tx.hash + index,
          type: tx.type,
          tokenAmount: `${formatNumber(tx.amount)} ${token.symbol}`,
          value: tokenPrice ? `$${formatNumber(tx.amount * tokenPrice)}` : '-',
          address: tx.type === 'buy' ? tx.to : tx.from,
          addressFull: tx.type === 'buy' ? tx.to : tx.from,
          hash: tx.hash,
          time: formatTimeAgo(tx.timestamp)
        }))

        setTransactions(tokenTxs)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
    setLoading(false)
  }

  // Fetch transactions on token change and poll for updates
  useEffect(() => {
    fetchTransactions(selectedToken)

    // Poll for new transactions every 10 seconds
    const interval = setInterval(() => {
      fetchTransactions(selectedToken)
    }, 10000)

    return () => clearInterval(interval)
  }, [selectedToken])

  // DexScreener embed URL
  const getChartUrl = useCallback((address) => {
    if (!address) return ''
    // ETH uses WETH address
    const tokenAddress = address === '0x0000000000000000000000000000000000000000'
      ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      : address
    // Simple embed params for reliable loading
    return `https://dexscreener.com/ethereum/${tokenAddress}?embed=1&theme=dark&trades=0&info=0`
  }, [])

  // Memoized chart URL
  const chartUrl = useMemo(() => getChartUrl(chartToken?.address), [chartToken?.address, getChartUrl])

  // Handle chart iframe load complete
  const handleChartLoad = useCallback(() => {
    // Delay to ensure chart is fully rendered before hiding overlay
    setTimeout(() => setChartLoading(false), 500)
  }, [])

  return (
    <>
      <Head>
        <title>Swap - KumaDEX</title>
        <link rel="dns-prefetch" href="https://dexscreener.com" />
        <link rel="dns-prefetch" href="https://io.dexscreener.com" />
        <link rel="preconnect" href="https://dexscreener.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://io.dexscreener.com" crossOrigin="anonymous" />
      </Head>
      <AppContainer>
        <Header />
        <MainContent>
          <TopRow>
            <LeftColumn>
              <TokenDetailsPanel>
                <TokenHeader>
                  <TokenIcon>
                    {selectedToken.logo && (selectedToken.logo.startsWith('http://') || selectedToken.logo.startsWith('https://')) ? (
                      <img
                        src={selectedToken.logo}
                        alt={selectedToken.symbol || ''}
                        style={{ width: 56, height: 56, borderRadius: '50%' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : selectedToken.logo && selectedToken.logo.startsWith('/') ? (
                      <Image
                        src={selectedToken.logo}
                        alt={selectedToken.symbol || ''}
                        width={56}
                        height={56}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}>
                        {selectedToken.symbol?.slice(0, 2) || '??'}
                      </span>
                    )}
                  </TokenIcon>
                  <TokenInfo>
                    <TokenName>{selectedToken.name || 'Unknown Token'}</TokenName>
                    <TokenTicker>${selectedToken.symbol || '???'}</TokenTicker>
                  </TokenInfo>
                </TokenHeader>

                <TokenStats>
                  <StatItem>
                    <StatLabel>Market Cap</StatLabel>
                    <StatValue>
                      {pairData?.fdv ? `$${formatNumber(pairData.fdv)}` : pairData?.marketCap ? `$${formatNumber(pairData.marketCap)}` : 'Loading...'}
                    </StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Price</StatLabel>
                    <StatValue>
                      {pairData?.priceUsd ? `$${parseFloat(pairData.priceUsd).toFixed(8)}` : '-'}
                    </StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>24h</StatLabel>
                    <StatValue style={{ color: pairData?.priceChange?.h24 >= 0 ? '#22c55e' : '#ef4444' }}>
                      {pairData?.priceChange?.h24 ? `${pairData.priceChange.h24 >= 0 ? '+' : ''}${pairData.priceChange.h24.toFixed(2)}%` : '-'}
                    </StatValue>
                  </StatItem>
                </TokenStats>

                {marketData.description && (
                  <TokenDescription>{marketData.description}</TokenDescription>
                )}

                <TokenLinks>
                  {marketData.website && (
                    <SocialIconLink
                      href={marketData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Website"
                    >
                      <WebsiteIcon />
                    </SocialIconLink>
                  )}
                  {marketData.twitter && (
                    <SocialIconLink
                      href={`https://x.com/${marketData.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="X (Twitter)"
                    >
                      <XIcon />
                    </SocialIconLink>
                  )}
                  {marketData.telegram && (
                    <SocialIconLink
                      href={`https://t.me/${marketData.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Telegram"
                    >
                      <TelegramIcon />
                    </SocialIconLink>
                  )}
                  <SocialIconLink
                    href={`https://etherscan.io/token/${selectedToken.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Etherscan"
                  >
                    <EtherscanIcon />
                  </SocialIconLink>
                  <SocialIconLink
                    href={`https://bubblemaps.io/eth/token/${selectedToken.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Bubblemaps"
                  >
                    <BubblemapsIcon />
                  </SocialIconLink>
                  {!isKumaEcosystem && (
                    <UpdateSocialsButton onClick={() => setShowUpdateSocialsModal(true)} title="Update Socials">
                      <EditIcon />
                    </UpdateSocialsButton>
                  )}
                </TokenLinks>
              </TokenDetailsPanel>

              <SwapInterface onTokenChange={setSelectedToken} initialToToken={selectedToken} />
            </LeftColumn>

            <RightColumn>
              <ChartContainer>
                <ChartLoadingOverlay $visible={chartLoading}>
                  <ChartLoadingText>Loading {chartToken?.symbol} chart...</ChartLoadingText>
                </ChartLoadingOverlay>
                {chartUrl && (
                  <iframe
                    key={chartToken?.address}
                    src={chartUrl}
                    title={`${chartToken?.symbol || 'Token'} Chart`}
                    allow="clipboard-write"
                    allowFullScreen
                    onLoad={handleChartLoad}
                  />
                )}
              </ChartContainer>
            </RightColumn>
          </TopRow>

          <TransactionsPanel>
            <TransactionsHeader>
              <TransactionsTitle>Recent Swaps ({selectedToken.symbol})</TransactionsTitle>
              <LiveIndicator>{loading ? 'Loading...' : 'Last 5'}</LiveIndicator>
            </TransactionsHeader>
            <TransactionsList>
              {transactions.length === 0 && !loading && (
                <TransactionRow style={{ justifyContent: 'center', display: 'flex' }}>
                  <TxValue>No recent transactions</TxValue>
                </TransactionRow>
              )}
              {transactions.map((tx) => (
                <TransactionRow key={tx.id}>
                  <TxType $type={tx.type}>{tx.type}</TxType>
                  <TxAmount>{tx.tokenAmount}</TxAmount>
                  <TxValue>{tx.value}</TxValue>
                  <TxAddress
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {truncateAddress(tx.addressFull || tx.address)}
                  </TxAddress>
                  <TxTime>{tx.time}</TxTime>
                </TransactionRow>
              ))}
            </TransactionsList>
          </TransactionsPanel>
        </MainContent>
      </AppContainer>

      <ModalOverlay $isOpen={showUpdateSocialsModal} onClick={() => setShowUpdateSocialsModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>Update Token Socials</ModalTitle>
          <ModalText>
            Want to add or update the social links and description for <strong>{selectedToken.symbol}</strong>?
            Contact us on Telegram to get your token listed with full details.
          </ModalText>
          <TelegramContactButton
            href="https://t.me/loshamoo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TelegramIcon />
            Contact @loshamoo
          </TelegramContactButton>
          <ModalCloseButton onClick={() => setShowUpdateSocialsModal(false)}>
            Close
          </ModalCloseButton>
        </ModalContent>
      </ModalOverlay>
    </>
  )
}