import Header from '../src/components/Header'
import styled from 'styled-components'
import { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, TrendingDown, ExternalLink, ArrowUpRight, ArrowDownLeft, RefreshCw, Search, Repeat, Layers, Zap, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'react-feather'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { CONTRACTS } from '../src/config/contracts'

// Kuma Ecosystem Tokens with Ethereum mainnet addresses
const KUMA_ECOSYSTEM_TOKENS = [
  {
    symbol: 'KUMA',
    name: 'Kuma Inu',
    logo: '/breederlogos/kuma.png',
    address: CONTRACTS.TOKENS.KUMA,
    decimals: 18,
    coingeckoId: 'kuma-inu',
    description: 'The original Kuma Inu token',
    poolId: 12,
    allocPoint: 2000
  },
  {
    symbol: 'dKUMA',
    name: 'dKuma',
    logo: '/breederlogos/dkuma.png',
    address: CONTRACTS.TOKENS.dKUMA,
    decimals: 18,
    coingeckoId: null,
    description: 'Kuma Breeder reward token',
    poolId: 6,
    allocPoint: 1500
  },
  {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    logo: '/breederlogos/shib.png',
    address: CONTRACTS.TOKENS.SHIB,
    decimals: 18,
    coingeckoId: 'shiba-inu',
    description: 'The Dogecoin killer',
    poolId: 2,
    allocPoint: 50
  },
  {
    symbol: 'LEASH',
    name: 'Doge Killer',
    logo: '/breederlogos/leash.png',
    address: CONTRACTS.TOKENS.LEASH,
    decimals: 18,
    coingeckoId: 'leash',
    description: 'Limited supply store of value',
    poolId: 3,
    allocPoint: 50
  },
  {
    symbol: 'AKITA',
    name: 'Akita Inu',
    logo: '/breederlogos/akita.png',
    address: CONTRACTS.TOKENS.AKITA,
    decimals: 18,
    coingeckoId: 'akita-inu',
    description: 'Community-driven meme token',
    poolId: 4,
    allocPoint: 5
  },
  {
    symbol: 'ELON',
    name: 'Dogelon Mars',
    logo: '/breederlogos/elon.png',
    address: CONTRACTS.TOKENS.ELON,
    decimals: 18,
    coingeckoId: 'dogelon-mars',
    description: 'Interplanetary currency',
    poolId: 5,
    allocPoint: 5
  },
]

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`

const PageHeader = styled.div`
  margin-bottom: 32px;
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`

const PageDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 8px;
`

const LiveIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 212, 170, 0.1);
  color: #00d4aa;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background: #00d4aa;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`

/* Featured Tokens Section */
const FeaturedSection = styled.div`
  margin-bottom: 48px;
`

const SectionLabel = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const FeaturedCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  background: ${({ $active, theme }) => $active ? 'rgba(255, 0, 122, 0.12)' : theme.colors.background.secondary};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border.primary};
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: rgba(255, 0, 122, 0.08);
    transform: translateY(-2px);
  }
`

const FeaturedMarketCap = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 600;
`

const FeaturedChange = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 11px;
  color: ${({ $isPositive }) => $isPositive ? '#00d4aa' : '#ff6b6b'};
  font-weight: 600;
  background: ${({ $isPositive }) => $isPositive ? 'rgba(0, 212, 170, 0.1)' : 'rgba(255, 107, 107, 0.1)'};
  padding: 4px 8px;
  border-radius: 8px;
`

const FeaturedIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.interactive};
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 34px;
    height: 34px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const FeaturedSymbol = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`



/* Tab Navigation with Search */
const TabSearchRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  padding-bottom: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`

const TabContainer = styled.div`
  display: flex;
  gap: 4px;
  position: relative;
`

const Tab = styled.button`
  padding: 12px 20px;
  background: transparent;
  color: ${({ $active, theme }) => $active ? theme.colors.text.primary : theme.colors.text.tertiary};
  border: none;
  border-bottom: 2px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: -1px;
  padding-bottom: 14px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

