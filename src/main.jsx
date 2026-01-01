import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

// REPLACE WITH YOUR REOWN PROJECT ID
const projectId = 'YOUR_REOWN_PROJECT_ID_HERE'

const solanaAdapter = new SolanaAdapter()

const metadata = {
  name: 'Your Solana Mini App',
  description: 'Connect your Solana wallet',
  url: 'https://your-vercel-domain.vercel.app', // Update after deploy
  icons: ['https://your-icon-url.png'] // Optional
}

createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet, solanaTestnet],
  projectId,
  metadata,
  features: {
    email: false,
    socials: false,
    allWallets: true // Shows full list including Phantom, Backpack, etc.
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
