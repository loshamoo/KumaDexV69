import styled from 'styled-components';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Send, ShoppingBag, RotateCcw, RefreshCw, ExternalLink, Loader, Plus, ChevronDown } from 'react-feather';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACTS } from '../config/contracts';
import Image from 'next/image';

// ERC20 ABI for balance calls (read-only)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
];

// Tokens to display in portfolio
const PORTFOLIO_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, logo: '/breederlogos/eth.png', coingeckoId: 'ethereum' },
  { symbol: 'KUMA', name: 'Kuma Inu', address: CONTRACTS.TOKENS.KUMA, decimals: 18, logo: '/breederlogos/kuma.png', coingeckoId: 'kuma-inu' },
  { symbol: 'dKUMA', name: 'dKuma', address: CONTRACTS.TOKENS.dKUMA, decimals: 18, logo: '/breederlogos/dkuma.png', coingeckoId: null },
  { symbol: 'USDC', name: 'USD Coin', address: CONTRACTS.TOKENS.USDC, decimals: 6, logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', coingeckoId: 'usd-coin' },
  { symbol: 'USDT', name: 'Tether', address: CONTRACTS.TOKENS.USDT, decimals: 6, logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', coingeckoId: 'tether' },
  { symbol: 'SHIB', name: 'Shiba Inu', address: CONTRACTS.TOKENS.SHIB, decimals: 18, logo: '/breederlogos/shib.png', coingeckoId: 'shiba-inu' },
  { symbol: 'LEASH', name: 'Doge Killer', address: CONTRACTS.TOKENS.LEASH, decimals: 18, logo: '/breederlogos/leash.png', coingeckoId: 'leash' },
  { symbol: 'WETH', name: 'Wrapped ETH', address: CONTRACTS.TOKENS.WETH, decimals: 18, logo: '/breederlogos/eth.png', coingeckoId: 'ethereum' },
];

const ETHERSCAN_API_KEY = 'YourApiKeyToken'; // Replace with actual key or use env variable

const PortfolioContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const WalletHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const WalletIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  overflow: hidden;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WalletName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
`;

const WalletAddress = styled.a`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const VerificationIcon = styled(Check)`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.success || '#00d4aa'};
`;

const SUPPORTED_CHAINS = [
  { id: 'eth', name: 'Ethereum', abbr: 'ETH', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', color: '#627eea' },
  { id: 'sol', name: 'Solana', abbr: 'SOL', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', color: '#9945ff' },
  { id: 'polygon', name: 'Polygon', abbr: 'MATIC', logo: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', color: '#8247e5' },
  { id: 'bnb', name: 'BNB Chain', abbr: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', color: '#f3ba2f' },
  { id: 'avax', name: 'Avalanche', abbr: 'AVAX', logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', color: '#e84142' },
  { id: 'arb', name: 'Arbitrum', abbr: 'ARB', logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg', color: '#28a0f0' },
  { id: 'ftm', name: 'Fantom', abbr: 'FTM', logo: 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png', color: '#1969ff' },
];

const ChainSelectorContainer = styled.div`
  position: relative;
`;

const NetworkBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ $color }) => $color ? `${$color}15` : 'rgba(0, 212, 170, 0.1)'};
  border: 1px solid ${({ $color }) => $color ? `${$color}40` : 'rgba(0, 212, 170, 0.3)'};
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${({ $color }) => $color ? `${$color}35` : 'rgba(0, 212, 170, 0.3)'};
    transform: translateY(-1px);
  }
`;

const ChainLogo = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color || '#333'};

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
`;

const ChainDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: rgb(30, 32, 36);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 8px;
  min-width: 180px;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;

const ChainOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  ${({ $active }) => $active && `
    background: rgba(255, 0, 122, 0.1);
  `}
`;

const ChainOptionLogo = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color || '#333'};

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
`;

const ChainOptionName = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const ChainOptionAbbr = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: auto;
`;

const NetworkDot = styled.div`
  width: 8px;
  height: 8px;
  background: ${({ $color }) => $color || '#00d4aa'};
  border-radius: 50%;
`;

const ConnectPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
`;

const ConnectPromptTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ConnectPromptText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 24px;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: fit-content;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PortfolioValue = styled.div`
  margin-bottom: 20px;
`;

const HoldingsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const HoldingsCard = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 28px;
  position: relative;
  overflow: visible;
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  aspect-ratio: 1.586 / 1;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(252, 114, 255, 0.15) 0%, transparent 60%);
    pointer-events: none;
    overflow: hidden;
    border-radius: 20px;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -30%;
    width: 80%;
    height: 80%;
    background: radial-gradient(circle, rgba(0, 212, 170, 0.1) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const CardChip = styled.div`
  width: 45px;
  height: 35px;
  background: linear-gradient(135deg, #d4af37 0%, #f9d423 50%, #d4af37 100%);
  border-radius: 6px;
  position: relative;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 4px;
    right: 4px;
    height: 1px;
    background: rgba(0, 0, 0, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 50%;
    width: 1px;
    background: rgba(0, 0, 0, 0.2);
  }
`;

const CardLogo = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
`;

const CardLogoText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const CardNetwork = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 9999;
`;

const CardContent = styled.div`
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const HoldingsTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HoldingsLabel = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HoldingsValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const CardAddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
`;

const CardAddress = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
`;

const HoldingsStats = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 8px;
`;

const HoldingsStat = styled.div``;

const ChangeValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isPositive }) => $isPositive ? '#00d4aa' : '#ff6b6b'};
  text-shadow: 0 0 20px ${({ $isPositive }) => $isPositive ? 'rgba(0, 212, 170, 0.5)' : 'rgba(255, 107, 107, 0.5)'};
`;

const BreakdownCard = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

const BreakdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TimelineTabs = styled.div`
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 8px;
`;

const TimelineTab = styled.button`
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => $active ? 'rgba(252, 114, 255, 0.2)' : 'transparent'};
  color: ${({ $active, theme }) => $active ? '#fc72ff' : theme.colors.text.secondary};

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(252, 114, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    color: ${({ $active, theme }) => $active ? '#fc72ff' : theme.colors.text.primary};
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  min-height: 140px;
  position: relative;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 140px;
`;

const ChartGrowthInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const GrowthLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const GrowthValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $isPositive }) => $isPositive ? '#00d4aa' : '#ff6b6b'};
`;

const BreakdownContent = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const DonutContainer = styled.div`
  width: 120px;
  height: 120px;
  flex-shrink: 0;
`;

const LegendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const LegendText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const LegendValue = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ValueAmount = styled.div`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const ValueChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ $isPositive }) => $isPositive ? '#00d4aa' : '#ff6b6b'};
  font-size: 16px;
  font-weight: 500;
`;

const ActionButton = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background.tertiary || theme.colors.background.secondary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ color }) => color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ActionLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SectionContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const SectionSubtitle = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

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
`;

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
`;

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
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenIconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.interactive};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    border-radius: 50%;
  }
