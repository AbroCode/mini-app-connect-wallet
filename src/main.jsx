import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet } from '@reown/appkit/networks' // Works from main package

// YOUR REAL PROJECT ID FROM cloud.reown.com
const projectId = '1f1ea64e0b931eecba61513d1868ae02'

const metadata = {
  name: 'Free Fire SOL Deposit',
  description: 'Deposit SOL for diamonds/topup/mods',
  url: 'https://your-vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const solanaAdapter = new SolanaAdapter()

createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet],
  projectId,
  metadata,
  features: {
    allWallets: true, // 500+ wallets grid
    connectMethodsOrder: ['wallet']
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
