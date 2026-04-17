import { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowDown, Settings } from 'react-feather';
import TokenInput from './TokenInput';
import SwapButton from './SwapButton';
import TokenModal from './TokenModal';
import SwapSettings from './SwapSettings';
import SwapDetails from './SwapDetails';
import BreederNotification from './BreederNotification';
import { KUMABREEDER_TOKENS } from '../data/tokens';

const SwapContainer = styled.div`
  background: #1a1f2e;
  border-radius: ${({ theme }) => theme.borderRadius.xlarge};
  padding: 12px;
  width: 100%;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const SwapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SettingsButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 6px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.interactive};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const SwapBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ArrowContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  position: relative;
  z-index: 2;
`;

const ArrowButton = styled.button`
  background: ${({ theme }) => theme.colors.background.module};
  border: 4px solid ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.interactive};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const RateDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 12px;
`;

const RateRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RateLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const RateValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const ConversionHighlight = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.2);
`;

const ConversionLabel = styled.span`
  color: #22c55e;
  font-weight: 500;
  font-size: 12px;
`;

const ConversionValue = styled.span`
  color: #22c55e;
  font-weight: 600;
  font-size: 14px;
`;

const CrossChainIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-top: 8px;
  background: rgba(247, 147, 26, 0.1);
  border: 1px solid rgba(247, 147, 26, 0.3);
  border-radius: 10px;
  font-size: 12px;
`;

const CrossChainBadge = styled.span`
  background: linear-gradient(135deg, #f7931a, #f59e0b);
  color: #000;
  font-weight: 600;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 12px;
  text-transform: uppercase;
`;

const CrossChainText = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  flex: 1;
`;

const CrossChainRoute = styled.span`
  color: #f7931a;
  font-weight: 500;
