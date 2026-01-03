import { useEffect, useState, useCallback } from "react"
import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react"
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import "./App.css"

function App() {
  const { address, isConnected: connected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider("solana")
  const { connection } = useAppKitConnection()
  const { open } = useAppKit()

  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [errorDetails, setErrorDetails] = useState("")
  const [telegramId, setTelegramId] = useState("")

  const BOT_ADDRESS = "8vrwajVezWhxt4M1wyyPRuFzYDV3LBkw2y2nGkiSZU71"

   const handleDeposit = useCallback(async () => {
    // 1. Strict Check (Like Code 1)
    if (!connected) {
      open()
      return
    }
    
    // We strictly look for signAndSendTransaction since you confirmed it works
    const sendTransaction = walletProvider?.signAndSendTransaction
    if (!sendTransaction || !connection || !address || !amount) return

    const tg = window.Telegram?.WebApp
    const publicKey = new PublicKey(address)

    setLoading(true)
    setStatus("PREPARING")
    setErrorDetails("")
    tg?.HapticFeedback?.impactOccurred("medium")

    try {
      setStatus("FETCHING BLOCKHASH")
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed")

      const tx = new Transaction({
        feePayer: publicKey,
        recentBlockhash: blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(BOT_ADDRESS),
          lamports: Math.round(Number.parseFloat(amount) * LAMPORTS_PER_SOL),
        }),
      )

      setStatus("CONFIRM IN WALLET")

      // 2. Direct Call (Exactly like Code 1)
      // This triggers the wallet to open directly
      const signature = await sendTransaction(tx)

      setStatus("CONFIRMING...")
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      )

      if (confirmation.value.err) throw new Error("TRANSACTION FAILED")

      setStatus("SUCCESS!")
      tg?.HapticFeedback?.notificationOccurred("success")

      tg?.sendData(JSON.stringify({ signature, amount, fromAddress: address }))
      setTimeout(() => tg?.close(), 2000)

    } catch (err) {
      console.error("[v0] Tx Error:", err)
      setStatus("ERROR")
      
      let msg = err.message || "FAILED"
      if (msg.includes("rejected") || msg.includes("User rejected")) msg = "CANCELLED BY USER"
      
      setErrorDetails(msg.toUpperCase())
      tg?.HapticFeedback?.notificationOccurred("error")
    } finally {
      setLoading(false)
    }
  }, [connected, walletProvider, connection, address, amount, open])



  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.MainButton.setText(`DEPOSIT ${amount || "0"} SOL`)
      if (connected && amount > 0) {
        tg.MainButton.show()
        tg.MainButton.onClick(handleDeposit)
      } else {
        tg.MainButton.hide()
      }
      return () => tg.MainButton.offClick(handleDeposit)
    }
  }, [connected, amount, handleDeposit])

  return (
    <div className="container">
      <header className="header">
        <h1>CRYPTO DEPOSIT</h1>
        <p className="subtitle">PHANTOM & SOLANA READY</p>
      </header>

      <div className="card">
        <div className="input-group">
          <label>AMOUNT (SOL)</label>
          <div className="amount-input-wrapper">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
        </div>

        <div className="wallet-section">
          {!connected ? (
            <appkit-button />
          ) : (
            <div className="connected-info">
              <p>
                CONNECTED: {address.slice(0, 4)}...{address.slice(-4)}
              </p>
              <button onClick={() => open()} className="pay-btn">
                SWITCH WALLET
              </button>
            </div>
          )}
        </div>

        {connected && amount > 0 && (
          <button onClick={handleDeposit} className="pay-btn" disabled={loading}>
            {loading ? "CHECK WALLET..." : `PAY ${amount} SOL`}
          </button>
        )}
      </div>

      <div className={`status-pill ${status ? "visible" : ""}`}>
        <span>{status}</span>
        {errorDetails && <span className="error-subtext">{errorDetails}</span>}
      </div>
    </div>
  )
}

export default App
