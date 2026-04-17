import Header from '../src/components/Header'
import SwapInterface from '../src/components/SwapInterface'
import CoachMarks from '../src/components/CoachMarks'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, AlertTriangle } from 'react-feather'

// Coach mark steps for KumaDex perpetuals trading
const KUMADEX_COACH_STEPS = [
  {
    target: '#kumadex-swap-interface',
    title: 'Execute Your Trade',
    description: 'Enter your trade amount, review the details, and execute. Connect your wallet to start trading with leverage on Kuma ecosystem tokens.',
    placement: 'bottom'
  },
  {
    target: '#kumadex-leverage',
    title: 'Set Your Leverage',
    description: 'Adjust leverage from 1x to 25x using the slider or quick buttons. Higher leverage means higher potential gains but also higher risk of liquidation.',
    placement: 'top'
  },
  {
    target: '#kumadex-pool-selector',
    title: 'Select Your Trading Pool',
    description: 'Choose from Kuma ecosystem tokens to trade with leverage. Each pool is backed by Kuma Breeder staking rewards.',
    placement: 'top'
  },
  {
    target: '#kumadex-pool-header',
    title: 'Filter Pool Types',
    description: 'Switch between All pools, Single tokens (KUMA, SHIB, etc.), or LP tokens (KUMA-ETH, SHIB-ETH) for different trading strategies.',
    placement: 'bottom'
  }
]

// Breeder pool tokens available for perps trading
const BREEDER_POOL_OPTIONS = [
  { symbol: 'KUMA', name: 'Kuma Inu', logo: '/breederlogos/kuma.png', poolId: 12, allocPoint: 2000, isLP: false, address: '0x48C276e8d03813224bb1e55F953adB6d02FD3E02' },
  { symbol: 'dKUMA', name: 'dKuma', logo: '/breederlogos/dkuma.png', poolId: null, allocPoint: null, isLP: false, address: '0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8' },
  { symbol: 'KUMA-ETH', name: 'KUMA-ETH LP', logo: '/breederlogos/kuma.png', poolId: 13, allocPoint: 1000, isLP: true, address: '0x48C276e8d03813224bb1e55F953adB6d02FD3E02' },
  { symbol: 'dKUMA-ETH', name: 'dKUMA-ETH LP', logo: '/breederlogos/dkuma.png', poolId: 6, allocPoint: 1500, isLP: true, address: '0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8' },
  { symbol: 'SHIB', name: 'Shiba Inu', logo: '/breederlogos/shib.png', poolId: 2, allocPoint: 50, isLP: false, address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
  { symbol: 'SHIB-ETH', name: 'SHIB-ETH LP', logo: '/breederlogos/shib.png', poolId: 8, allocPoint: 100, isLP: true, address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
  { symbol: 'LEASH', name: 'Doge Killer', logo: '/breederlogos/leash.png', poolId: 3, allocPoint: 50, isLP: false, address: '0x27C70Cd1946795B66be9d954418546998b546634' },
  { symbol: 'LEASH-ETH', name: 'LEASH-ETH LP', logo: '/breederlogos/leash.png', poolId: 9, allocPoint: 100, isLP: true, address: '0x27C70Cd1946795B66be9d954418546998b546634' },
  { symbol: 'AKITA', name: 'Akita Inu', logo: '/breederlogos/akita.png', poolId: 4, allocPoint: 5, isLP: false, address: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6' },
  { symbol: 'AKITA-ETH', name: 'AKITA-ETH LP', logo: '/breederlogos/akita.png', poolId: 10, allocPoint: 5, isLP: true, address: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6' },
  { symbol: 'ELON', name: 'Dogelon Mars', logo: '/breederlogos/elon.png', poolId: 5, allocPoint: 5, isLP: false, address: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3' },
  { symbol: 'ELON-ETH', name: 'ELON-ETH LP', logo: '/breederlogos/elon.png', poolId: 11, allocPoint: 1, isLP: true, address: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3' },
];

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
`

const MainContent = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  padding: 40px 48px;
  gap: 24px;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: flex-start;
  }

  @media (max-width: 768px) {
    padding: 40px 24px;
  }

  @media (max-width: 480px) {
    padding: 20px 16px;
    align-items: center;
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

  @media (max-width: 1024px) {
    min-height: 400px;
  }
`

const ChartContainer = styled.div`
  background: #1a1f2e;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.large};
  flex: 1;
  min-height: 400px;
  width: 100%;
  position: relative;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% + 40px);
    border: none;
  }
`

const ChartOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 12px;
  z-index: 10;
  pointer-events: none;
`

const PriceIndicator = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(13, 13, 13, 0.9);
  border-radius: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  pointer-events: auto;
`

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const PriceDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`

const PriceLabel = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  min-width: 70px;
`

const PriceValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $color, theme }) => $color || theme.colors.text.primary};
`

const LeverageContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: 12px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
`

const LeverageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const LeverageTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

const LeverageValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary};
`

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
`

const Slider = styled.input`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.background.interactive};
  border-radius: 3px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 50%;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const QuickLeverageButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
`

const QuickLeverageButton = styled.button`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.secondary : theme.colors.background.interactive};
  color: ${({ $active, theme }) =>
    $active ? '#000000' : theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    color: #000000;
  }
`

const LiquidationInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 104, 113, 0.1);
  border: 1px solid rgba(255, 104, 113, 0.3);
  border-radius: 8px;
  margin-top: 4px;
`

const LiquidationRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const LiquidationLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    color: #FF6871;
  }
`

const LiquidationValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #FF6871;
`

const LiquidationDistance = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`

const PositionButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
  width: 100%;
`

const PositionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${({ $type }) => $type === 'long' ? `
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);

    &:hover {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
      box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  ` : `
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);

    &:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

