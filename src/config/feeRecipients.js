/**
 * SwapX / LI.FI fee configuration.
 *
 * LI.FI collects the integrator fee for INTEGRATOR ('kumadex') to the wallet
 * configured in the LI.FI Partner Portal (https://portal.li.fi/). Passing an
 * address as `referrer` does not move funds — referrer is tracking-only.
 *
 * NEXT_PUBLIC_SWAPX_FEE_ROUTER is the on-chain SwapXFeeRouter used to sweep
 * USDC that actually arrives at that contract. It is not a LI.FI quote param.
 *
 * Owner action: in the LI.FI portal, set the fee wallet for integrator
 * `kumadex` to the SwapXFeeRouter once that contract should receive fees.
 * Public: loshamoo / Kuma community only.
 */

import { LIFI_FEE_PERCENT, LIFI_INTEGRATOR } from '../lib/lifiFeeParams';

/** Historical SwapX fee EOA (pre-router). Not passed to LI.FI as referrer. */
export const LEGACY_FEE_EOA = '0x15305A9c292B4e38B3154f6bfa54841A84C92922';

/** Deployed SwapXFeeRouter (empty until env set). */
export const SWAPX_FEE_ROUTER =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SWAPX_FEE_ROUTER
    ? String(process.env.NEXT_PUBLIC_SWAPX_FEE_ROUTER).trim()
    : '') || '';

export const FEE_PERCENT = LIFI_FEE_PERCENT;
export const INTEGRATOR = LIFI_INTEGRATOR;

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

function isValidAddress(addr) {
  return typeof addr === 'string' && ADDR_RE.test(addr);
}

/**
 * Intended on-chain fee hop (router when env is a valid 0x address, else the
 * legacy EOA). Display / ops only — not a LI.FI API parameter.
 */
export function getFeeRecipient() {
  if (isValidAddress(SWAPX_FEE_ROUTER)) {
    return SWAPX_FEE_ROUTER;
  }
  return LEGACY_FEE_EOA;
}

/** True when NEXT_PUBLIC_SWAPX_FEE_ROUTER is set and looks like an address. */
export const cutoverActive = isValidAddress(SWAPX_FEE_ROUTER);

export const FEE_CONFIG = {
  integrator: INTEGRATOR,
  feePercent: FEE_PERCENT,
  feePercentDisplay: `${(FEE_PERCENT * 100).toFixed(1)}%`,
  intendedOnChainRecipient: getFeeRecipient(),
  legacyFeeEoa: LEGACY_FEE_EOA,
  swapxFeeRouter: SWAPX_FEE_ROUTER || null,
  cutoverActive,
  // Kept for older UI reads; not a LI.FI referrer.
  feeRecipient: getFeeRecipient(),
};

export default {
  LEGACY_FEE_EOA,
  SWAPX_FEE_ROUTER,
  FEE_PERCENT,
  INTEGRATOR,
  getFeeRecipient,
  cutoverActive,
  FEE_CONFIG,
};
