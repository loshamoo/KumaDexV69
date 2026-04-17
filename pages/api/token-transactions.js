// API route to fetch token transactions using direct RPC calls
// Uses eth_getLogs to get Transfer events from token contracts

// Token addresses on Ethereum mainnet
const TOKEN_ADDRESSES = {
  KUMA: '0x48C276e8d03813224bb1e55F953adB6d02FD3E02',
  dKUMA: '0x3f5dd1A1538a4F9f82E543098f01F22480B0A3a8',
  SHIB: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  LEASH: '0x27C70Cd1946795B66be9d954418546998b546634',
  AKITA: '0x3301Ee63Fb29F863f2333Bd4466acb46CD8323E6',
  ELON: '0x761D38e5ddf6ccf6Cf7c55759d5210750B5D60F3',
}

const TOKEN_LOGOS = {
  KUMA: '/breederlogos/kuma.png',
  dKUMA: '/breederlogos/dkuma.png',
  SHIB: '/breederlogos/shib.png',
  LEASH: '/breederlogos/leash.png',
  AKITA: '/breederlogos/akita.png',
  ELON: '/breederlogos/elon.png',
}

const TOKEN_DECIMALS = {
  KUMA: 18,
  dKUMA: 18,
  SHIB: 18,
  LEASH: 18,
  AKITA: 18,
  ELON: 18,
}

// ERC20 Transfer event signature
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

// Known DEX router addresses
const DEX_ROUTERS = [
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2 Router
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45', // Uniswap V3 Router
  '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b', // Uniswap Universal Router
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Uniswap Universal Router 2
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', // SushiSwap Router
  '0xe592427a0aece92de3edee1f18e0157c05861564', // Uniswap V3 SwapRouter
].map(a => a.toLowerCase())

// Public RPC endpoints (fallback chain)
const RPC_ENDPOINTS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com',
  'https://1rpc.io/eth',
]

async function fetchWithFallback(body) {
  for (const rpc of RPC_ENDPOINTS) {
    try {
      const response = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (data.result !== undefined) {
        return data
      }
    } catch (err) {
      console.warn(`RPC ${rpc} failed:`, err.message)
    }
  }
  throw new Error('All RPC endpoints failed')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Accept optional token address and limit parameters
  const { address: queryAddress, limit = 10 } = req.query
  const maxLimit = Math.min(parseInt(limit) || 10, 50)

  try {
    // Get current block number
    const blockData = await fetchWithFallback({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    })

    const currentBlock = parseInt(blockData.result, 16)
    // Look back ~5000 blocks (~17 hours) for better coverage
    const fromBlock = '0x' + (currentBlock - 5000).toString(16)
    const toBlock = 'latest'

    const allTransactions = []

    // If specific address provided, only fetch that token
    // Otherwise fetch all tokens
    let tokensToFetch = Object.entries(TOKEN_ADDRESSES)

    if (queryAddress) {
      const normalizedQuery = queryAddress.toLowerCase()
      const matchedToken = Object.entries(TOKEN_ADDRESSES).find(
        ([, addr]) => addr.toLowerCase() === normalizedQuery
      )
      if (matchedToken) {
        tokensToFetch = [matchedToken]
      } else {
        // Custom token address - use generic decimals
        tokensToFetch = [['CUSTOM', queryAddress]]
      }
    }

    // Fetch Transfer events for each token
    for (const [symbol, address] of tokensToFetch) {
      try {
        const logsData = await fetchWithFallback({
          jsonrpc: '2.0',
          method: 'eth_getLogs',
          params: [{
            address: address,
            topics: [TRANSFER_TOPIC],
            fromBlock: fromBlock,
            toBlock: toBlock,
          }],
          id: 1,
        })

        if (logsData.result && Array.isArray(logsData.result)) {
          // Sort by block number descending and take recent ones
          const sortedLogs = logsData.result.sort((a, b) =>
            parseInt(b.blockNumber, 16) - parseInt(a.blockNumber, 16)
          ).slice(0, maxLimit * 3) // Get more to filter swaps

          // Get block timestamps for the logs
          const blockNumbers = [...new Set(sortedLogs.map(log => log.blockNumber))]
          const blockTimestamps = {}

          // Fetch timestamps for unique blocks
          const blocksToFetch = blockNumbers.slice(0, 15)
          await Promise.all(blocksToFetch.map(async (blockNum) => {
            try {
              const blockInfo = await fetchWithFallback({
                jsonrpc: '2.0',
                method: 'eth_getBlockByNumber',
                params: [blockNum, false],
                id: 1,
              })
              if (blockInfo.result) {
                blockTimestamps[blockNum] = parseInt(blockInfo.result.timestamp, 16) * 1000
              }
            } catch (err) {
              console.warn('Error fetching block:', err.message)
            }
          }))

          const decimals = TOKEN_DECIMALS[symbol] || 18
          const txs = sortedLogs.map(log => {
            // Decode Transfer event
            const from = '0x' + log.topics[1].slice(26)
            const to = '0x' + log.topics[2].slice(26)
            const value = parseInt(log.data, 16) / Math.pow(10, decimals)

            const fromLower = from.toLowerCase()
            const toLower = to.toLowerCase()

            // Determine transaction type
            const isBuy = DEX_ROUTERS.includes(fromLower)
            const isSell = DEX_ROUTERS.includes(toLower)

            return {
              hash: log.transactionHash,
              type: isBuy ? 'buy' : (isSell ? 'sell' : 'transfer'),
              token: symbol,
              tokenName: symbol,
              tokenLogo: TOKEN_LOGOS[symbol] || null,
              amount: value,
              timestamp: blockTimestamps[log.blockNumber] || Date.now(),
              from: from,
              to: to,
              blockNumber: parseInt(log.blockNumber, 16),
            }
          })
          allTransactions.push(...txs)
        }
      } catch (err) {
        console.warn(`Error fetching ${symbol} transactions:`, err.message)
      }
    }

    // Remove duplicates and sort by block number (most recent first)
    const uniqueTxs = Array.from(
      new Map(allTransactions.map(tx => [tx.hash + tx.token, tx])).values()
    ).sort((a, b) => b.blockNumber - a.blockNumber)

    // Filter to only include buy/sell (swap) transactions
    const swapTxs = uniqueTxs.filter(tx => tx.type === 'buy' || tx.type === 'sell')

    // If not enough swap transactions, include regular transfers
    let finalTxs = swapTxs.slice(0, maxLimit)
    if (finalTxs.length < maxLimit) {
      const transferTxs = uniqueTxs.filter(tx => tx.type === 'transfer')
      const remaining = maxLimit - finalTxs.length
      finalTxs = [...finalTxs, ...transferTxs.slice(0, remaining)]
      // Re-sort by block number
      finalTxs.sort((a, b) => b.blockNumber - a.blockNumber)
    }

    // Return the most recent transactions based on limit
    res.status(200).json({
      success: true,
      transactions: finalTxs.slice(0, maxLimit),
      timestamp: Date.now(),
      blocksScanned: 5000,
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    res.status(500).json({ error: 'Failed to fetch transactions', message: error.message })
  }
}
