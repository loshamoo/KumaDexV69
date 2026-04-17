// API route to fetch breeder data server-side (more reliable than client-side)
import Web3 from 'web3';

const BREEDER_ADDRESS = '0xa206D322829e04fb5acD36F289eD5367AC3E73e4';
const DKUMA_ETH_LP = '0xb4edfec7aa5588786901c63a8338e4b37611b2af';
const KUMA_ETH_LP = '0xdf60e6416fcf8c955fddf01148753a911f7a5905';
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

const BREEDER_ABI = [
  {"inputs":[],"name":"poolLength","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"_pid","type":"uint256"}],"name":"poolInfo","outputs":[{"name":"lpToken","type":"address"},{"name":"allocPoint","type":"uint256"},{"name":"lastRewardBlock","type":"uint256"},{"name":"accSushiPerShare","type":"uint256"},{"name":"poolFee","type":"uint256"},{"name":"limitPerWallet","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalAllocPoint","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"sushiPerBlock","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

const LP_ABI = [
  {"inputs":[],"name":"getReserves","outputs":[{"type":"uint112"},{"type":"uint112"},{"type":"uint32"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"token0","outputs":[{"type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"token1","outputs":[{"type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"type":"string"}],"stateMutability":"view","type":"function"}
];

const LP_TOKEN_INFO = {
  '0xb4edfec7aa5588786901c63a8338e4b37611b2af': { symbol: 'dKUMA-ETH', primaryToken: 'dKUMA' },
  '0x811beed0119b4afce20d2583eb608c6f7af1954f': { symbol: 'SHIB-ETH', primaryToken: 'SHIB' },
  '0x874376be8231dad99aabf9ef0767b3cc054c60ee': { symbol: 'LEASH-ETH', primaryToken: 'LEASH' },
  '0xda3a20aad0c34fa742bd9813d45bbf67c787ae0b': { symbol: 'AKITA-ETH', primaryToken: 'AKITA' },
  '0x7b73644935b8e68019ac6356c40661e1bc315860': { symbol: 'ELON-ETH', primaryToken: 'ELON' },
  '0xdf60e6416fcf8c955fddf01148753a911f7a5905': { symbol: 'KUMA-ETH', primaryToken: 'KUMA' }
};

const SINGLE_TOKEN_INFO = {
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': { symbol: 'SHIB', coingeckoId: 'shiba-inu' },
  '0x27c70cd1946795b66be9d954418546998b546634': { symbol: 'LEASH', coingeckoId: 'leash' },
  '0x3301ee63fb29f863f2333bd4466acb46cd8323e6': { symbol: 'AKITA', coingeckoId: 'akita-inu' },
  '0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3': { symbol: 'ELON', coingeckoId: 'dogelon-mars' },
  '0x48c276e8d03813224bb1e55f953adb6d02fd3e02': { symbol: 'KUMA', coingeckoId: null }
};

// RPC endpoints with fallback
const RPC_ENDPOINTS = [
  'https://ethereum.publicnode.com',
  'https://1rpc.io/eth',
  'https://eth.drpc.org'
];

// Helper to get working Web3 instance
async function getWeb3() {
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      const web3 = new Web3(rpcUrl);
      await web3.eth.getBlockNumber();
      return web3;
    } catch (e) {
      console.warn(`RPC ${rpcUrl} failed:`, e.message);
    }
  }
  throw new Error('All RPC endpoints failed');
}

// Helper to calculate LP TVL by checking token order
async function calculateLPTvl(web3, lpAddress, ethPrice) {
  try {
    const lpContract = new web3.eth.Contract(LP_ABI, lpAddress);

    const [token0, token1, reserves, totalSupply, stakedBalance] = await Promise.all([
      lpContract.methods.token0().call(),
      lpContract.methods.token1().call(),
      lpContract.methods.getReserves().call(),
      lpContract.methods.totalSupply().call(),
      lpContract.methods.balanceOf(BREEDER_ADDRESS).call()
    ]);

    const token0Lower = token0.toLowerCase();
    const token1Lower = token1.toLowerCase();

    // Determine which reserve is WETH
    let ethReserve;
    if (token0Lower === WETH_ADDRESS) {
      ethReserve = parseFloat(web3.utils.fromWei(reserves[0].toString(), 'ether'));
    } else if (token1Lower === WETH_ADDRESS) {
      ethReserve = parseFloat(web3.utils.fromWei(reserves[1].toString(), 'ether'));
    } else {
      // No WETH in this pair - return 0 for now
      console.warn('No WETH found in LP:', lpAddress);
      return 0;
    }

    const totalSupplyNum = parseFloat(web3.utils.fromWei(totalSupply.toString(), 'ether'));
    const stakedNum = parseFloat(web3.utils.fromWei(stakedBalance.toString(), 'ether'));

    if (totalSupplyNum === 0) return 0;

    // TVL = (staked/total) * ethReserve * 2 * ethPrice
    const tvl = (stakedNum / totalSupplyNum) * ethReserve * 2 * ethPrice;
    return tvl;
  } catch (err) {
    console.error('Error calculating LP TVL:', lpAddress, err.message);
    return 0;
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

  try {
    const web3 = await getWeb3();

    // Fetch ETH price with timeout
    let ethPrice = 2500; // Default fallback
    let priceData = {};

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const priceResp = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,shiba-inu,leash,akita-inu,dogelon-mars&vs_currencies=usd',
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      priceData = await priceResp.json();
      ethPrice = priceData.ethereum?.usd || 2500;
    } catch (priceErr) {
      console.warn('CoinGecko price fetch failed, using fallback:', priceErr.message);
    }

    // Get dKUMA price from LP (token0 = dKUMA, token1 = WETH)
    let dkumaPrice = 0;
    try {
      const dkumaLp = new web3.eth.Contract(LP_ABI, DKUMA_ETH_LP);
      const [dkumaToken0, dkumaReserves] = await Promise.all([
        dkumaLp.methods.token0().call(),
        dkumaLp.methods.getReserves().call()
      ]);

      // Determine which is dKUMA and which is WETH
      const isDkumaToken0 = dkumaToken0.toLowerCase() !== WETH_ADDRESS;
      const dkumaReserve = parseFloat(web3.utils.fromWei(
        (isDkumaToken0 ? dkumaReserves[0] : dkumaReserves[1]).toString(), 'ether'
      ));
      const dkumaEthReserve = parseFloat(web3.utils.fromWei(
        (isDkumaToken0 ? dkumaReserves[1] : dkumaReserves[0]).toString(), 'ether'
      ));

      if (dkumaReserve > 0) {
        dkumaPrice = (dkumaEthReserve * ethPrice) / dkumaReserve;
      }
      console.log('dKUMA price calculation:', { dkumaReserve, dkumaEthReserve, dkumaPrice });
    } catch (err) {
      console.error('Error getting dKUMA price:', err.message);
    }

    // Get KUMA price from LP
    let kumaPrice = 0;
    try {
      const kumaLp = new web3.eth.Contract(LP_ABI, KUMA_ETH_LP);
      const [kumaToken0, kumaReserves] = await Promise.all([
        kumaLp.methods.token0().call(),
        kumaLp.methods.getReserves().call()
      ]);

      const isKumaToken0 = kumaToken0.toLowerCase() !== WETH_ADDRESS;
      const kumaReserve = parseFloat(web3.utils.fromWei(
        (isKumaToken0 ? kumaReserves[0] : kumaReserves[1]).toString(), 'ether'
      ));
      const kumaEthReserve = parseFloat(web3.utils.fromWei(
        (isKumaToken0 ? kumaReserves[1] : kumaReserves[0]).toString(), 'ether'
      ));

      if (kumaReserve > 0) {
        kumaPrice = (kumaEthReserve * ethPrice) / kumaReserve;
      }
      console.log('KUMA price calculation:', { kumaReserve, kumaEthReserve, kumaPrice });
    } catch (err) {
      console.error('Error getting KUMA price:', err.message);
    }

    const prices = {
      eth: ethPrice,
      weth: ethPrice,
      dkuma: dkumaPrice,
      kuma: kumaPrice,
      shib: priceData['shiba-inu']?.usd || 0.00001,
      leash: priceData.leash?.usd || 300,
      akita: priceData['akita-inu']?.usd || 0.0000001,
      elon: priceData['dogelon-mars']?.usd || 0.0000001
    };

    // Get contract data
    const breeder = new web3.eth.Contract(BREEDER_ABI, BREEDER_ADDRESS);
    const [poolLength, totalAllocPoint, sushiPerBlock] = await Promise.all([
      breeder.methods.poolLength().call(),
      breeder.methods.totalAllocPoint().call(),
      breeder.methods.sushiPerBlock().call()
    ]);

    const BLOCKS_PER_YEAR = 2628000;
    const sushiPerBlockNum = parseFloat(web3.utils.fromWei(sushiPerBlock.toString(), 'ether'));
    const totalAllocNum = parseFloat(totalAllocPoint.toString());

    console.log('Contract data:', { poolLength: Number(poolLength), totalAllocPoint: totalAllocNum, sushiPerBlock: sushiPerBlockNum });

    const pools = [];

    for (let pid = 0; pid < Number(poolLength); pid++) {
      try {
        const poolInfo = await breeder.methods.poolInfo(pid).call();
        const allocPoint = Number(poolInfo.allocPoint);

        if (allocPoint === 0) continue;

        const lpAddress = poolInfo.lpToken.toLowerCase();
        const knownLP = LP_TOKEN_INFO[lpAddress];
        const knownSingle = SINGLE_TOKEN_INFO[lpAddress];

        let tvl = 0;
        let symbol = 'UNKNOWN';
        let primaryToken = 'UNKNOWN';
        let isLP = false;

        if (knownLP) {
          // LP Token - calculate TVL with proper token order checking
          isLP = true;
          symbol = knownLP.symbol;
          primaryToken = knownLP.primaryToken;
          tvl = await calculateLPTvl(web3, lpAddress, ethPrice);
        } else if (knownSingle) {
          // Single Token
          symbol = knownSingle.symbol;
          primaryToken = knownSingle.symbol;

          try {
            const tokenContract = new web3.eth.Contract(LP_ABI, lpAddress);
            const stakedBalance = await tokenContract.methods.balanceOf(BREEDER_ADDRESS).call();
            const stakedNum = parseFloat(web3.utils.fromWei(stakedBalance.toString(), 'ether'));
            const tokenPrice = prices[knownSingle.symbol.toLowerCase()] || 0;
            tvl = stakedNum * tokenPrice;
          } catch (err) {
            console.error('Error getting single token TVL:', lpAddress, err.message);
          }
        } else {
          // Unknown token - try to detect if it's an LP
          try {
            const lpContract = new web3.eth.Contract(LP_ABI, lpAddress);
            await lpContract.methods.token0().call();
            // If we get here, it's likely an LP
            isLP = true;
            symbol = 'UNKNOWN-LP';
            tvl = await calculateLPTvl(web3, lpAddress, ethPrice);
          } catch {
            // Not an LP, treat as single token
            symbol = 'UNKNOWN';
          }
        }

        // Calculate APR
        let apr = 0;
        if (tvl > 0 && dkumaPrice > 0) {
          const poolShare = allocPoint / totalAllocNum;
          const yearlyRewards = sushiPerBlockNum * BLOCKS_PER_YEAR * poolShare;
          const yearlyUSD = yearlyRewards * dkumaPrice;
          apr = (yearlyUSD / tvl) * 100;
        }

        // Log pool details for debugging
        console.log(`Pool ${pid} (${symbol}):`, { allocPoint, tvl: tvl.toFixed(2), apr: apr.toFixed(2) });

        pools.push({
          pid,
          lpToken: lpAddress,
          symbol,
          primaryToken,
          isLP,
          allocPoint,
          tvl: tvl.toFixed(2),
          apr: apr.toFixed(2)
        });
      } catch (poolErr) {
        console.error(`Error processing pool ${pid}:`, poolErr.message);
      }
    }

    res.status(200).json({
      prices,
      totalAllocPoint: totalAllocNum,
      sushiPerBlock: sushiPerBlockNum,
      pools
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
