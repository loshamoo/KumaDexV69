import { useState, useEffect, useCallback, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import {
  DKUMA_BREEDER_ABI,
  DKUMA_BREEDER_ADDRESS,
  DKUMA_TOKEN_ADDRESS,
  USDC_TOKEN_ADDRESS,
  ERC20_ABI
} from '../contracts/dKumaBreederABI';
import Web3 from 'web3';

// Cache configuration
const CACHE_KEY = 'dkuma_breeder_cache_v1';
const CACHE_EXPIRY = 30000; // 30 seconds

// RPC endpoints for fallback (ordered by reliability)
const RPC_ENDPOINTS = [
  'https://eth.drpc.org',
  'https://rpc.ankr.com/eth',
  'https://eth.meowrpc.com',
  'https://ethereum-rpc.publicnode.com',
  'https://1rpc.io/eth',
  'https://cloudflare-eth.com'
];

// dKUMA-ETH LP for price calculation
const DKUMA_ETH_LP = '0xB4EdfeC7Aa5588786901C63A8338e4b37611B2Af';

// Uniswap V2 Pair ABI (minimal)
const UNISWAP_PAIR_ABI = [
  {
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      { "internalType": "uint112", "name": "_reserve0", "type": "uint112" },
      { "internalType": "uint112", "name": "_reserve1", "type": "uint112" },
      { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Cache helpers
const getCachedData = () => {
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

const setCachedData = (data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
};

const useDKumaBreeder = () => {
  const { web3: walletWeb3, account, isConnected, chainId } = useWeb3();

  // State
  const [breederContract, setBreederContract] = useState(null);
  const [dkumaContract, setDkumaContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txPending, setTxPending] = useState(false);
  const [error, setError] = useState(null);
  const [readOnlyWeb3, setReadOnlyWeb3] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Breeder data
  const [breederData, setBreederData] = useState({
    totalStaked: '0',
    tvl: '0',
    userStaked: '0',
    userRewards: '0',
    poolShare: '0',
    poolEndTime: 0,
    poolStartTime: 0,
    stakingFees: 3,
    unstakingFees: 5,
    isActive: false,
    dkumaPrice: 0,
    ethPrice: 0,
    userDkumaBalance: '0',
    allowance: '0',
    rewardPerSecond: '0',
    apy: '0',
    totalRewardsPaid: '0',
    rewardBalance: '0'
  });

  // Refs
  const fetchingRef = useRef(false);
  const lastFetchRef = useRef(0);
  const mountedRef = useRef(true);

  // Initialize read-only Web3
  useEffect(() => {
    const initReadOnlyWeb3 = async () => {
      console.log('dKuma Breeder: Initializing Web3 connection...');
      for (const rpc of RPC_ENDPOINTS) {
        try {
          const web3Instance = new Web3(new Web3.providers.HttpProvider(rpc, {
            timeout: 10000,
            headers: [{ name: 'Accept', value: 'application/json' }]
          }));
          const blockNumber = await Promise.race([
            web3Instance.eth.getBlockNumber(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
          ]);
          if (blockNumber > 0) {
            setReadOnlyWeb3(web3Instance);
            console.log('dKuma Breeder: Connected to RPC:', rpc, 'Block:', blockNumber);
            return;
          }
        } catch (e) {
          console.warn('dKuma Breeder RPC failed:', rpc, e.message);
        }
      }
      console.error('dKuma Breeder: All RPC endpoints failed');
    };
    initReadOnlyWeb3();
    return () => { mountedRef.current = false; };
  }, []);

  // Load cached data on hydration
  useEffect(() => {
    setIsHydrated(true);
    const cached = getCachedData();
    if (cached) {
      setBreederData(prev => ({ ...prev, ...cached }));
      setLoading(false);
    }
  }, []);

  // Initialize contracts when Web3 is available
  useEffect(() => {
    const currentWeb3 = walletWeb3 || readOnlyWeb3;
    if (!currentWeb3) return;

    try {
      const breeder = new currentWeb3.eth.Contract(DKUMA_BREEDER_ABI, DKUMA_BREEDER_ADDRESS);
      const dkuma = new currentWeb3.eth.Contract(ERC20_ABI, DKUMA_TOKEN_ADDRESS);
      setBreederContract(breeder);
      setDkumaContract(dkuma);
    } catch (err) {
      console.error('Contract init error:', err);
      setError('Failed to initialize contracts');
    }
  }, [walletWeb3, readOnlyWeb3]);

  // Fetch dKUMA price from LP
  const fetchDkumaPrice = useCallback(async (web3Instance) => {
    try {
      // First get ETH price from CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await response.json();
      const ethPrice = data.ethereum?.usd || 2000;

      // Get dKUMA price from LP reserves (dKUMA is token0, WETH is token1)
      const lpContract = new web3Instance.eth.Contract(UNISWAP_PAIR_ABI, DKUMA_ETH_LP);
      const reserves = await lpContract.methods.getReserves().call();

      const dkumaReserve = parseFloat(web3Instance.utils.fromWei(reserves._reserve0.toString(), 'ether'));
      const ethReserve = parseFloat(web3Instance.utils.fromWei(reserves._reserve1.toString(), 'ether'));

      let dkumaPrice = 0;
      if (dkumaReserve > 0) {
        dkumaPrice = (ethReserve * ethPrice) / dkumaReserve;
      }

      return { dkumaPrice, ethPrice };
    } catch (err) {
      console.warn('Price fetch error:', err.message);
      return { dkumaPrice: 0.00002, ethPrice: 2000 };
    }
  }, []);

  // Fetch all breeder data
  const fetchBreederData = useCallback(async (forceRefresh = false) => {
    if (fetchingRef.current) return;
    if (!forceRefresh && Date.now() - lastFetchRef.current < 5000) return;

    const currentWeb3 = walletWeb3 || readOnlyWeb3;
    if (!currentWeb3 || !breederContract) return;

    fetchingRef.current = true;
    lastFetchRef.current = Date.now();

    try {
      // Fetch prices
      const { dkumaPrice, ethPrice } = await fetchDkumaPrice(currentWeb3);

      // Fetch contract data in parallel
      const [
        totalStaked,
        poolEndTime,
        poolStartTime,
        stakingFees,
        unstakingFees,
        isActive,
        rewardPerSecond,
        totalRewardsPaid,
        rewardBalance
      ] = await Promise.all([
        breederContract.methods.totalStaked().call().catch(() => '0'),
        breederContract.methods.poolEndTime().call().catch(() => '0'),
        breederContract.methods.poolStartTime().call().catch(() => '0'),
        breederContract.methods.stakingFees().call().catch(() => '300'), // 3%
        breederContract.methods.unstakingFees().call().catch(() => '500'), // 5%
        breederContract.methods.dKUMA_BREEDER_IS_ACTIVE().call().catch(() => false),
        breederContract.methods.rewardPerSecond().call().catch(() => '0'),
        breederContract.methods.totalRewardsPaid().call().catch(() => '0'),
        breederContract.methods.rewardBalance().call().catch(() => '0')
      ]);

      // Calculate TVL
      const totalStakedFloat = parseFloat(currentWeb3.utils.fromWei(totalStaked.toString(), 'ether'));
      const tvl = totalStakedFloat * dkumaPrice;

      // Calculate APY
      // rewardPerSecond is in USDC (6 decimals)
      const rewardPerSecondFloat = parseFloat(currentWeb3.utils.fromWei(rewardPerSecond.toString(), 'mwei'));
      const secondsPerYear = 365 * 24 * 60 * 60;
      const annualRewardsUSD = rewardPerSecondFloat * secondsPerYear;
      let apy = 0;
      if (tvl > 0) {
        apy = (annualRewardsUSD / tvl) * 100;
      }

      // Fetch user-specific data if connected
      let userStaked = '0';
      let userRewards = '0';
      let poolShare = '0';
      let userDkumaBalance = '0';
      let allowance = '0';

      if (account && isConnected) {
        try {
          const [stakeInfo, pendingReward, balance, currentAllowance] = await Promise.all([
            breederContract.methods.stakeInfo(account).call().catch(() => ({ amount: '0' })),
            breederContract.methods.pendingReward(account).call().catch(() => '0'),
            dkumaContract ? dkumaContract.methods.balanceOf(account).call().catch(() => '0') : '0',
            dkumaContract ? dkumaContract.methods.allowance(account, DKUMA_BREEDER_ADDRESS).call().catch(() => '0') : '0'
          ]);

          userStaked = stakeInfo.amount || stakeInfo[0] || '0';
          userRewards = pendingReward;
          userDkumaBalance = balance;
          allowance = currentAllowance;

          // Calculate pool share
          const userStakedFloat = parseFloat(currentWeb3.utils.fromWei(userStaked.toString(), 'ether'));
          if (totalStakedFloat > 0 && userStakedFloat > 0) {
            poolShare = ((userStakedFloat / totalStakedFloat) * 100).toFixed(4);
          }
        } catch (userErr) {
          console.warn('User data fetch error:', userErr.message);
        }
      }

      const newData = {
        totalStaked: currentWeb3.utils.fromWei(totalStaked.toString(), 'ether'),
        tvl: tvl.toFixed(2),
        userStaked: currentWeb3.utils.fromWei(userStaked.toString(), 'ether'),
        userRewards: currentWeb3.utils.fromWei(userRewards.toString(), 'mwei'), // USDC has 6 decimals
        poolShare,
        poolEndTime: parseInt(poolEndTime),
        poolStartTime: parseInt(poolStartTime),
        stakingFees: parseInt(stakingFees) / 100,
        unstakingFees: parseInt(unstakingFees) / 100,
        isActive: isActive === true || isActive === 'true',
        dkumaPrice,
        ethPrice,
        userDkumaBalance: currentWeb3.utils.fromWei(userDkumaBalance.toString(), 'ether'),
        allowance: currentWeb3.utils.fromWei(allowance.toString(), 'ether'),
        rewardPerSecond: currentWeb3.utils.fromWei(rewardPerSecond.toString(), 'mwei'),
        apy: apy.toFixed(2),
        totalRewardsPaid: currentWeb3.utils.fromWei(totalRewardsPaid.toString(), 'mwei'),
        rewardBalance: currentWeb3.utils.fromWei(rewardBalance.toString(), 'mwei')
      };

      if (mountedRef.current) {
        setBreederData(newData);
        setCachedData(newData);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error('Fetch breeder data error:', err);
      if (mountedRef.current) {
        setError(err.message);
        setLoading(false);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [walletWeb3, readOnlyWeb3, breederContract, dkumaContract, account, isConnected, fetchDkumaPrice]);

  // Auto-fetch data when dependencies change
  useEffect(() => {
    if (breederContract) {
      fetchBreederData(true);
    }
  }, [breederContract, account, isConnected, fetchBreederData]);

  // Polling for updates
  useEffect(() => {
    if (!breederContract) return;
    const interval = setInterval(() => fetchBreederData(false), 30000);
    return () => clearInterval(interval);
  }, [breederContract, fetchBreederData]);

  // Approve dKUMA spending
  const approve = useCallback(async (amount) => {
    if (!dkumaContract || !account || !walletWeb3) {
      throw new Error('Wallet not connected');
    }

    setTxPending(true);
    setError(null);

    try {
      const amountWei = walletWeb3.utils.toWei(amount.toString(), 'ether');
      const maxApproval = walletWeb3.utils.toWei('999999999999999999', 'ether');

      const tx = await dkumaContract.methods.approve(
        DKUMA_BREEDER_ADDRESS,
        maxApproval
      ).send({ from: account });

      await fetchBreederData(true);
      return tx;
    } catch (err) {
      console.error('Approve error:', err);
      setError(err.message);
      throw err;
    } finally {
      setTxPending(false);
    }
  }, [dkumaContract, account, walletWeb3, fetchBreederData]);

  // Stake dKUMA
  const stake = useCallback(async (amount) => {
    if (!breederContract || !account || !walletWeb3) {
      throw new Error('Wallet not connected');
    }

    setTxPending(true);
    setError(null);

    try {
      const amountWei = walletWeb3.utils.toWei(amount.toString(), 'ether');

      // Check allowance first
      const currentAllowance = await dkumaContract.methods.allowance(account, DKUMA_BREEDER_ADDRESS).call();
      if (BigInt(currentAllowance) < BigInt(amountWei)) {
        throw new Error('Insufficient allowance. Please approve first.');
      }

      const tx = await breederContract.methods.deposit(amountWei).send({ from: account });
      await fetchBreederData(true);
      return tx;
    } catch (err) {
      console.error('Stake error:', err);
      setError(err.message);
      throw err;
    } finally {
      setTxPending(false);
    }
  }, [breederContract, dkumaContract, account, walletWeb3, fetchBreederData]);

  // Unstake dKUMA
  const unstake = useCallback(async (amount) => {
    if (!breederContract || !account || !walletWeb3) {
      throw new Error('Wallet not connected');
    }

    setTxPending(true);
    setError(null);

    try {
      const amountWei = walletWeb3.utils.toWei(amount.toString(), 'ether');
      const tx = await breederContract.methods.withdraw(amountWei).send({ from: account });
      await fetchBreederData(true);
      return tx;
    } catch (err) {
      console.error('Unstake error:', err);
      setError(err.message);
      throw err;
    } finally {
      setTxPending(false);
    }
  }, [breederContract, account, walletWeb3, fetchBreederData]);

  // Claim rewards (harvest)
  const claim = useCallback(async () => {
    if (!breederContract || !account || !walletWeb3) {
      throw new Error('Wallet not connected');
    }

    setTxPending(true);
    setError(null);

    try {
      const tx = await breederContract.methods.harvest().send({ from: account });
      await fetchBreederData(true);
      return tx;
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message);
      throw err;
    } finally {
      setTxPending(false);
    }
  }, [breederContract, account, walletWeb3, fetchBreederData]);

  // Emergency withdraw
  const emergencyWithdraw = useCallback(async () => {
    if (!breederContract || !account || !walletWeb3) {
      throw new Error('Wallet not connected');
    }

    setTxPending(true);
    setError(null);

    try {
      const tx = await breederContract.methods.emergencyWithdraw().send({ from: account });
      await fetchBreederData(true);
      return tx;
    } catch (err) {
      console.error('Emergency withdraw error:', err);
      setError(err.message);
      throw err;
    } finally {
      setTxPending(false);
    }
  }, [breederContract, account, walletWeb3, fetchBreederData]);

  // Check if user needs to approve
  const needsApproval = useCallback((amount) => {
    const amountFloat = parseFloat(amount) || 0;
    const allowanceFloat = parseFloat(breederData.allowance) || 0;
    return amountFloat > allowanceFloat;
  }, [breederData.allowance]);

  return {
    // Data
    breederData,
    loading,
    txPending,
    error,
    isHydrated,

    // Actions
    stake,
    unstake,
    claim,
    approve,
    emergencyWithdraw,
    refreshData: () => fetchBreederData(true),

    // Helpers
    needsApproval,

    // Contract addresses
    breederAddress: DKUMA_BREEDER_ADDRESS,
    dkumaAddress: DKUMA_TOKEN_ADDRESS,
    usdcAddress: USDC_TOKEN_ADDRESS
  };
};

export default useDKumaBreeder;
