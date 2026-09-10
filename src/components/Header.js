import styled from 'styled-components';
import { useRouter } from 'next/router';
import ConnectWalletButton from './ConnectWalletButton';
import { useState, useEffect, useRef } from 'react';
import priceService from '../services/priceService';
import Image from 'next/image';
import { Search, X } from 'react-feather';

// KumaDex token logo mapping - maps addresses and symbols to local logo assets
const KUMADEX_TOKEN_LOGOS = {
  // By address (lowercase)
  '0x48c276e8d03813224bb1e55f953adb6d02fd3e02': '/breederlogos/kuma.png', // KUMA
  '0x3f5dd1a1538a4f9f82e543098f01f22480b0a3a8': '/breederlogos/dkuma.png', // dKUMA
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': '/breederlogos/shib.png', // SHIB
  '0x27c70cd1946795b66be9d954418546998b546634': '/breederlogos/leash.png', // LEASH
  '0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3': '/breederlogos/elon.png', // ELON
  '0x3301ee63fb29f863f2333bd4466acb46cd8323e6': '/breederlogos/akita.png', // AKITA
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': '/breederlogos/usdc.png', // USDC
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': '/breederlogos/eth.png', // WETH
  '0x9813037ee2218799597d83d4a5b6f3b6778218d9': '/breederlogos/shib.png', // BONE
  // LP tokens
  '0xdf60e6416fcf8c955fddf01148753a911f7a5905': '/breederlogos/kuma.png', // KUMA-ETH LP
  '0xb4edfec7aa5588786901c63a8338e4b37611b2af': '/breederlogos/dkuma.png', // dKUMA-ETH LP
  '0x811beed0119b4afce20d2583eb608c6f7af1954f': '/breederlogos/shib.png', // SHIB-ETH LP
  '0x874376be8231dad99aabf9ef0767b3cc054c60ee': '/breederlogos/leash.png', // LEASH-ETH LP
  '0xda3a20aad0c34fa742bd9813d45bbf67c787ae0b': '/breederlogos/akita.png', // AKITA-ETH LP
  '0x7b73644935b8e68019ac6356c40661e1bc315860': '/breederlogos/elon.png', // ELON-ETH LP
};

// Symbol-based fallback mapping
const KUMADEX_SYMBOL_LOGOS = {
  'KUMA': '/breederlogos/kuma.png',
  'DKUMA': '/breederlogos/dkuma.png',
  'dKUMA': '/breederlogos/dkuma.png',
  'SHIB': '/breederlogos/shib.png',
  'LEASH': '/breederlogos/leash.png',
  'ELON': '/breederlogos/elon.png',
  'AKITA': '/breederlogos/akita.png',
  'USDC': '/breederlogos/usdc.png',
  'ETH': '/breederlogos/eth.png',
  'WETH': '/breederlogos/eth.png',
  'BONE': '/breederlogos/shib.png',
};

