import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previewSwapOutput, formatPreviewAmount } from '../src/lib/swapQuote.js';

test('preview is 1:1 minus impact when prices match (no leverage)', () => {
  const out = previewSwapOutput({ fromAmount: 1, fromPrice: 100, toPrice: 100 });
  assert.ok(out != null);
  // 0.3% base + tiny size impact
  assert.ok(out < 1);
  assert.ok(out > 0.99);
});

test('preview never multiplies by leverage — 25x must not inflate output', () => {
  const out = previewSwapOutput({ fromAmount: 10, fromPrice: 2, toPrice: 1 });
  // USD in = 20, raw out = 20, after ~0.3% ≈ 19.94
  assert.ok(out > 19.5 && out < 20);
  assert.notEqual(Math.round(out), 20 * 25);
});

test('preview returns null for missing prices or zero amount', () => {
  assert.equal(previewSwapOutput({ fromAmount: 1, fromPrice: null, toPrice: 1 }), null);
  assert.equal(previewSwapOutput({ fromAmount: 0, fromPrice: 1, toPrice: 1 }), null);
  assert.equal(previewSwapOutput({ fromAmount: 1, fromPrice: 1, toPrice: 0 }), null);
});

test('formatPreviewAmount handles magnitudes', () => {
  assert.equal(formatPreviewAmount(2.5), '2.5000');
  assert.ok(formatPreviewAmount(0.0001234).startsWith('0.000123'));
});
