"use client"

import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

// REPLACE WITH YOUR PROJECT ID FROM https://cloud.reown.com (free, takes 1 min)
const projectId = '1f1ea64e0b931eecba61513d1868ae02'

// Solana adapter with NO wallets specified = ALL supported Solana wallets (600+ via WC, including Phantom, Solflare, Backpack, etc.)
const solanaAdapter = new SolanaAdapter()

// Professional metadata for your payment mini app
const metadata = {
  name: 'CRYPTO DEPOSIT',
  description: 'Fast & Secure Solana Payments',
  url: window.location.origin, // Or your deployed Vercel/Netlify URL
  icons: ['/vite.svg'] // Replace with your logo if you have one
}

// Initialize Reown AppKit with EVERY feature enabled (max pro setup for Telegram/Solana)
createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet, solanaTestnet], // Mainnet primary
  projectId,
  metadata,
  features: {
    analytics: true,     // Track usage for bot optimization
    allWallets: true,    // Show ALL Solana wallets (not limited)
    email: true,         // Email login for easy onboarding
    socials: ['google', 'x', 'discord', 'facebook', 'apple'], // All major socials
    onramp: true,        // Buy SOL with card/fiat directly
    swaps: true,         // In-app token swaps
    notifications: true  // Wallet push notifications
  },
  themeMode: 'dark',
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
