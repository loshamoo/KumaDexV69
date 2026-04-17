// Price service for fetching real-time cryptocurrency prices
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens';
const PRICE_CACHE_TIME = 30000; // Cache for 30 seconds

// Token addresses for DexScreener lookups
const TOKEN_ADDRESSES = {
  'KUMA': '0x48C276e8d03813224bb1e55F953adB6d02FD3E02',
  'DKUMA': '0x3f5dd1A1538a4F9f82E543098f01F22480b0A3a8',
  'SHIB': '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  'LEASH': '0x27C70Cd1946795B66be9d954418546998b546634',
  'ELON': '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3',
  'AKITA': '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6'
};

class PriceService {
  constructor() {
    this.cache = {};
    this.lastFetch = {};
  }

  async getETHPrice() {
    const cacheKey = 'eth-usd';
    const now = Date.now();

    // Return cached price if still valid
    if (this.cache[cacheKey] && this.lastFetch[cacheKey] && (now - this.lastFetch[cacheKey] < PRICE_CACHE_TIME)) {
      return this.cache[cacheKey];
    }

    try {
      // Try DexScreener first (WETH address)
      const response = await fetch(`${DEXSCREENER_API}/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`);
      const data = await response.json();

      if (data.pairs && data.pairs.length > 0) {
        const usdcPair = data.pairs.find(p => p.chainId === 'ethereum' && p.quoteToken?.symbol === 'USDC');
        const price = usdcPair ? parseFloat(usdcPair.priceUsd) : parseFloat(data.pairs[0].priceUsd);
        if (price > 0) {
          this.cache[cacheKey] = price;
          this.lastFetch[cacheKey] = now;
          return price;
        }
      }

      // Fallback to CoinGecko
      const cgResponse = await fetch(`${COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`);
      const cgData = await cgResponse.json();

      if (cgData.ethereum && cgData.ethereum.usd) {
        const price = cgData.ethereum.usd;
        this.cache[cacheKey] = price;
        this.lastFetch[cacheKey] = now;
        return price;
      }

      return this.cache[cacheKey] || 2500;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return this.cache[cacheKey] || 2500;
    }
  }

  async getTokenPrice(tokenSymbol) {
    const cacheKey = `${tokenSymbol}-usd`;
    const now = Date.now();

    // Return cached price if still valid
    if (this.cache[cacheKey] && this.lastFetch[cacheKey] && (now - this.lastFetch[cacheKey] < PRICE_CACHE_TIME)) {
      return this.cache[cacheKey];
    }

    try {
      const upperSymbol = tokenSymbol.toUpperCase();
      const tokenAddress = TOKEN_ADDRESSES[upperSymbol];

      // Try DexScreener first for tokens with known addresses
      if (tokenAddress) {
        const response = await fetch(`${DEXSCREENER_API}/${tokenAddress}`);
        const data = await response.json();

        if (data.pairs && data.pairs.length > 0) {
          // Find the most liquid Ethereum pair
          const ethPairs = data.pairs
            .filter(p => p.chainId === 'ethereum')
            .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));

          if (ethPairs.length > 0 && ethPairs[0].priceUsd) {
            const price = parseFloat(ethPairs[0].priceUsd);
            this.cache[cacheKey] = price;
            this.lastFetch[cacheKey] = now;
            return price;
          }
        }
      }

      // Fallback to CoinGecko for other tokens
      const coingeckoIds = {
        'KUMA': 'kuma-inu',
        'SHIB': 'shiba-inu',
        'LEASH': 'leash',
        'ELON': 'dogelon-mars',
        'AKITA': 'akita-inu',
        'ETH': 'ethereum',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'DAI': 'dai',
        'WBTC': 'wrapped-bitcoin',
        'UNI': 'uniswap',
        'LINK': 'chainlink',
        'AAVE': 'aave',
        'MATIC': 'matic-network',
        'CRV': 'curve-dao-token',
        'PEPE': 'pepe',
        'FLOKI': 'floki',
        'COMP': 'compound-coin',
        'MKR': 'maker',
        'SUSHI': 'sushi',
        'BONE': 'bone-shibaswap'
      };

      const coingeckoId = coingeckoIds[upperSymbol];

      if (coingeckoId) {
        const response = await fetch(`${COINGECKO_API}/simple/price?ids=${coingeckoId}&vs_currencies=usd`);
        const data = await response.json();

        if (data[coingeckoId] && data[coingeckoId].usd) {
          const price = data[coingeckoId].usd;
          this.cache[cacheKey] = price;
          this.lastFetch[cacheKey] = now;
          return price;
        }
      }

      return this.cache[cacheKey] || 0;
    } catch (error) {
      console.error(`Error fetching ${tokenSymbol} price:`, error);
      return this.cache[cacheKey] || 0;
    }
  }

  async getTokenPriceByAddress(tokenAddress) {
    // For demo purposes, return estimated prices based on address
    // In production, this would fetch from DEX or price oracle
    const tokenPrices = {
      '0x0000000000000000000000000000000000000001': 0.00001, // KUMA
      '0x0000000000000000000000000000000000000002': 0.000012, // SHIB  
      '0x0000000000000000000000000000000000000003': 450, // LEASH
      '0x0000000000000000000000000000000000000004': 0.0000001, // AKITA
      '0x0000000000000000000000000000000000000005': 0.00000008, // ELON
      '0x0000000000000000000000000000000000000006': 0.000005, // DKUMA
    };
    
    return tokenPrices[tokenAddress.toLowerCase()] || 0;
  }

  async getLPTokenPrice(lpTokenAddress, token0Address, token1Address) {
    try {
      // Get ETH price first
      const ethPrice = await this.getETHPrice();
      
      // For ETH pairs, use ETH price as base
      // This is a simplified calculation - real implementation would fetch reserves from the LP contract
      if (token1Address && token1Address.toLowerCase().includes('eth')) {
        return ethPrice * 2; // LP token worth ~2x the ETH value (simplified)
      }
      
      // For other pairs, estimate based on token prices
      const token0Price = await this.getTokenPriceByAddress(token0Address);
      const token1Price = await this.getTokenPriceByAddress(token1Address);
      
      // Simplified LP pricing (should use actual reserves in production)
      return (token0Price + token1Price) * ethPrice;
    } catch (error) {
      console.error('Error calculating LP token price:', error);
      return 100; // Fallback LP price
    }
  }

  formatUSD(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatLargeNumber(value) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  async convertToUSD(amount, tokenSymbol) {
    try {
      const tokenPrice = await this.getTokenPrice(tokenSymbol);
      const usdValue = parseFloat(amount) * tokenPrice;
      return usdValue;
    } catch (error) {
      console.error(`Error converting ${tokenSymbol} to USD:`, error);
      return 0;
    }
  }

  formatTokenAmount(amount, usdValue) {
    const tokenAmount = parseFloat(amount);
    if (tokenAmount === 0) return '0';
    
    // Show token amount with USD equivalent
    if (usdValue > 0.01) {
      return `${tokenAmount.toFixed(4)} (${this.formatUSD(usdValue)})`;
    } else if (usdValue > 0) {
      return `${tokenAmount.toFixed(4)} ($${usdValue.toFixed(6)})`;
    } else {
      return tokenAmount.toFixed(4);
    }
  }
}

// Export singleton instance
const priceService = new PriceService();
export default priceService;