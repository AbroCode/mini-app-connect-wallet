"use client"

import React, { useMemo } from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets"
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'; // For MWA compat if needed
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'; // Optional for advanced
import { MobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile'; // ADD THIS

import "@solana/wallet-adapter-react-ui/styles.css"

function Root() {
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []) // Switch to private RPC here

  const wallets = useMemo(
    () => [
      new MobileWalletAdapter({
        appIdentity: { name: 'SOL Deposit', uri: 'https://your-miniapp-url.com', icon: '/icon.png' }, // Your app details
        cluster: 'mainnet-beta',
      }), // ADD THIS FOR MOBILE DEEP LINKS
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    [],
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
