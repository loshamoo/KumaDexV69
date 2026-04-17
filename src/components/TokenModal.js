import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Search, Loader } from 'react-feather';
import { KUMABREEDER_TOKENS } from '../data/tokens';
import Image from 'next/image';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background.charcoal};
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  width: 420px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SearchContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: ${({ theme }) => theme.colors.background.interactive};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 16px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const TokenList = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 8px;
`;

const TokenItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px;
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.background.interactive : 'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.interactive};
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TokenIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 50%;
  }
`;

const TokenDetails = styled.div`
  text-align: left;
`;

const TokenSymbol = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TokenName = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TokenAddress = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-family: monospace;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: 12px 12px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: ${({ theme }) => theme.colors.text.secondary};
  gap: 8px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const NoResults = styled.div`
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 14px;
`;

const ImportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const CustomTokenCard = styled.div`
  padding: 12px;
  margin: 8px 12px;
  background: ${({ theme }) => theme.colors.background.interactive};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
`;

const CustomTokenHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const CustomTokenInfo = styled.div`
  flex: 1;
`;

const TokenModal = ({ isOpen, onClose, onSelectToken, selectedToken }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customTokens, setCustomTokens] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [foundToken, setFoundToken] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Check if search query is an address
  const isAddress = searchQuery.startsWith('0x') && searchQuery.length >= 10;

  // Filter predefined tokens
  const filteredTokens = KUMABREEDER_TOKENS.filter(
    token =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Search for custom tokens via DexScreener
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setCustomTokens([]);
      setFoundToken(null);
      return;
    }

    // Clear previous timeout
    clearTimeout(searchTimeoutRef.current);

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);

      try {
        if (isAddress) {
          // Search by address
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${searchQuery}`);
          const data = await response.json();

          if (data.pairs && data.pairs.length > 0) {
            const ethPair = data.pairs
              .filter(p => p.chainId === 'ethereum')
              .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

            if (ethPair) {
              const token = {
                symbol: ethPair.baseToken.symbol,
                name: ethPair.baseToken.name,
                address: ethPair.baseToken.address,
                logo: ethPair.info?.imageUrl || null,
                decimals: 18,
                isCustom: true
              };
              setFoundToken(token);
              setCustomTokens([]);
            }
          } else {
            setFoundToken(null);
          }
        } else {
          // Search by name/symbol
          const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();

          if (data.pairs && data.pairs.length > 0) {
            const tokenMap = new Map();
            data.pairs
              .filter(pair => pair.chainId === 'ethereum')
              .slice(0, 20)
              .forEach(pair => {
                const token = pair.baseToken;
                const key = token.address.toLowerCase();
                // Skip if already in predefined tokens
                const isPredefined = KUMABREEDER_TOKENS.some(
                  t => t.address.toLowerCase() === key
                );
                if (!tokenMap.has(key) && !isPredefined) {
                  tokenMap.set(key, {
                    symbol: token.symbol,
                    name: token.name,
                    address: token.address,
                    logo: pair.info?.imageUrl || null,
                    decimals: 18,
                    isCustom: true
                  });
                }
              });
            setCustomTokens(Array.from(tokenMap.values()).slice(0, 6));
          } else {
            setCustomTokens([]);
          }
          setFoundToken(null);
        }
      } catch (error) {
        console.error('Error searching tokens:', error);
        setCustomTokens([]);
        setFoundToken(null);
      }

      setIsSearching(false);
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, isAddress]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setCustomTokens([]);
      setFoundToken(null);
    }
  }, [isOpen]);

  const handleSelectToken = (token) => {
    onSelectToken(token);
    onClose();
    setSearchQuery('');
    setCustomTokens([]);
    setFoundToken(null);
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Select a token</Title>
          <CloseButton onClick={onClose}>
            <X size={24} />
          </CloseButton>
        </Header>
        <SearchContainer style={{ position: 'relative' }}>
          <SearchIconWrapper>
            <Search size={20} />
          </SearchIconWrapper>
          <SearchInput
            placeholder="Search name or paste address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
        <TokenList>
          {/* Found token by address */}
          {foundToken && (
            <>
              <SectionTitle>Import Token</SectionTitle>
              <CustomTokenCard>
                <CustomTokenHeader>
                  <TokenIcon>
                    {foundToken.logo ? (
                      <img
                        src={foundToken.logo}
                        alt={foundToken.symbol}
                        style={{ width: 36, height: 36, borderRadius: '50%' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{foundToken.symbol.slice(0, 2)}</span>
                    )}
                  </TokenIcon>
                  <CustomTokenInfo>
                    <TokenSymbol>{foundToken.symbol}</TokenSymbol>
                    <TokenName>{foundToken.name}</TokenName>
                    <TokenAddress>{truncateAddress(foundToken.address)}</TokenAddress>
                  </CustomTokenInfo>
                </CustomTokenHeader>
                <ImportButton onClick={() => handleSelectToken(foundToken)}>
                  Import Token
                </ImportButton>
              </CustomTokenCard>
            </>
          )}

          {/* Loading state */}
          {isSearching && (
            <LoadingContainer>
              <Loader size={18} />
              Searching...
            </LoadingContainer>
          )}

          {/* Predefined tokens */}
          {filteredTokens.length > 0 && (
            <>
              {(customTokens.length > 0 || foundToken) && <SectionTitle>Popular Tokens</SectionTitle>}
              {filteredTokens.map((token) => (
                <TokenItem
                  key={token.symbol}
                  onClick={() => handleSelectToken(token)}
                  $selected={selectedToken?.symbol === token.symbol}
                >
                  <TokenInfo>
                    <TokenIcon>
                      {token.logo ? (
                        <Image
                          src={token.logo}
                          alt={token.symbol}
                          width={36}
                          height={36}
                          style={{ borderRadius: '50%' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span style={{ display: token.logo ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px' }}>
                        {token.symbol.slice(0, 2)}
                      </span>
                    </TokenIcon>
                    <TokenDetails>
                      <TokenSymbol>{token.symbol}</TokenSymbol>
                      <TokenName>{token.name}</TokenName>
                    </TokenDetails>
                  </TokenInfo>
                </TokenItem>
              ))}
            </>
          )}

          {/* Custom tokens from search */}
          {customTokens.length > 0 && (
            <>
              <SectionTitle>Search Results</SectionTitle>
              {customTokens.map((token) => (
                <TokenItem
                  key={token.address}
                  onClick={() => handleSelectToken(token)}
                  $selected={selectedToken?.address?.toLowerCase() === token.address.toLowerCase()}
                >
                  <TokenInfo>
                    <TokenIcon>
                      {token.logo ? (
                        <img
                          src={token.logo}
                          alt={token.symbol}
                          style={{ width: 36, height: 36, borderRadius: '50%' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <span>{token.symbol.slice(0, 2)}</span>
                      )}
                    </TokenIcon>
                    <TokenDetails>
                      <TokenSymbol>{token.symbol}</TokenSymbol>
                      <TokenName>{token.name}</TokenName>
                      <TokenAddress>{truncateAddress(token.address)}</TokenAddress>
                    </TokenDetails>
                  </TokenInfo>
                </TokenItem>
              ))}
            </>
          )}

          {/* No results */}
          {!isSearching && searchQuery.length >= 2 && filteredTokens.length === 0 && customTokens.length === 0 && !foundToken && (
            <NoResults>No tokens found</NoResults>
          )}
        </TokenList>
      </Modal>
    </Overlay>
  );
};

export default TokenModal;