const PositionIcon = styled.span`
  font-size: 14px;
`

const PoolSelectorContainer = styled.div`
  background: #1a1f2e;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 16px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.large};
`

const PoolSelectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const PoolSelectorTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`

const PoolTypeTabs = styled.div`
  display: flex;
  gap: 8px;
`

const PoolHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  padding: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.background.interactive};
  }
`

const PoolTypeTab = styled.button`
  background: ${({ $active }) =>
    $active ? '#4d2a52' : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? '#ffffff' : theme.colors.text.secondary};
  border: 1px solid ${({ $active, theme }) =>
    $active ? '#4d2a52' : theme.colors.border.primary};
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4d2a52;
    color: ${({ $active }) => $active ? '#ffffff' : '#4d2a52'};
  }
`

const PoolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const PoolOption = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: ${({ $active, theme }) =>
    $active ? 'rgba(77, 42, 82, 0.4)' : theme.colors.background.module};
  border: 1px solid ${({ $active, theme }) =>
    $active ? '#4d2a52' : theme.colors.border.primary};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4d2a52;
    background: rgba(77, 42, 82, 0.3);
  }
`

const PoolTokenIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.interactive};
  overflow: hidden;
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

const PoolTokenSymbol = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

// Brand Logo Components
const BrandLogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
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
  background: linear-gradient(135deg, #f7931a, #c77b15);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  padding-top: 2px;
  border-top: 2px solid #f7931a;
  display: inline-block;
`

// Format price based on magnitude
const formatPrice = (price) => {
  if (!price || price === 0) return '-';
  if (price < 0.000001) return price.toExponential(4);
  if (price < 0.01) return price.toFixed(8);
  if (price < 1) return price.toFixed(6);
  if (price < 1000) return price.toFixed(4);
  return price.toFixed(2);
};

