const KUMA = '0x48C276e8d03813224bb1e55F953adB6d02FD3E02'
const LP = '0xDF60E6416Fcf8C955FdDF01148753A911F7A5905'
const BREEDER = '0xa206D322829e04fb5acD36F289eD5367AC3E73e4'
const MIGRATE = '0x23223eed5B998c784690d7D2DEd01A65f42aC1A9'
const DEAD = '0x000000000000000000000000000000000000dEaD'
const OG = '0xcbddd5ce20450931fca5e57b2d66ecab07acd7c6'
const GATE = '0x0D0707963952f2fBA59dD06f2b425ace40b492Fe'
const RPC = process.env.NEXT_PUBLIC_RPC_URL || process.env.MAINNET_RPC_URL || 'https://ethereum.publicnode.com'

async function ethCall(to, data) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] })
  })
  const j = await res.json()
  if (j.error) throw new Error(j.error.message || 'eth_call failed')
  return BigInt(j.result || '0x0')
}

function balData(holder) {
  return '0x70a08231000000000000000000000000' + holder.slice(2).toLowerCase()
}

export default async function handler(req, res) {
  try {
    const total = await ethCall(KUMA, '0x18160ddd')
    const dead = await ethCall(KUMA, balData(DEAD))
    const inLp = await ethCall(KUMA, balData(LP))
    const breeder = await ethCall(KUMA, balData(BREEDER))
    const migrate = await ethCall(KUMA, balData(MIGRATE))
    const og = await ethCall(KUMA, balData(OG))
    const gate = await ethCall(KUMA, balData(GATE))
    const lpTs = await ethCall(LP, '0x18160ddd')
    const lpDead = await ethCall(LP, balData(DEAD))
    const lpBreeder = await ethCall(LP, balData(BREEDER))
    const permViaLp = lpTs > 0n ? (inLp * lpDead) / lpTs : 0n
    const kumaInBreederLp = lpTs > 0n ? (inLp * lpBreeder) / lpTs : 0n
    const permanent = dead + permViaLp
    const toNum = (x) => Number(x) / 1e18
    const pct = (x) => (Number(x) * 100) / Number(total)

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')
    res.status(200).json({
      ok: true,
      totalSupply: total.toString(),
      totalHuman: toNum(total),
      buckets: {
        burnedRaw: { wei: dead.toString(), human: toNum(dead), pct: pct(dead), label: 'Burned KUMA at 0xdead' },
        lockedViaBurnedLp: { wei: permViaLp.toString(), human: toNum(permViaLp), pct: pct(permViaLp), label: 'Locked in Uni V2 via burned LP (~97.5% LP at dead)' },
        permanentCombined: { wei: permanent.toString(), human: toNum(permanent), pct: pct(permanent), label: 'Permanently inaccessible (burn + dead LP)' },
        inLpTotal: { wei: inLp.toString(), human: toNum(inLp), pct: pct(inLp), label: 'KUMA sitting in Uni V2 pair' },
        breederRaw: { wei: breeder.toString(), human: toNum(breeder), pct: pct(breeder), label: 'KUMA on Breeder contract' },
        breederViaLp: { wei: kumaInBreederLp.toString(), human: toNum(kumaInBreederLp), pct: pct(kumaInBreederLp), label: 'KUMA via LP staked in Breeder' },
        migrate: { wei: migrate.toString(), human: toNum(migrate), pct: pct(migrate), label: 'KumaMigrate (unclaimed V1→V2)' },
        ogDeployer: { wei: og.toString(), human: toNum(og), pct: pct(og), label: 'OG Deployer wallet' },
        gateCex: { wei: gate.toString(), human: toNum(gate), pct: pct(gate), label: 'Gate.io (known CEX hot wallet)' }
      },
      lp: {
        totalSupply: lpTs.toString(),
        deadPct: lpTs > 0n ? (Number(lpDead) * 100) / Number(lpTs) : 0,
        pair: LP
      },
      contracts: { kuma: KUMA, lp: LP, breeder: BREEDER, migrate: MIGRATE },
      fetchedAt: new Date().toISOString()
    })
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e.message || e) })
  }
}
