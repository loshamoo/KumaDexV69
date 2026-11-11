/**
 * LI.FI quote/route fee parameters.
 *
 * LI.FI collects integrator fees for the `integrator` id to the wallet
 * configured in the LI.FI Partner Portal. The `referrer` field is
 * tracking-only and does not move funds — do not pass a fee router as referrer
 * and do not claim that this app routes fees on-chain via quote params.
 *
 * Owner action (portal, not this repo): set the fee wallet for integrator
 * `kumadex` to the SwapXFeeRouter once that contract is the intended sink.
 *
 * @see https://docs.li.fi/introduction/integrating-lifi/monetizing-integration
 */

export const LIFI_INTEGRATOR = 'kumadex';
export const LIFI_FEE_PERCENT = 0.003; // 0.3% of fromAmount

export function buildLifiQuoteQueryParams({ skipFee = false } = {}) {
  const params = {
    integrator: LIFI_INTEGRATOR,
  };
  if (!skipFee) {
    params.fee = String(LIFI_FEE_PERCENT);
  }
  return params;
}

export function buildLifiRouteOptions({ skipFee = false } = {}) {
  const options = {
    integrator: LIFI_INTEGRATOR,
  };
  if (!skipFee) {
    options.fee = LIFI_FEE_PERCENT;
  }
  return options;
}

/** True if a params/options object tries to treat referrer as a fee sink. */
export function hasFeeReferrer(obj) {
  return Boolean(obj && obj.referrer);
}
