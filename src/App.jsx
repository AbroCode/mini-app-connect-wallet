"use client"

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
  if (!connected) {
    open()
    return
  }

  if (!walletProvider?.signAndSendTransaction || !connection || !address || !amount) return

  const tg = window.Telegram?.WebApp
  const publicKey = new PublicKey(address)

  setLoading(true)
  setStatus("PREPARING")
  setErrorDetails("")
  tg?.HapticFeedback?.impactOccurred("medium")

  try {
    // Balance check (from second version)
    setStatus("CHECKING BALANCE...")
    const balance = await connection.getBalance(publicKey)
    const lamportsToSend = Math.round(Number.parseFloat(amount) * LAMPORTS_PER_SOL)
    if (balance < lamportsToSend) {
      const balanceSOL = (balance / LAMPORTS_PER_SOL).toFixed(4)
      throw new Error(`INSUFFICIENT FUNDS: YOU HAVE ${balanceSOL} SOL BUT NEED ${amount} SOL`)
    }

    setStatus("FETCHING BLOCKHASH")
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed")

    const tx = new Transaction({
      feePayer: publicKey,
      recentBlockhash: blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(BOT_ADDRESS),
        lamports: lamportsToSend,
      }),
    )

    setStatus("CONFIRM IN WALLET")

    let signature
    // Detect wallet and use appropriate signing method
    const walletName = walletProvider?.name || "unknown"  // Assuming walletProvider has a name property
    if (walletName.toLowerCase().includes("trust")) {
      // Fallback for Trust Wallet using adapter's sendTransaction (assume useWallet hook provides it)
      const { sendTransaction } = useWallet()  // Import and use this hook
      signature = await sendTransaction(tx)
    } else {
      // Default to AppKit for Phantom and others
      signature = await walletProvider.signAndSendTransaction(tx)
    }

    setStatus("CONFIRMING...")
    tg?.HapticFeedback?.impactOccurred("light")

    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight,
      },
      "confirmed",
    )

    if (confirmation.value.err) throw new Error("TRANSACTION FAILED ON CHAIN")

    setStatus("SUCCESS!")
    tg?.HapticFeedback?.notificationOccurred("success")

    // Enriched data sending (from second version)
    tg?.sendData(
      JSON.stringify({
        txSig: signature,
        amount,
        fromAddress: publicKey.toString(),
        telegramId: telegramId || "unknown",
      }),
    )
    setTimeout(() => tg?.close(), 2000)
  } catch (err) {
    console.error("[v0] Tx Error:", err)
    let message = err.message || "TRANSACTION FAILED"
    if (message.includes("403")) message = "NETWORK ERROR: RPC ACCESS FORBIDDEN. PLEASE TRY AGAIN LATER."
    if (message.includes("User rejected")) message = "CANCELLED: YOU REJECTED THE REQUEST"
    setStatus("ERROR")
    setErrorDetails(message.toUpperCase())
    tg?.HapticFeedback?.notificationOccurred("error")
  } finally {
    setLoading(false)
  }
}, [connected, walletProvider, connection, address, amount, open, telegramId])  // Added telegramId to deps

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