`;

// Format exchange rate to show full amount
const formatRate = (rate) => {
  if (!rate || isNaN(rate)) return '...';
  if (rate >= 1000000000) return rate.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (rate >= 1000000) return rate.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (rate >= 1000) return rate.toLocaleString('en-US', { maximumFractionDigits: 4 });
  if (rate >= 1) return rate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 });
  if (rate >= 0.0001) return rate.toFixed(8);
  if (rate >= 0.00000001) return rate.toFixed(12);
  return rate.toFixed(18);
};

// Default chain data for initial state
const DEFAULT_CHAIN = { id: 'eth', name: 'Ethereum', abbr: 'ETH', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', color: '#627eea' };

const SwapInterface = ({ leverage = 1, leverageControls, selectedPool = null, onTokenChange, initialToToken = null, hideChainSelector = false }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(KUMABREEDER_TOKENS[0]); // ETH
  const [toToken, setToToken] = useState(KUMABREEDER_TOKENS[2]); // KUMA (index 2)
  const [fromChain, setFromChain] = useState(DEFAULT_CHAIN);
  const [toChain, setToChain] = useState(DEFAULT_CHAIN);
  const [isFromModalOpen, setIsFromModalOpen] = useState(false);
  const [isToModalOpen, setIsToModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [swapSettings, setSwapSettings] = useState({
    slippage: '0.5',
    deadline: '20'
  });
  const [breederNotification, setBreederNotification] = useState({
    show: false,
    token: null
  });
  const [tokenPrices, setTokenPrices] = useState({
    fromPrice: null,
    toPrice: null,
    loading: false
  });

  // Notify parent when toToken changes
  useEffect(() => {
    if (onTokenChange) {
      onTokenChange(toToken);
    }
  }, [toToken, onTokenChange]);

  // Update toToken when initialToToken changes (from search/URL)
  useEffect(() => {
    if (initialToToken && initialToToken.address) {
      // Check if it's different from current toToken
      if (initialToToken.address.toLowerCase() !== toToken.address?.toLowerCase()) {
        setToToken(initialToToken);
        // Reset amounts when token changes
        setFromAmount('');
        setToAmount('');
      }
    }
  }, [initialToToken]);

  // Update toToken when selectedPool changes (from kumadex perps page)
  useEffect(() => {
    if (selectedPool) {
      // Find the corresponding token from KUMABREEDER_TOKENS
      const poolToken = KUMABREEDER_TOKENS.find(
        token => token.symbol === selectedPool.symbol ||
                 token.symbol === selectedPool.symbol.split('-')[0]
      );
      if (poolToken && poolToken.symbol !== toToken.symbol) {
        setToToken(poolToken);
        // Reset amounts when pool changes
        setFromAmount('');
        setToAmount('');
      }
    }
  }, [selectedPool]);

  useEffect(() => {
    checkConnection();
  }, []);

  // Fetch token prices from DexScreener
  useEffect(() => {
    const fetchTokenPrices = async () => {
      setTokenPrices(prev => ({ ...prev, loading: true }));

      try {
        let fromPrice = null;
        let toPrice = null;

        // Fetch fromToken price
        if (fromToken.address === '0x0000000000000000000000000000000000000000') {
          // ETH - fetch from DexScreener using WETH
          const ethResponse = await fetch('https://api.dexscreener.com/latest/dex/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
          const ethData = await ethResponse.json();
          if (ethData.pairs && ethData.pairs.length > 0) {
            const usdcPair = ethData.pairs.find(p => p.chainId === 'ethereum' && p.quoteToken.symbol === 'USDC');
            fromPrice = usdcPair ? parseFloat(usdcPair.priceUsd) : parseFloat(ethData.pairs[0].priceUsd);
          }
        } else if (fromToken.address) {
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${fromToken.address}`);
          const data = await response.json();
          if (data.pairs && data.pairs.length > 0) {
            const ethPair = data.pairs
              .filter(p => p.chainId === 'ethereum')
              .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
            fromPrice = ethPair ? parseFloat(ethPair.priceUsd) : null;
          }
        }

        // Fetch toToken price
        if (toToken.address === '0x0000000000000000000000000000000000000000') {
          // ETH
          const ethResponse = await fetch('https://api.dexscreener.com/latest/dex/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
          const ethData = await ethResponse.json();
          if (ethData.pairs && ethData.pairs.length > 0) {
            const usdcPair = ethData.pairs.find(p => p.chainId === 'ethereum' && p.quoteToken.symbol === 'USDC');
            toPrice = usdcPair ? parseFloat(usdcPair.priceUsd) : parseFloat(ethData.pairs[0].priceUsd);
          }
        } else if (toToken.address) {
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${toToken.address}`);
          const data = await response.json();
          if (data.pairs && data.pairs.length > 0) {
            const ethPair = data.pairs
              .filter(p => p.chainId === 'ethereum')
              .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
            toPrice = ethPair ? parseFloat(ethPair.priceUsd) : null;
          }
        }

        setTokenPrices({
          fromPrice,
          toPrice,
          loading: false
        });

        // Recalculate amount if there's already an input
        if (fromAmount && fromPrice && toPrice) {
          const inputValue = parseFloat(fromAmount);
          const fromValueUsd = inputValue * fromPrice;
          const outputAmount = fromValueUsd / toPrice;
          // Apply price impact (0.3% base fee + slippage based on size)
          const priceImpact = Math.min(inputValue * 0.001, 0.03);
          const adjustedOutput = outputAmount * (1 - priceImpact) * leverage;
          setToAmount(adjustedOutput.toFixed(6));
        }
      } catch (error) {
        console.error('Error fetching token prices:', error);
        setTokenPrices(prev => ({ ...prev, loading: false }));
      }
    };

    fetchTokenPrices();
  }, [fromToken.address, toToken.address]);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          getBalance(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const getBalance = async (address) => {
    try {
      if (window.ethereum) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
        setBalance(balanceInEth.toFixed(4));
      }
    } catch (error) {
      console.error('Error getting balance:', error);
    }
  };

  const handleSwapTokens = useCallback(() => {
    // Swap tokens
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    // Swap chains
    const tempChain = fromChain;
    setFromChain(toChain);
    setToChain(tempChain);

    // Swap prices
    setTokenPrices(prev => ({
      fromPrice: prev.toPrice,
      toPrice: prev.fromPrice,
      loading: false
    }));

    // Keep the fromAmount and recalculate toAmount
    // The useEffect will trigger recalculation when prices update
    setToAmount('...');
  }, [fromToken, toToken, fromChain, toChain, fromAmount, toAmount]);

  // Recalculate when leverage or prices change
  useEffect(() => {
    if (fromAmount) {
      handleFromAmountChange(fromAmount);
    }
  }, [leverage, tokenPrices.fromPrice, tokenPrices.toPrice]);

  // Define breeder pool tokens (tokens that are stakeable in breeder pools)
  const BREEDER_POOL_TOKENS = ['KUMA', 'SHIB', 'LEASH', 'ELON', 'AKITA'];

  // Check if a token is available for staking in breeder pools
  const isBreederToken = (token) => {
    return BREEDER_POOL_TOKENS.includes(token.symbol);
  };

  // Show notification when a breeder token is selected
  const checkForBreederNotification = (selectedToken) => {
    if (isBreederToken(selectedToken) && !breederNotification.show) {
      // Small delay to let the swap interface update first
      setTimeout(() => {
        setBreederNotification({
          show: true,
          token: selectedToken
        });
      }, 1000);
    }
  };

  const handleFromAmountChange = (value) => {
    setFromAmount(value);

    if (value && !isNaN(Number(value)) && Number(value) > 0) {
      const inputAmount = Number(value);
      const { fromPrice, toPrice } = tokenPrices;

      if (fromPrice && toPrice && toPrice > 0) {
        // Calculate USD value of input
        const fromValueUsd = inputAmount * fromPrice;

        // Calculate output amount based on real prices
        const outputAmount = fromValueUsd / toPrice;

        // Apply price impact (0.3% base + size-based impact, max 5%)
        const sizeImpact = Math.min((inputAmount * fromPrice / 10000) * 0.01, 0.02);
        const totalImpact = 0.003 + sizeImpact; // 0.3% base fee + size impact

        // Apply leverage and price impact
        const leveragedOutput = outputAmount * leverage;
        const adjustedOutput = leveragedOutput * (1 - totalImpact);

        // Format output based on magnitude
        if (adjustedOutput >= 1000000) {
          setToAmount(adjustedOutput.toLocaleString('en-US', { maximumFractionDigits: 2 }));
        } else if (adjustedOutput >= 1) {
          setToAmount(adjustedOutput.toFixed(4));
        } else if (adjustedOutput >= 0.000001) {
          setToAmount(adjustedOutput.toFixed(8));
        } else {
          setToAmount(adjustedOutput.toExponential(4));
        }
      } else {
        // Fallback if prices not loaded - show loading indicator
        setToAmount('...');
      }

      // Check for breeder notification
      checkForBreederNotification(fromToken);
      checkForBreederNotification(toToken);
    } else {
      setToAmount('');
    }
  };

  return (
    <>
      <SwapContainer>
        <SwapHeader>
          <Title>
            {selectedPool
              ? `${selectedPool.symbol} Perp ${leverage > 1 ? `(${leverage}x)` : ''}`
              : `SwapX ${leverage > 1 ? `(${leverage}x)` : ''}`
            }
          </Title>
          <SettingsButton onClick={() => setIsSettingsOpen(true)}>
            <Settings size={20} />
          </SettingsButton>
        </SwapHeader>
        <SwapBody>
          <TokenInput
            label="From"
            value={fromAmount}
            onChange={handleFromAmountChange}
            token={fromToken}
            onTokenSelect={() => setIsFromModalOpen(true)}
            balance={balance}
            chain={fromChain}
            onChainChange={setFromChain}
            hideChainSelector={hideChainSelector}
          />
          <ArrowContainer>
            <ArrowButton onClick={handleSwapTokens}>
              <ArrowDown size={16} />
            </ArrowButton>
          </ArrowContainer>
          <TokenInput
            label="To"
            value={toAmount}
            onChange={setToAmount}
            token={toToken}
            onTokenSelect={() => setIsToModalOpen(true)}
            readOnly
            chain={toChain}
            onChainChange={setToChain}
            hideChainSelector={hideChainSelector}
          />

          {tokenPrices.fromPrice && tokenPrices.toPrice && (
            <RateDisplay>
              <RateRow>
                <RateLabel>Rate</RateLabel>
                <RateValue>
                  1 {fromToken.symbol} = {formatRate(tokenPrices.fromPrice / tokenPrices.toPrice)} {toToken.symbol}
                </RateValue>
              </RateRow>
              {fromAmount && toAmount && toAmount !== '...' && (
                <ConversionHighlight>
                  <ConversionLabel>You receive</ConversionLabel>
                  <ConversionValue>
                    {toAmount} {toToken.symbol}
                  </ConversionValue>
                </ConversionHighlight>
              )}
            </RateDisplay>
          )}

          {fromChain?.id !== toChain?.id && (
            <CrossChainIndicator>
              <CrossChainBadge>Bridge</CrossChainBadge>
              <CrossChainText>Cross-chain swap via</CrossChainText>
              <CrossChainRoute>LI.FI</CrossChainRoute>
            </CrossChainIndicator>
          )}

          {leverageControls}
          
          <SwapButton
            isConnected={isConnected}
            fromAmount={fromAmount}
            toAmount={toAmount}
            fromToken={fromToken}
            toToken={toToken}
            fromChain={fromChain}
            toChain={toChain}
            slippage={parseFloat(swapSettings.slippage)}
          />
          
          {fromAmount && toAmount && (
            <SwapDetails 
              fromAmount={fromAmount}
              toAmount={toAmount}
              fromToken={fromToken}
              toToken={toToken}
              slippage={swapSettings.slippage}
            />
          )}
        </SwapBody>
      </SwapContainer>
      
      <TokenModal
        isOpen={isFromModalOpen}
        onClose={() => setIsFromModalOpen(false)}
        onSelectToken={setFromToken}
        selectedToken={fromToken}
      />
      
      <TokenModal
        isOpen={isToModalOpen}
        onClose={() => setIsToModalOpen(false)}
        onSelectToken={setToToken}
        selectedToken={toToken}
      />
      
      <SwapSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={swapSettings}
        onUpdateSettings={setSwapSettings}
      />
      
      <BreederNotification
        token={breederNotification.token}
        show={breederNotification.show}
        onClose={() => setBreederNotification({ show: false, token: null })}
      />
    </>
  );
};

export default SwapInterface;