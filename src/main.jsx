import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

// YOUR REOWN PROJECT ID
const projectId = 'YOUR_REOWN_PROJECT_ID_HERE'

const metadata = {
  name: 'Solana Mini App',
  description: 'Connect wallet for bot automation',
  url: 'https://your-vercel-url.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const solanaAdapter = new SolanaAdapter()

createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet, solanaTestnet],
  projectId,
  metadata,
  features: {
    allWallets: true,
    analytics: true,
    connectMethodsOrder: ['wallet'],  // Still only wallets in list
    showQrModal: true  // KEY: Forces QR fallback for browser testing (scan with Phantom app)
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
