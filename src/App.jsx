"use client"

import { useEffect, useState } from "react"
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import "./App.css"

function App() {
  const { address, isConnected: connected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('solana')
  const { connection } = useAppKitConnection()

  const publicKey = address ? new PublicKey(address) : null
  const sendTransaction = walletProvider?.signAndSendTransaction
  const disconnect = walletProvider?.disconnect // For change wallet

  const [telegramId, setTelegramId] = useState("")
  const [telegramUsername, setTelegramUsername] = useState("")

  const [params] = useState(() => new URLSearchParams(window.location.search))
  const [amount, setAmount] = useState(params.get("amount") || "")
  const [userId, setUserId] = useState(params.get("userId") || "UNKNOWN")

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

      const user = tg.initDataUnsafe?.user
      if (user) {
        setTelegramId(user.id?.toString() || "")
        setTelegramUsername(user.username || user.first_name || "")
      }

      console.log("[v0] Telegram User ID:", user?.id)
      console.log("[v0] Telegram Username:", user?.username || user?.first_name)
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
    setStatus("PREPARING")
    setErrorDetails("")
    tg?.HapticFeedback?.impactOccurred("medium")

    try {
      setStatus("CHECKING BALANCE...")
      const balance = await connection.getBalance(publicKey)
      const lamportsToSend = Math.round(Number.parseFloat(amount) * LAMPORTS_PER_SOL)

      if (balance < lamportsToSend) {
        const balanceSOL = (balance / LAMPORTS_PER_SOL).toFixed(4)
        throw new Error(`INSUFFICIENT FUNDS: YOU HAVE ${balanceSOL} SOL BUT NEED ${amount} SOL`)
      }

      setStatus("PREPARING TX...")
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

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

      setStatus("SIGNING...")
      const signature = await sendTransaction(tx)

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

      if (confirmation.value.err) {
        throw new Error("TRANSACTION FAILED ON CHAIN")
      }

      setStatus("SUCCESS!")
      tg?.HapticFeedback?.notificationOccurred("success")

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
      console.log("[v0] Transaction error:", err)
      let message = err.message || "TRANSACTION FAILED"
      if (message.includes("403")) message = "NETWORK ERROR: RPC ACCESS FORBIDDEN. PLEASE TRY AGAIN LATER."
      if (message.includes("User rejected")) message = "CANCELLED: YOU REJECTED THE REQUEST"

      setStatus("ERROR")
      setErrorDetails(message.toUpperCase())
      tg?.HapticFeedback?.notificationOccurred("error")
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

  const handleChangeWallet = async () => {
    try {
      await disconnect?.()
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light")
    } catch (e) {
      console.error("[v0] Disconnect error:", e)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>CRYPTO DEPOSIT</h1>
        <p className="subtitle">FAST & SECURE SOLANA PAYMENTS</p>
        {telegramId && <p className="telegram-id-badge">ID: {telegramId}</p>}
        {telegramUsername && (
          <div className="telegram-user-badge">
            <span className="user-label">USER:</span>
            <span className="user-value">{telegramUsername || `ID: ${telegramId}`}</span>
          </div>
        )}
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
          {!connected ? (
            <appkit-button className="masterpiece-wallet-btn" />
          ) : (
            <div className="connected-wallet-info">
              <div className="wallet-address">
                {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
              </div>
              <button onClick={handleChangeWallet} className="change-wallet-btn">
                CHANGE WALLET
              </button>
            </div>
          )}
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
    </div>
  )
}

export default App
