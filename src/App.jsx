import { useEffect, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletModalButton } from '@solana/wallet-adapter-react-ui' // Better: Always "Select Wallet" button
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import './App.css'

function App() {
  const { publicKey, connected, sendTransaction, connecting } = useWallet()
  const { connection } = useConnection()
  const [amount, setAmount] = useState(null)
  const [tgId, setTgId] = useState(null)
  const [status, setStatus] = useState('')

  // TEST BOT RECEIVE ADDRESS — replace with your real one later
  const BOT_ADDRESS = new PublicKey('YOUR_TEST_BOT_SOL_ADDRESS_HERE') // e.g., a devnet wallet for testing

  // Parse amount & tg_id from URL (bot launches with ?amount=0.05&tg_id=123)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const amt = parseFloat(params.get('amount'))
    const id = params.get('tg_id')
    if (amt > 0) setAmount(amt)
    if (id) setTgId(id)
  }, [])

  // Auto request payment RIGHT AFTER connect
  useEffect(() => {
    if (connected && publicKey && amount && !status.includes('Paid')) {
      handlePayment()
    }
  }, [connected, publicKey, amount])

  const handlePayment = async () => {
    if (!publicKey || !amount) return

    setStatus('Requesting payment approval in wallet...')

    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: BOT_ADDRESS,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      )

      const signature = await sendTransaction(tx, connection)
      setStatus('Confirming transaction...')

      await connection.confirmTransaction(signature, 'processed')
      setStatus(`Paid ${amount} SOL ✅ Tx: ${signature.slice(0,8)}...`)

      // Send proof to bot for instant credit (diamonds/topup/mod unlock)
      const data = {
        paymentTx: signature,
        amount: amount,
        tgId: tgId || window.Telegram.WebApp.initDataUnsafe.user?.id,
        walletAddress: publicKey.toBase58()
      }
      window.Telegram.WebApp.sendData(JSON.stringify(data))
    } catch (err) {
      setStatus('Payment rejected or failed 😔')
      console.error(err)
    }
  }

  return (
    <div className="container">
      <h1>Free Fire Payment</h1>

      {amount ? (
        <p>Pay <strong>{amount} SOL</strong> to unlock premium pack</p>
      ) : (
        <p>No amount specified — launch from bot with ?amount=0.05</p>
      )}

      {/* Always shows wallet list modal — no "Connect" text confusion */}
      <WalletModalButton style={{ width: '100%', padding: '20px', fontSize: '20px' }}>
        {connecting ? 'Connecting...' : 'Select Wallet & Pay'}
      </WalletModalButton>

      <div className="status">
        <p>{status}</p>
        {connected && <p>Wallet: {publicKey.toBase58().slice(0,8)}...{publicKey.toBase58().slice(-6)}</p>}
      </div>
    </div>
  )
}

export default App
