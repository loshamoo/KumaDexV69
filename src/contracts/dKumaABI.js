// dKUMA Contract Address - DAO functionality built into the token contract
export const DKUMA_ADDRESS = '0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8';

// Network Configuration
export const NETWORK_CONFIG = {
  ETHEREUM_MAINNET: {
    chainId: 1,
    chainIdHex: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io'
  }
};

// dKUMA Token Contract ABI with DAO functionality
export const DKUMA_ABI = [
  // Standard ERC20 functions
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // DAO/Governance functions
  {
    "inputs": [{"internalType": "address", "name": "delegatee", "type": "address"}],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "delegates",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "getCurrentVotes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "blockNumber", "type": "uint256"}
    ],
    "name": "getPriorVotes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "getVotes",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Proposal functions (if available)
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "proposalId", "type": "uint256"}],
    "name": "proposals",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "proposer", "type": "address"},
      {"internalType": "uint256", "name": "eta", "type": "uint256"},
      {"internalType": "uint256", "name": "startBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "endBlock", "type": "uint256"},
      {"internalType": "uint256", "name": "forVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "againstVotes", "type": "uint256"},
      {"internalType": "bool", "name": "canceled", "type": "bool"},
      {"internalType": "bool", "name": "executed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"internalType": "bool", "name": "support", "type": "bool"}
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"internalType": "address", "name": "voter", "type": "address"}
    ],
    "name": "getReceipt",
    "outputs": [
      {"internalType": "bool", "name": "hasVoted", "type": "bool"},
      {"internalType": "bool", "name": "support", "type": "bool"},
      {"internalType": "uint256", "name": "votes", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "delegator", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "fromDelegate", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "toDelegate", "type": "address"}
    ],
    "name": "DelegateChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "delegate", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "previousBalance", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256"}
    ],
    "name": "DelegateVotesChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "id", "type": "uint256"}
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "id", "type": "uint256"}
    ],
    "name": "ProposalCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "uint256", "name": "id", "type": "uint256"}
    ],
    "name": "ProposalExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "voter", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"indexed": false, "internalType": "bool", "name": "support", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "votes", "type": "uint256"}
    ],
    "name": "VoteCast",
    "type": "event"
  }
];