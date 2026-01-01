import { useWallet, WalletMultiButton } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const { publicKey, connected } = useWallet()
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (connected && publicKey && !sent) {
      const address = publicKey.toBase58()
      const data = { walletAddress: address, chain: 'solana' }
      window.Telegram.WebApp.sendData(JSON.stringify(data))
      setSent(true)
      window.Telegram.WebApp.expand()
    }
  }, [connected, publicKey, sent])

  return (
    <div className="container">
      <h1>Connect Solana Wallet</h1>
      <p>For SOL withdraws & Free Fire rewards</p>

      {/* Pro button opens modal with wallet list only */}
      <WalletMultiButton />

      {connected && publicKey && (
        <div className="connected">
          <p>Connected ✅</p>
          <strong>{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)}</strong>
          <p>(Address sent to bot)</p>
        </div>
      )}
    </div>
  )
}

export default App
