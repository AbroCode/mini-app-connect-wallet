import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import './App.css'

function App() {
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (connected && publicKey && !sent) {
      const address = publicKey.toBase58()
      const data = { walletAddress: address, chain: 'solana' }
      window.Telegram.WebApp.sendData(JSON.stringify(data))
      setSent(true)
      window.Telegram.WebApp.expand()

      // Fetch balance for pro display (mod for Free Fire withdraw checks)
      const connection = new Connection(clusterApiUrl('mainnet-beta'))
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / 1e9) // Lamports to SOL
      })
    }
  }, [connected, publicKey, sent])

  return (
    <div className="container">
      <h1>Connect Solana Wallet</h1>
      <p>For Free Fire rewards & SOL withdraws</p>

      {/* Pro button → modal with wallets → deep link + prompt */}
      <WalletMultiButton style={{ margin: '20px auto', display: 'block' }} />

      {connected && publicKey ? (
        <div className="connected">
          <p>Connected ✅</p>
          <strong>{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)}</strong>
          {balance !== null && <p>Balance: {balance.toFixed(4)} SOL</p>}
          <p>(Address sent to bot — ready for withdraw automation)</p>
        </div>
      ) : (
        <p>No wallet connected yet.</p>
      )}
    </div>
  )
}

export default App
