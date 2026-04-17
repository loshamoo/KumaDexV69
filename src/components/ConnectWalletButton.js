import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ChevronDown, CreditCard, AlertCircle, RefreshCw } from 'react-feather';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACTS } from '../config/contracts';

// ERC20 ABI for balance calls (read-only)
const ERC20_BALANCE_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

// Token configurations for balance display
const DISPLAY_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, logo: '/breederlogos/eth.png' },
  { symbol: 'KUMA', name: 'Kuma Inu', address: CONTRACTS.TOKENS.KUMA, decimals: 18, logo: '/breederlogos/kuma.png' },
  { symbol: 'dKUMA', name: 'dKuma', address: CONTRACTS.TOKENS.dKUMA, decimals: 18, logo: '/breederlogos/dkuma.png' },
  { symbol: 'USDC', name: 'USD Coin', address: CONTRACTS.TOKENS.USDC, decimals: 6, logo: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
];

const ETHEREUM_MAINNET_CHAIN_ID = 1;

const ConnectButtonContainer = styled.div`
  position: relative;
`;

const ConnectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${({ connected }) => connected ? '8px 12px' : '10px 16px'};
  background: ${({ theme, connected }) => connected ? 'transparent' : '#4d2a52'};
  color: ${({ theme, connected }) => connected ? theme.colors.text.primary : '#ffffff'};
  border: 1px solid ${({ theme, connected }) => connected ? theme.colors.border.primary : '#4d2a52'};
  border-radius: 16px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 40px;

  &:hover {
    background: ${({ theme, connected }) => connected ? theme.colors.background.secondary : '#3f2153'};
    border-color: ${({ theme, connected }) => connected ? theme.colors.border.secondary : '#3f2153'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.primary};
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 280px;
  max-width: 320px;
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transform: translateY(${({ isOpen }) => isOpen ? 0 : '-10px'}) translateX(${({ isOpen }) => isOpen ? 0 : '10px'});
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  margin-bottom: 8px;
`;

const Address = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: monospace;
`;

const DisconnectButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.error};
    color: white;
  }
`;

const NetworkWarning = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #ff9800;
`;

const SwitchNetworkButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: #ff9800;
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;

  &:hover {
    background: #f57c00;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BalancesSection = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary};
  margin-bottom: 12px;
`;

const BalancesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const BalancesTitle = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RefreshButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.tertiary};
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
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

const BalanceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.primary}20;
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TokenIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background.interactive};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    border-radius: 50%;
  }
`;

const TokenSymbol = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BalanceValue = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: monospace;
`;

const LoadingText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const ErrorText = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.error};
`;

const ConnectWalletButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [balances, setBalances] = useState({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const { isConnected, account, chainId, web3, connectWallet, disconnectWallet, switchNetwork } = useWeb3();
  const dropdownRef = useRef(null);

  const isCorrectNetwork = chainId === ETHEREUM_MAINNET_CHAIN_ID;

  // Fetch token balances using read-only calls
  const fetchBalances = useCallback(async () => {
    if (!account || !web3) return;

    setLoadingBalances(true);
    setBalanceError(null);

    try {
      const newBalances = {};

      for (const token of DISPLAY_TOKENS) {
        try {
          if (token.address === null) {
            // ETH balance - read-only call
            const ethBalance = await web3.eth.getBalance(account);
            const ethValue = parseFloat(web3.utils.fromWei(ethBalance, 'ether'));
            newBalances[token.symbol] = ethValue;
          } else {
            // ERC20 token balance - read-only call
            const tokenContract = new web3.eth.Contract(ERC20_BALANCE_ABI, token.address);
            const balance = await tokenContract.methods.balanceOf(account).call();

            // Convert based on decimals
            const divisor = Math.pow(10, token.decimals);
            const tokenValue = parseFloat(balance) / divisor;
            newBalances[token.symbol] = tokenValue;
          }
        } catch (tokenErr) {
          console.warn(`Failed to fetch ${token.symbol} balance:`, tokenErr.message);
          newBalances[token.symbol] = null;
        }
      }

      setBalances(newBalances);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setBalanceError('Failed to load balances');
    } finally {
      setLoadingBalances(false);
    }
  }, [account, web3]);

  // Fetch balances when account or chainId changes
  useEffect(() => {
    if (isConnected && account && web3) {
      fetchBalances();
    }
  }, [isConnected, account, web3, chainId, fetchBalances]);

  // Handle network switch with error handling
  const handleSwitchNetwork = async () => {
    if (!window.ethereum) {
      setBalanceError('No wallet detected');
      return;
    }

    setSwitchingNetwork(true);
    setBalanceError(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum Mainnet
      });
    } catch (err) {
      if (err.code === 4902) {
        // Network not added - try to add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://ethereum.publicnode.com'],
              blockExplorerUrls: ['https://etherscan.io'],
            }],
          });
        } catch (addErr) {
          setBalanceError('Failed to add Ethereum network');
        }
      } else if (err.code === 4001) {
        setBalanceError('Network switch rejected');
      } else {
        setBalanceError('Failed to switch network');
      }
    } finally {
      setSwitchingNetwork(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance, symbol) => {
    if (balance === null || balance === undefined) return '--';
    if (balance === 0) return '0';

    // Format based on token type
    if (symbol === 'USDC') {
      return balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (balance < 0.0001) {
      return balance.toExponential(2);
    } else if (balance < 1) {
      return balance.toFixed(6);
    } else if (balance < 1000) {
      return balance.toFixed(4);
    } else {
      return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setBalances({});
    setIsOpen(false);
  };

  const handleConnectClick = () => {
    handleConnect();
  };

  if (isConnected && account) {
    return (
      <ConnectButtonContainer ref={dropdownRef}>
        <ConnectButton
          connected={true}
          onClick={() => setIsOpen(!isOpen)}
        >
          <CreditCard size={16} />
          {formatAddress(account)}
          <ChevronDown size={16} />
        </ConnectButton>

        <DropdownMenu isOpen={isOpen}>
          <AccountInfo>
            <Address>{formatAddress(account)}</Address>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {isCorrectNetwork ? 'Ethereum Mainnet' : `Chain ID: ${chainId}`}
            </div>
          </AccountInfo>

          {/* Network Warning */}
          {!isCorrectNetwork && (
            <>
              <NetworkWarning>
                <AlertCircle size={14} />
                <span>Please switch to Ethereum Mainnet</span>
              </NetworkWarning>
              <SwitchNetworkButton
                onClick={handleSwitchNetwork}
                disabled={switchingNetwork}
              >
                {switchingNetwork ? 'Switching...' : 'Switch to Ethereum Mainnet'}
              </SwitchNetworkButton>
            </>
          )}

          {/* Token Balances */}
          <BalancesSection>
            <BalancesHeader>
              <BalancesTitle>Balances</BalancesTitle>
              <RefreshButton
                onClick={fetchBalances}
                disabled={loadingBalances}
                $loading={loadingBalances}
                title="Refresh balances"
              >
                <RefreshCw size={14} />
              </RefreshButton>
            </BalancesHeader>

            {balanceError && <ErrorText>{balanceError}</ErrorText>}

            {DISPLAY_TOKENS.map((token) => (
              <BalanceItem key={token.symbol}>
                <TokenInfo>
                  <TokenIcon>
                    <img
                      src={token.logo}
                      alt={token.symbol}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </TokenIcon>
                  <TokenSymbol>{token.symbol}</TokenSymbol>
                </TokenInfo>
                {loadingBalances ? (
                  <LoadingText>Loading...</LoadingText>
                ) : (
                  <BalanceValue>
                    {formatBalance(balances[token.symbol], token.symbol)}
                  </BalanceValue>
                )}
              </BalanceItem>
            ))}
          </BalancesSection>

          <DisconnectButton onClick={handleDisconnect}>
            Disconnect
          </DisconnectButton>
        </DropdownMenu>
      </ConnectButtonContainer>
    );
  }

  return (
    <ConnectButtonContainer>
      <ConnectButton onClick={handleConnectClick}>
        <CreditCard size={16} />
        Connect Wallet
      </ConnectButton>
    </ConnectButtonContainer>
  );
};

export default ConnectWalletButton;