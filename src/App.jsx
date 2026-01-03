"use client"

import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import "./App.css"

function App() {
  const { publicKey, connected, sendTransaction, wallet } = useWallet()
  const { connection } = useConnection()

  const [amount, setAmount] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("amount") || ""
  })
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorDetails, setErrorDetails] = useState("")

  const BOT_ADDRESS = "8vrwajVezWhxt4M1wyyPRuFzYDV3LBkw2y2nGkiSZU71"

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.enableClosingConfirmation()
      tg.setHeaderColor("#000000") // Professional black header
      tg.setBackgroundColor("#000000")
    }
  }, [])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    const canDeposit = connected && amount && Number.parseFloat(amount) > 0 && !loading

    if (canDeposit) {
      tg.MainButton.setText(`DEPOSIT ${amount} SOL`)
      tg.MainButton.color = "#ffffff" // High contrast white
      tg.MainButton.textColor = "#000000" // Black text
      tg.MainButton.show()
      tg.MainButton.enable()
      tg.MainButton.onClick(handleDeposit)
    } else {
      tg.MainButton.hide()
    }

    return () => tg.MainButton.offClick(handleDeposit)
  }, [connected, amount, loading])

  const handleDeposit = async () => {
    if (!sendTransaction || !connection || !publicKey || !amount) return

    const tg = window.Telegram?.WebApp
    setLoading(true)
    setStatus("PREPARING TRANSACTION")
    setErrorDetails("")
    tg?.HapticFeedback?.impactOccurred("medium")

    if (tg) {
      tg.MainButton.showProgress(false)
      tg.MainButton.setText("PROCESSING...")
      tg.MainButton.disable()
    }

    try {
      const balance = await connection.getBalance(publicKey)
      const lamportsToSend = Number.parseFloat(amount) * LAMPORTS_PER_SOL

      if (balance < lamportsToSend) {
        throw new Error("INSUFFICIENT FUNDS: YOUR BALANCE IS LOWER THAN THE DEPOSIT AMOUNT")
      }

      const { blockhash } = await connection.getLatestBlockhash()
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

      const signature = await sendTransaction(tx, connection)
      setStatus("CONFIRMING...")
      tg?.HapticFeedback?.impactOccurred("light")

      await connection.confirmTransaction(signature, "processed")

      setStatus("SUCCESS!")
      tg?.HapticFeedback?.notificationOccurred("success")

      if (tg) {
        tg.MainButton.hideProgress()
        tg.MainButton.setText("COMPLETED")
      }

      tg?.sendData(JSON.stringify({ txSig: signature, amount, fromAddress: publicKey.toString() }))
      setTimeout(() => tg?.close(), 2000)
    } catch (err) {
      const message = err.message || "TRANSACTION FAILED"
      setStatus("ERROR")
      setErrorDetails(message.toUpperCase())
      tg?.HapticFeedback?.notificationOccurred("error")

      if (tg) {
        tg.MainButton.hideProgress()
        tg.MainButton.setText("TRY AGAIN")
        tg.MainButton.enable()
      }
      setTimeout(() => {
        setStatus("")
        setErrorDetails("")
      }, 6000)
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (e) => {
    setAmount(e.target.value)
    if (e.target.value && Number.parseFloat(e.target.value) > 0) {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged()
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    if (amount) {
      url.searchParams.set("amount", amount)
    } else {
      url.searchParams.delete("amount")
    }
    window.history.replaceState({}, "", url.toString())
  }, [amount])

  return (
    <div className="container">
      <header className="header">
        <h1>CRYPTO DEPOSIT</h1>
        <p className="subtitle">FAST & SECURE SOLANA PAYMENTS</p>
      </header>

      <div className="card">
        <div className="input-group">
          <label htmlFor="amount">ENTER AMOUNT</label>
          <div className="amount-input-wrapper">
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              disabled={loading}
            />
            <span className="currency-label">SOL</span>
          </div>
        </div>

        <div className="wallet-section">
          <WalletMultiButton className="masterpiece-wallet-btn" />
        </div>

        {connected && amount && Number.parseFloat(amount) > 0 && (
          <button
            onClick={handleDeposit}
            className={`pay-btn ${loading ? "loading" : ""} desktop-only`}
            disabled={loading}
          >
            {loading ? "PROCESSING..." : `DEPOSIT ${amount} SOL`}
          </button>
        )}
      </div>

      <div
        className={`status-pill ${status ? "visible" : ""} ${status === "ERROR" ? "error" : ""} ${loading ? "loading" : ""}`}
      >
        {loading && <span className="spinner"></span>}
        <div className="status-text-container">
          <span className="status-main">{status}</span>
          {errorDetails && <span className="error-subtext">{errorDetails}</span>}
        </div>
      </div>

      {connected && publicKey && (
        <p className="address-display">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </p>
      )}
    </div>
  )
}

export default App
