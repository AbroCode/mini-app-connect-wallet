"use client"

import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

// Replace with your Project ID from cloud.reown.com
const projectId = 'YOUR_PROJECT_ID_HERE'

// Create Solana adapter — NO wallets array = ALL supported Solana wallets (Phantom, Solflare, Backpack + hundreds via WC)
const solanaAdapter = new SolanaAdapter()

// Pro metadata for your payment bot
const metadata = {
  name: 'SOL Deposit Payment',
  description: 'Secure & Fast Solana Deposits via Telegram Mini App',
  url: 'https://your-deployed-url.vercel.app', // Your live URL
  icons: ['https://your-icon-url-or-vite.svg']
}

// Initialize AppKit with EVERY Reown feature enabled for Solana/Telegram
createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet, solanaTestnet], // Mainnet + test for flexibility
  metadata,
  projectId,
  features: {
    analytics: true,         // Track connects/deposits for bot optimization
    allWallets: true,        // Show ALL Solana wallets (not just recent/popular)
    email: true,             // Email login (great for onboarding new users)
    socials: true,           // All social logins (Google, Discord, X, etc.)
    onramp: true,            // Buy SOL with fiat directly in modal
    swaps: true,             // In-app token swaps
    notifications: true      // Wallet notifications (pro for payment bots)
  },
  themeMode: 'dark',         // Matches your black Telegram theme
  themeVariables: {
    '--appkit-border-radius-m': '12px',
    '--appkit-color-background-100': '#000000',
    '--appkit-color-background-200': '#0a0a0a',
    '--appkit-color-foreground-100': '#ffffff',
    '--appkit-color-accent-100': '#00d4ff'
  },
  allowUnsupportedChain: false
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
