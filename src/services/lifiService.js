// LI.FI Service for Cross-Chain Swaps
// Integrates with LI.FI Diamond Contract: 0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3

import { ethers } from 'ethers';
import { LIFI_DIAMOND_ADDRESS, LIFI_DIAMOND_ABI, ERC20_ABI } from '../contracts/LiFiDiamondABI';

const LIFI_API_BASE = 'https://li.quest/v1';

// KumaDex Integrator Configuration
const KUMADEX_INTEGRATOR = 'kumadex';
const KUMADEX_FEE_RECIPIENT = '0x15305A9c292B4e38B3154f6bfa54841A84C92922';
const KUMADEX_FEE_PERCENT = 0.003; // 0.3% integrator fee

// Supported chains for LI.FI
export const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum', symbol: 'ETH', logo: '/chainlogos/ethereum.png' },
  56: { name: 'BNB Chain', symbol: 'BNB', logo: '/chainlogos/bnb.png' },
  137: { name: 'Polygon', symbol: 'MATIC', logo: '/chainlogos/polygon.png' },
  42161: { name: 'Arbitrum', symbol: 'ETH', logo: '/chainlogos/arbitrum.png' },
  10: { name: 'Optimism', symbol: 'ETH', logo: '/chainlogos/optimism.png' },
  43114: { name: 'Avalanche', symbol: 'AVAX', logo: '/chainlogos/avalanche.png' },
  250: { name: 'Fantom', symbol: 'FTM', logo: '/chainlogos/fantom.png' },
  8453: { name: 'Base', symbol: 'ETH', logo: '/chainlogos/base.png' },
};

// Native token addresses (zero address represents native token)
const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000';
const NATIVE_TOKEN_ALT = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

/**
 * Get available tokens for a specific chain
 */
export async function getTokensForChain(chainId) {
  try {
    const response = await fetch(`${LIFI_API_BASE}/tokens?chains=${chainId}`);
    if (!response.ok) throw new Error('Failed to fetch tokens');
    const data = await response.json();
    return data.tokens[chainId] || [];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}

/**
 * Get swap quote from LI.FI API
 * Includes KumaDex integrator fee sent to fee recipient wallet
 */
export async function getQuote({
  fromChainId,
  toChainId,
  fromToken,
  toToken,
  fromAmount,
  fromAddress,
  slippage = 0.5,
}) {
  try {
    const params = new URLSearchParams({
      fromChain: fromChainId.toString(),
      toChain: toChainId.toString(),
      fromToken: fromToken,
      toToken: toToken,
      fromAmount: fromAmount,
      fromAddress: fromAddress,
      slippage: (slippage / 100).toString(),
      integrator: KUMADEX_INTEGRATOR,
      fee: KUMADEX_FEE_PERCENT.toString(),
      referrer: KUMADEX_FEE_RECIPIENT,
    });

    const response = await fetch(`${LIFI_API_BASE}/quote?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get quote');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}

/**
 * Get multiple route options for a swap
 * Includes KumaDex integrator fee sent to fee recipient wallet
 */
export async function getRoutes({
  fromChainId,
  toChainId,
  fromToken,
  toToken,
  fromAmount,
  fromAddress,
  slippage = 0.5,
}) {
  try {
    const requestBody = {
      fromChainId: parseInt(fromChainId),
      toChainId: parseInt(toChainId),
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      fromAmount: fromAmount,
      fromAddress: fromAddress,
      options: {
        slippage: slippage / 100,
        integrator: KUMADEX_INTEGRATOR,
        fee: KUMADEX_FEE_PERCENT,
        referrer: KUMADEX_FEE_RECIPIENT,
        order: 'RECOMMENDED',
        allowSwitchChain: false,
      },
    };

    const response = await fetch(`${LIFI_API_BASE}/advanced/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get routes');
    }

    const data = await response.json();
    return data.routes || [];
  } catch (error) {
    console.error('Error getting routes:', error);
    throw error;
  }
}

/**
 * Check and set token approval if needed
 */
export async function checkAndApproveToken(signer, tokenAddress, amount) {
  // Native tokens don't need approval
  if (tokenAddress === NATIVE_TOKEN || tokenAddress.toLowerCase() === NATIVE_TOKEN_ALT.toLowerCase()) {
    return { approved: true, hash: null };
  }

  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const userAddress = await signer.getAddress();

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(userAddress, LIFI_DIAMOND_ADDRESS);
    const amountBN = ethers.BigNumber.from(amount);

    if (currentAllowance.gte(amountBN)) {
      return { approved: true, hash: null };
    }

    // Approve max amount
    const tx = await tokenContract.approve(LIFI_DIAMOND_ADDRESS, ethers.constants.MaxUint256);
    await tx.wait();

    return { approved: true, hash: tx.hash };
  } catch (error) {
    console.error('Error approving token:', error);
    throw error;
  }
}

