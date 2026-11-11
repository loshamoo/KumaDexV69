# KumaDex

A decentralized exchange interface built with Next.js, styled-components, ethers v6, and web3.js. Deployed on **Vercel**.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file:
   ```bash
   cp .env.local.example .env.local
   ```

3. Optional: set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` if you add WalletConnect later.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Checks:
   ```bash
   npm test
   npm run lint
   npm run build
   ```

## Features

- Token swapping / bridging via LI.FI (EVM including Robinhood Chain `4663`, and Solana)
- Kuma Breeder and dKUMA Breeder staking
- Responsive UI

Perpetuals (1x–25x) are **not live**. `/kumadex` is a status page (coming via DAO). Spot swaps are on `/swap`.

## Token approvals

ERC-20 approvals for LI.FI swaps and Breeder LP/dKUMA deposits use the **exact amount** being spent, not unlimited (`MaxUint256`). Tokens that reject non-zero → non-zero allowance changes (USDT-style) are reset to zero first.

## LI.FI integrator fees

Quotes pass LI.FI’s real fee parameters:

- `integrator=kumadex`
- `fee=0.003` (0.3% of `fromAmount`)

The `referrer` field is **tracking-only** and is not used. It cannot send fees to the SwapXFeeRouter.

**Owner action (LI.FI Partner Portal, not this repo):** set the fee-collection wallet for integrator `kumadex` to the SwapXFeeRouter once that contract should receive integrator fees. See [LI.FI monetizing the integration](https://docs.li.fi/introduction/integrating-lifi/monetizing-integration) and [portal.li.fi](https://portal.li.fi/).

`NEXT_PUBLIC_SWAPX_FEE_ROUTER` only enables on-chain router status (pause / last sweep). It does not redirect LI.FI fees by itself.

## Dependencies

- Next.js 14
- React 18
- styled-components
- ethers 6
- web3.js 4
- @solana/web3.js

`npm audit` remaining items that were **not** force-upgraded (breaking majors): Next 14 still reports Image Optimizer / RSC advisories that npm would only “fix” by jumping to Next 16; `@solana/web3.js` 1.x via jayson/uuid; `web3` 4.x via zod. Stay on these majors until the owner is ready for Next 16 / Solana web3.js 3.
