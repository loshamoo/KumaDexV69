// LI.FI Diamond Contract ABI
// Contract Address: 0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3
// Cross-chain bridge and DEX aggregator

export const LIFI_DIAMOND_ADDRESS = '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3';

export const LIFI_DIAMOND_ABI = [
  // ERC20 Approval
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Single Swap V3 - ERC20 to ERC20
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_transactionId", "type": "bytes32" },
      { "internalType": "string", "name": "_integrator", "type": "string" },
      { "internalType": "string", "name": "_referrer", "type": "string" },
      { "internalType": "address payable", "name": "_receiver", "type": "address" },
      { "internalType": "uint256", "name": "_minAmountOut", "type": "uint256" },
      {
        "components": [
          { "internalType": "address", "name": "callTo", "type": "address" },
          { "internalType": "address", "name": "approveTo", "type": "address" },
          { "internalType": "address", "name": "sendingAssetId", "type": "address" },
          { "internalType": "address", "name": "receivingAssetId", "type": "address" },
          { "internalType": "uint256", "name": "fromAmount", "type": "uint256" },
          { "internalType": "bytes", "name": "callData", "type": "bytes" },
          { "internalType": "bool", "name": "requiresDeposit", "type": "bool" }
        ],
        "internalType": "struct LibSwap.SwapData",
        "name": "_swapData",
        "type": "tuple"
      }
    ],
    "name": "swapTokensSingleV3ERC20ToERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Single Swap V3 - Native to ERC20
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_transactionId", "type": "bytes32" },
      { "internalType": "string", "name": "_integrator", "type": "string" },
      { "internalType": "string", "name": "_referrer", "type": "string" },
      { "internalType": "address payable", "name": "_receiver", "type": "address" },
      { "internalType": "uint256", "name": "_minAmountOut", "type": "uint256" },
      {
        "components": [
          { "internalType": "address", "name": "callTo", "type": "address" },
          { "internalType": "address", "name": "approveTo", "type": "address" },
          { "internalType": "address", "name": "sendingAssetId", "type": "address" },
          { "internalType": "address", "name": "receivingAssetId", "type": "address" },
          { "internalType": "uint256", "name": "fromAmount", "type": "uint256" },
          { "internalType": "bytes", "name": "callData", "type": "bytes" },
          { "internalType": "bool", "name": "requiresDeposit", "type": "bool" }
        ],
        "internalType": "struct LibSwap.SwapData",
        "name": "_swapData",
        "type": "tuple"
      }
    ],
    "name": "swapTokensSingleV3NativeToERC20",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },

  // Single Swap V3 - ERC20 to Native
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_transactionId", "type": "bytes32" },
      { "internalType": "string", "name": "_integrator", "type": "string" },
      { "internalType": "string", "name": "_referrer", "type": "string" },
      { "internalType": "address payable", "name": "_receiver", "type": "address" },
      { "internalType": "uint256", "name": "_minAmountOut", "type": "uint256" },
      {
        "components": [
          { "internalType": "address", "name": "callTo", "type": "address" },
          { "internalType": "address", "name": "approveTo", "type": "address" },
          { "internalType": "address", "name": "sendingAssetId", "type": "address" },
          { "internalType": "address", "name": "receivingAssetId", "type": "address" },
          { "internalType": "uint256", "name": "fromAmount", "type": "uint256" },
          { "internalType": "bytes", "name": "callData", "type": "bytes" },
          { "internalType": "bool", "name": "requiresDeposit", "type": "bool" }
        ],
        "internalType": "struct LibSwap.SwapData",
        "name": "_swapData",
        "type": "tuple"
      }
    ],
    "name": "swapTokensSingleV3ERC20ToNative",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Multiple Swap V3 - ERC20 to ERC20
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_transactionId", "type": "bytes32" },
      { "internalType": "string", "name": "_integrator", "type": "string" },
      { "internalType": "string", "name": "_referrer", "type": "string" },
      { "internalType": "address payable", "name": "_receiver", "type": "address" },
      { "internalType": "uint256", "name": "_minAmountOut", "type": "uint256" },
      {
        "components": [
          { "internalType": "address", "name": "callTo", "type": "address" },
          { "internalType": "address", "name": "approveTo", "type": "address" },
          { "internalType": "address", "name": "sendingAssetId", "type": "address" },
          { "internalType": "address", "name": "receivingAssetId", "type": "address" },
          { "internalType": "uint256", "name": "fromAmount", "type": "uint256" },
          { "internalType": "bytes", "name": "callData", "type": "bytes" },
          { "internalType": "bool", "name": "requiresDeposit", "type": "bool" }
        ],
        "internalType": "struct LibSwap.SwapData[]",
        "name": "_swapData",
        "type": "tuple[]"
      }
    ],
    "name": "swapTokensMultipleV3ERC20ToERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // Generic Swap with Bridge Data
  {
    "inputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "transactionId", "type": "bytes32" },
          { "internalType": "string", "name": "bridge", "type": "string" },
          { "internalType": "string", "name": "integrator", "type": "string" },
          { "internalType": "address", "name": "referrer", "type": "address" },
          { "internalType": "address", "name": "sendingAssetId", "type": "address" },
          { "internalType": "address", "name": "receiver", "type": "address" },
          { "internalType": "uint256", "name": "minAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "destinationChainId", "type": "uint256" },
          { "internalType": "bool", "name": "hasSourceSwaps", "type": "bool" },
          { "internalType": "bool", "name": "hasDestinationCall", "type": "bool" }
        ],
        "internalType": "struct ILiFi.BridgeData",
        "name": "_bridgeData",
        "type": "tuple"
      },
      {
        "components": [
          { "internalType": "address", "name": "callTo", "type": "address" },
          { "internalType": "address", "name": "approveTo", "type": "address" },
          { "internalType": "address", "name": "sendingAssetId", "type": "address" },
          { "internalType": "address", "name": "receivingAssetId", "type": "address" },
          { "internalType": "uint256", "name": "fromAmount", "type": "uint256" },
          { "internalType": "bytes", "name": "callData", "type": "bytes" },
          { "internalType": "bool", "name": "requiresDeposit", "type": "bool" }
        ],
        "internalType": "struct LibSwap.SwapData[]",
        "name": "_swapData",
        "type": "tuple[]"
      }
    ],
    "name": "swapAndStartBridgeTokensViaGenericCrossChain",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Standard ERC20 ABI for token approvals
export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default LIFI_DIAMOND_ABI;
