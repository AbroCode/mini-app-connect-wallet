import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletModalButton } from '@solana/wallet-adapter-react-ui' // This is correct
import './App.css'

function App() {
  const { publicKey, connected } = useWallet()
  const [amount, setAmount] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const amt = parseFloat(params.get('amount'))
    if (amt > 0) setAmount(amt)
  }, [])

  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58()
      const data = { walletAddress: address, chain: 'solana' }
      window.Telegram.WebApp.sendData(JSON.stringify(data))
      window.Telegram.WebApp.expand()
    }
  }, [connected, publicKey])

  return (
    <div className="container">
      <h1>Free Fire SOL Payment</h1>

      {amount ? (
        <p>Pay <strong>{amount} SOL</strong> for premium pack</p>
      ) : (
        <p>Test mode — launch with ?amount=0.01</p>
      )}

      <WalletModalButton>
        {connected ? 'Wallet Connected' : 'Select Wallet to Pay'}
      </WalletModalButton>

      {connected && publicKey && (
        <div className="status">
          <p>Connected ✅</p>
          <strong>{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)}</strong>
        </div>
      )}
    </div>
  )
}

export default App
