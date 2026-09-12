/**
 * Minimal SwapXFeeRouter ABI — Swept event + read getters for Hub /infinite-loop panel.
 * Source: kuma-audit foundry out/SwapXFeeRouter.sol (fragment). Public: loshamoo only.
 */

export const SWAPX_FEE_ROUTER_ABI = [
  {
    type: 'function',
    name: 'bpsBreeder',
    inputs: [],
    outputs: [{ name: '', type: 'uint16', internalType: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'bpsVessel',
    inputs: [],
    outputs: [{ name: '', type: 'uint16', internalType: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'dBreeder',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'lastSweepAt',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'usdc',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vessel',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'weth',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Swept',
    inputs: [
      { name: 'usdcAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'toBreeder', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'toVessel', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'bpsBreeder', type: 'uint16', indexed: false, internalType: 'uint16' },
      { name: 'bpsVessel', type: 'uint16', indexed: false, internalType: 'uint16' },
    ],
    anonymous: false,
  },
];

export default SWAPX_FEE_ROUTER_ABI;
