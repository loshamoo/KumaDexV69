import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'react-feather';
import Image from 'next/image';

const SUPPORTED_CHAINS = [
  { id: 'eth', name: 'Ethereum', abbr: 'ETH', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', color: '#627eea' },
  { id: 'sol', name: 'Solana', abbr: 'SOL', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', color: '#9945ff' },
  { id: 'polygon', name: 'Polygon', abbr: 'MATIC', logo: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', color: '#8247e5' },
  { id: 'bnb', name: 'BNB Chain', abbr: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', color: '#f3ba2f' },
  { id: 'avax', name: 'Avalanche', abbr: 'AVAX', logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', color: '#e84142' },
  { id: 'arb', name: 'Arbitrum', abbr: 'ARB', logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg', color: '#28a0f0' },
  { id: 'ftm', name: 'Fantom', abbr: 'FTM', logo: 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png', color: '#1969ff' },
];

const Container = styled.div`
  background: rgb(38, 39, 43);
  border-radius: ${({ theme }) => theme.borderRadius.large};
  padding: 12px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const Balance = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChainSelectorWrapper = styled.div`
  position: relative;
  margin-right: 8px;
`;

const ChainButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.colors.background.module};
  padding: 6px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const ChainLogo = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: contain;
`;

const ChainDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: rgb(38, 39, 43);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  z-index: 100;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const ChainOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${({ $isSelected }) => $isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ChainOptionLogo = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: contain;
`;

const ChainOptionName = styled.span`
  flex: 1;
  text-align: left;
`;

const ChainAbbr = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
`;

const Input = styled.input`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 24px;
  font-weight: 500;
  flex: 1;
  width: 0;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const TokenButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.background.module};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  font-size: 18px;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`;

const TokenIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TokenInput = ({
  label,
  value,
  onChange,
  token,
  onTokenSelect,
  balance,
  readOnly,
  chain,
  onChainChange,
  hideChainSelector = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);
  const chainDropdownRef = useRef(null);

  // Default to ETH if no chain specified
  const selectedChain = chain || SUPPORTED_CHAINS[0];

  // Reset image error when token changes
  useEffect(() => {
    setImageError(false);
  }, [token?.address, token?.symbol]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chainDropdownRef.current && !chainDropdownRef.current.contains(event.target)) {
        setIsChainDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChainSelect = (chainItem) => {
    if (onChainChange) {
      onChainChange(chainItem);
    }
    setIsChainDropdownOpen(false);
  };

  // Check if logo is external URL (custom token)
  const isExternalLogo = token?.logo && (token.logo.startsWith('http://') || token.logo.startsWith('https://'));
  const isLocalLogo = token?.logo && token.logo.startsWith('/');
  const hasValidLogo = (isExternalLogo || isLocalLogo) && !imageError;

  return (
    <Container>
      <Header>
        <Label>{label}</Label>
        {balance && <Balance>Balance: {balance}</Balance>}
      </Header>
      <InputRow>
        {!hideChainSelector && (
          <ChainSelectorWrapper ref={chainDropdownRef}>
            <ChainButton onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}>
              <ChainLogo src={selectedChain.logo} alt={selectedChain.abbr} />
              <ChevronDown size={14} color="rgba(255,255,255,0.6)" />
            </ChainButton>
            {isChainDropdownOpen && (
              <ChainDropdown>
                {SUPPORTED_CHAINS.map((chainItem) => (
                  <ChainOption
                    key={chainItem.id}
                    $isSelected={chainItem.id === selectedChain.id}
                    onClick={() => handleChainSelect(chainItem)}
                  >
                    <ChainOptionLogo src={chainItem.logo} alt={chainItem.abbr} />
                    <ChainOptionName>{chainItem.name}</ChainOptionName>
                    <ChainAbbr>{chainItem.abbr}</ChainAbbr>
                  </ChainOption>
                ))}
              </ChainDropdown>
            )}
          </ChainSelectorWrapper>
        )}
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^\d*\.?\d*$/.test(val)) {
              onChange(val);
            }
          }}
          readOnly={readOnly}
        />
        <TokenButton onClick={onTokenSelect}>
          <TokenIcon>
            {hasValidLogo && isExternalLogo && (
              <img
                src={token.logo}
                alt={token.symbol || ''}
                style={{ width: 24, height: 24, borderRadius: '50%' }}
                onError={() => setImageError(true)}
              />
            )}
            {hasValidLogo && isLocalLogo && (
              <Image
                src={token.logo}
                alt={token.symbol || ''}
                width={24}
                height={24}
                style={{ borderRadius: '50%' }}
                onError={() => setImageError(true)}
              />
            )}
            {!hasValidLogo && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '600',
                width: '24px',
                height: '24px'
              }}>
                {token?.symbol?.slice(0, 2) || '??'}
              </span>
            )}
          </TokenIcon>
          {token.symbol || 'Select'}
          <ChevronDown size={20} />
        </TokenButton>
      </InputRow>
    </Container>
  );
};

export default TokenInput;