/* Token Table - Uniswap Style */
const TableContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
  overflow: hidden;
`

const TableWrapper = styled.div`
  overflow-x: auto;
`

const TokenTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
`

const TableHead = styled.thead`
  background: transparent;
`

const TableHeadRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`

const TableHeader = styled.th`
  padding: 20px;
  text-align: ${({ $align }) => $align || 'left'};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.tertiary};
  white-space: nowrap;
  cursor: ${({ $sortable }) => $sortable ? 'pointer' : 'default'};
  user-select: none;
  transition: color 0.2s ease;

  &:first-child {
    padding-left: 24px;
  }

  &:last-child {
    padding-right: 24px;
  }

  &:hover {
    color: ${({ $sortable, theme }) => $sortable ? theme.colors.text.primary : theme.colors.text.tertiary};
  }
`

const SortIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text.tertiary};
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => $align === 'right' ? 'flex-end' : 'flex-start'};
  gap: 4px;
`

const TableHeaderIndex = styled(TableHeader)`
  width: 50px;
`

const TableBody = styled.tbody``

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
`

const TableCell = styled.td`
  padding: 20px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  vertical-align: middle;

  &:first-child {
    padding-left: 24px;
  }

  &:last-child {
    padding-right: 24px;
  }
`

const TableCellIndex = styled(TableCell)`
  width: 50px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-weight: 500;
`

const TokenNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const TokenLogo = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background.interactive};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const TokenNameInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TokenNameText = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`

const TokenSymbolText = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-weight: 400;
`

const PriceCell = styled.span`
  font-weight: 500;
`

const ChangeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ $isPositive }) => $isPositive ? '#00d4aa' : '#ff6b6b'};
  font-weight: 500;
`

const VolumeCell = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
`

const ChartCell = styled.div`
  width: 100px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const MiniChart = styled.svg`
  width: 100px;
  height: 32px;
`

/* Transaction Table */
const TxTableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child {
    border-bottom: none;
  }
`

const TxTypeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ $type }) =>
    $type === 'buy' ? '#00d4aa' :
      $type === 'sell' ? '#ff6b6b' :
        $type === 'breeder' ? '#ff007a' :
          '#888'};
  font-weight: 500;
`

const TxIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $type }) =>
    $type === 'buy' ? 'rgba(0, 212, 170, 0.1)' :
      $type === 'sell' ? 'rgba(255, 107, 107, 0.1)' :
        $type === 'breeder' ? 'rgba(255, 0, 122, 0.1)' :
          'rgba(136, 136, 136, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $type }) =>
    $type === 'buy' ? '#00d4aa' :
      $type === 'sell' ? '#ff6b6b' :
        $type === 'breeder' ? '#ff007a' :
          '#888'};
`

const TxLink = styled.a`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-family: monospace;
  font-size: 13px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.text.secondary};
  gap: 12px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const SearchInput = styled.input`
  flex: 1;
  max-width: 400px;
  padding: 12px 16px 12px 44px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const FilterLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-right: 8px;
`

const FilterButton = styled.button`
  padding: 6px 14px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active }) => $active ? '#fff' : '#888'};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border.primary};
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ $active }) => $active ? '#fff' : '#fff'};
  }
`

const FilterTokenIcon = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    border-radius: 50%;
  }
`

const RefreshTxButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    animation: ${({ $loading }) => $loading ? 'spin 1s linear infinite' : 'none'};
  }
`

const AutoRefreshToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${({ $active }) => $active ? 'rgba(0, 212, 170, 0.1)' : 'transparent'};
  border: 1px solid ${({ $active }) => $active ? '#00d4aa' : '#333'};
  border-radius: 20px;
  color: ${({ $active }) => $active ? '#00d4aa' : '#888'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #00d4aa;
  }
`

const LastUpdated = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin-left: 8px;
`

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 16px;
`

const NetworkBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(98, 126, 234, 0.1);
  color: #627eea;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 12px;
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.primary};
`

