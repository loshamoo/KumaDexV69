import { useState, useEffect, useCallback, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  KUMABREEDER_ABI,
  KUMABREEDER_ADDRESS,
  ERC20_ABI,
  UNISWAP_PAIR_ABI,
  TOKEN_ADDRESSES,
  NETWORK_CONFIG
} from '../contracts/KumaBreederABI';
import Web3 from 'web3';

// Cache keys
const CACHE_KEY = 'kumabreeder_pools_cache_v3';
const PRICE_CACHE_KEY = 'kumabreeder_prices_cache';
const CACHE_EXPIRY = 30000;

// Known token addresses for identification (all lowercase for comparison)
const KNOWN_TOKENS = {
  // Wrapped ETH
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { symbol: 'WETH', decimals: 18, coingeckoId: 'ethereum' },
  // dKUMA token (token0 in dKUMA-ETH LP)
  '0x3f5dd1a1538a4f9f82e543098f01f22480b0a3a8': { symbol: 'dKUMA', decimals: 18, coingeckoId: null },
  // KUMA token (Pool 12 single staking, token0 in KUMA-ETH LP)
  '0x48c276e8d03813224bb1e55f953adb6d02fd3e02': { symbol: 'KUMA', decimals: 18, coingeckoId: 'kuma-inu' },
  // SHIB token (Pool 2 single staking, token0 in SHIB-ETH LP)
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': { symbol: 'SHIB', decimals: 18, coingeckoId: 'shiba-inu' },
  // LEASH token (Pool 3 single staking, token0 in LEASH-ETH LP)
  '0x27c70cd1946795b66be9d954418546998b546634': { symbol: 'LEASH', decimals: 18, coingeckoId: 'leash' },
  // AKITA token (Pool 4 single staking, token0 in AKITA-ETH LP)
  '0x3301ee63fb29f863f2333bd4466acb46cd8323e6': { symbol: 'AKITA', decimals: 18, coingeckoId: 'akita-inu' },
  // ELON token (Pool 5 single staking, token0 in ELON-ETH LP)
  '0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3': { symbol: 'ELON', decimals: 18, coingeckoId: 'dogelon-mars' }
};

// LP token address to primary token mapping (for logo display)
// These are the actual Uniswap V2 LP token addresses from the KumaBreeder contract
const LP_TOKEN_INFO = {
  // Pool 6: dKUMA-ETH LP (allocPoint: 1500)
  '0xb4edfec7aa5588786901c63a8338e4b37611b2af': { symbol: 'dKUMA-ETH', primaryToken: 'dKUMA' },
  // Pool 8: SHIB-ETH LP (allocPoint: 100)
  '0x811beed0119b4afce20d2583eb608c6f7af1954f': { symbol: 'SHIB-ETH', primaryToken: 'SHIB' },
  // Pool 9: LEASH-ETH LP (allocPoint: 100)
  '0x874376be8231dad99aabf9ef0767b3cc054c60ee': { symbol: 'LEASH-ETH', primaryToken: 'LEASH' },
  // Pool 10: AKITA-ETH LP (allocPoint: 5)
  '0xda3a20aad0c34fa742bd9813d45bbf67c787ae0b': { symbol: 'AKITA-ETH', primaryToken: 'AKITA' },
  // Pool 11: ELON-ETH LP (allocPoint: 1)
  '0x7b73644935b8e68019ac6356c40661e1bc315860': { symbol: 'ELON-ETH', primaryToken: 'ELON' },
  // Pool 13: KUMA-ETH LP (allocPoint: 1000)
  '0xdf60e6416fcf8c955fddf01148753a911f7a5905': { symbol: 'KUMA-ETH', primaryToken: 'KUMA' }
};

// Single token staking addresses (for reference)
// Pool 2: SHIB - 0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce (allocPoint: 50)
// Pool 3: LEASH - 0x27c70cd1946795b66be9d954418546998b546634 (allocPoint: 50)
// Pool 4: AKITA - 0x3301ee63fb29f863f2333bd4466acb46cd8323e6 (allocPoint: 5)
// Pool 5: ELON - 0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3 (allocPoint: 5)
// Pool 12: KUMA - 0x48c276e8d03813224bb1e55f953adb6d02fd3e02 (allocPoint: 2000)

