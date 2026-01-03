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
import { MobileWalletAdapter } from "@solana-mobile/wallet-adapter-mobile"  // ONLY THIS NEW IMPORT

import "@solana/wallet-adapter-react-ui/styles.css"

function Root() {
  // SWITCH TO PRIVATE RPC HERE TO FIX 403 ERROR (e.g., Helius free tier)
  const endpoint = useMemo(() => "https://your-private-rpc-url.mainnet-beta.solana.com", [])  
  // Or for testing: clusterApiUrl("devnet")

  const wallets = useMemo(
    () => [
      new MobileWalletAdapter({
        appIdentity: {
          name: "SOL Deposit",                  // Your app name
          uri: window.location.origin,          // Your deployed URL
          icon: "/favicon.ico",                 // Or any icon path
        },
        cluster: "mainnet-beta",
      }),
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    []
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
  </React.StrictMode>
)