const PaginationInfo = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, $disabled, theme }) =>
    $disabled ? theme.colors.text.tertiary :
      $active ? '#fff' : theme.colors.text.primary};
  border: 1px solid ${({ $active, $disabled, theme }) =>
    $disabled ? theme.colors.border.primary :
      $active ? theme.colors.primary : theme.colors.border.primary};
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: ${({ $active, $disabled, theme }) =>
    $disabled ? 'transparent' :
      $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.05)'};
    border-color: ${({ $disabled, theme }) => $disabled ? theme.colors.border.primary : theme.colors.primary};
  }
`

const PageNumbers = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const PageNumber = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#fff' : theme.colors.text.secondary};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.colors.primary : 'rgba(255, 255, 255, 0.05)'};
    border-color: ${({ theme }) => theme.colors.border.primary};
  }
`

// Generate sparkline from real price data
const generateSparklineFromData = (sparklineData, isPositive) => {
  if (!sparklineData || sparklineData.length === 0) {
    // Fallback to random data
    const points = []
    let value = 50
    for (let i = 0; i < 20; i++) {
      value += (Math.random() - (isPositive ? 0.4 : 0.6)) * 10
      value = Math.max(10, Math.min(90, value))
      points.push({ x: i * 5, y: 100 - value })
    }
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  }

  // Use last 24 data points (approximately 24 hours)
  const recentData = sparklineData.slice(-24)
  const min = Math.min(...recentData)
  const max = Math.max(...recentData)
  const range = max - min || 1

  const points = recentData.map((price, i) => {
    const x = (i / (recentData.length - 1)) * 100
    const y = 100 - ((price - min) / range) * 80 - 10
    return { x, y }
  })

  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

export default function Discover() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('tokens')
  const [searchQuery, setSearchQuery] = useState('')
  const [tokenFilter, setTokenFilter] = useState('all')
  const [tokenData, setTokenData] = useState({})
  const [transactions, setTransactions] = useState([])
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [loadingTxs, setLoadingTxs] = useState(false)
  const [selectedToken, setSelectedToken] = useState(null)
  const [lastTxUpdate, setLastTxUpdate] = useState(null)
  const [lastPriceUpdate, setLastPriceUpdate] = useState(null)
  const [txError, setTxError] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('marketCap')
  const [sortDirection, setSortDirection] = useState('desc')
  const TRANSACTIONS_PER_PAGE = 25
  const autoRefreshRef = useRef(null)

  // Handle column sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  // Navigate to SwapX with token
  const handleTokenClick = (token) => {
    router.push(`/swap?token=${token.address}`)
  }

  // Fetch token prices from our API route
  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/token-prices')
      const result = await response.json()

      if (result.success) {
        setTokenData(result.data)
        setLastPriceUpdate(new Date())
      }
    } catch (err) {
      console.error('Error fetching prices:', err)
    } finally {
      setLoadingPrices(false)
    }
  }, [])

  // Fetch transactions from our API route
  const fetchTransactions = useCallback(async () => {
    setLoadingTxs(true)
    setTxError(null)

    try {
      const response = await fetch('/api/token-transactions')
      const result = await response.json()

      if (result.success) {
        // Add price values to transactions
        const txsWithValues = result.transactions.map(tx => ({
          ...tx,
          value: tx.amount * (tokenData[tx.token]?.price || 0)
        }))
        setTransactions(txsWithValues)
        setLastTxUpdate(new Date())
      } else {
        throw new Error(result.error || 'Failed to fetch transactions')
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setTxError('Failed to fetch transactions. Please try again.')
    } finally {
      setLoadingTxs(false)
    }
  }, [tokenData])

  // Initial price fetch
  useEffect(() => {
    fetchPrices()

    // Refresh prices every 60 seconds
    const priceInterval = setInterval(fetchPrices, 60000)
    return () => clearInterval(priceInterval)
  }, [fetchPrices])

  // Fetch transactions when tab changes or prices load
  useEffect(() => {
    if (activeTab === 'transactions' && Object.keys(tokenData).length > 0) {
      fetchTransactions()
    }
  }, [activeTab, tokenData, fetchTransactions])

  // Auto-refresh transactions
  useEffect(() => {
    if (autoRefresh && activeTab === 'transactions') {
      autoRefreshRef.current = setInterval(() => {
        fetchTransactions()
      }, 30000) // Every 30 seconds
    } else {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current)
      }
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current)
      }
    }
  }, [autoRefresh, activeTab, fetchTransactions])

  const formatPrice = (price) => {
    if (!price || price === 0) return '$0.00'
    if (price < 0.00000001) return `$${price.toExponential(2)}`
    if (price < 0.0001) return `$${price.toFixed(8)}`
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatLargeNumber = (num) => {
    if (!num || num === 0) return '$0'
    if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
    return `$${num.toFixed(2)}`
  }

  const formatChange = (change) => {
    if (change === undefined || change === null) return '0.00%'
    const prefix = change >= 0 ? '▲' : '▼'
    return `${prefix} ${Math.abs(change).toFixed(2)}%`
  }

  const formatAmount = (amount) => {
    if (amount === 0) return '0'
    if (amount < 0.0001) return amount.toExponential(2)
    if (amount < 1) return amount.toFixed(6)
    if (amount < 1000) return amount.toFixed(2)
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)}B`
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(2)}M`
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(2)}K`
    return amount.toFixed(2)
  }

  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const filteredTokens = KUMA_ECOSYSTEM_TOKENS
    .filter(token =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dataA = tokenData[a.symbol] || {}
      const dataB = tokenData[b.symbol] || {}

      let valueA, valueB

      switch (sortColumn) {
        case 'token':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          return sortDirection === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA)
        case 'price':
          valueA = dataA.price || 0
          valueB = dataB.price || 0
          break
        case 'change1h':
          valueA = dataA.change1h || 0
          valueB = dataB.change1h || 0
          break
        case 'change24h':
          valueA = dataA.change24h || 0
          valueB = dataB.change24h || 0
          break
        case 'marketCap':
          valueA = dataA.fdv || dataA.marketCap || 0
          valueB = dataB.fdv || dataB.marketCap || 0
          break
        case 'volume':
          valueA = dataA.volume24h || 0
          valueB = dataB.volume24h || 0
          break
        default:
          return 0
      }

      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA
    })

  return (
    <AppContainer>
      <Header />
      <MainContent>
        <PageHeader>
          <PageTitle>Discover KumaDex</PageTitle>
          <PageDescription>
            Explore tokens in the Kuma ecosystem
            <NetworkBadge>
              <Zap size={12} />
              Ethereum Mainnet
            </NetworkBadge>
            {lastPriceUpdate && (
              <LiveIndicator>Live</LiveIndicator>
            )}
          </PageDescription>
        </PageHeader>

        {/* Featured Tokens Grid */}
        <FeaturedSection>
          <SectionLabel>Kuma Ecosystem</SectionLabel>
          <FeaturedGrid>
            {KUMA_ECOSYSTEM_TOKENS.map((token) => {
              const data = tokenData[token.symbol] || {}
              const change24h = data.change24h || 0

              return (
                <FeaturedCard
                  key={token.symbol}
                  $active={selectedToken === token.symbol}
                  onClick={() => handleTokenClick(token)}
                >
                  <FeaturedChange $isPositive={change24h >= 0}>
                    {formatChange(change24h)}
                  </FeaturedChange>
                  <FeaturedIcon>
                    <Image
                      src={token.logo}
                      alt={token.symbol}
                      width={40}
                      height={40}
                    />
                  </FeaturedIcon>
                  <FeaturedSymbol>{token.symbol}</FeaturedSymbol>
                  <FeaturedMarketCap>{formatLargeNumber(data.marketCap || data.fdv)}</FeaturedMarketCap>
                </FeaturedCard>
              )
            })}
          </FeaturedGrid>
        </FeaturedSection>

        {/* Tabs with Search */}
        <TabSearchRow>
          <SearchBar>
            <SearchWrapper>
              <SearchIconWrapper>
                <Search size={18} />
              </SearchIconWrapper>
              <SearchInput
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchWrapper>
          </SearchBar>
          <TabContainer>
            <Tab $active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')}>
              Tokens
            </Tab>
            <Tab $active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')}>
              Transactions
            </Tab>
          </TabContainer>
        </TabSearchRow>

        {/* Token Table */}
        {activeTab === 'tokens' && (
          <TableContainer>
            <TableWrapper>
              {loadingPrices ? (
                <LoadingContainer>
                  <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Loading tokens from Ethereum mainnet...
                </LoadingContainer>
              ) : (
                <TokenTable>
                  <TableHead>
                    <TableHeadRow>
                      <TableHeaderIndex>#</TableHeaderIndex>
                      <TableHeader $sortable onClick={() => handleSort('token')}>
                        <HeaderContent>
                          Token
                          <SortIndicator $active={sortColumn === 'token'}>
                            {sortColumn === 'token' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} />}
                          </SortIndicator>
                        </HeaderContent>
                      </TableHeader>
                      <TableHeader $align="right" $sortable onClick={() => handleSort('price')}>
                        <HeaderContent $align="right">
                          Price
                          <SortIndicator $active={sortColumn === 'price'}>
                            {sortColumn === 'price' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} />}
                          </SortIndicator>
                        </HeaderContent>
                      </TableHeader>
                      <TableHeader $align="right" $sortable onClick={() => handleSort('change1h')}>
                        <HeaderContent $align="right">
                          1h %
                          <SortIndicator $active={sortColumn === 'change1h'}>
                            {sortColumn === 'change1h' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} />}
                          </SortIndicator>
                        </HeaderContent>
                      </TableHeader>
                      <TableHeader $align="right" $sortable onClick={() => handleSort('change24h')}>
                        <HeaderContent $align="right">
                          24h %
                          <SortIndicator $active={sortColumn === 'change24h'}>
                            {sortColumn === 'change24h' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} />}
                          </SortIndicator>
                        </HeaderContent>
                      </TableHeader>
                      <TableHeader $align="right" $sortable onClick={() => handleSort('marketCap')}>
                        <HeaderContent $align="right">
                          Market Cap
                          <SortIndicator $active={sortColumn === 'marketCap'}>
                            {sortColumn === 'marketCap' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} />}
                          </SortIndicator>
                        </HeaderContent>
                      </TableHeader>
                      <TableHeader $align="right" $sortable onClick={() => handleSort('volume')}>
                        <HeaderContent $align="right">
                          24h Volume
                          <SortIndicator $active={sortColumn === 'volume'}>
                            {sortColumn === 'volume' ? (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} />}
                          </SortIndicator>
                        </HeaderContent>
                      </TableHeader>
                      <TableHeader $align="right">Chart</TableHeader>
                    </TableHeadRow>
                  </TableHead>
                  <TableBody>
                    {filteredTokens.map((token, index) => {
                      const data = tokenData[token.symbol] || {}
                      const change1H = data.change1h || 0
                      const change24H = data.change24h || 0
                      const isPositive1H = change1H >= 0
                      const isPositive24H = change24H >= 0

                      return (
                        <TableRow
                          key={token.symbol}
                          onClick={() => handleTokenClick(token)}
                        >
                          <TableCellIndex>{index + 1}</TableCellIndex>
                          <TableCell>
                            <TokenNameCell>
                              <TokenLogo>
                                <Image
                                  src={token.logo}
                                  alt={token.symbol}
                                  width={32}
                                  height={32}
                                />
                              </TokenLogo>
                              <TokenNameInfo>
                                <TokenNameText>{token.name}</TokenNameText>
                                <TokenSymbolText>{token.symbol}</TokenSymbolText>
                              </TokenNameInfo>
                            </TokenNameCell>
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <PriceCell>{formatPrice(data.price)}</PriceCell>
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <ChangeCell $isPositive={isPositive1H}>
                              {formatChange(change1H)}
                            </ChangeCell>
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <ChangeCell $isPositive={isPositive24H}>
                              {formatChange(change24H)}
                            </ChangeCell>
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            {formatLargeNumber(data.fdv)}
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <VolumeCell>{formatLargeNumber(data.volume24h)}</VolumeCell>
                          </TableCell>
                          <TableCell style={{ textAlign: 'right' }}>
                            <ChartCell>
                              <MiniChart viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path
                                  d={generateSparklineFromData(data.sparkline, isPositive24H)}
                                  fill="none"
                                  stroke={isPositive24H ? '#00d4aa' : '#ff6b6b'}
                                  strokeWidth="2"
                                />
                              </MiniChart>
                            </ChartCell>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </TokenTable>
              )}
            </TableWrapper>
          </TableContainer>
        )}

        {/* Transactions Table */}
        {activeTab === 'transactions' && (
          <>
            <FilterBar>
              <FilterLabel></FilterLabel>
              <FilterButton
                $active={tokenFilter === 'all'}
                onClick={() => { setTokenFilter('all'); setCurrentPage(1); }}
              >
                All
              </FilterButton>
              {KUMA_ECOSYSTEM_TOKENS.map(token => (
                <FilterButton
                  key={token.symbol}
                  $active={tokenFilter === token.symbol}
                  onClick={() => { setTokenFilter(token.symbol); setCurrentPage(1); }}
                >
                  <FilterTokenIcon>
                    <Image src={token.logo} alt={token.symbol} width={18} height={18} />
                  </FilterTokenIcon>
                  {token.symbol}
                </FilterButton>
              ))}
              <FilterButton
                $active={tokenFilter === 'BREEDER'}
                onClick={() => { setTokenFilter('BREEDER'); setCurrentPage(1); }}
              >
                <FilterTokenIcon>
                  <Image src="/breederlogos/kuma.png" alt="Breeder" width={18} height={18} />
                </FilterTokenIcon>
                Breeder
              </FilterButton>
              <AutoRefreshToggle
                $active={autoRefresh}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Zap size={14} />
                Auto
              </AutoRefreshToggle>
              <RefreshTxButton
                onClick={fetchTransactions}
                disabled={loadingTxs}
                $loading={loadingTxs}
              >
                <RefreshCw size={14} />
                Refresh
              </RefreshTxButton>
              {lastTxUpdate && (
                <LastUpdated>
                  Updated {formatTime(lastTxUpdate.getTime())}
                </LastUpdated>
              )}
            </FilterBar>

            {txError && (
              <ErrorBanner>
                <ExternalLink size={16} />
                {txError}
              </ErrorBanner>
            )}

            <TableContainer>
              <TableWrapper>
                {loadingTxs ? (
                  <LoadingContainer>
                    <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Loading transactions from Ethereum mainnet...
                  </LoadingContainer>
                ) : transactions.length === 0 ? (
                  <EmptyState>
                    No recent transactions found.
                    <br />
                    <span style={{ fontSize: '13px', marginTop: '8px', display: 'block' }}>
                      Click Refresh to fetch the latest transactions from Etherscan.
                    </span>
                  </EmptyState>
                ) : (() => {
                  // Filter transactions first
                  const filteredTxs = transactions.filter(tx => {
                    if (tokenFilter === 'all') return true
                    if (tokenFilter === 'BREEDER') return tx.type === 'breeder'
                    return tx.token === tokenFilter
                  })

                  // Pagination calculations
                  const totalPages = Math.ceil(filteredTxs.length / TRANSACTIONS_PER_PAGE)
                  const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE
                  const endIndex = startIndex + TRANSACTIONS_PER_PAGE
                  const paginatedTxs = filteredTxs.slice(startIndex, endIndex)

                  return (
                    <>
                      <TokenTable>
                        <TableHead>
                          <TableHeadRow>
                            <TableHeader>Type</TableHeader>
                            <TableHeader>Token</TableHeader>
                            <TableHeader $align="right">Amount</TableHeader>
                            <TableHeader $align="right">Value</TableHeader>
                            <TableHeader>Wallet</TableHeader>
                            <TableHeader $align="right">Time</TableHeader>
                          </TableHeadRow>
                        </TableHead>
                        <TableBody>
                          {paginatedTxs.map((tx) => {
                            const getTypeDisplay = () => {
                              switch (tx.type) {
                                case 'buy':
                                  return { icon: <ArrowDownLeft size={14} />, label: 'Buy' }
                                case 'sell':
                                  return { icon: <ArrowUpRight size={14} />, label: 'Sell' }
                                case 'breeder':
                                  return { icon: <Layers size={14} />, label: tx.action || 'Breeder' }
                                case 'transfer':
                                default:
                                  return { icon: <Repeat size={14} />, label: 'Transfer' }
                              }
                            }

                            const typeDisplay = getTypeDisplay()
                            const amountColor = tx.type === 'buy' ? '#00d4aa' :
                              tx.type === 'sell' ? '#ff6b6b' :
                                tx.type === 'breeder' ? '#ff007a' : '#888'

                            return (
                              <TxTableRow key={tx.hash + tx.token}>
                                <TableCell>
                                  <TxTypeCell $type={tx.type}>
                                    <TxIcon $type={tx.type}>
                                      {typeDisplay.icon}
                                    </TxIcon>
                                    {typeDisplay.label}
                                  </TxTypeCell>
                                </TableCell>
                                <TableCell>
                                  <TokenNameCell>
                                    <TokenLogo>
                                      <Image
                                        src={tx.tokenLogo}
                                        alt={tx.token}
                                        width={32}
                                        height={32}
                                      />
                                    </TokenLogo>
                                    <TokenNameInfo>
                                      <TokenNameText>{tx.type === 'breeder' ? tx.tokenName : tx.token}</TokenNameText>
                                      <TxLink
                                        href={`https://etherscan.io/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {formatAddress(tx.hash)}
                                      </TxLink>
                                    </TokenNameInfo>
                                  </TokenNameCell>
                                </TableCell>
                                <TableCell style={{ textAlign: 'right', color: amountColor }}>
                                  {tx.type === 'buy' ? '+' : tx.type === 'sell' ? '-' : ''}{formatAmount(tx.amount)} {tx.type !== 'breeder' ? tx.token : 'ETH'}
                                </TableCell>
                                <TableCell style={{ textAlign: 'right' }}>
                                  {tx.value > 0 ? formatPrice(tx.value) : '-'}
                                </TableCell>
                                <TableCell>
                                  <TxLink
                                    href={`https://etherscan.io/address/${tx.from}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {formatAddress(tx.from)}
                                  </TxLink>
                                </TableCell>
                                <TableCell style={{ textAlign: 'right', color: '#888' }}>
                                  {formatTime(tx.timestamp)}
                                </TableCell>
                              </TxTableRow>
                            )
                          })}
                        </TableBody>
                      </TokenTable>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <PaginationContainer>
                          <PaginationInfo>
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredTxs.length)} of {filteredTxs.length}
                          </PaginationInfo>
                          <PageNumbers>
                            <PaginationButton
                              $disabled={currentPage === 1}
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft size={16} />
                              Prev
                            </PaginationButton>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }
                              return (
                                <PageNumber
                                  key={pageNum}
                                  $active={currentPage === pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                >
                                  {pageNum}
                                </PageNumber>
                              )
                            })}
                            <PaginationButton
                              $disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                              <ChevronRight size={16} />
                            </PaginationButton>
                          </PageNumbers>
                        </PaginationContainer>
                      )}
                    </>
                  )
                })()}
              </TableWrapper>
            </TableContainer>
          </>
        )}
      </MainContent>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppContainer>
  )
}