// Get local logo for a token (by address or symbol)
const getKumaDexLogo = (address, symbol) => {
  // First try by address
  if (address) {
    const addressLogo = KUMADEX_TOKEN_LOGOS[address.toLowerCase()];
    if (addressLogo) return addressLogo;
  }
  // Then try by symbol
  if (symbol) {
    const symbolLogo = KUMADEX_SYMBOL_LOGOS[symbol.toUpperCase()];
    if (symbolLogo) return symbolLogo;
  }
  return null;
};

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #141823;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  position: sticky;
  top: 0;
  z-index: 9999;

  @media (max-width: 768px) {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 5px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LogoText = styled.span`
  font-family: 'TargetAcad', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 18px;
  color: rgb(214, 214, 214);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.3),
    0 -1px 0 rgba(0, 0, 0, 0.5);
  position: relative;
  transition: color 0.3s ease;

  &:hover {
    color: rgb(255, 255, 255);
  }
`;

const LogoIcon = styled.img`
  width: 28px;
  height: 28px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 4px;
  align-items: center;
  background: rgb(38, 39, 43);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;

  @media (max-width: 768px) {
    gap: 4px;
    flex-wrap: wrap;
    order: 3;
    justify-content: center;
  }

  @media (max-width: 480px) {
    gap: 2px;
    font-size: 12px;
    padding: 4px 8px;
  }
`;

const SearchContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  max-width: 400px;

  @media (max-width: 1024px) {
    width: 300px;
    max-width: 300px;
  }

  @media (max-width: 768px) {
    position: relative;
    left: auto;
    transform: none;
    order: 4;
    width: 100%;
    max-width: 100%;
    margin: 8px 0 0 0;
  }
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgb(38, 39, 43);
  border-radius: 12px;
  padding: 8px 12px;
  border: 1px solid ${({ $focused }) => $focused ? 'rgba(252, 114, 255, 0.5)' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const SearchIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
  display: flex;
  align-items: center;
  margin-right: 8px;
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const ClearButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 2px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: rgb(38, 39, 43);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  max-height: 400px;
  overflow-y: auto;
  z-index: 10000;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TokenResultIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.module};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TokenResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TokenResultName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TokenResultSymbol = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TokenResultAddress = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-family: monospace;
`;

const TokenResultMarketCap = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: right;
  white-space: nowrap;
`;

const SearchLoading = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 14px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const PriceTicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 140px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const TokenLogo = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const TickerPrice = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: monospace;
  font-weight: 600;
`;

const NavLink = styled.a`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 16px;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-decoration: none;
  font-size: 13px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: ${({ theme }) => theme.colors.text.primary};
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MoreButton = styled.button`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 16px;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background: rgba(255, 255, 255, 0.1);
  }

  &.open {
    color: ${({ theme }) => theme.colors.text.primary};
    background: rgba(255, 255, 255, 0.1);
  }
`;


const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: ${({ $isOpen }) => $isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)'};
  margin-top: 8px;
  background: #1a1d21;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  min-width: 160px;
  width: max-content;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  pointer-events: ${({ $isOpen }) => $isOpen ? 'auto' : 'none'};
  transition: all 0.2s ease;
  backdrop-filter: none;
  overflow: hidden;
`;

const DropdownItem = styled.a`
  display: block;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  text-align: center;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
  background: #1a1d21;

  &:last-child {
    border-bottom: none;
  }

  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  &:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }

  &:hover {
    color: #ffffff;
    background: #a855f7;
  }
