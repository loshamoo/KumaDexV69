# KumaDex

A decentralized exchange interface built with Next.js, styled-components, and RainbowKit.

## Setup

1. Install dependencies:
   ```bash
   npm install --ignore-scripts --omit=optional
   ```

2. Copy the environment file:
   ```bash
   cp .env.local.example .env.local
   ```

3. Get a WalletConnect Project ID from https://cloud.walletconnect.com/ and add it to your .env.local file.

4. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- Token swapping interface
- Wallet connection via RainbowKit
- Responsive design
- Multiple token support

## Known Issues

- Directory path with Unicode characters may cause Node.js issues
- For production, consider moving to a path without special characters

## Dependencies

- Next.js 14
- React 18
- styled-components
- RainbowKit
- wagmi
- ethers