import { useEffect, useState } from 'react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import './App.css'

function App() {
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('solana')
  const { connection } = useAppKitConnection()
  const [amount, setAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState('')

  const BOT_ADDRESS = '8vrwajVezWhxt4M1wyyPRuFzYDV3LBkw2y2nGkiSZU71' // Your receive

  const handleSubmit = (e) => {
    e.preventDefault()
    if (parseFloat(amount) > 0) setSubmitted(true)
  }

  const handleDeposit = async () => {
    if (!walletProvider || !connection || !address) return

    setStatus('Fetching blockhash & requesting approval...')

    try {
      const { blockhash } = await connection.getLatestBlockhash()

      const tx = new Transaction({
        feePayer: new PublicKey(address),
        recentBlockhash: blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(address),
          toPubkey: new PublicKey(BOT_ADDRESS),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      )

      const signature = await walletProvider.sendTransaction(tx, connection)
      setStatus('Confirming tx on chain...')

      await connection.confirmTransaction(signature, 'processed')
      setStatus(`Deposited ${amount} SOL ✅ Tx: ${signature.slice(0,8)}...`)

      window.Telegram.WebApp.sendData(JSON.stringify({
        txSig: signature,
        amount,
        fromAddress: address
      }))
    } catch (err) {
      setStatus('Rejected or failed 😔 Check wallet approval')
      console.error(err)
    }
  }

  return (
    <div className="container">
      <h1>SOL Deposit - Free Fire Bot</h1>

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
          <button type="submit">Submit Amount</button>
        </form>
      ) : (
        <>
          <p>Deposit <strong>{amount} SOL</strong> to unlock diamonds/topup/mods</p>

          <w3m-button size="lg" label="Connect Wallet" />

          {isConnected && (
            <button onClick={handleDeposit} className="pay-btn">
              Deposit {amount} SOL Now
            </button>
          )}

          <div className="status">
            <p>{status}</p>
            {isConnected && <p>Connected: {address?.slice(0,8)}...{address?.slice(-6)}</p>}
          </div>
        </>
      )}
    </div>
  )
}

export default App
