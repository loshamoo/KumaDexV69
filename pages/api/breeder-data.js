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
  '0xb4edfec7aa5588786901c63a8338e4b37611b2af': { symbol: 'dKUMA-ETH', primaryToken: 'dKUMA', priceKey: 'dkuma' },
  '0x811beed0119b4afce20d2583eb608c6f7af1954f': { symbol: 'SHIB-ETH', primaryToken: 'SHIB', priceKey: 'shib' },
  '0x874376be8231dad99aabf9ef0767b3cc054c60ee': { symbol: 'LEASH-ETH', primaryToken: 'LEASH', priceKey: 'leash' },
  '0xda3a20aad0c34fa742bd9813d45bbf67c787ae0b': { symbol: 'AKITA-ETH', primaryToken: 'AKITA', priceKey: 'akita' },
  '0x7b73644935b8e68019ac6356c40661e1bc315860': { symbol: 'ELON-ETH', primaryToken: 'ELON', priceKey: 'elon' },
  '0xdf60e6416fcf8c955fddf01148753a911f7a5905': { symbol: 'KUMA-ETH', primaryToken: 'KUMA', priceKey: 'kuma' }
};

const SINGLE_TOKEN_INFO = {
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': { symbol: 'SHIB', priceKey: 'shib', tokenAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' },
  '0x27c70cd1946795b66be9d954418546998b546634': { symbol: 'LEASH', priceKey: 'leash', tokenAddress: '0x27C70Cd1946795B66be9d954418546998b546634' },
  '0x3301ee63fb29f863f2333bd4466acb46cd8323e6': { symbol: 'AKITA', priceKey: 'akita', tokenAddress: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6' },
  '0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3': { symbol: 'ELON', priceKey: 'elon', tokenAddress: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3' },
  '0x48c276e8d03813224bb1e55f953adb6d02fd3e02': { symbol: 'KUMA', priceKey: 'kuma', tokenAddress: '0x48C276e8d03813224bb1e55F953adB6d02FD3E02' }
};

const TOKEN_ADDRESSES = {
  shib: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  leash: '0x27C70Cd1946795B66be9d954418546998b546634',
  akita: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6',
  elon: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3',
  kuma: '0x48C276e8d03813224bb1e55F953adB6d02FD3E02',
  dkuma: '0x3f5dd1A1538a4F9f82E543098f01F22480b0A3a8'
};

const RPC_ENDPOINTS = [
  'https://ethereum.publicnode.com',
  'https://1rpc.io/eth',
  'https://eth.drpc.org'
];

const TVL_APR_FLOOR_USD = 10;
const DUST_PRICE = 1e-9;

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

function isDust(price) {
  return !(price > 0) || price < DUST_PRICE;
}

function isSaneMarketPrice(price) {
  return price > 0 && price >= DUST_PRICE;
}

/**
 * Price selection for Breeder TVL:
 * - LP-implied from the known ETH Uniswap pair is source of truth when present
 *   (including honestly-low / dust if that pool is drained or poisoned).
 * - If LP-implied exists and CG differs by >50× (or CG is dust while LP > 0.01), keep LP.
 * - CoinGecko / DexScreener only fill gaps when LP-implied is missing (0 / failed).
 */
function pickSanePrice(lpImplied, candidates = []) {
  const saneCandidates = candidates.filter((p) => isSaneMarketPrice(p));
  const bestExternal = saneCandidates.length
    ? saneCandidates.reduce((a, b) => (a > b ? a : b))
    : 0;

  // LP-implied present → prefer it for ethereum TVL consistency
  if (lpImplied > 0) {
    if (lpImplied > 0.01 && saneCandidates.length) {
      // still prefer LP when CG is absurd vs LP
      return lpImplied;
    }
    return lpImplied;
  }

  // No LP-implied: use best sane external (CG / DexScreener)
  if (bestExternal > 0) return bestExternal;
  const any = candidates.find((p) => p > 0);
  return any || 0;
}

async function getLpReserves(web3, lpAddress) {
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
  const reserve0 = parseFloat(web3.utils.fromWei(reserves[0].toString(), 'ether'));
  const reserve1 = parseFloat(web3.utils.fromWei(reserves[1].toString(), 'ether'));

  let ethReserve = 0;
  let tokenReserve = 0;
  let hasWeth = false;

  if (token0Lower === WETH_ADDRESS) {
    hasWeth = true;
    ethReserve = reserve0;
    tokenReserve = reserve1;
  } else if (token1Lower === WETH_ADDRESS) {
    hasWeth = true;
    ethReserve = reserve1;
    tokenReserve = reserve0;
  }

  return {
    token0: token0Lower,
    token1: token1Lower,
    reserve0,
    reserve1,
    ethReserve,
    tokenReserve,
    hasWeth,
    totalSupplyNum: parseFloat(web3.utils.fromWei(totalSupply.toString(), 'ether')),
    stakedNum: parseFloat(web3.utils.fromWei(stakedBalance.toString(), 'ether'))
  };
}

function lpImpliedTokenPrice(ethReserve, tokenReserve, ethPrice) {
  if (!(tokenReserve > 0) || !(ethReserve > 0) || !(ethPrice > 0)) return 0;
  return (ethReserve / tokenReserve) * ethPrice;
}

async function fetchCoinGeckoPrices() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const ids = 'ethereum,shiba-inu,leash,doge-killer,akita-inu,dogelon-mars';
    const priceResp = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { signal: controller.signal }
    );
    if (!priceResp.ok) {
      console.warn('CoinGecko HTTP', priceResp.status);
      return {};
    }
    return await priceResp.json();
  } catch (err) {
    console.warn('CoinGecko price fetch failed:', err.message);
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDexScreenerPrice(tokenAddress, { rejectDustIfLp = false, lpImplied = 0 } = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!resp.ok) return 0;
    const data = await resp.json();
    const pairs = Array.isArray(data.pairs) ? data.pairs : [];
    if (!pairs.length) return 0;

    const target = tokenAddress.toLowerCase();
    const byLiq = (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0);
    const MIN_LIQ = 1000; // ignore dust / spoof micro-pairs

    // priceUsd is for baseToken — only trust pairs where our token is the base
    const asBase = pairs.filter((p) => (p.baseToken?.address || '').toLowerCase() === target);
    const ethPairs = asBase.filter((p) => p.chainId === 'ethereum').sort(byLiq);
    const allPairs = [...asBase].sort(byLiq);

    const pickFrom = (list, { allowDust = false, minLiq = MIN_LIQ } = {}) => {
      for (const p of list) {
        const liq = p.liquidity?.usd || 0;
        if (liq < minLiq) continue;
        const price = parseFloat(p.priceUsd);
        if (!(price > 0)) continue;
        if (!allowDust && isDust(price)) continue;
        if (rejectDustIfLp && lpImplied > 0.01 && isDust(price)) continue;
        return price;
      }
      return 0;
    };

    // Prefer highest-liquidity ethereum pair (token as base, non-dust, min liquidity)
    const ethSane = pickFrom(ethPairs);
    if (ethSane > 0) return ethSane;

    // Ethereum dust/empty: any-chain liquid pair (e.g. PulseChain LEASH)
    const anySane = pickFrom(allPairs);
    if (anySane > 0) return anySane;

    // Last resort: ethereum dust only if LP is also not a healthy reference
    if (!(lpImplied > 0.01)) {
      return pickFrom(ethPairs, { allowDust: true, minLiq: 0 });
    }
    return 0;
  } catch (err) {
    console.warn('DexScreener fetch failed:', err.message);
    return 0;
  }
}

