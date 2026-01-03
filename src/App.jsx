"use client"

import { useEffect, useState } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import "./App.css"

function App() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()

  const [amount, setAmount] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("amount") || ""
  })
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const BOT_ADDRESS = "8vrwajVezWhxt4M1wyyPRuFzYDV3LBkw2y2nGkiSZU71"

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.enableClosingConfirmation()

      // Set header color to match app theme
      tg.setHeaderColor("#0a0e27")
      tg.setBackgroundColor("#0a0e27")
    }
  }, [])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    const canDeposit = connected && amount && Number.parseFloat(amount) > 0 && !loading

    if (canDeposit) {
      tg.MainButton.setText(`Deposit ${amount} SOL`)
      tg.MainButton.color = "#00d4ff"
      tg.MainButton.textColor = "#0a0e27"
      tg.MainButton.show()
      tg.MainButton.enable()

      // Set up click handler
      tg.MainButton.onClick(handleDeposit)
    } else {
      tg.MainButton.hide()
    }

    // Cleanup
    return () => {
      tg.MainButton.offClick(handleDeposit)
    }
  }, [connected, amount, loading])

  const handleDeposit = async () => {
    if (!sendTransaction || !connection || !publicKey || !amount) return

    const tg = window.Telegram?.WebApp

    setLoading(true)
    setStatus("Preparing transaction...")

    tg?.HapticFeedback?.impactOccurred("medium")

    // Update MainButton to show progress
    if (tg) {
      tg.MainButton.showProgress(false)
      tg.MainButton.setText("Processing...")
      tg.MainButton.disable()
    }

    try {
      const { blockhash } = await connection.getLatestBlockhash()

      const tx = new Transaction({
        feePayer: publicKey,
        recentBlockhash: blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(BOT_ADDRESS),
          lamports: Number.parseFloat(amount) * LAMPORTS_PER_SOL,
        }),
      )

      const signature = await sendTransaction(tx, connection)
      setStatus("Confirming on blockchain...")
      tg?.HapticFeedback?.impactOccurred("light")

      await connection.confirmTransaction(signature, "processed")

      setStatus(`Transaction confirmed!`)
      tg?.HapticFeedback?.notificationOccurred("success")

      if (tg) {
        tg.MainButton.hideProgress()
        tg.MainButton.setText("Success!")
      }

      // Send data to bot
      tg?.sendData(
        JSON.stringify({
          txSig: signature,
          amount,
          fromAddress: publicKey.toString(),
        }),
      )

      // Close app after success
      setTimeout(() => {
        tg?.close()
      }, 2000)
    } catch (err) {
      setStatus("Transaction failed. Please try again.")
      tg?.HapticFeedback?.notificationOccurred("error")

      if (tg) {
        tg.MainButton.hideProgress()
        tg.MainButton.setText("Try Again")
        tg.MainButton.enable()
      }

      console.error(err)

      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setStatus("")
      }, 5000)
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
        <h1>SOL Deposit</h1>
        <p className="subtitle">Free Fire Topup Bot</p>
      </header>

      <div className="card">
        <div className="input-group">
          <label htmlFor="amount">Amount (SOL)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            disabled={loading}
          />
        </div>

        <div className="wallet-section">
          <WalletMultiButton />
        </div>

        {connected && amount && Number.parseFloat(amount) > 0 && (
          <button
            onClick={handleDeposit}
            className={`pay-btn ${loading ? "loading" : ""} desktop-only`}
            disabled={loading}
          >
            {loading ? "Processing..." : `Deposit ${amount} SOL`}
          </button>
        )}
      </div>

      <div className={`status-pill ${status ? "visible" : ""} ${loading ? "loading" : ""}`}>
        {loading && <span className="spinner"></span>}
        {status}
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