`;

const TokenDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const TokenName = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TokenSymbol = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TransactionRow = styled.div`
  display: grid;
  grid-template-columns: auto 2fr 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 600px) {
    grid-template-columns: auto 1fr 1fr;

    > div:nth-child(3) {
      display: none;
    }
  }
`;

const TxIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $type }) =>
    $type === 'in' ? 'rgba(0, 212, 170, 0.1)' :
    $type === 'out' ? 'rgba(255, 107, 107, 0.1)' :
    'rgba(255, 255, 255, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $type }) =>
    $type === 'in' ? '#00d4aa' :
    $type === 'out' ? '#ff6b6b' :
    '#888'};
`;

const TxDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TxType = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TxHash = styled.a`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const TxTime = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TxValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ $type, theme }) =>
    $type === 'in' ? '#00d4aa' :
    $type === 'out' ? '#ff6b6b' :
    theme.colors.text.primary};
  text-align: right;
`;

const TIMELINE_OPTIONS = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

// Generate mock chart data based on timeline
const generateChartData = (currentValue, timeline) => {
  const points = timeline === '1D' ? 24 : timeline === '1W' ? 7 : timeline === '1M' ? 30 : timeline === '3M' ? 90 : timeline === '1Y' ? 365 : 730;
  const volatility = timeline === '1D' ? 0.02 : timeline === '1W' ? 0.05 : timeline === '1M' ? 0.1 : timeline === '3M' ? 0.15 : 0.25;
  const trend = 0.0003; // Slight upward trend

  const data = [];
  let value = currentValue * (1 - volatility * (Math.random() * 0.5 + 0.5));

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.48) * volatility * currentValue / points;
    value = Math.max(value + change + (currentValue * trend), currentValue * 0.5);
    data.push(value);
  }

  // Ensure last point is close to current value
  data[data.length - 1] = currentValue;

  return data;
};

