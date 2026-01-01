import { useEffect, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalButton } from '@solana/wallet-adapter-react-ui'
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import './App.css'

function App() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [amount, setAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState('')

  const BOT_ADDRESS = new PublicKey('8vrwajVezWhxt4M1wyyPRuFzYDV3LBkw2y2nGkiSZU71')

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (amt > 0) setSubmitted(true)
  }

  useEffect(() => {
    if (connected && publicKey && submitted && amount) {
      handlePay()
    }
  }, [connected, publicKey, submitted])

  const handlePay = async () => {
    setStatus('Approve in wallet...')
    try {
      const { blockhash } = await connection.getLatestBlockhash()
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: BOT_ADDRESS,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      )

      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig)
      setStatus(`Paid ${amount} SOL ✅ Tx: ${sig.slice(0,8)}...`)

      window.Telegram.WebApp.sendData(JSON.stringify({ txSig: sig, amount, from: publicKey.toBase58() }))
    } catch (e) {
      setStatus('Rejected 😔')
    }
  }

  return (
    <div className="container">
      <h1>Free Fire Deposit</h1>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <input type="number" step="0.01" placeholder="SOL Amount" value={amount} onChange={e => setAmount(e.target.value)} required />
          <button type="submit">Submit & Pay</button>
        </form>
      ) : (
        <>
          <p>Pay <strong>{amount} SOL</strong></p>
          <WalletModalButton>Select Wallet</WalletModalButton>
          <div className="status"><p>{status}</p></div>
        </>
      )}
    </div>
  )
}

export default App
