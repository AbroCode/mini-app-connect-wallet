import { useEffect, useState } from 'react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import './App.css'

function App() {
  const { address, isConnected } = useAppKitAccount()
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
      <p>Tap below to choose your wallet:</p>

      {/* Pro Reown button → opens full modal with deep links */}
      <w3m-button size="lg" label="Connect Wallet" />

      {isConnected && address ? (
        <div className="connected">
          <p>Connected ✅</p>
          <strong>{address.slice(0, 8)}...{address.slice(-6)}</strong>
          <p>(Address auto-sent to your bot)</p>
        </div>
      ) : (
        <p>No wallet connected yet.</p>
      )}
    </div>
  )
}

export default App