const Portfolio = () => {
  const { isConnected, account, web3, chainId } = useWeb3();
  const [balances, setBalances] = useState({});
  const [prices, setPrices] = useState({});
  const [priceChanges, setPriceChanges] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [selectedChain, setSelectedChain] = useState(SUPPORTED_CHAINS[0]);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [chartTimeline, setChartTimeline] = useState('1M');
  const [chartData, setChartData] = useState([]);
  const chainDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chainDropdownRef.current && !chainDropdownRef.current.contains(event.target)) {
        setChainDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [totalChange, setTotalChange] = useState(0);
  const [totalChangeValue, setTotalChangeValue] = useState(0);

  // Generate chart data when totalValue or timeline changes
  useEffect(() => {
    if (totalValue > 0) {
      setChartData(generateChartData(totalValue, chartTimeline));
    }
  }, [totalValue, chartTimeline]);

  const isMainnet = chainId === 1;

  // Fetch token prices from CoinGecko
  const fetchPrices = useCallback(async () => {
    try {
      const ids = PORTFOLIO_TOKENS
        .filter(t => t.coingeckoId)
        .map(t => t.coingeckoId)
        .join(',');

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      const data = await response.json();

      const priceMap = {};
      const changeMap = {};
      PORTFOLIO_TOKENS.forEach(token => {
        if (token.coingeckoId && data[token.coingeckoId]) {
          priceMap[token.symbol] = data[token.coingeckoId].usd;
          changeMap[token.symbol] = data[token.coingeckoId].usd_24h_change || 0;
        }
      });

      // Estimate dKUMA price (can be fetched from LP if available)
      priceMap['dKUMA'] = priceMap['dKUMA'] || 0.00002;
      changeMap['dKUMA'] = changeMap['dKUMA'] || 0;

      setPrices(priceMap);
      setPriceChanges(changeMap);
      return priceMap;
    } catch (err) {
      console.error('Error fetching prices:', err);
      return {};
    }
  }, []);

  // Fetch token balances
  const fetchBalances = useCallback(async () => {
    if (!account || !web3) return;

    setLoadingBalances(true);
    try {
      const newBalances = {};
      const currentPrices = Object.keys(prices).length > 0 ? prices : await fetchPrices();

      for (const token of PORTFOLIO_TOKENS) {
        try {
          let balance;
          if (token.address === null) {
            // ETH balance
            const ethBalance = await web3.eth.getBalance(account);
            balance = parseFloat(web3.utils.fromWei(ethBalance, 'ether'));
          } else {
            // ERC20 balance
            const tokenContract = new web3.eth.Contract(ERC20_ABI, token.address);
            const rawBalance = await tokenContract.methods.balanceOf(account).call();
            const divisor = Math.pow(10, token.decimals);
            balance = parseFloat(rawBalance) / divisor;
          }

          const price = currentPrices[token.symbol] || 0;
          const value = balance * price;

          newBalances[token.symbol] = {
            balance,
            price,
            value,
          };
        } catch (err) {
          console.warn(`Failed to fetch ${token.symbol} balance:`, err.message);
          newBalances[token.symbol] = { balance: 0, price: 0, value: 0 };
        }
      }

      setBalances(newBalances);

      // Calculate total portfolio value
      const total = Object.values(newBalances).reduce((sum, t) => sum + (t.value || 0), 0);
      setTotalValue(total);

      // Calculate total change (weighted average of price changes)
      let weightedChange = 0;
      let changeValue = 0;
      Object.entries(newBalances).forEach(([symbol, data]) => {
        if (data.value > 0 && priceChanges[symbol]) {
          const weight = data.value / total;
          weightedChange += weight * priceChanges[symbol];
          changeValue += data.value * (priceChanges[symbol] / 100);
        }
      });
      setTotalChange(weightedChange);
      setTotalChangeValue(changeValue);
    } catch (err) {
      console.error('Error fetching balances:', err);
    } finally {
      setLoadingBalances(false);
    }
  }, [account, web3, prices, priceChanges, fetchPrices]);

  // Fetch transactions from Etherscan
  const fetchTransactions = useCallback(async () => {
    if (!account) return;

    setLoadingTxs(true);
    try {
      // Fetch normal transactions
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${ETHERSCAN_API_KEY}`
      );
      const data = await response.json();

      if (data.status === '1' && Array.isArray(data.result)) {
        const formattedTxs = data.result.map(tx => {
          const isIncoming = tx.to.toLowerCase() === account.toLowerCase();
          const value = parseFloat(tx.value) / 1e18;

          return {
            hash: tx.hash,
            type: isIncoming ? 'in' : 'out',
            from: tx.from,
            to: tx.to,
            value: value,
            timestamp: parseInt(tx.timeStamp) * 1000,
            gasUsed: tx.gasUsed,
            gasPrice: tx.gasPrice,
            isError: tx.isError === '1',
          };
        });

        setTransactions(formattedTxs);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoadingTxs(false);
    }
  }, [account]);

  // Initial data fetch
  useEffect(() => {
    if (isConnected && account && web3) {
      fetchPrices().then(() => {
        fetchBalances();
      });
      fetchTransactions();
    }
  }, [isConnected, account, web3, chainId]);

  // Refresh all data
  const handleRefresh = () => {
    fetchPrices().then(() => {
      fetchBalances();
    });
    fetchTransactions();
  };

  const formatBalance = (balance, symbol) => {
    if (balance === 0) return '0';
    if (balance < 0.0001) return balance.toExponential(2);
    if (balance < 1) return balance.toFixed(6);
    if (balance < 1000) return balance.toFixed(4);
    return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatUSD = (value) => {
    if (value === 0) return '$0.00';
    if (value < 0.01) return '<$0.01';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return '$0.00';
    if (price < 0.00001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  };

  // Filter tokens with non-zero balances for display
  const tokensWithBalance = PORTFOLIO_TOKENS.filter(
    token => balances[token.symbol]?.balance > 0
  );

  const allTokens = PORTFOLIO_TOKENS.map(token => ({
    ...token,
    balance: balances[token.symbol]?.balance || 0,
    price: balances[token.symbol]?.price || prices[token.symbol] || 0,
    value: balances[token.symbol]?.value || 0,
  })).sort((a, b) => b.value - a.value);

  // Show all features even when not connected, just with 0 balances
  const displayAccount = account || '0x0000000000000000000000000000000000000000';

  return (
    <PortfolioContainer>
      {/* Holdings Overview Cards */}
      <HoldingsRow>
        <HoldingsCard>
          <CardLogo>
            <Image
              src="/breederlogos/kuma.png"
              alt="KumaDex"
              width={28}
              height={28}
              style={{ borderRadius: '50%' }}
            />
            <CardLogoText>KumaDex</CardLogoText>
          </CardLogo>

          <CardNetwork ref={chainDropdownRef}>
            <NetworkBadge
              $color={selectedChain.color}
              onClick={(e) => {
                e.stopPropagation();
                setChainDropdownOpen(!chainDropdownOpen);
              }}
            >
              <ChainLogo $color={selectedChain.color}>
                <Image
                  src={selectedChain.logo}
                  alt={selectedChain.name}
                  width={20}
                  height={20}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </ChainLogo>
              {selectedChain.abbr}
              <ChevronDown size={14} style={{ marginLeft: '4px', transform: chainDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
            </NetworkBadge>
            {chainDropdownOpen && (
              <ChainDropdown>
                {SUPPORTED_CHAINS.map((chain) => (
                  <ChainOption
                    key={chain.id}
                    $active={selectedChain.id === chain.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChain(chain);
                      setChainDropdownOpen(false);
                    }}
                  >
                    <ChainOptionLogo $color={chain.color}>
                      <Image
                        src={chain.logo}
                        alt={chain.name}
                        width={24}
                        height={24}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </ChainOptionLogo>
                    <ChainOptionName>{chain.name}</ChainOptionName>
                    <ChainOptionAbbr>{chain.abbr}</ChainOptionAbbr>
                  </ChainOption>
                ))}
              </ChainDropdown>
            )}
          </CardNetwork>

          <CardContent>
            <HoldingsLabel style={{ marginTop: '40px' }}>Balance</HoldingsLabel>
            <HoldingsValue>{formatUSD(totalValue)}</HoldingsValue>

            <HoldingsStats>
              <HoldingsStat>
                <HoldingsLabel>{tokensWithBalance.length} Token{tokensWithBalance.length !== 1 ? 's' : ''}</HoldingsLabel>
              </HoldingsStat>
              <HoldingsStat>
                <ChangeValue $isPositive={totalChange >= 0}>
                  {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
                </ChangeValue>
              </HoldingsStat>
            </HoldingsStats>

            <CardAddressRow>
              <CardAddress>
                {isConnected
                  ? `${account.slice(0, 4)} ${account.slice(4, 8)} ${account.slice(8, 12)} •••• ${account.slice(-4)}`
                  : 'Connect Wallet to View Address'
                }
              </CardAddress>
              {isConnected && (
                <a
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'rgba(255,255,255,0.6)', display: 'flex' }}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </CardAddressRow>
          </CardContent>
        </HoldingsCard>

        <BreakdownCard>
          <BreakdownHeader>
            <HoldingsTitle style={{ margin: 0 }}>Portfolio Growth</HoldingsTitle>
            <TimelineTabs>
              {TIMELINE_OPTIONS.map((option) => (
                <TimelineTab
                  key={option}
                  $active={chartTimeline === option}
                  onClick={() => setChartTimeline(option)}
                >
                  {option}
                </TimelineTab>
              ))}
            </TimelineTabs>
          </BreakdownHeader>
          <ChartContainer>
            {chartData.length > 0 && (
              <ChartSvg viewBox="0 0 400 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={chartData[chartData.length - 1] >= chartData[0] ? '#00d4aa' : '#ff6b6b'} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={chartData[chartData.length - 1] >= chartData[0] ? '#00d4aa' : '#ff6b6b'} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="35" x2="400" y2="35" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="105" x2="400" y2="105" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                {/* Area fill */}
                <path
                  d={`
                    M 0 ${140 - ((chartData[0] - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData) || 1)) * 120 - 10}
                    ${chartData.map((value, index) => {
                      const x = (index / (chartData.length - 1)) * 400;
                      const y = 140 - ((value - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData) || 1)) * 120 - 10;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L 400 140 L 0 140 Z
                  `}
                  fill="url(#chartGradient)"
                />
                {/* Line */}
                <path
                  d={`
                    M 0 ${140 - ((chartData[0] - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData) || 1)) * 120 - 10}
                    ${chartData.map((value, index) => {
                      const x = (index / (chartData.length - 1)) * 400;
                      const y = 140 - ((value - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData) || 1)) * 120 - 10;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke={chartData[chartData.length - 1] >= chartData[0] ? '#00d4aa' : '#ff6b6b'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* End point dot */}
                <circle
                  cx="400"
                  cy={140 - ((chartData[chartData.length - 1] - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData) || 1)) * 120 - 10}
                  r="4"
                  fill={chartData[chartData.length - 1] >= chartData[0] ? '#00d4aa' : '#ff6b6b'}
                />
              </ChartSvg>
            )}
          </ChartContainer>
          <ChartGrowthInfo>
            <GrowthLabel>
              {chartTimeline === '1D' ? '24h' : chartTimeline === '1W' ? '7 days' : chartTimeline === '1M' ? '30 days' : chartTimeline === '3M' ? '90 days' : chartTimeline === '1Y' ? '1 year' : 'All time'} change
            </GrowthLabel>
            {chartData.length > 0 && (
              <GrowthValue $isPositive={chartData[chartData.length - 1] >= chartData[0]}>
                {chartData[chartData.length - 1] >= chartData[0] ? '+' : ''}
                {formatUSD(chartData[chartData.length - 1] - chartData[0])} ({chartData[0] > 0 ? ((chartData[chartData.length - 1] - chartData[0]) / chartData[0] * 100).toFixed(2) : 0}%)
              </GrowthValue>
            )}
          </ChartGrowthInfo>
        </BreakdownCard>
      </HoldingsRow>

      {/* Token Balances */}
      <SectionContainer>
        <SectionHeader>
          <div>
            <SectionTitle>Tokens</SectionTitle>
            <SectionSubtitle>
              {tokensWithBalance.length} token{tokensWithBalance.length !== 1 ? 's' : ''} with balance
            </SectionSubtitle>
          </div>
          <RefreshButton
            onClick={fetchBalances}
            disabled={loadingBalances}
            $loading={loadingBalances}
            title="Refresh balances"
          >
            <RefreshCw size={18} />
          </RefreshButton>
        </SectionHeader>

        {loadingBalances && Object.keys(balances).length === 0 ? (
          <LoadingContainer>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: 12 }}>Loading balances...</span>
          </LoadingContainer>
        ) : (
          <>
            <TableHeader>
              <div>Token</div>
              <div>Price</div>
              <div>Balance</div>
              <div>Value</div>
            </TableHeader>

            {allTokens.map((token) => (
              <TokenRow key={token.symbol}>
                <TokenInfo>
                  <TokenIconWrapper>
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </TokenIconWrapper>
                  <TokenDetails>
                    <TokenName>{token.name}</TokenName>
                    <TokenSymbol>{token.symbol}</TokenSymbol>
                  </TokenDetails>
                </TokenInfo>
                <div style={{ color: '#888' }}>{formatPrice(token.price)}</div>
                <div>{formatBalance(token.balance, token.symbol)}</div>
                <div style={{ fontWeight: 500 }}>{formatUSD(token.value)}</div>
              </TokenRow>
            ))}
          </>
        )}
      </SectionContainer>

      {/* Transaction History */}
      <SectionContainer>
        <SectionHeader>
          <div>
            <SectionTitle>Recent Transactions</SectionTitle>
            <SectionSubtitle>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </SectionSubtitle>
          </div>
          <RefreshButton
            onClick={fetchTransactions}
            disabled={loadingTxs}
            $loading={loadingTxs}
            title="Refresh transactions"
          >
            <RefreshCw size={18} />
          </RefreshButton>
        </SectionHeader>

        {!isConnected ? (
          <EmptyState>
            Connect your wallet to view transaction history.
          </EmptyState>
        ) : loadingTxs && transactions.length === 0 ? (
          <LoadingContainer>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: 12 }}>Loading transactions...</span>
          </LoadingContainer>
        ) : transactions.length === 0 ? (
          <EmptyState>
            No transactions found for this wallet.
          </EmptyState>
        ) : (
          transactions.slice(0, 10).map((tx) => (
            <TransactionRow key={tx.hash}>
              <TxIcon $type={tx.type}>
                {tx.type === 'in' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </TxIcon>
              <TxDetails>
                <TxType>
                  {tx.type === 'in' ? 'Received' : 'Sent'}
                  {tx.isError && ' (Failed)'}
                </TxType>
                <TxHash
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {formatAddress(tx.hash)}
                  <ExternalLink size={10} />
                </TxHash>
              </TxDetails>
              <TxTime>{formatTime(tx.timestamp)}</TxTime>
              <TxValue $type={tx.type}>
                {tx.type === 'in' ? '+' : '-'}{tx.value.toFixed(4)} ETH
              </TxValue>
            </TransactionRow>
          ))
        )}
      </SectionContainer>
    </PortfolioContainer>
  );
};

export default Portfolio;
