import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

// REPLACE WITH YOUR REOWN PROJECT ID
const projectId = '1f1ea64e0b931eecba61513d1868ae02'

const metadata = {
  name: 'Solana Mini App',
  description: 'Connect wallet for bot automation',
  url: 'https://your-vercel-url.vercel.app', // Update after deploy
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
    analytics: true
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
