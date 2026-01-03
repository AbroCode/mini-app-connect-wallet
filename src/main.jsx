"use client"

import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter, TrustWalletAdapter } from '@solana/wallet-adapter-wallets' // Add these

// Your Project ID
const projectId = '1f1ea64e0b931eecba61513d1868ae02'

// Explicit wallets = better deep link detection & priority for mobile (Phantom opens app directly more reliably)
const solanaAdapter = new SolanaAdapter({
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter(),
    // Add more if needed — this forces native handlers
  ]
})

const metadata = {
  name: 'CRYPTO DEPOSIT',
  description: 'Fast & Secure Solana Payments',
  url: window.location.origin,
  icons: ['/vite.svg']
}

createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet, solanaTestnet],
  projectId,
  metadata,
  features: {
    analytics: true,
    allWallets: true, // Still show all, but prioritize natives
    email: false,
    onramp: true,
    swaps: true,
    notifications: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--appkit-border-radius-m': '12px',
    '--appkit-color-background-100': '#000000',
    '--appkit-color-background-200': '#0a0a0a',
    '--appkit-color-foreground-100': '#ffffff',
    '--appkit-color-accent-100': '#00d4ff'
  },
  allowUnsupportedChain: false,
  // Extra for better mobile return
  linkMode: true
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
