import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ethers } from 'ethers';

test('ethers v6 parseUnits/formatUnits (swap amount helpers)', () => {
  const parsed = ethers.parseUnits('1.5', 18);
  assert.equal(parsed, 1500000000000000000n);
  assert.equal(ethers.formatUnits(parsed, 18), '1.5');
});

test('ethers v6 providers used by SwapButton and Infinite Loop', () => {
  assert.equal(typeof ethers.BrowserProvider, 'function');
  assert.equal(typeof ethers.JsonRpcProvider, 'function');
  assert.equal(typeof ethers.providers, 'undefined');
  assert.equal(typeof ethers.BigNumber, 'undefined');
  assert.equal(typeof ethers.utils, 'undefined');
});
