import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getQuote, executeSwap, checkAndApproveToken, getExplorerUrl, isNativeToken, ensureWalletChain } from '../services/lifiService';
import {
  isSolanaChain,
  resolveLifiTokenAddress,
  resolveTokenDecimals,
  parseAmountToBase,
  executeSolanaSwap,
} from '../services/lifiSolana';
import { connectPhantom } from '../services/solanaWallet';

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

// Chain ID mapping (LiFi numeric ids)
const CHAIN_ID_MAP = {
  'eth': 1,
  'polygon': 137,
  'bnb': 56,
  'arb': 42161,
  'avax': 43114,
  'ftm': 250,
  'base': 8453,
  'op': 10,
  'out': 4663,
  'robinhood': 4663,
  'sol': 1151111081099710,
  'solana': 1151111081099710,
};

async function getEvmAddress() {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask to swap on EVM chains');
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const userAddress = await signer.getAddress();
  return { provider, signer, userAddress };
}

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
    if (!fromAmount || !fromToken || !toToken) return;

    setIsSwapping(true);
    setSwapStatus('connecting');
    setError(null);

    try {
      const fromChainId = CHAIN_ID_MAP[fromChain?.id] || 1;
      const toChainId = CHAIN_ID_MAP[toChain?.id] || 1;
      const fromIsSol = isSolanaChain(fromChainId);
      const toIsSol = isSolanaChain(toChainId);

      const fromTokenAddress = resolveLifiTokenAddress(fromToken, fromChainId);
      const toTokenAddress = resolveLifiTokenAddress(toToken, toChainId);
      const decimals = resolveTokenDecimals(fromToken, fromChainId);
      const fromAmountWei = parseAmountToBase(fromAmount, decimals);

      let fromAddress;
      let toAddress;
      let evmSigner = null;

      if (fromIsSol) {
        // Solana → * : Phantom signs the LiFi SVM tx
        setSwapStatus('connecting-phantom');
        fromAddress = await connectPhantom();
        if (toIsSol) {
          toAddress = fromAddress;
        } else {
          // dest EVM wallet
          if (!window.ethereum) {
            throw new Error('Connect MetaMask for the EVM destination address');
          }
          const evm = await getEvmAddress();
          toAddress = evm.userAddress;
        }
      } else {
        // EVM → * : MetaMask / ethers (unchanged Diamond path, incl. Robinhood 4663)
        if (!window.ethereum) {
          throw new Error('Please install MetaMask to swap tokens');
        }
        const evm = await getEvmAddress();
        evmSigner = evm.signer;
        fromAddress = evm.userAddress;

        const network = await evm.provider.getNetwork();
        if (network.chainId !== fromChainId) {
          setSwapStatus('switching-network');
          try {
            await ensureWalletChain(fromChainId);
          } catch (switchError) {
            throw new Error('Please switch to the correct network (add Robinhood Chain if prompted)');
          }
        }

        if (toIsSol) {
          setSwapStatus('connecting-phantom');
          toAddress = await connectPhantom();
        } else {
          toAddress = fromAddress;
        }
      }

      setSwapStatus('getting-quote');

      const quote = await getQuote({
        fromChainId,
        toChainId,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount: fromAmountWei,
        fromAddress,
        toAddress,
        slippage,
      });

      if (!quote || !quote.transactionRequest) {
        throw new Error('Could not get swap quote. Try a different amount or token pair.');
      }

      let result;
      if (fromIsSol) {
        setSwapStatus('swapping');
        result = await executeSolanaSwap(quote);
      } else {
        // EVM execute — same as before (approval + Diamond send)
        if (!isNativeToken(fromTokenAddress) && fromTokenAddress !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
          setSwapStatus('approving');
          const approval = await checkAndApproveToken(evmSigner, fromToken.address, fromAmountWei);
          if (approval.hash) {
            console.log('Approval tx:', approval.hash);
          }
        }
        setSwapStatus('swapping');
        result = await executeSwap(evmSigner, quote);
      }

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

  const fromIsSol = isSolanaChain(CHAIN_ID_MAP[fromChain?.id]);

  const getButtonText = () => {
    if (!fromIsSol && !isConnected) return 'Connect Wallet';
    if (!fromAmount || parseFloat(fromAmount) === 0) return 'Enter an amount';
    if (isSwapping) {
      switch (swapStatus) {
        case 'connecting': return 'Connecting...';
        case 'connecting-phantom': return 'Connect Phantom...';
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

  const isDisabled = (!fromIsSol && !isConnected) || !fromAmount || parseFloat(fromAmount) === 0;

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
export { CHAIN_ID_MAP };
