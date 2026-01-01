import { useState } from 'react'
import './App.css'

function App() {
  const [amount, setAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const BOT_ADDRESS = '8vrwajVezWhxt4M1wyyPRuFzYDV3LBkw2y2nGkiSZU71'

  const handleSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (amt > 0) setSubmitted(true)
  }

  // Phantom deep link for connect + transfer (coordinated, no reload)
  const phantomDeepLink = () => {
    const params = new URLSearchParams({
      app_url: window.location.origin,
      redirect_link: window.location.href, // Return to same page with state
      cluster: 'mainnet-beta',
      amount: (parseFloat(amount) * 1e9).toString(), // lamports
      to: BOT_ADDRESS,
      // Add reference or memo if needed for bot verify
    })
    const link = `https://phantom.app/ul/v1/transfer?${params.toString()}`
    window.location.href = link // Opens Phantom, approves → return seamless
  }

  return (
    <div className="container">
      <h1>Free Fire SOL Deposit</h1>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <input type="number" step="0.01" placeholder="Enter SOL amount" value={amount} onChange={e => setAmount(e.target.value)} required />
          <button type="submit">Submit Amount</button>
        </form>
      ) : (
        <>
          <p>Deposit <strong>{amount} SOL</strong> for diamonds/topup/mods</p>

          {/* Pro Phantom button - deep link, coordinated flow */}
          <button onClick={phantomDeepLink} className="phantom-btn">
            Pay with Phantom (Recommended)
          </button>

          {/* Fallback for other wallets */}
          <w3m-button size="lg" label="Other Wallets (100+)" />

          <p>To: {BOT_ADDRESS.slice(0,8)}...{BOT_ADDRESS.slice(-6)}</p>
        </>
      )}
    </div>
  )
}

export default App