`;

const Header = () => {
  const router = useRouter();
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);
  const [prices, setPrices] = useState({
    KUMA: null,
    DKUMA: null,
    ETH: null
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tradeDropdownOpen, setTradeDropdownOpen] = useState(false);
  const [poolDropdownOpen, setPoolDropdownOpen] = useState(false);
  const [daoDropdownOpen, setDaoDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const tradeDropdownRef = useRef(null);
  const poolDropdownRef = useRef(null);
  const daoDropdownRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const tradeHoverTimeoutRef = useRef(null);
  const poolHoverTimeoutRef = useRef(null);
  const daoHoverTimeoutRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const tokens = ['KUMA', 'DKUMA', 'ETH'];

  const isActive = (path) => {
    return router.pathname === path;
  };

  // Fetch prices for all tokens
  const fetchPrices = async () => {
    try {
      const kumaPrice = await priceService.getTokenPrice('KUMA');
      const dkumaPrice = await priceService.getTokenPrice('DKUMA');
      const ethPrice = await priceService.getETHPrice();
      
      setPrices({
        KUMA: kumaPrice,
        DKUMA: dkumaPrice,
        ETH: ethPrice
      });
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  // Rotate ticker every 3 seconds
  useEffect(() => {
    fetchPrices(); // Initial fetch
    
    const priceInterval = setInterval(fetchPrices, 30000); // Refresh prices every 30 seconds
    const tickerInterval = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % tokens.length);
    }, 3000); // Change ticker every 3 seconds

    return () => {
      clearInterval(priceInterval);
      clearInterval(tickerInterval);
    };
  }, []);

  // Close all dropdowns helper
  const closeAllDropdowns = () => {
    setDropdownOpen(false);
    setTradeDropdownOpen(false);
    setPoolDropdownOpen(false);
    setDaoDropdownOpen(false);
  };

  // Handle hover functionality for More dropdown
  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    clearTimeout(tradeHoverTimeoutRef.current);
    clearTimeout(poolHoverTimeoutRef.current);
    clearTimeout(daoHoverTimeoutRef.current);
    closeAllDropdowns();
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  // Handle hover functionality for Trade dropdown
  const handleTradeMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    clearTimeout(tradeHoverTimeoutRef.current);
    clearTimeout(poolHoverTimeoutRef.current);
    clearTimeout(daoHoverTimeoutRef.current);
    closeAllDropdowns();
    setTradeDropdownOpen(true);
  };

  const handleTradeMouseLeave = () => {
    tradeHoverTimeoutRef.current = setTimeout(() => {
      setTradeDropdownOpen(false);
    }, 150);
  };

  // Handle hover functionality for Pool dropdown
  const handlePoolMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    clearTimeout(tradeHoverTimeoutRef.current);
    clearTimeout(poolHoverTimeoutRef.current);
    clearTimeout(daoHoverTimeoutRef.current);
    closeAllDropdowns();
    setPoolDropdownOpen(true);
  };

  const handlePoolMouseLeave = () => {
    poolHoverTimeoutRef.current = setTimeout(() => {
      setPoolDropdownOpen(false);
    }, 150);
  };

  // Handle hover functionality for DAO dropdown
  const handleDaoMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    clearTimeout(tradeHoverTimeoutRef.current);
    clearTimeout(poolHoverTimeoutRef.current);
    clearTimeout(daoHoverTimeoutRef.current);
    closeAllDropdowns();
    setDaoDropdownOpen(true);
  };

  const handleDaoMouseLeave = () => {
    daoHoverTimeoutRef.current = setTimeout(() => {
      setDaoDropdownOpen(false);
    }, 150);
  };

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (tradeDropdownRef.current && !tradeDropdownRef.current.contains(event.target)) {
        setTradeDropdownOpen(false);
      }
      if (poolDropdownRef.current && !poolDropdownRef.current.contains(event.target)) {
        setPoolDropdownOpen(false);
      }
      if (daoDropdownRef.current && !daoDropdownRef.current.contains(event.target)) {
        setDaoDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(hoverTimeoutRef.current);
      clearTimeout(tradeHoverTimeoutRef.current);
      clearTimeout(poolHoverTimeoutRef.current);
      clearTimeout(daoHoverTimeoutRef.current);
      clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Search for tokens using DexScreener API
  const searchTokens = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Check if query is an address
      const isAddress = query.startsWith('0x') && query.length >= 10;

      let results = [];

      if (isAddress) {
        // Search by token address
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${query}`);
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
          // Get unique tokens from pairs (filter for Ethereum)
          const tokenMap = new Map();
          data.pairs
            .filter(pair => pair.chainId === 'ethereum')
            .forEach(pair => {
              const token = pair.baseToken.address.toLowerCase() === query.toLowerCase()
                ? pair.baseToken
                : pair.quoteToken;
              if (!tokenMap.has(token.address.toLowerCase())) {
                // Use local KumaDex logo if available, otherwise use DexScreener logo
                const localLogo = getKumaDexLogo(token.address, token.symbol);
                tokenMap.set(token.address.toLowerCase(), {
                  name: token.name,
                  symbol: token.symbol,
                  address: token.address,
                  logo: localLogo || pair.info?.imageUrl || null,
                  priceUsd: pair.priceUsd,
                  marketCap: pair.fdv || pair.marketCap || null
                });
              }
            });
          results = Array.from(tokenMap.values());
        }
      } else {
        // Search by token name/symbol
        const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
          // Get unique tokens from pairs (filter for Ethereum)
          const tokenMap = new Map();
          data.pairs
            .filter(pair => pair.chainId === 'ethereum')
            .slice(0, 20)
            .forEach(pair => {
              const token = pair.baseToken;
              if (!tokenMap.has(token.address.toLowerCase())) {
                // Use local KumaDex logo if available, otherwise use DexScreener logo
                const localLogo = getKumaDexLogo(token.address, token.symbol);
                tokenMap.set(token.address.toLowerCase(), {
                  name: token.name,
                  symbol: token.symbol,
                  address: token.address,
                  logo: localLogo || pair.info?.imageUrl || null,
                  priceUsd: pair.priceUsd,
                  marketCap: pair.fdv || pair.marketCap || null
                });
              }
            });
          results = Array.from(tokenMap.values()).slice(0, 8);
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tokens:', error);
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchTokens(value);
    }, 300);
  };

  // Handle token selection
  const handleTokenSelect = (token) => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchFocused(false);

    // Navigate to swapx page with token address as query parameter
    router.push(`/swap?token=${token.address}`);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Truncate address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format marketcap for display
  const formatMarketCap = (marketCap) => {
    if (!marketCap) return null;
    const num = parseFloat(marketCap);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const getTokenLogo = (symbol) => {
    return KUMADEX_SYMBOL_LOGOS[symbol] || KUMADEX_SYMBOL_LOGOS[symbol?.toUpperCase()];
  };

  const formatPrice = (price, symbol) => {
    if (!price) return '$0.00';
    
    // All prices displayed in USD
    if (symbol === 'ETH') {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price < 0.001) {
      return `$${price.toFixed(8)}`; // More precision for very small values
    } else if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else {
      return `$${price.toFixed(4)}`;
    }
  };

  const currentToken = tokens[currentTickerIndex];
  const currentPrice = prices[currentToken];
  const currentLogo = getTokenLogo(currentToken);

  return (
    <HeaderContainer>
      <LeftSection>
        <Logo onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
          <LogoIcon src="/breederlogos/kuma.png" alt="KumaDex Logo" />
          <LogoText>KumaDex</LogoText>
        </Logo>
        <Nav>
        {/* Trade Dropdown */}
        <DropdownContainer
          ref={tradeDropdownRef}
          onMouseEnter={handleTradeMouseEnter}
          onMouseLeave={handleTradeMouseLeave}
        >
          <MoreButton
            onClick={() => {
              const newState = !tradeDropdownOpen;
              closeAllDropdowns();
              setTradeDropdownOpen(newState);
            }}
            className={tradeDropdownOpen || isActive('/swap') || isActive('/kumadex') ? 'open' : ''}
          >
            Trade
          </MoreButton>
          <DropdownMenu
            $isOpen={tradeDropdownOpen}
            className="dropdown-menu"
          >
            <DropdownItem
              href="/swap"
              onClick={(e) => {
                e.preventDefault();
                router.push('/swap');
                setTradeDropdownOpen(false);
              }}
              style={isActive('/swap') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              SwapX
            </DropdownItem>
            <DropdownItem
              href="/kumadex"
              onClick={(e) => {
                e.preventDefault();
                router.push('/kumadex');
                setTradeDropdownOpen(false);
              }}
              style={isActive('/kumadex') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              KumaDex (Perp)
            </DropdownItem>
          </DropdownMenu>
        </DropdownContainer>

        {/* Pool Dropdown */}
        <DropdownContainer
          ref={poolDropdownRef}
          onMouseEnter={handlePoolMouseEnter}
          onMouseLeave={handlePoolMouseLeave}
        >
          <MoreButton
            onClick={() => {
              const newState = !poolDropdownOpen;
              closeAllDropdowns();
              setPoolDropdownOpen(newState);
            }}
            className={poolDropdownOpen || isActive('/breeder') || isActive('/dkuma-breeder') || isActive('/discover') || isActive('/flippening') ? 'open' : ''}
          >
            Pool
          </MoreButton>
          <DropdownMenu
            $isOpen={poolDropdownOpen}
            className="dropdown-menu"
          >
            <DropdownItem
              href="/discover"
              onClick={(e) => {
                e.preventDefault();
                router.push('/discover');
                setPoolDropdownOpen(false);
              }}
              style={isActive('/discover') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              Discover KumaDex
            </DropdownItem>
            <DropdownItem
              href="/breeder"
              onClick={(e) => {
                e.preventDefault();
                router.push('/breeder');
                setPoolDropdownOpen(false);
              }}
              style={isActive('/breeder') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              Kuma Breeder
            </DropdownItem>
            <DropdownItem
              href="/dkuma-breeder"
              onClick={(e) => {
                e.preventDefault();
                router.push('/dkuma-breeder');
                setPoolDropdownOpen(false);
              }}
              style={isActive('/dkuma-breeder') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              dKuma Breeder
            </DropdownItem>
            <DropdownItem
              href="/flippening"
              onClick={(e) => {
                e.preventDefault();
                router.push('/flippening');
                setPoolDropdownOpen(false);
              }}
              style={isActive('/flippening') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              Flippening
            </DropdownItem>
          </DropdownMenu>
        </DropdownContainer>

        {/* DAO Dropdown */}
        <DropdownContainer
          ref={daoDropdownRef}
          onMouseEnter={handleDaoMouseEnter}
          onMouseLeave={handleDaoMouseLeave}
        >
          <MoreButton
            onClick={() => {
              const newState = !daoDropdownOpen;
              closeAllDropdowns();
              setDaoDropdownOpen(newState);
            }}
            className={daoDropdownOpen || isActive('/dao') ? 'open' : ''}
          >
            DAO
          </MoreButton>
          <DropdownMenu
            $isOpen={daoDropdownOpen}
            className="dropdown-menu"
          >
            <DropdownItem
              href="https://snapshot.org/#/s:kumatokens.eth"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setDaoDropdownOpen(false);
              }}
            >
              Kuma DAO
            </DropdownItem>
            <DropdownItem
              href="/dao"
              onClick={(e) => {
                e.preventDefault();
                router.push('/dao');
                setDaoDropdownOpen(false);
              }}
              style={isActive('/dao') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              dKuma DAO
            </DropdownItem>
          </DropdownMenu>
        </DropdownContainer>

        <NavLink
          href="/portfolio"
          className={isActive('/portfolio') ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            router.push('/portfolio');
          }}
        >
          Wallet
        </NavLink>

        <DropdownContainer
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <MoreButton
            onClick={() => {
              const newState = !dropdownOpen;
              closeAllDropdowns();
              setDropdownOpen(newState);
            }}
            className={dropdownOpen ? 'open' : ''}
          >
            More
          </MoreButton>
          <DropdownMenu
            $isOpen={dropdownOpen}
            className="dropdown-menu"
          >
            <DropdownItem
              href="/addresses"
              onClick={(e) => {
                e.preventDefault();
                router.push('/addresses');
                setDropdownOpen(false);
              }}
            >
              Addresses
            </DropdownItem>
            <DropdownItem
              href="/monthly-revenue"
              onClick={(e) => {
                e.preventDefault();
                router.push('/monthly-revenue');
                setDropdownOpen(false);
              }}
              style={isActive('/monthly-revenue') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              Monthly Revenue
            </DropdownItem>
            <DropdownItem
              href="/vessel-vault"
              onClick={(e) => {
                e.preventDefault();
                router.push('/vessel-vault');
                setDropdownOpen(false);
              }}
              style={isActive('/vessel-vault') ? { background: 'rgba(255, 255, 255, 0.1)', color: '#fff' } : {}}
            >
              Vessel Vault
            </DropdownItem>
            <DropdownItem
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDropdownOpen(false);
              }}
            >
              Migrate to V3
            </DropdownItem>
            <DropdownItem
              href="/docs"
              onClick={(e) => {
                e.preventDefault();
                router.push('/docs');
                setDropdownOpen(false);
              }}
            >
              Docs
            </DropdownItem>
          </DropdownMenu>
        </DropdownContainer>
        </Nav>
      </LeftSection>

      <SearchContainer ref={searchRef}>
        <SearchInputWrapper $focused={searchFocused}>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search tokens by name or address..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
          />
          {searchQuery && (
            <ClearButton onClick={clearSearch}>
              <X size={16} />
            </ClearButton>
          )}
        </SearchInputWrapper>

        {searchFocused && (searchQuery.length >= 2 || searchResults.length > 0) && (
          <SearchResults>
            {searchLoading ? (
              <SearchLoading>Searching...</SearchLoading>
            ) : searchResults.length > 0 ? (
              searchResults.map((token) => (
                <SearchResultItem
                  key={token.address}
                  onClick={() => handleTokenSelect(token)}
                >
                  <TokenResultIcon>
                    {token.logo ? (
                      <img src={token.logo} alt={token.symbol} />
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>
                        {token.symbol?.slice(0, 2)}
                      </span>
                    )}
                  </TokenResultIcon>
                  <TokenResultInfo>
                    <TokenResultName>{token.name}</TokenResultName>
                    <TokenResultSymbol>{token.symbol}</TokenResultSymbol>
                    <TokenResultAddress>{truncateAddress(token.address)}</TokenResultAddress>
                  </TokenResultInfo>
                  {token.marketCap && (
                    <TokenResultMarketCap>
                      {formatMarketCap(token.marketCap)}
                    </TokenResultMarketCap>
                  )}
                </SearchResultItem>
              ))
            ) : searchQuery.length >= 2 ? (
              <NoResults>No tokens found</NoResults>
            ) : null}
          </SearchResults>
        )}
      </SearchContainer>

      <RightSection>
        <PriceTicker>
          <TokenLogo>
            <Image
              src={currentLogo}
              alt={currentToken}
              width={20}
              height={20}
              style={{ borderRadius: '50%' }}
            />
          </TokenLogo>
          <TickerPrice>{formatPrice(currentPrice, currentToken)}</TickerPrice>
        </PriceTicker>
        <ConnectWalletButton />
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;