const getCachedPools = () => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) return data;
    }
  } catch (e) {}
  return null;
};

const setCachedPools = (pools) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: pools, timestamp: Date.now() }));
  } catch (e) {}
};

const getCachedPrices = () => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(PRICE_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 60000) return data;
    }
  } catch (e) {}
  return null;
};

const setCachedPrices = (prices) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify({ data: prices, timestamp: Date.now() }));
  } catch (e) {}
};

const useBreederContractWeb3 = () => {
  const { web3: walletWeb3, account, isConnected, chainId } = useWeb3();
  const [contract, setContract] = useState(null);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txPending, setTxPending] = useState(false);
  const [error, setError] = useState(null);
  const [readOnlyWeb3, setReadOnlyWeb3] = useState(null);
  const [prices, setPrices] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);

  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const mountedRef = useRef(true);

  // Load cached data after hydration (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    const cachedPools = getCachedPools();
    const cachedPrices = getCachedPrices();
    if (cachedPools && cachedPools.length > 0) {
      setPools(cachedPools);
      setLoading(false);
    }
    if (cachedPrices) {
      setPrices(cachedPrices);
    }
  }, []);

  const fetchWithTimeout = (promise, timeout = 5000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);
  };

  // dKUMA-ETH LP address for price calculation
  const DKUMA_ETH_LP = '0xB4EdfeC7Aa5588786901C63A8338e4b37611B2Af';
  // KUMA-ETH LP address for KUMA price
  const KUMA_ETH_LP = '0xDF60E6416Fcf8C955FdDF01148753A911F7A5905';

  // Fetch prices from CoinGecko + calculate dKUMA/KUMA from LP
  const fetchPrices = useCallback(async () => {
    try {
      const ids = 'ethereum,shiba-inu,leash,akita-inu,dogelon-mars';
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await response.json();
      const ethPrice = data.ethereum?.usd || 2000;

      // Calculate dKUMA and KUMA prices from their LP pools
      let dkumaPrice = 0;
      let kumaPrice = 0;

      const currentWeb3 = walletWeb3 || readOnlyWeb3;
      if (currentWeb3) {
        try {
          // Get dKUMA price from dKUMA-ETH LP (dKUMA is token0, WETH is token1)
          const dkumaLpContract = new currentWeb3.eth.Contract(UNISWAP_PAIR_ABI, DKUMA_ETH_LP);
          const dkumaReserves = await fetchWithTimeout(dkumaLpContract.methods.getReserves().call(), 10000);
          const dkumaReserve = parseFloat(currentWeb3.utils.fromWei(dkumaReserves._reserve0.toString(), 'ether'));
          const dkumaEthReserve = parseFloat(currentWeb3.utils.fromWei(dkumaReserves._reserve1.toString(), 'ether'));
          if (dkumaReserve > 0) {
            dkumaPrice = (dkumaEthReserve * ethPrice) / dkumaReserve;
          }
          console.log('dKUMA LP:', { reserve: dkumaReserve, ethReserve: dkumaEthReserve, price: dkumaPrice });

          // Get KUMA price from KUMA-ETH LP (KUMA is token0, WETH is token1)
          const kumaLpContract = new currentWeb3.eth.Contract(UNISWAP_PAIR_ABI, KUMA_ETH_LP);
          const kumaReserves = await fetchWithTimeout(kumaLpContract.methods.getReserves().call(), 10000);
          const kumaReserve = parseFloat(currentWeb3.utils.fromWei(kumaReserves._reserve0.toString(), 'ether'));
          const kumaEthReserve = parseFloat(currentWeb3.utils.fromWei(kumaReserves._reserve1.toString(), 'ether'));
          if (kumaReserve > 0) {
            kumaPrice = (kumaEthReserve * ethPrice) / kumaReserve;
          }
          console.log('KUMA LP:', { reserve: kumaReserve, ethReserve: kumaEthReserve, price: kumaPrice });
        } catch (lpErr) {
          console.warn('Failed to get LP prices:', lpErr.message);
        }
      }

      const newPrices = {
        eth: ethPrice,
        weth: ethPrice,
        shib: data['shiba-inu']?.usd || 0.00001,
        leash: data.leash?.usd || 300,
        akita: data['akita-inu']?.usd || 0.0000001,
        elon: data['dogelon-mars']?.usd || 0.0000001,
        kuma: kumaPrice || 0.000000001,
        dkuma: dkumaPrice || 0.00002
      };

      console.log('Final Prices:', { eth: ethPrice, dkuma: dkumaPrice, kuma: kumaPrice });

      setPrices(newPrices);
      setCachedPrices(newPrices);
      return newPrices;
    } catch (err) {
      console.warn('Price fetch failed:', err.message);
      return prices.eth ? prices : {
        eth: 2000, weth: 2000, shib: 0.00001, leash: 300,
        akita: 0.0000001, elon: 0.0000001, kuma: 0.000000001, dkuma: 0.00002
      };
    }
  }, [prices, walletWeb3, readOnlyWeb3]);

  // Initialize Web3
  useEffect(() => {
    mountedRef.current = true;
    const initWeb3 = async () => {
      const rpcEndpoints = [
        'https://ethereum.publicnode.com',
        'https://1rpc.io/eth',
        'https://eth.drpc.org'
      ];

      for (const rpcUrl of rpcEndpoints) {
        try {
          const web3Instance = new Web3(new Web3.providers.HttpProvider(rpcUrl, { timeout: 5000 }));
          await fetchWithTimeout(web3Instance.eth.getBlockNumber(), 5000);
          if (!mountedRef.current) return;
          setReadOnlyWeb3(web3Instance);
          setContract(new web3Instance.eth.Contract(KUMABREEDER_ABI, KUMABREEDER_ADDRESS));
          return;
        } catch (e) {
          console.warn(`RPC ${rpcUrl} failed:`, e.message);
        }
      }
      if (mountedRef.current) {
        setError('Unable to connect to Ethereum');
        setLoading(false);
      }
    };
    initWeb3();
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (walletWeb3 && KUMABREEDER_ADDRESS) {
      setContract(new walletWeb3.eth.Contract(KUMABREEDER_ABI, KUMABREEDER_ADDRESS));
    }
  }, [walletWeb3]);

  // Get token info from address
  const getTokenInfo = useCallback((address) => {
    if (!address) return { symbol: 'TOKEN', decimals: 18 };
    const known = KNOWN_TOKENS[address.toLowerCase()];
    return known || { symbol: 'TOKEN', decimals: 18 };
  }, []);

  // Check if token is a Uniswap LP pair
  const isLPToken = useCallback(async (tokenAddress) => {
    const web3Instance = walletWeb3 || readOnlyWeb3;
    if (!web3Instance) return false;
    try {
      const lpContract = new web3Instance.eth.Contract(UNISWAP_PAIR_ABI, tokenAddress);
      await fetchWithTimeout(lpContract.methods.token0().call(), 2000);
      return true;
    } catch {
      return false;
    }
  }, [walletWeb3, readOnlyWeb3]);

  // Get LP pair info
  const getLPPairInfo = useCallback(async (lpAddress) => {
    const web3Instance = walletWeb3 || readOnlyWeb3;
    if (!web3Instance) {
      console.log('getLPPairInfo: No web3 instance for', lpAddress);
      return null;
    }
    try {
      const lpContract = new web3Instance.eth.Contract(UNISWAP_PAIR_ABI, lpAddress);

      // Try to get token0 first to check if it's an LP
      const token0 = await fetchWithTimeout(lpContract.methods.token0().call(), 8000);
      const token1 = await fetchWithTimeout(lpContract.methods.token1().call(), 8000);

      // If we got here, it's an LP token
      const [reserves, totalSupply, stakedBalance] = await Promise.all([
        fetchWithTimeout(lpContract.methods.getReserves().call(), 8000),
        fetchWithTimeout(lpContract.methods.totalSupply().call(), 8000),
        fetchWithTimeout(lpContract.methods.balanceOf(KUMABREEDER_ADDRESS).call(), 8000)
      ]);

      const token0Info = getTokenInfo(token0);
      const token1Info = getTokenInfo(token1);

      console.log('LP detected:', lpAddress, token0Info.symbol, '-', token1Info.symbol);

      return {
        isLP: true,
        token0: { address: token0, ...token0Info },
        token1: { address: token1, ...token1Info },
        reserve0: reserves._reserve0.toString(),
        reserve1: reserves._reserve1.toString(),
        totalSupply: web3Instance.utils.fromWei(totalSupply.toString(), 'ether'),
        stakedBalance: web3Instance.utils.fromWei(stakedBalance.toString(), 'ether')
      };
    } catch (err) {
      // Not an LP token or failed to fetch
      console.log('Not LP or failed:', lpAddress, err.message);
      return null;
    }
  }, [walletWeb3, readOnlyWeb3, getTokenInfo]);

  // Get single token info
  const getSingleTokenInfo = useCallback(async (tokenAddress) => {
    const web3Instance = walletWeb3 || readOnlyWeb3;
    if (!web3Instance) return null;
    try {
      const tokenContract = new web3Instance.eth.Contract(ERC20_ABI, tokenAddress);
      const [symbol, stakedBalance] = await Promise.all([
        fetchWithTimeout(tokenContract.methods.symbol().call(), 2000).catch(() => 'TOKEN'),
        fetchWithTimeout(tokenContract.methods.balanceOf(KUMABREEDER_ADDRESS).call(), 2000).catch(() => '0')
      ]);

      const knownInfo = getTokenInfo(tokenAddress);

      return {
        isLP: false,
        symbol: knownInfo.symbol || symbol,
        decimals: knownInfo.decimals || 18,
        stakedBalance: web3Instance.utils.fromWei(stakedBalance.toString(), 'ether')
      };
    } catch {
      return null;
    }
  }, [walletWeb3, readOnlyWeb3, getTokenInfo]);

  // Calculate TVL for LP token (takes web3Instance as parameter to avoid closure issues)
  const calculateLPTVL = useCallback((lpInfo, tokenPrices, web3Instance) => {
    if (!lpInfo || !lpInfo.isLP || !web3Instance) return 0;

    const { token0, token1, reserve0, reserve1, totalSupply, stakedBalance } = lpInfo;
    const stakedNum = parseFloat(stakedBalance);
    const totalSupplyNum = parseFloat(totalSupply);

    if (totalSupplyNum === 0 || stakedNum === 0) return 0;

    // Determine which token is WETH
    const isToken0WETH = token0.symbol === 'WETH';
    const isToken1WETH = token1.symbol === 'WETH';

    let poolTotalValueUSD = 0;

    if (isToken0WETH || isToken1WETH) {
      // One side is WETH - calculate total value as 2x ETH value
      const wethReserve = isToken0WETH ? reserve0 : reserve1;
      const wethValue = parseFloat(web3Instance.utils.fromWei(wethReserve.toString(), 'ether'));
      poolTotalValueUSD = wethValue * (tokenPrices.eth || 2500) * 2;
    } else {
      // Neither is WETH - use token prices
      const r0 = parseFloat(web3Instance.utils.fromWei(reserve0.toString(), 'ether'));
      const r1 = parseFloat(web3Instance.utils.fromWei(reserve1.toString(), 'ether'));
      const price0 = tokenPrices[token0.symbol.toLowerCase()] || 0;
      const price1 = tokenPrices[token1.symbol.toLowerCase()] || 0;
      poolTotalValueUSD = (r0 * price0) + (r1 * price1);
    }

    // Calculate staked portion
    const stakedRatio = stakedNum / totalSupplyNum;
    return poolTotalValueUSD * stakedRatio;
  }, []);

  // Calculate TVL for single token
  const calculateSingleTokenTVL = useCallback((tokenInfo, tokenPrices) => {
    if (!tokenInfo || tokenInfo.isLP) return 0;
    const stakedNum = parseFloat(tokenInfo.stakedBalance);
    const price = tokenPrices[tokenInfo.symbol.toLowerCase()] || 0;
    return stakedNum * price;
  }, []);

  const getPoolInfo = useCallback(async (pid) => {
    if (!contract) return null;
    try {
      const poolInfo = await fetchWithTimeout(contract.methods.poolInfo(pid).call(), 4000);
      return {
        pid,
        lpToken: poolInfo.lpToken,
        allocPoint: poolInfo.allocPoint.toString(),
        lastRewardBlock: poolInfo.lastRewardBlock.toString(),
        accSushiPerShare: poolInfo.accSushiPerShare.toString(),
        poolFee: poolInfo.poolFee.toString(),
        limitPerWallet: poolInfo.limitPerWallet.toString()
      };
    } catch {
      return null;
    }
  }, [contract]);

  const getUserInfo = useCallback(async (pid, user) => {
    const web3Instance = walletWeb3 || readOnlyWeb3;
    if (!contract || !user || !web3Instance) return { amount: '0', rewardDebt: '0' };
    try {
      const userInfo = await fetchWithTimeout(contract.methods.userInfo(pid, user).call(), 3000);
      return {
        amount: web3Instance.utils.fromWei(userInfo.amount.toString(), 'ether'),
        rewardDebt: web3Instance.utils.fromWei(userInfo.rewardDebt.toString(), 'ether')
      };
    } catch {
      return { amount: '0', rewardDebt: '0' };
    }
  }, [contract, walletWeb3, readOnlyWeb3]);

  const getPendingRewards = useCallback(async (pid, user) => {
    const web3Instance = walletWeb3 || readOnlyWeb3;
    if (!contract || !user || !web3Instance) return '0';
    try {
      const pending = await fetchWithTimeout(contract.methods.pendingSushi(pid, user).call(), 3000);
      return web3Instance.utils.fromWei(pending.toString(), 'ether');
    } catch {
      return '0';
    }
  }, [contract, walletWeb3, readOnlyWeb3]);

  // Main fetch function - uses server-side API for reliable data
  const fetchAllPools = useCallback(async (forceRefresh = false) => {
    if (fetchingRef.current && !forceRefresh) return;

    const now = Date.now();
    if (!forceRefresh && now - lastFetchRef.current < 10000) return;

    fetchingRef.current = true;
    lastFetchRef.current = now;

    if (pools.length === 0) setLoading(true);

    try {
      // Fetch pool data from server-side API for reliable TVL/APR calculations
      const response = await fetch('/api/breeder-data');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const apiData = await response.json();

      console.log('API Data received:', {
        prices: apiData.prices,
        totalAllocPoint: apiData.totalAllocPoint,
        sushiPerBlock: apiData.sushiPerBlock,
        poolCount: apiData.pools?.length
      });

      // Update prices from API
      if (apiData.prices) {
        setPrices(apiData.prices);
        setCachedPrices(apiData.prices);
      }

      // Transform API pools to our format
      const poolsData = apiData.pools.map(pool => {
        // Determine if it's an LP based on symbol containing '-'
        const isLP = pool.symbol.includes('-');
        const name = isLP ? `${pool.symbol} LP` : `${pool.symbol} Staking`;

        // Get pool fee from contract (we need to fetch this separately)
        // For now use default values
        return {
          pid: pool.pid,
          lpToken: pool.lpToken,
          symbol: pool.symbol,
          name,
          isLP: pool.isLP,
          primaryToken: pool.primaryToken,
          token0Symbol: pool.isLP ? pool.primaryToken : pool.symbol,
          token1Symbol: pool.isLP ? 'WETH' : '',
          allocPoint: pool.allocPoint.toString(),
          poolFee: '0.0',
          limitPerWallet: '0',
          tvl: pool.tvl,
          stakedBalance: '0',
          totalSupply: '0',
          apr: pool.apr,
          userDeposit: '0',
          pendingReward: '0',
          isActive: pool.allocPoint > 0
        };
      });

      // Log some pools for debugging
      poolsData.forEach(pool => {
        if (pool.pid === 6 || pool.pid === 12 || pool.pid === 13) {
          console.log(`Pool ${pool.pid} (${pool.symbol}):`, {
            tvl: '$' + pool.tvl,
            apr: pool.apr + '%',
            allocPoint: pool.allocPoint
          });
        }
      });

      // Filter to only show active pools
      const activePools = poolsData.filter(p => p.isActive);

      if (mountedRef.current) {
        setPools(activePools);
        setCachedPools(activePools);
        setLoading(false);
      }

      // Fetch user data in background if connected
      if (account && walletWeb3 && contract) {
        fetchUserData(activePools);
      }

    } catch (err) {
      console.error('Error fetching pools from API:', err);

      // Fallback to direct RPC if API fails
      await fetchPoolsDirectRPC(forceRefresh);
    } finally {
      fetchingRef.current = false;
    }
  }, [contract, readOnlyWeb3, walletWeb3, account, pools.length]);

  // Fallback: Direct RPC fetch (used if API fails)
  const fetchPoolsDirectRPC = useCallback(async (forceRefresh = false) => {
    if (!contract || !readOnlyWeb3) return;

    try {
      // Fetch prices
      const tokenPrices = await fetchPrices();

      // Fetch contract data
      const [poolLength, totalAllocPoint, sushiPerBlock] = await Promise.all([
        fetchWithTimeout(contract.methods.poolLength().call(), 8000),
        fetchWithTimeout(contract.methods.totalAllocPoint().call(), 8000),
        fetchWithTimeout(contract.methods.sushiPerBlock().call(), 8000)
      ]);

      const numPools = Math.min(parseInt(poolLength) || 0, 20);
      if (numPools === 0) {
        setPools([]);
        setLoading(false);
        return;
      }

      // Fetch all pool info
      const poolIndices = Array.from({ length: numPools }, (_, i) => i);
      const allPoolInfo = (await Promise.all(poolIndices.map(pid => getPoolInfo(pid)))).filter(Boolean);

      // Check which are LP tokens and get their info
      const poolDataPromises = allPoolInfo.map(async (poolInfo) => {
        const lpAddress = poolInfo.lpToken.toLowerCase();
        const knownLPInfo = LP_TOKEN_INFO[lpAddress];

        // If we have known LP info, use it directly (faster and more reliable)
        if (knownLPInfo) {
          // It's a known LP token - fetch LP data for TVL calculation
          const lpPairInfo = await getLPPairInfo(poolInfo.lpToken);
          const tvl = lpPairInfo ? calculateLPTVL(lpPairInfo, tokenPrices, readOnlyWeb3) : 0;

          return {
            ...poolInfo,
            isLP: true,
            symbol: knownLPInfo.symbol,
            name: `${knownLPInfo.symbol} LP`,
            primaryToken: knownLPInfo.primaryToken,
            token0Symbol: lpPairInfo?.token0?.symbol || knownLPInfo.primaryToken,
            token1Symbol: lpPairInfo?.token1?.symbol || 'WETH',
            tvl: tvl.toFixed(2),
            stakedBalance: lpPairInfo?.stakedBalance || '0',
            totalSupply: lpPairInfo?.totalSupply || '0'
          };
        }

        // Try to detect LP dynamically
        const lpPairInfo = await getLPPairInfo(poolInfo.lpToken);

        if (lpPairInfo) {
          // It's an LP token (detected dynamically)
          const tvl = calculateLPTVL(lpPairInfo, tokenPrices, readOnlyWeb3);

          let symbol, primaryToken;
          if (lpPairInfo.token1.symbol === 'WETH') {
            symbol = `${lpPairInfo.token0.symbol}-ETH`;
            primaryToken = lpPairInfo.token0.symbol;
          } else if (lpPairInfo.token0.symbol === 'WETH') {
            symbol = `${lpPairInfo.token1.symbol}-ETH`;
            primaryToken = lpPairInfo.token1.symbol;
          } else {
            symbol = `${lpPairInfo.token0.symbol}-${lpPairInfo.token1.symbol}`;
            primaryToken = lpPairInfo.token0.symbol;
          }

          return {
            ...poolInfo,
            isLP: true,
            symbol,
            name: `${symbol} LP`,
            primaryToken,
            token0Symbol: lpPairInfo.token0.symbol,
            token1Symbol: lpPairInfo.token1.symbol,
            tvl: tvl.toFixed(2),
            stakedBalance: lpPairInfo.stakedBalance,
            totalSupply: lpPairInfo.totalSupply
          };
        } else {
          // It's a single token
          const tokenInfo = await getSingleTokenInfo(poolInfo.lpToken);
          const tvl = tokenInfo ? calculateSingleTokenTVL(tokenInfo, tokenPrices) : 0;

          return {
            ...poolInfo,
            isLP: false,
            symbol: tokenInfo?.symbol || 'TOKEN',
            name: `${tokenInfo?.symbol || 'TOKEN'} Staking`,
            primaryToken: tokenInfo?.symbol || 'TOKEN',
            token0Symbol: tokenInfo?.symbol || 'TOKEN',
            token1Symbol: '',
            tvl: tvl.toFixed(2),
            stakedBalance: tokenInfo?.stakedBalance || '0',
            totalSupply: '0'
          };
        }
      });

      const poolsWithInfo = await Promise.all(poolDataPromises);

      // Calculate APR for each pool
      const BLOCKS_PER_YEAR = 2628000;
      const sushiPerBlockNum = parseFloat(readOnlyWeb3.utils.fromWei(sushiPerBlock.toString(), 'ether'));
      const totalAllocNum = parseFloat(totalAllocPoint) || 1;
      const dkumaPrice = tokenPrices.dkuma || 0;

      const poolsData = poolsWithInfo.map(pool => {
        const allocPoint = parseFloat(pool.allocPoint) || 0;
        const tvl = parseFloat(pool.tvl) || 0;

        let apr = '0.00';
        if (allocPoint > 0 && tvl > 0 && sushiPerBlockNum > 0 && dkumaPrice > 0) {
          const poolShare = allocPoint / totalAllocNum;
          const yearlyDkumaRewards = sushiPerBlockNum * BLOCKS_PER_YEAR * poolShare;
          const yearlyRewardsUSD = yearlyDkumaRewards * dkumaPrice;
          const aprValue = (yearlyRewardsUSD / tvl) * 100;
          apr = Math.min(aprValue, 999999).toFixed(2);
        }

        return {
          pid: pool.pid,
          lpToken: pool.lpToken,
          symbol: pool.symbol,
          name: pool.name,
          isLP: pool.isLP,
          primaryToken: pool.primaryToken,
          token0Symbol: pool.token0Symbol,
          token1Symbol: pool.token1Symbol,
          allocPoint: pool.allocPoint,
          poolFee: (Number(pool.poolFee) / 10).toFixed(1),
          limitPerWallet: readOnlyWeb3.utils.fromWei(pool.limitPerWallet || '0', 'ether'),
          tvl: pool.tvl,
          stakedBalance: pool.stakedBalance,
          totalSupply: pool.totalSupply,
          apr,
          userDeposit: '0',
          pendingReward: '0',
          isActive: allocPoint > 0
        };
      });

      const activePools = poolsData.filter(p => p.isActive);

      if (mountedRef.current) {
        setPools(activePools);
        setCachedPools(activePools);
        setLoading(false);
      }

      if (account && walletWeb3) {
        fetchUserData(activePools);
      }

    } catch (err) {
      console.error('Error in direct RPC fetch:', err);
      if (mountedRef.current && pools.length === 0) {
        setError('Failed to load pools');
      }
      setLoading(false);
    }
  }, [contract, readOnlyWeb3, walletWeb3, account, getPoolInfo, getLPPairInfo, getSingleTokenInfo, calculateLPTVL, calculateSingleTokenTVL, fetchPrices, pools.length]);

  const fetchUserData = useCallback(async (currentPools) => {
    const web3Instance = walletWeb3 || readOnlyWeb3;
    if (!account || !contract || !web3Instance || currentPools.length === 0) return;

    try {
      const userDataPromises = currentPools.map(async (pool) => {
        const [userInfo, pendingReward] = await Promise.all([
          getUserInfo(pool.pid, account),
          getPendingRewards(pool.pid, account)
        ]);
        return { pid: pool.pid, userInfo, pendingReward };
      });

      const userData = await Promise.all(userDataPromises);

      if (mountedRef.current) {
        setPools(prev => prev.map(pool => {
          const data = userData.find(u => u.pid === pool.pid);
          if (data) {
            return {
              ...pool,
              userDeposit: data.userInfo.amount,
              pendingReward: data.pendingReward
            };
          }
          return pool;
        }));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, [account, contract, walletWeb3, readOnlyWeb3, getUserInfo, getPendingRewards]);

  // Transaction functions
  const deposit = useCallback(async (pid, amount) => {
    if (!contract || !walletWeb3 || !account) throw new Error('Connect wallet');
    if (chainId !== NETWORK_CONFIG.ETHEREUM_MAINNET.chainId) throw new Error('Switch to Ethereum Mainnet');

    setTxPending(true);
    try {
      const poolInfo = await getPoolInfo(pid);
      if (!poolInfo) throw new Error('Pool not found');

      const lpContract = new walletWeb3.eth.Contract(ERC20_ABI, poolInfo.lpToken);
      const amountWei = walletWeb3.utils.toWei(amount, 'ether');

      const allowance = await lpContract.methods.allowance(account, KUMABREEDER_ADDRESS).call();
      if (BigInt(allowance) < BigInt(amountWei)) {
        await lpContract.methods.approve(KUMABREEDER_ADDRESS, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').send({ from: account });
      }

      const tx = await contract.methods.deposit(pid, amountWei).send({ from: account });
      setTxPending(false);
      fetchAllPools(true);
      return tx;
    } catch (err) {
      setTxPending(false);
      throw err;
    }
  }, [contract, walletWeb3, account, chainId, getPoolInfo, fetchAllPools]);

  const withdraw = useCallback(async (pid, amount) => {
    if (!contract || !walletWeb3 || !account) throw new Error('Connect wallet');
    if (chainId !== NETWORK_CONFIG.ETHEREUM_MAINNET.chainId) throw new Error('Switch to Ethereum Mainnet');

    setTxPending(true);
    try {
      const amountWei = walletWeb3.utils.toWei(amount, 'ether');
      const tx = await contract.methods.withdraw(pid, amountWei).send({ from: account });
      setTxPending(false);
      fetchAllPools(true);
      return tx;
    } catch (err) {
      setTxPending(false);
      throw err;
    }
  }, [contract, walletWeb3, account, chainId, fetchAllPools]);

  const claimRewards = useCallback(async (pid) => {
    if (!contract || !walletWeb3 || !account) throw new Error('Connect wallet');
    if (chainId !== NETWORK_CONFIG.ETHEREUM_MAINNET.chainId) throw new Error('Switch to Ethereum Mainnet');

    setTxPending(true);
    try {
      const tx = await contract.methods.withdraw(pid, 0).send({ from: account });
      setTxPending(false);
      fetchAllPools(true);
      return tx;
    } catch (err) {
      setTxPending(false);
      throw err;
    }
  }, [contract, walletWeb3, account, chainId, fetchAllPools]);

  const emergencyWithdraw = useCallback(async (pid) => {
    if (!contract || !walletWeb3 || !account) throw new Error('Connect wallet');
    if (chainId !== NETWORK_CONFIG.ETHEREUM_MAINNET.chainId) throw new Error('Switch to Ethereum Mainnet');

    setTxPending(true);
    try {
      const tx = await contract.methods.emergencyWithdraw(pid).send({ from: account });
      setTxPending(false);
      fetchAllPools(true);
      return tx;
    } catch (err) {
      setTxPending(false);
      throw err;
    }
  }, [contract, walletWeb3, account, chainId, fetchAllPools]);

  // Initial fetch - use API which doesn't require web3 instance
  useEffect(() => {
    if (!fetchingRef.current && isHydrated) {
      fetchAllPools();
    }
  }, [isHydrated]);

  // Refresh when contract becomes available (for fallback)
  useEffect(() => {
    if (contract && readOnlyWeb3 && pools.length === 0 && !fetchingRef.current) {
      fetchAllPools();
    }
  }, [contract, readOnlyWeb3, pools.length]);

  // Fetch user data when account changes
  useEffect(() => {
    if (account && pools.length > 0) {
      fetchUserData(pools);
    }
  }, [account, pools.length]);

  return {
    pools,
    loading,
    txPending,
    error,
    isConnected,
    chainId,
    prices,
    deposit,
    withdraw,
    claimRewards,
    emergencyWithdraw,
    refetch: () => fetchAllPools(true),
    getPoolInfo,
    getUserInfo,
    getPendingRewards,
    contractAddress: KUMABREEDER_ADDRESS,
    networkConfig: NETWORK_CONFIG.ETHEREUM_MAINNET
  };
};

export default useBreederContractWeb3;
