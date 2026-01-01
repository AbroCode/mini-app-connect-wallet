import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css' // Pro modal styles

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  // Add more if needed (Backpack, OKX, etc.)
]

const endpoint = clusterApiUrl('mainnet-beta') // Or devnet for testing

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
)
