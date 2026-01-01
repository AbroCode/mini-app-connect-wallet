import { useAppKitAccount } from '@reown/appkit/react'
import { useEffect, useState } from 'react'

function App() {
  const { address, isConnected } = useAppKitAccount()
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (isConnected && address && !sent) {
      const data = { walletAddress: address, chain: 'solana' }
      window.Telegram.WebApp.sendData(JSON.stringify(data))
      setSent(true)
      window.Telegram.WebApp.expand()
    }
  }, [isConnected, address, sent])

  return (
    <>
      <w3m-button size="lg" />
      {isConnected && address && (
        <p>Connected: {address.slice(0, 8)}...{address.slice(-6)} (Sent to bot ✅)</p>
      )}
    </>
  )
}

export default App
