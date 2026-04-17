import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getQuote, executeSwap, checkAndApproveToken, getExplorerUrl, isNativeToken } from '../services/lifiService';
import { LIFI_DIAMOND_ADDRESS } from '../contracts/LiFiDiamondABI';

const Button = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 12px;
  background: ${({ $disabled }) =>
    $disabled ? 'rgba(77, 42, 82, 0.5)' : '#4d2a52'};
  color: ${({ $disabled }) =>
    $disabled ? 'rgba(255, 255, 255, 0.5)' : 'white'};
  font-size: 18px;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  transition: all ${({ theme }) => theme.transitions.fast};
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  cursor: ${({ $disabled, $loading }) =>
    $disabled || $loading ? 'not-allowed' : 'pointer'};

  &:hover:not(:disabled) {
    background: ${({ $disabled }) => $disabled ? 'rgba(77, 42, 82, 0.5)' : '#3f2153'};
    opacity: 1;
  }
`;

const StatusContainer = styled.div`
  margin-top: 8px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background.module};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 13px;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatusValue = styled.span`
  color: ${({ $success, $error }) =>
    $success ? '#22c55e' :
    $error ? '#ef4444' :
    '#f7931a'};
  font-weight: 500;
`;

const TxLink = styled.a`
  color: #f7931a;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

// Chain ID mapping
const CHAIN_ID_MAP = {
  'eth': 1,
  'polygon': 137,
  'bnb': 56,
  'arb': 42161,
  'avax': 43114,
  'ftm': 250,
  'base': 8453,
  'op': 10,
};

const SwapButton = ({
  isConnected,
  fromAmount,
  toAmount,
  fromToken,
  toToken,
  fromChain,
  toChain,
  slippage = 0.5,
}) => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatus, setSwapStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  // Reset status when inputs change
  useEffect(() => {
    if (swapStatus === 'success' || swapStatus === 'error') {
      // Keep success/error status until user changes input
      const timer = setTimeout(() => {
        setSwapStatus(null);
        setTxHash(null);
        setError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [fromAmount, toAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!isConnected || !fromAmount || !fromToken || !toToken) return;

    setIsSwapping(true);
    setSwapStatus('connecting');
    setError(null);

    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to swap tokens');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      // Get chain IDs
      const fromChainId = CHAIN_ID_MAP[fromChain?.id] || 1;
      const toChainId = CHAIN_ID_MAP[toChain?.id] || 1;

      // Check if we're on the correct network
      const network = await provider.getNetwork();
      if (network.chainId !== fromChainId) {
        setSwapStatus('switching-network');
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${fromChainId.toString(16)}` }],
          });
        } catch (switchError) {
          throw new Error(`Please switch to the correct network`);
        }
      }

      // Get token addresses (handle native tokens)
      const fromTokenAddress = isNativeToken(fromToken.address) || fromToken.address === '0x0000000000000000000000000000000000000000'
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : fromToken.address;

      const toTokenAddress = isNativeToken(toToken.address) || toToken.address === '0x0000000000000000000000000000000000000000'
        ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        : toToken.address;

      // Parse amount to wei
      const decimals = fromToken.decimals || 18;
      const fromAmountWei = ethers.utils.parseUnits(fromAmount.toString(), decimals).toString();

      setSwapStatus('getting-quote');

      // Get quote from LiFi
      const quote = await getQuote({
        fromChainId,
        toChainId,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount: fromAmountWei,
        fromAddress: userAddress,
        slippage,
      });

      if (!quote || !quote.transactionRequest) {
        throw new Error('Could not get swap quote. Try a different amount or token pair.');
      }

      // Check and approve token if needed (for non-native tokens)
      if (!isNativeToken(fromTokenAddress) && fromTokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        setSwapStatus('approving');
        const approval = await checkAndApproveToken(signer, fromToken.address, fromAmountWei);
        if (approval.hash) {
          console.log('Approval tx:', approval.hash);
        }
      }

      setSwapStatus('swapping');

      // Execute the swap
      const result = await executeSwap(signer, quote);

      setTxHash(result.hash);
      setSwapStatus('success');

      console.log('Swap successful:', result);
    } catch (err) {
      console.error('Swap failed:', err);
      setError(err.message || 'Swap failed. Please try again.');
      setSwapStatus('error');
    } finally {
      setIsSwapping(false);
    }
  };

  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet';
    if (!fromAmount || parseFloat(fromAmount) === 0) return 'Enter an amount';
    if (isSwapping) {
      switch (swapStatus) {
        case 'connecting': return 'Connecting...';
        case 'switching-network': return 'Switch Network...';
        case 'getting-quote': return 'Getting Quote...';
        case 'approving': return 'Approving Token...';
        case 'swapping': return 'Swapping...';
        default: return 'Processing...';
      }
    }

    // Show cross-chain indicator if chains are different
    const fromChainId = CHAIN_ID_MAP[fromChain?.id] || 1;
    const toChainId = CHAIN_ID_MAP[toChain?.id] || 1;
    if (fromChainId !== toChainId) {
      return `Bridge & Swap`;
    }

    return 'Swap';
  };

  const isDisabled = !isConnected || !fromAmount || parseFloat(fromAmount) === 0;

  return (
    <>
      <Button
        onClick={handleSwap}
        $disabled={isDisabled}
        $loading={isSwapping}
        disabled={isDisabled || isSwapping}
      >
        {getButtonText()}
      </Button>

      {swapStatus && (swapStatus === 'success' || swapStatus === 'error') && (
        <StatusContainer>
          {swapStatus === 'success' && (
            <>
              <StatusRow>
                <StatusLabel>Status</StatusLabel>
                <StatusValue $success>Success!</StatusValue>
              </StatusRow>
              {txHash && (
                <StatusRow>
                  <StatusLabel>Transaction</StatusLabel>
                  <TxLink
                    href={getExplorerUrl(CHAIN_ID_MAP[fromChain?.id] || 1, txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer →
                  </TxLink>
                </StatusRow>
              )}
            </>
          )}
          {swapStatus === 'error' && (
            <StatusRow>
              <StatusLabel>Error</StatusLabel>
              <StatusValue $error>{error || 'Swap failed'}</StatusValue>
            </StatusRow>
          )}
        </StatusContainer>
      )}
    </>
  );
};

export default SwapButton;