export default function KumaDex() {
  const [leverage, setLeverage] = useState(1);
  const [selectedPool, setSelectedPool] = useState(BREEDER_POOL_OPTIONS[0]);
  const [poolFilter, setPoolFilter] = useState('all'); // 'all', 'single', 'lp'
  const [isPoolsExpanded, setIsPoolsExpanded] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const quickLeverageOptions = [3, 5, 10, 25];
  const INITIAL_POOLS_SHOWN = 8; // 2 rows of 4

  // Fetch current price from DexScreener
  useEffect(() => {
    const fetchPrice = async () => {
      setPriceLoading(true);
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${selectedPool.address}`);
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
          // Get the highest liquidity Ethereum pair
          const ethPair = data.pairs
            .filter(p => p.chainId === 'ethereum')
            .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

          if (ethPair) {
            setCurrentPrice(parseFloat(ethPair.priceUsd));
          }
        }
      } catch (error) {
        console.error('Error fetching price:', error);
      }
      setPriceLoading(false);
    };

    fetchPrice();
    // Refresh price every 15 seconds
    const interval = setInterval(fetchPrice, 15000);
    return () => clearInterval(interval);
  }, [selectedPool]);

  // Calculate liquidation prices (assuming long position)
  // Liquidation Price (Long) = Entry Price × (1 - 1/Leverage + Maintenance Margin)
  // Using ~0.5% maintenance margin
  const maintenanceMargin = 0.005;
  const liquidationPriceLong = currentPrice ? currentPrice * (1 - (1 / leverage) + maintenanceMargin) : null;
  const liquidationPriceShort = currentPrice ? currentPrice * (1 + (1 / leverage) - maintenanceMargin) : null;

  // Calculate distance to liquidation as percentage
  const liquidationDistanceLong = currentPrice && liquidationPriceLong
    ? ((currentPrice - liquidationPriceLong) / currentPrice * 100).toFixed(2)
    : null;
  const liquidationDistanceShort = currentPrice && liquidationPriceShort
    ? ((liquidationPriceShort - currentPrice) / currentPrice * 100).toFixed(2)
    : null;

  const handleLeverageChange = (event) => {
    const value = parseInt(event.target.value);
    setLeverage(Math.min(value, 25)); // Ensure maximum leverage is 25x
  };

  const handleQuickLeverage = (value) => {
    setLeverage(value);
  };

  const handlePoolSelect = (pool) => {
    setSelectedPool(pool);
  };

  // Filter pools based on selected tab
  const allFilteredPools = BREEDER_POOL_OPTIONS.filter(pool => {
    if (poolFilter === 'single') return !pool.isLP;
    if (poolFilter === 'lp') return pool.isLP;
    return true;
  });

  // Show limited pools unless expanded
  const filteredPools = isPoolsExpanded
    ? allFilteredPools
    : allFilteredPools.slice(0, INITIAL_POOLS_SHOWN);

  const hasMorePools = allFilteredPools.length > INITIAL_POOLS_SHOWN;

  // Get chart URL based on selected pool's token address
  const getChartUrl = (pool) => {
    return `https://dexscreener.com/ethereum/${pool.address}?embed=1&theme=dark&trades=0&info=0&chartLeftToolbar=0&chartTheme=dark&chartStyle=1&chartType=usd&interval=15&chartTimescalesEnabled=0&chartToolbar=0`
  }

  return (
    <AppContainer>
      <Header />
      <MainContent>
        <LeftColumn>
          <div id="kumadex-swap-interface" style={{ width: '100%' }}>
          <SwapInterface
            leverage={leverage}
            selectedPool={selectedPool}
            hideChainSelector={true}
            leverageControls={
              <LeverageContainer id="kumadex-leverage">
                <LeverageHeader>
                  <LeverageTitle>Leverage</LeverageTitle>
                  <LeverageValue>{leverage}x</LeverageValue>
                </LeverageHeader>

                <SliderContainer>
                  <Slider
                    type="range"
                    min="1"
                    max="25"
                    value={leverage}
                    onChange={handleLeverageChange}
                  />
                  <SliderLabels>
                    <span>1x</span>
                    <span>25x</span>
                  </SliderLabels>
                </SliderContainer>

                <QuickLeverageButtons>
                  {quickLeverageOptions.map((option) => (
                    <QuickLeverageButton
                      key={option}
                      $active={leverage === option}
                      onClick={() => handleQuickLeverage(option)}
                    >
                      {option}x
                    </QuickLeverageButton>
                  ))}
                </QuickLeverageButtons>

                {leverage > 1 && currentPrice && (
                  <LiquidationInfo>
                    <LiquidationRow>
                      <LiquidationLabel>
                        <AlertTriangle size={14} />
                        Liq. Price (Long)
                      </LiquidationLabel>
                      <div style={{ textAlign: 'right' }}>
                        <LiquidationValue>${formatPrice(liquidationPriceLong)}</LiquidationValue>
                        <LiquidationDistance> (-{liquidationDistanceLong}%)</LiquidationDistance>
                      </div>
                    </LiquidationRow>
                    <LiquidationRow>
                      <LiquidationLabel>
                        <AlertTriangle size={14} />
                        Liq. Price (Short)
                      </LiquidationLabel>
                      <div style={{ textAlign: 'right' }}>
                        <LiquidationValue>${formatPrice(liquidationPriceShort)}</LiquidationValue>
                        <LiquidationDistance> (+{liquidationDistanceShort}%)</LiquidationDistance>
                      </div>
                    </LiquidationRow>
                  </LiquidationInfo>
                )}

                <PositionButtonsContainer>
                  <PositionButton $type="long">
                    <PositionIcon>↗</PositionIcon>
                    Long
                  </PositionButton>
                  <PositionButton $type="short">
                    <PositionIcon>↘</PositionIcon>
                    Short
                  </PositionButton>
                </PositionButtonsContainer>
              </LeverageContainer>
            }
          />
          </div>

          {/* Breeder Pool Selector - Below Swap Card */}
          <PoolSelectorContainer id="kumadex-pool-selector">
            <PoolSelectorHeader id="kumadex-pool-header">
              <PoolSelectorTitle>Select Breeder Pool</PoolSelectorTitle>
              <PoolHeaderRight>
                <PoolTypeTabs>
                  <PoolTypeTab
                    $active={poolFilter === 'all'}
                    onClick={() => setPoolFilter('all')}
                  >
                    All
                  </PoolTypeTab>
                  <PoolTypeTab
                    $active={poolFilter === 'single'}
                    onClick={() => setPoolFilter('single')}
                  >
                    Single
                  </PoolTypeTab>
                  <PoolTypeTab
                    $active={poolFilter === 'lp'}
                    onClick={() => setPoolFilter('lp')}
                  >
                    LP
                  </PoolTypeTab>
                </PoolTypeTabs>
                {hasMorePools && (
                  <ExpandButton
                    onClick={() => setIsPoolsExpanded(!isPoolsExpanded)}
                    title={isPoolsExpanded ? 'Show less' : 'Show more'}
                  >
                    {isPoolsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </ExpandButton>
                )}
              </PoolHeaderRight>
            </PoolSelectorHeader>

            <PoolGrid>
              {filteredPools.map((pool) => (
                <PoolOption
                  key={pool.symbol}
                  $active={selectedPool.symbol === pool.symbol}
                  onClick={() => handlePoolSelect(pool)}
                >
                  <PoolTokenIcon>
                    <Image
                      src={pool.logo}
                      alt={pool.symbol}
                      width={32}
                      height={32}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </PoolTokenIcon>
                  <PoolTokenSymbol>{pool.symbol}</PoolTokenSymbol>
                </PoolOption>
              ))}
            </PoolGrid>
          </PoolSelectorContainer>
        </LeftColumn>

        <RightColumn>
          <ChartContainer>
            <iframe
              key={selectedPool.address}
              src={getChartUrl(selectedPool)}
              title={`${selectedPool.symbol} Chart`}
              allow="clipboard-write"
              allowFullScreen
            />
            {leverage > 1 && currentPrice && (
              <ChartOverlay>
                <PriceIndicator>
                  <PriceRow>
                    <PriceDot $color="#22c55e" />
                    <PriceLabel>Entry Price</PriceLabel>
                    <PriceValue>${formatPrice(currentPrice)}</PriceValue>
                  </PriceRow>
                  <PriceRow>
                    <PriceDot $color="#FF6871" />
                    <PriceLabel>Liq. (Long)</PriceLabel>
                    <PriceValue $color="#FF6871">${formatPrice(liquidationPriceLong)}</PriceValue>
                  </PriceRow>
                  <PriceRow>
                    <PriceDot $color="#f97316" />
                    <PriceLabel>Liq. (Short)</PriceLabel>
                    <PriceValue $color="#f97316">${formatPrice(liquidationPriceShort)}</PriceValue>
                  </PriceRow>
                </PriceIndicator>
              </ChartOverlay>
            )}
          </ChartContainer>
        </RightColumn>
      </MainContent>

      <CoachMarks
        id="kumadex-perps"
        welcomeTitle="Welcome to KumaDex Perpetuals"
        welcomeDescription="Trade Kuma ecosystem tokens with up to 25x leverage. Select your pool, set your leverage, and start trading!"
        welcomeLogo="/breederlogos/kuma.png"
        steps={KUMADEX_COACH_STEPS}
      />
    </AppContainer>
  )
}