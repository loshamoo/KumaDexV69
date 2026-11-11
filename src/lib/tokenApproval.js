/**
 * Exact-amount ERC-20 approvals. Unlimited (MaxUint256) approvals are not used.
 *
 * Some tokens (USDT-style) revert when changing a non-zero allowance to a
 * different non-zero value. Those need a reset-to-zero before the exact approve.
 */

export const MAX_UINT256 = (1n << 256n) - 1n;

export function toBigIntAmount(value) {
  if (value == null || value === '') return 0n;
  if (typeof value === 'bigint') return value;
  const s = String(value).trim();
  if (!s) return 0n;
  return BigInt(s);
}

export function isUnlimitedApproval(amount) {
  const a = toBigIntAmount(amount);
  return a === MAX_UINT256;
}

/**
 * @returns {{ skip: boolean, resetFirst: boolean, amount: bigint }}
 */
export function planExactApproval(currentAllowance, requiredAmount) {
  const current = toBigIntAmount(currentAllowance);
  const required = toBigIntAmount(requiredAmount);

  if (required <= 0n) {
    return { skip: true, resetFirst: false, amount: 0n };
  }
  if (current >= required) {
    return { skip: true, resetFirst: false, amount: required };
  }
  return {
    skip: false,
    resetFirst: current > 0n,
    amount: required,
  };
}

export function exactApprovalAmount(requiredAmount) {
  return toBigIntAmount(requiredAmount);
}
