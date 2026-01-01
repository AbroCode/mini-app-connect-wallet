import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_PROJECT_ID || 'YOUR_REOWN_PROJECT_ID_HERE' // Use env or paste

const metadata = {
  name: 'Solana Mini App',
  description: 'Connect wallet for bot access',
  url: 'https://your-vercel-url.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const solanaAdapter = new SolanaAdapter()

createAppKit({
  adapters: [solanaAdapter],
  networks: [solana, solanaDevnet, solanaTestnet],
  metadata,
  projectId,
  features: {
    analytics: true,
    allWallets: true
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
