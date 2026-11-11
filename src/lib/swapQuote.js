/**
 * Spot swap preview math. Leverage must never be applied: there are no
 * live perpetuals contracts, so multiplying output by 1x–25x would mislead.
 */

export function previewSwapOutput({ fromAmount, fromPrice, toPrice }) {
  const inputAmount = Number(fromAmount);
  const from = Number(fromPrice);
  const to = Number(toPrice);
  if (!Number.isFinite(inputAmount) || inputAmount <= 0) return null;
  if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0 || to <= 0) return null;

  const fromValueUsd = inputAmount * from;
  const outputAmount = fromValueUsd / to;
  const sizeImpact = Math.min((fromValueUsd / 10000) * 0.01, 0.02);
  const totalImpact = 0.003 + sizeImpact;
  return outputAmount * (1 - totalImpact);
}

export function formatPreviewAmount(adjustedOutput) {
  if (adjustedOutput == null || !Number.isFinite(Number(adjustedOutput))) return '';
  const n = Number(adjustedOutput);
  if (n >= 1000000) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  if (n >= 1) return n.toFixed(4);
  if (n >= 0.000001) return n.toFixed(8);
  return n.toExponential(4);
}
