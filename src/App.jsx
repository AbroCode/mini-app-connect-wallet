import { useEffect, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import './App.css'

function App() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [sent, setSent] = useState(false)
  const [txStatus, setTxStatus] = useState('')

  // Bot's receive address (your hot wallet — keep secure!)
  const BOT_ADDRESS = new PublicKey('YOUR_BOT_SOLANA_ADDRESS_HERE') // Replace with real

  useEffect(() => {
    if (connected && publicKey && !sent) {
      const address = publicKey.toBase58()
      const data = { walletAddress: address, chain: 'solana' }
      window.Telegram.WebApp.sendData(JSON.stringify(data))
      setSent(true)
      window.Telegram.WebApp.expand()
    }
  }, [connected, publicKey, sent])

  const handlePayment = async (amountSOL) => {
    if (!connected || !publicKey) {
      setTxStatus('Connect wallet first bro!')
      return
    }

    try {
      setTxStatus('Requesting approval in Phantom...')

      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: BOT_ADDRESS,
          lamports: amountSOL * LAMPORTS_PER_SOL,
        })
      )

      const signature = await sendTransaction(tx, connection)
      setTxStatus('Confirming tx...')

      await connection.confirmTransaction(signature, 'processed')
      setTxStatus(`Paid ✅ Tx: ${signature.slice(0, 8)}...`)

      // Send tx proof to bot for instant credit (diamonds/topup mod)
      window.Telegram.WebApp.sendData(JSON.stringify({
        paymentTx: signature,
        amount: amountSOL,
        walletAddress: publicKey.toBase58()
      }))
    } catch (error) {
      setTxStatus('Rejected or failed 😔')
      console.error(error)
    }
  }

  return (
    <div className="container">
      <h1>Free Fire Premium Bot</h1>
      <p>Connect & Pay for Diamonds/Topup/Mods</p>

      <WalletMultiButton style={{ margin: '20px auto', display: 'block' }} />

      {connected && publicKey ? (
        <div className="connected">
          <p>Wallet: {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)}</p>
          <p>Ready for payment automation</p>

          {/* Example payments — mod prices for your Free Fire features */}
          <button onClick={() => handlePayment(0.05)} className="pay-btn">
            Pay 0.05 SOL → 500 Diamonds
          </button>
          <button onClick={() => handlePayment(0.1)} className="pay-btn">
            Pay 0.1 SOL → Unlimited Ammo Mod
          </button>
          <button onClick={() => handlePayment(0.2)} className="pay-btn">
            Pay 0.2 SOL → Full Topup Pack
          </button>

          <p>{txStatus}</p>
        </div>
      ) : (
        <p>Connect Phantom to pay & unlock mods</p>
      )}
    </div>
  )
}

export default App
