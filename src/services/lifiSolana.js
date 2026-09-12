// LiFi SVM helpers. Quote API is shared; only execute differs (Phantom + base64 tx).

import { getQuote } from './lifiService';
import { connectPhantom, signAndSendTransaction } from './solanaWallet';

export const SOLANA_CHAIN_ID = 1151111081099710;
export const SOLANA_CHAIN_KEY = 'sol';
export const SOLANA_NATIVE = '11111111111111111111111111111111';
export const SOLANA_WSOL = 'So11111111111111111111111111111111111111112';
export const SOLANA_USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

const EVM_NATIVE = '0x0000000000000000000000000000000000000000';
const EVM_NATIVE_ALT = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export function isSolanaChain(chainId) {
  if (chainId === undefined || chainId === null) return false;
  const n = Number(chainId);
  if (n === SOLANA_CHAIN_ID) return true;
  const s = String(chainId).toLowerCase();
  return s === 'sol' || s === 'solana' || s === String(SOLANA_CHAIN_ID);
}

export function isSolanaNative(address) {
  if (!address) return false;
  return address === SOLANA_NATIVE || address === SOLANA_WSOL;
}

function isEvmNative(address) {
  if (!address) return true;
  return (
    address === EVM_NATIVE ||
    address.toLowerCase() === EVM_NATIVE_ALT.toLowerCase()
  );
}

function looksLikeSolanaAddress(address) {
  if (!address || typeof address !== 'string') return false;
  if (address.startsWith('0x') || address.startsWith('0X')) return false;
  return address.length >= 32 && address.length <= 44;
}

/**
 * Map UI token → LiFi token address for the given chain.
 * Native ETH placeholder on Solana becomes native SOL.
 */
export function resolveLifiTokenAddress(token, chainId) {
  const addr = token?.address || '';
  if (isSolanaChain(chainId)) {
    if (looksLikeSolanaAddress(addr)) return addr;
    if (isEvmNative(addr) || isSolanaNative(addr) || token?.symbol === 'SOL' || token?.symbol === 'ETH') {
      return SOLANA_NATIVE;
    }
    throw new Error('Select a Solana token (SOL, USDC, …) when Solana is the selected chain');
  }
  if (isEvmNative(addr) || isSolanaNative(addr)) {
    return EVM_NATIVE_ALT;
  }
  return addr;
}

export function resolveTokenDecimals(token, chainId) {
  if (isSolanaChain(chainId)) {
    if (token?.chain === 'sol' && token.decimals != null) return token.decimals;
    const sym = (token?.symbol || '').toUpperCase();
    if (sym === 'USDC' || sym === 'USDT') return 6;
    return 9;
  }
  return token?.decimals || 18;
}

/** Parse a human amount to base units without ethers v5/v6 mismatch. */
export function parseAmountToBase(amount, decimals) {
  if (amount === undefined || amount === null || amount === '') return '0';
  const str = String(amount).trim();
  if (!str || str === '.') return '0';
  const neg = str.startsWith('-');
  const raw = neg ? str.slice(1) : str;
  const [wholePart, fracPart = ''] = raw.split('.');
  const whole = wholePart.replace(/\D/g, '') || '0';
  const frac = fracPart.replace(/\D/g, '').slice(0, decimals).padEnd(decimals, '0');
  const value = BigInt(whole) * (10n ** BigInt(decimals)) + BigInt(frac || '0');
  return (neg ? -value : value).toString();
}

/**
 * Execute a LiFi SVM quote via Phantom.
 * Live quotes (2026-09-11): SOL source → transactionRequest = { data: <base64> }.
 */
export async function executeSolanaSwap(quote) {
  const data = quote?.transactionRequest?.data;
  if (!data) {
    throw new Error('No Solana transaction in quote (expected transactionRequest.data)');
  }
  if (typeof data === 'string' && data.startsWith('0x')) {
    throw new Error('Quote looks like an EVM transaction — use the MetaMask path');
  }

  const signature = await signAndSendTransaction(data);
  const action = quote.action || {};
  const estimate = quote.estimate || {};
  return {
    hash: signature,
    fromToken: action.fromToken,
    toToken: action.toToken,
    fromAmount: action.fromAmount,
    toAmount: estimate.toAmount,
    fromChainId: action.fromChainId,
    toChainId: action.toChainId,
  };
}

/**
 * Ensure Phantom is connected and return { publicKey }.
 */
export async function ensureSolanaWallet() {
  const publicKey = await connectPhantom();
  return { publicKey };
}

export { getQuote };

export default {
  SOLANA_CHAIN_ID,
  SOLANA_NATIVE,
  SOLANA_WSOL,
  SOLANA_USDC,
  isSolanaChain,
  isSolanaNative,
  resolveLifiTokenAddress,
  resolveTokenDecimals,
  parseAmountToBase,
  executeSolanaSwap,
  ensureSolanaWallet,
};
