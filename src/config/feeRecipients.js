/**
 * SwapX / LiFi integrator fee recipients.
 * Cutover: set NEXT_PUBLIC_SWAPX_FEE_ROUTER after router deploy → fees hit Timelock router.
 * Until then, getFeeRecipient() returns LEGACY_FEE_EOA.
 * Public: loshamoo only.
 */

/** Live SwapX fee EOA (pre-router). */
export const LEGACY_FEE_EOA = '0x15305A9c292B4e38B3154f6bfa54841A84C92922';

/** Deployed SwapXFeeRouter (empty until env set). */
export const SWAPX_FEE_ROUTER =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SWAPX_FEE_ROUTER
    ? String(process.env.NEXT_PUBLIC_SWAPX_FEE_ROUTER).trim()
    : '') || '';

export const FEE_PERCENT = 0.003; // 0.3% integrator fee
export const INTEGRATOR = 'kumadex';

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

function isValidAddress(addr) {
  return typeof addr === 'string' && ADDR_RE.test(addr);
}

/**
 * Active LiFi referrer: router when env is a valid 0x address, else legacy EOA.
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
  feeRecipient: getFeeRecipient(),
  feePercent: FEE_PERCENT,
  feePercentDisplay: `${(FEE_PERCENT * 100).toFixed(1)}%`,
  legacyFeeEoa: LEGACY_FEE_EOA,
  swapxFeeRouter: SWAPX_FEE_ROUTER || null,
  cutoverActive,
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
