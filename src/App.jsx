import { useEffect, useState } from 'react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { PublicKey, Transaction } from '@solana/web3.js'
import './App.css'

function App() {
  const { address, isConnected } = useAppKitAccount()
  const { provider } = useAppKitProvider('solana')
  const [amount, setAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState('')

  const BOT_ADDRESS = '8vrwajVezWhxt4M1wyyPRuFzYDV3LBkw2y2nGkiSZU71' // Your receive

  const handleSubmit = (e) => {
    e.preventDefault()
    if (parseFloat(amount) > 0) setSubmitted(true)
  }

  useEffect(() => {
    if (isConnected && address && submitted && amount > 0) {
      handlePayment()
    }
  }, [isConnected, address, submitted])

  const handlePayment = async () => {
    setStatus('Approve transfer in wallet...')

    try {
      const transaction = new Transaction().add({
        // Simple transfer instruction (adapt for tokens if needed)
        // Full code uses SystemProgram.transfer
        // Note: provider.sendTransaction handles it
      })

      const sig = await provider.sendTransaction(transaction)
      setStatus(`Deposited ${amount} SOL ✅ Tx: ${sig.slice(0,8)}...`)

      window.Telegram.WebApp.sendData(JSON.stringify({
        txSig: sig,
        amount,
        fromAddress: address
      }))
    } catch (e) {
      setStatus('Rejected/failed 😔')
    }
  }

  return (
    <div className="container">
      <h1>SOL Deposit</h1>
      <p>For Free Fire diamonds, topup & mods</p>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            step="0.01"
            placeholder="Enter SOL amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <button type="submit">Submit & Pay</button>
        </form>
      ) : (
        <>
          <p>Pay <strong>{amount} SOL</strong> to {BOT_ADDRESS.slice(0,8)}...{BOT_ADDRESS.slice(-6)}</p>

          <w3m-button size="lg" label="Connect Wallet & Deposit" />

          <div className="status">
            <p>{status}</p>
            {isConnected && <p>From: {address?.slice(0,8)}...{address?.slice(-6)}</p>}
          </div>
        </>
      )}
    </div>
  )
}

export default App
