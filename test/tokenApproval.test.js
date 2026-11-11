import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_UINT256,
  planExactApproval,
  exactApprovalAmount,
  isUnlimitedApproval,
} from '../src/lib/tokenApproval.js';

test('skips approve when allowance already covers the exact amount', () => {
  const plan = planExactApproval('1000', '500');
  assert.equal(plan.skip, true);
  assert.equal(plan.resetFirst, false);
  assert.equal(plan.amount, 500n);
});

test('approves the exact required amount, never MaxUint256', () => {
  const plan = planExactApproval('0', '12345');
  assert.equal(plan.skip, false);
  assert.equal(plan.resetFirst, false);
  assert.equal(plan.amount, 12345n);
  assert.equal(isUnlimitedApproval(plan.amount), false);
  assert.equal(exactApprovalAmount('12345'), 12345n);
});

test('reset-to-zero first when current allowance is non-zero but insufficient', () => {
  const plan = planExactApproval('10', '100');
  assert.equal(plan.skip, false);
  assert.equal(plan.resetFirst, true);
  assert.equal(plan.amount, 100n);
});

test('MaxUint256 is treated as unlimited and is not the exact-approval path', () => {
  assert.equal(isUnlimitedApproval(MAX_UINT256), true);
  assert.equal(isUnlimitedApproval(MAX_UINT256.toString()), true);
  const plan = planExactApproval('0', '1');
  assert.notEqual(plan.amount, MAX_UINT256);
});
