// Contract addresses and configuration
export const CONTRACTS = {
  // Main KumaBreeder contract address - UPDATE THIS WITH DEPLOYED ADDRESS
  KUMABREEDER: process.env.NEXT_PUBLIC_KUMABREEDER_ADDRESS || '0xa206D322829e04fb5acD36F289eD5367AC3E73e4',

  // dKUMA Breeder contract address for staking dKUMA tokens
  DKUMA_BREEDER: process.env.NEXT_PUBLIC_DKUMA_BREEDER_ADDRESS || '0x00844Af60e061c30BB8cfF5D5D1637559AE1B682',
  
  // Network configuration
  NETWORK: {
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || 1, // 1 for Ethereum mainnet
    name: process.env.NEXT_PUBLIC_NETWORK_NAME || 'Ethereum',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    blockExplorer: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://etherscan.io'
  },
  
  // Transaction settings
  TX_SETTINGS: {
    gasLimitMultiplier: 1.2, // Add 20% to estimated gas
    confirmations: 2, // Wait for 2 block confirmations
    timeout: 60000, // 60 seconds timeout for transactions
  },
  
  // Pool settings
  POOL_SETTINGS: {
    refreshInterval: 30000, // Refresh pool data every 30 seconds
    blocksPerYear: 2372500, // Approximate blocks per year on Ethereum
    maxSlippage: 0.5, // 0.5% max slippage for swaps
  },
  
  // Token addresses
  TOKENS: {
    KUMA: process.env.NEXT_PUBLIC_KUMA_ADDRESS || '0x48C276e8d03813224bb1e55F953adB6d02FD3E02',
    dKUMA: process.env.NEXT_PUBLIC_DKUMA_ADDRESS || '0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8',
    SHIB: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', // SHIB token
    LEASH: '0x27C70Cd1946795B66be9d954418546998b546634', // LEASH token
    AKITA: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6', // AKITA token
    ELON: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3', // ELON token
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Mainnet WETH
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Mainnet USDT
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // Mainnet DAI
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Mainnet WBTC
  }
};

// Helper function to get contract address
export const getContractAddress = (contractName) => {
  return CONTRACTS[contractName] || null;
};

// Helper function to check if contract is deployed
export const isContractDeployed = (address) => {
  return address && address !== '0x0000000000000000000000000000000000000000';
};

// Helper function to get block explorer link
export const getExplorerLink = (type, value) => {
  const baseUrl = CONTRACTS.NETWORK.blockExplorer;
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${value}`;
    case 'address':
      return `${baseUrl}/address/${value}`;
    case 'block':
      return `${baseUrl}/block/${value}`;
    default:
      return baseUrl;
  }
};

// Helper function to format pool fee
export const formatPoolFee = (fee) => {
  return (parseInt(fee) / 10).toFixed(1) + '%';
};

// Helper function to calculate blocks until
export const getBlocksUntil = (targetBlock, currentBlock) => {
  const blocks = targetBlock - currentBlock;
  const seconds = blocks * 12; // ~12 seconds per block on Ethereum
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} seconds`;
};