async function calculateLPTvl(web3, lpAddress, ethPrice, prices) {
  try {
    const info = await getLpReserves(web3, lpAddress);
    if (info.totalSupplyNum === 0) return { tvl: 0, stakedNum: info.stakedNum, totalSupplyNum: 0 };

    if (info.hasWeth) {
      const tvl = (info.stakedNum / info.totalSupplyNum) * info.ethReserve * 2 * ethPrice;
      return { tvl, stakedNum: info.stakedNum, totalSupplyNum: info.totalSupplyNum, ethReserve: info.ethReserve };
    }

    // No WETH — value both sides with token prices when possible
    const price0 = prices[info.token0] || 0;
    const price1 = prices[info.token1] || 0;
    // Also try known symbols by matching against TOKEN_ADDRESSES
    let p0 = price0;
    let p1 = price1;
    for (const [key, addr] of Object.entries(TOKEN_ADDRESSES)) {
      if (addr.toLowerCase() === info.token0) p0 = p0 || prices[key] || 0;
      if (addr.toLowerCase() === info.token1) p1 = p1 || prices[key] || 0;
    }
    const poolUsd = info.reserve0 * p0 + info.reserve1 * p1;
    const tvl = (info.stakedNum / info.totalSupplyNum) * poolUsd;
    return { tvl, stakedNum: info.stakedNum, totalSupplyNum: info.totalSupplyNum };
  } catch (err) {
    console.error('Error calculating LP TVL:', lpAddress, err.message);
    return { tvl: 0 };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

  try {
    const web3 = await getWeb3();

    // 1) ETH from CoinGecko (fallback ~2500)
    const priceData = await fetchCoinGeckoPrices();
    const ethPrice = priceData.ethereum?.usd || 2500;

    // 2) LP-implied USD prices for every known ETH LP
    const lpImplied = {};
    await Promise.all(
      Object.entries(LP_TOKEN_INFO).map(async ([lpAddress, meta]) => {
        try {
          const info = await getLpReserves(web3, lpAddress);
          if (info.hasWeth && info.tokenReserve > 0) {
            lpImplied[meta.priceKey] = lpImpliedTokenPrice(info.ethReserve, info.tokenReserve, ethPrice);
          }
        } catch (err) {
          console.warn('LP-implied failed for', meta.symbol, err.message);
        }
      })
    );

    // 3) CoinGecko candidates (LEASH: try both leash + doge-killer)
    const cgShib = priceData['shiba-inu']?.usd || 0;
    const cgLeash = priceData.leash?.usd || 0;
    const cgDogeKiller = priceData['doge-killer']?.usd || 0;
    const cgAkita = priceData['akita-inu']?.usd || 0;
    const cgElon = priceData['dogelon-mars']?.usd || 0;

    // Prefer whichever LEASH CG id is sane vs LP
    const leashCgSane = pickSanePrice(lpImplied.leash || 0, [cgDogeKiller, cgLeash].filter(Boolean));
    // If pick returned LP and LP is dust, try max of sane CG ids explicitly
    const leashCgBest = [cgDogeKiller, cgLeash].filter((p) => isSaneMarketPrice(p)).sort((a, b) => b - a)[0] || 0;

    // 4) DexScreener last resort for tokens that still look wrong / missing
    const needDs = ['shib', 'leash', 'akita', 'elon'];
    const dsPrices = {};
    await Promise.all(
      needDs.map(async (key) => {
        const lp = lpImplied[key] || 0;
        // DexScreener only when LP-implied missing — do not override drained/poisoned LP dust
        if (!(lp > 0)) {
          const cg =
            key === 'shib' ? cgShib :
            key === 'leash' ? (leashCgBest || cgLeash) :
            key === 'akita' ? cgAkita :
            cgElon;
          if (!isSaneMarketPrice(cg)) {
            dsPrices[key] = await fetchDexScreenerPrice(TOKEN_ADDRESSES[key], {
              rejectDustIfLp: false,
              lpImplied: 0
            });
          }
        }
      })
    );

    const prices = {
      eth: ethPrice,
      weth: ethPrice,
      dkuma: lpImplied.dkuma || 0,
      kuma: lpImplied.kuma || 0,
      shib: pickSanePrice(lpImplied.shib || 0, [cgShib, dsPrices.shib].filter(Boolean)),
      // LEASH: Uniswap LEASH-ETH LP-implied is authoritative (honestly low if pool drained/poisoned)
      leash: pickSanePrice(lpImplied.leash || 0, [leashCgBest, cgDogeKiller, cgLeash, dsPrices.leash].filter(Boolean)),
      akita: pickSanePrice(lpImplied.akita || 0, [cgAkita, dsPrices.akita].filter(Boolean)),
      elon: pickSanePrice(lpImplied.elon || 0, [cgElon, dsPrices.elon].filter(Boolean))
    }

    console.log('Price map:', {
      eth: ethPrice,
      lpImplied,
      cg: { cgShib, cgLeash, cgDogeKiller, cgAkita, cgElon },
      ds: dsPrices,
      final: prices
    });

    const dkumaPrice = prices.dkuma;

    const breeder = new web3.eth.Contract(BREEDER_ABI, BREEDER_ADDRESS);
    const [poolLength, totalAllocPoint, sushiPerBlock] = await Promise.all([
      breeder.methods.poolLength().call(),
      breeder.methods.totalAllocPoint().call(),
      breeder.methods.sushiPerBlock().call()
    ]);

    const BLOCKS_PER_YEAR = 2628000;
    const sushiPerBlockNum = parseFloat(web3.utils.fromWei(sushiPerBlock.toString(), 'ether'));
    const totalAllocNum = parseFloat(totalAllocPoint.toString());
    const length = Number(poolLength);

    console.log('Contract data:', { poolLength: length, totalAllocPoint: totalAllocNum, sushiPerBlock: sushiPerBlockNum });

    // Parallelize pool iteration
    const poolResults = await Promise.all(
      Array.from({ length }, (_, pid) => pid).map(async (pid) => {
        try {
          const poolInfo = await breeder.methods.poolInfo(pid).call();
          const allocPoint = Number(poolInfo.allocPoint);
          if (allocPoint === 0) return null;

          const lpAddress = poolInfo.lpToken.toLowerCase();
          const knownLP = LP_TOKEN_INFO[lpAddress];
          const knownSingle = SINGLE_TOKEN_INFO[lpAddress];

          let tvl = 0;
          let symbol = 'UNKNOWN';
          let primaryToken = 'UNKNOWN';
          let isLP = false;
          let warning = undefined;

          if (knownLP) {
            isLP = true;
            symbol = knownLP.symbol;
            primaryToken = knownLP.primaryToken;
            const lpTvl = await calculateLPTvl(web3, lpAddress, ethPrice, prices);
            tvl = lpTvl.tvl || 0;
          } else if (knownSingle) {
            symbol = knownSingle.symbol;
            primaryToken = knownSingle.symbol;
            try {
              const tokenContract = new web3.eth.Contract(LP_ABI, lpAddress);
              const [stakedBalance, totalSupply] = await Promise.all([
                tokenContract.methods.balanceOf(BREEDER_ADDRESS).call(),
                tokenContract.methods.totalSupply().call().catch(() => null)
              ]);
              const stakedNum = parseFloat(web3.utils.fromWei(stakedBalance.toString(), 'ether'));
              const tokenPrice = prices[knownSingle.priceKey] || 0;
              tvl = stakedNum * tokenPrice;
              if (totalSupply != null) {
                const supplyNum = parseFloat(web3.utils.fromWei(totalSupply.toString(), 'ether'));
                if (supplyNum > 0 && stakedNum > supplyNum * 1.01) {
                  warning = 'staked-exceeds-supply';
                }
              }
            } catch (err) {
              console.error('Error getting single token TVL:', lpAddress, err.message);
            }
          } else {
            try {
              const lpContract = new web3.eth.Contract(LP_ABI, lpAddress);
              await lpContract.methods.token0().call();
              isLP = true;
              symbol = 'UNKNOWN-LP';
              const lpTvl = await calculateLPTvl(web3, lpAddress, ethPrice, prices);
              tvl = lpTvl.tvl || 0;
            } catch {
              symbol = 'UNKNOWN';
            }
          }

          let apr = '0.00';
          let aprNote = null;
          if (tvl < TVL_APR_FLOOR_USD) {
            apr = '0.00';
            aprNote = 'tvl-too-low';
          } else if (dkumaPrice > 0 && totalAllocNum > 0) {
            const poolShare = allocPoint / totalAllocNum;
            const yearlyRewards = sushiPerBlockNum * BLOCKS_PER_YEAR * poolShare;
            const yearlyUSD = yearlyRewards * dkumaPrice;
            let aprValue = (yearlyUSD / tvl) * 100;
            if (aprValue > 1e6) aprValue = 1e6;
            apr = aprValue.toFixed(2);
          }

          console.log(`Pool ${pid} (${symbol}):`, { allocPoint, tvl: tvl.toFixed(2), apr, aprNote });

          const out = {
            pid,
            lpToken: lpAddress,
            symbol,
            primaryToken,
            isLP,
            allocPoint,
            tvl: tvl.toFixed(2),
            apr
          };
          if (aprNote) out.aprNote = aprNote;
          if (warning) out.warning = warning;
          return out;
        } catch (poolErr) {
          console.error(`Error processing pool ${pid}:`, poolErr.message);
          return null;
        }
      })
    );

    const pools = poolResults.filter(Boolean);

    res.status(200).json({
      prices,
      totalAllocPoint: totalAllocNum,
      sushiPerBlock: sushiPerBlockNum,
      pools,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
