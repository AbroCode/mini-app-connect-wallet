import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

// REPLACE WITH YOUR REOWN PROJECT ID FROM cloud.reown.com
const projectId = 'YOUR_REOWN_PROJECT_ID_HERE'

const metadata = {
  name: 'Your Solana Mini App',
  description: 'Connect Solana wallet seamlessly',
  url: 'https://your-vercel-url.vercel.app', // Update after first deploy
  icons: ['https://your-icon.png'] // Optional
}

const solanaAdapter = new SolanaAdapter()

createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet, solanaTestnet],
  projectId,
  metadata,
  features: {
    email: false,
    socials: false,
    allWallets: true // Shows full list: Phantom, Backpack, etc.
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
