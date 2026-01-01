import { useEffect, useState } from 'react'
import { useAppKitAccount, useAppKitEvents } from '@reown/appkit/react'
import './App.css'

function App() {
  const { address, isConnected } = useAppKitAccount({ namespace: 'solana' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (isConnected && address && !sent) {
      const data = {
        walletAddress: address,
        chain: 'solana',
        connectedAt: new Date().toISOString()
      }
      window.Telegram.WebApp.sendData(JSON.stringify(data))
      setSent(true)
      window.Telegram.WebApp.expand()
    }
  }, [isConnected, address, sent])

  return (
    <div className="container">
      <h1>Connect Solana Wallet</h1>
      <p>Select your wallet to connect:</p>

      {/* Professional connect button → opens modal with full wallet list + deep links */}
      <w3m-button size="lg" label="Connect Wallet" loadingLabel="Connecting..." />

      {isConnected && address ? (
        <div className="connected">
          <p>Wallet Connected ✅</p>
          <strong>{address.slice(0, 8)}...{address.slice(-6)}</strong>
          <p>(Address sent to your bot)</p>
        </div>
      ) : (
        <p>No wallet connected yet.</p>
      )}
    </div>
  )
}

export default App