/**
 * Execute a swap transaction using the quote data
 */
export async function executeSwap(signer, quote) {
  try {
    const { transactionRequest, action, estimate } = quote;

    if (!transactionRequest) {
      throw new Error('No transaction request in quote');
    }

    // Check approval first for non-native tokens
    if (action.fromToken.address !== NATIVE_TOKEN &&
        action.fromToken.address.toLowerCase() !== NATIVE_TOKEN_ALT.toLowerCase()) {
      await checkAndApproveToken(signer, action.fromToken.address, action.fromAmount);
    }

    // Execute the swap transaction
    const tx = await signer.sendTransaction({
      to: transactionRequest.to,
      data: transactionRequest.data,
      value: transactionRequest.value ? ethers.BigNumber.from(transactionRequest.value) : 0,
      gasLimit: transactionRequest.gasLimit ? ethers.BigNumber.from(transactionRequest.gasLimit) : undefined,
    });

    return {
      hash: tx.hash,
      fromToken: action.fromToken,
      toToken: action.toToken,
      fromAmount: action.fromAmount,
      toAmount: estimate.toAmount,
      fromChainId: action.fromChainId,
      toChainId: action.toChainId,
    };
  } catch (error) {
    console.error('Error executing swap:', error);
    throw error;
  }
}

/**
 * Get transaction status from LI.FI
 */
export async function getTransactionStatus(txHash, fromChainId, toChainId) {
  try {
    const params = new URLSearchParams({
      txHash: txHash,
      fromChain: fromChainId.toString(),
      toChain: toChainId.toString(),
    });

    const response = await fetch(`${LIFI_API_BASE}/status?${params}`);
    if (!response.ok) throw new Error('Failed to get status');

    return await response.json();
  } catch (error) {
    console.error('Error getting transaction status:', error);
    throw error;
  }
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount, decimals, maxDecimals = 6) {
  if (!amount) return '0';
  const value = ethers.utils.formatUnits(amount, decimals);
  const num = parseFloat(value);
  if (num === 0) return '0';
  if (num < 0.000001) return '<0.000001';
  return num.toLocaleString(undefined, { maximumFractionDigits: maxDecimals });
}

/**
 * Parse token amount from user input
 */
export function parseTokenAmount(amount, decimals) {
  if (!amount || isNaN(amount)) return '0';
  return ethers.utils.parseUnits(amount.toString(), decimals).toString();
}

/**
 * Check if address is native token
 */
export function isNativeToken(address) {
  return address === NATIVE_TOKEN || address.toLowerCase() === NATIVE_TOKEN_ALT.toLowerCase();
}

/**
 * Get chain explorer URL for transaction
 */
export function getExplorerUrl(chainId, txHash) {
  const explorers = {
    1: 'https://etherscan.io/tx/',
    56: 'https://bscscan.com/tx/',
    137: 'https://polygonscan.com/tx/',
    42161: 'https://arbiscan.io/tx/',
    10: 'https://optimistic.etherscan.io/tx/',
    43114: 'https://snowtrace.io/tx/',
    250: 'https://ftmscan.com/tx/',
    8453: 'https://basescan.org/tx/',
  };

  const baseUrl = explorers[chainId] || 'https://etherscan.io/tx/';
  return `${baseUrl}${txHash}`;
}

// Export fee configuration for UI display
export const FEE_CONFIG = {
  integrator: KUMADEX_INTEGRATOR,
  feeRecipient: KUMADEX_FEE_RECIPIENT,
  feePercent: KUMADEX_FEE_PERCENT,
  feePercentDisplay: `${(KUMADEX_FEE_PERCENT * 100).toFixed(1)}%`,
};

export default {
  SUPPORTED_CHAINS,
  FEE_CONFIG,
  getTokensForChain,
  getQuote,
  getRoutes,
  checkAndApproveToken,
  executeSwap,
  getTransactionStatus,
  formatTokenAmount,
  parseTokenAmount,
  isNativeToken,
  getExplorerUrl,
};
