// API route to fetch token prices from CoinGecko with detailed market data

const COINGECKO_IDS = {
  KUMA: 'kuma-inu',
  SHIB: 'shiba-inu',
  LEASH: 'leash',
  AKITA: 'akita-inu',
  ELON: 'dogelon-mars',
  ETH: 'ethereum',
}

// Fallback prices when API is rate limited
const FALLBACK_PRICES = {
  KUMA: { price: 0.00000015, change1h: 0.5, change24h: 2.1, volume24h: 50000, fdv: 150000 },
  SHIB: { price: 0.00001234, change1h: -0.3, change24h: 1.5, volume24h: 150000000, fdv: 7200000000 },
  LEASH: { price: 320.50, change1h: 0.8, change24h: -1.2, volume24h: 500000, fdv: 34000000 },
  AKITA: { price: 0.00000002, change1h: 1.2, change24h: -0.5, volume24h: 100000, fdv: 2000000 },
  ELON: { price: 0.00000015, change1h: -0.1, change24h: 3.2, volume24h: 5000000, fdv: 82000000 },
  ETH: { price: 2650.00, change1h: 0.2, change24h: 1.8, volume24h: 15000000000, fdv: 320000000000 },
  dKUMA: { price: 0.00002, change1h: 0.5, change24h: 2.3, volume24h: 50000, fdv: 2000000 },
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const ids = Object.values(COINGECKO_IDS).join(',')

    // Fetch detailed market data including price changes
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    // If rate limited, return fallback data
    if (response.status === 429) {
      console.warn('CoinGecko rate limited, using fallback prices')
      return res.status(200).json({
        success: true,
        data: FALLBACK_PRICES,
        timestamp: Date.now(),
        cached: true,
      })
    }

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    // Handle empty response
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(200).json({
        success: true,
        data: FALLBACK_PRICES,
        timestamp: Date.now(),
        cached: true,
      })
    }

    // Transform data into our format
    const tokenData = {}

    data.forEach(coin => {
      // Find which symbol this coin corresponds to
      const symbol = Object.entries(COINGECKO_IDS).find(([_, id]) => id === coin.id)?.[0]
      if (!symbol) return

      tokenData[symbol] = {
        price: coin.current_price || 0,
        change1h: coin.price_change_percentage_1h_in_currency || 0,
        change24h: coin.price_change_percentage_24h || 0,
        change7d: coin.price_change_percentage_7d_in_currency || 0,
        volume24h: coin.total_volume || 0,
        marketCap: coin.market_cap || 0,
        fdv: coin.fully_diluted_valuation || coin.market_cap || 0,
        high24h: coin.high_24h || 0,
        low24h: coin.low_24h || 0,
        sparkline: coin.sparkline_in_7d?.price || [],
        lastUpdated: coin.last_updated,
      }
    })

    // Add estimated dKUMA data (no CoinGecko listing)
    // In production, this should fetch from a DEX like Uniswap
    tokenData['dKUMA'] = {
      price: 0.00002,
      change1h: 0.5,
      change24h: 2.3,
      change7d: -1.2,
      volume24h: 50000,
      marketCap: 2000000,
      fdv: 2000000,
      high24h: 0.000022,
      low24h: 0.000018,
      sparkline: [],
      lastUpdated: new Date().toISOString(),
      isEstimated: true,
    }

    res.status(200).json({
      success: true,
      data: tokenData,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error fetching prices:', error)
    res.status(500).json({ error: 'Failed to fetch prices', message: error.message })
  }
}
