import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet } from '@reown/appkit/networks'

// YOUR REAL PROJECT ID FROM cloud.reown.com (mandatory for full wallet list!)
const projectId = 'YOUR_REOWN_PROJECT_ID_HERE'

const metadata = {
  name: 'Free Fire SOL Deposit',
  description: 'Deposit SOL for diamonds/topup/mods',
  url: 'https://your-vercel.app',
  icons: ['https://your-icon.png']
}

const solanaAdapter = new SolanaAdapter()

createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet],
  projectId,
  metadata,
  features: {
    allWallets: true, // FULL 500+ LIST INCLUDING 100+ SOLANA
    analytics: true,
    connectMethodsOrder: ['wallet'] // Only wallets, no email/social
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
