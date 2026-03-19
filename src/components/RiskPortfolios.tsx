import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Flame, X, CheckCircle2, Loader2, Settings2 } from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { useDeposit, usePrices } from '@yo-protocol/react'
import { parseTokenAmount, VAULTS } from '@yo-protocol/core'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

const PROFILES = [
  {
    id: 'conservative', title: 'Conservative', icon: Shield, color: '#00FF8B',
    desc: 'Low risk, stable yield. 100% yoUSD.',
    allocations: [{ vaultId: 'yoUSD', pct: 100 }]
  },
  {
    id: 'balanced', title: 'Balanced', icon: Zap, color: '#D6FF34',
    desc: 'Moderate risk. 50% yoUSD, 25% yoETH, 25% yoBTC.',
    allocations: [{ vaultId: 'yoUSD', pct: 50 }, { vaultId: 'yoETH', pct: 25 }, { vaultId: 'yoBTC', pct: 25 }]
  },
  {
    id: 'aggressive', title: 'Aggressive', icon: Flame, color: '#FF5E5E',
    desc: 'Max growth. 60% yoETH, 40% yoBTC.',
    allocations: [{ vaultId: 'yoETH', pct: 60 }, { vaultId: 'yoBTC', pct: 40 }]
  },
  {
    id: 'custom', title: 'Custom Basket', icon: Settings2, color: '#4E6FFF',
    desc: 'Build your own strategy. Pick any assets.',
    allocations: [{ vaultId: 'yoUSD', pct: 100 }]
  }
]

const SYMBOL_TO_CG: Record<string, string> = {
  'WETH': 'ethereum', 'ETH': 'ethereum',
  'cbBTC': 'bitcoin', 'BTC': 'bitcoin',
  'USDC': 'usd-coin', 'EURC': 'euro-coin',
}
const VAULT_COLORS: Record<string, string> = {
  yoUSD: '#00FF8B', yoETH: '#627EEA', yoBTC: '#FFAF4F', yoEUR: '#4E6FFF'
}

export default function RiskPortfolios() {
  const [selectedProfile, setSelectedProfile] = useState<typeof PROFILES[0] | null>(null)

  return (
    <>
      <div style={{ marginBottom: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            One-Click Portfolios
          </h2>
          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: 13, fontWeight: 400, margin: '0 0 14px' }}>
            Diversify instantly based on your risk tolerance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="port-grid">
          {PROFILES.map((prof) => (
            <motion.div
              key={prof.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedProfile(prof)}
              style={{
                background: 'rgba(13,17,23,0.75)', border: `1px solid ${prof.color}40`, borderRadius: 20,
                padding: '24px', backdropFilter: 'blur(12px)', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.2s',
                boxShadow: `0 8px 32px ${prof.color}10`
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(13,17,23,0.75)' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${prof.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <prof.icon size={22} color={prof.color} />
              </div>
              <h3 style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{prof.title}</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 12, lineHeight: 1.5, margin: '0 0 20px', minHeight: 40 }}>{prof.desc}</p>
              
              <div style={{ width: '100%', height: 6, borderRadius: 3, display: 'flex', overflow: 'hidden', marginBottom: 20 }}>
                {prof.allocations.map((a, i) => {
                  const vColor = a.vaultId === 'yoUSD' ? '#00FF8B' : '#627EEA'
                  return <div key={i} style={{ width: `${a.pct}%`, background: vColor, borderRight: i === 0 ? '1px solid #111' : 'none' }} />
                })}
              </div>

              <button style={{
                background: 'transparent', border: `1px solid ${prof.color}60`, borderRadius: 10, color: prof.color,
                padding: '8px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', width: '100%', cursor: 'pointer', fontFamily: F
              }}>
                Invest
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedProfile && (
        <BundleModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}

      <style>{`
        @media (max-width: 768px) { .port-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  )
}

function BundleModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { prices } = usePrices()
  const [totalStr, setTotalStr] = useState('')
  const [step, setStep] = useState(0) // 0: input, 1: executing, 2: success, -1: error
  const [allocs, setAllocs] = useState<any[]>(profile.allocations)
  const [isEditing, setIsEditing] = useState(profile.id === 'custom')

  // Pre-generate deposit hooks for all potential vaults
  const depUSD  = useDeposit({ vault: VAULTS.yoUSD.address as `0x${string}` })
  const depETH  = useDeposit({ vault: VAULTS.yoETH.address as `0x${string}` })
  const depBTC  = useDeposit({ vault: VAULTS.yoBTC.address as `0x${string}` })
  const depEUR  = useDeposit({ vault: VAULTS.yoEUR.address as `0x${string}` })

  const DEPOSIT_MAP: Record<string, any> = { yoUSD: depUSD, yoETH: depETH, yoBTC: depBTC, yoEUR: depEUR }

  const handleDeposit = async () => {
    if (!address || !totalStr || !prices) return
    const amountNum = parseFloat(totalStr)
    if (isNaN(amountNum) || amountNum <= 0) return

    setStep(1)
    try {
      for (const a of allocs) {
        if (a.pct <= 0) continue
        const splitUsd = (amountNum * a.pct) / 100
        const vault = VAULTS[a.vaultId as keyof typeof VAULTS]
        const symbol = vault.underlying?.symbol || ''
        const cgId = SYMBOL_TO_CG[symbol] ?? symbol.toLowerCase()
        const price = (prices as any)?.[cgId] ?? 1
        
        const tokenAmt = splitUsd / price
        const dec = vault.underlying?.decimals ?? 18
        const tokenAddr = (vault.underlying?.address as any)?.[chainId ?? 8453] as `0x${string}`

        await DEPOSIT_MAP[a.vaultId].deposit({ 
          token: tokenAddr, 
          amount: parseTokenAmount(tokenAmt.toFixed(dec > 8 ? 8 : dec), dec), 
          chainId: chainId ?? 8453 
        })
      }
      setStep(2)
    } catch (err) {
      console.error(err)
      setStep(-1)
    }
  }

  const numeric = parseFloat(totalStr) || 0
  const totalPct = allocs.reduce((s, a) => s + a.pct, 0)
  const isValid = numeric > 0 && totalPct === 100

  const toggleVault = (vid: string) => {
    if (allocs.find(a => a.vaultId === vid)) {
      if (allocs.length > 1) setAllocs(allocs.filter(a => a.vaultId !== vid))
    } else {
      setAllocs([...allocs, { vaultId: vid, pct: 0 }])
    }
  }

  const updatePct = (idx: number, val: number) => {
    const currentVal = allocs[idx].pct
    const totalOthers = totalPct - currentVal
    const nextVal = Math.min(val, 100 - totalOthers) // Cannot exceed 100% total
    const next = [...allocs]
    next[idx].pct = Math.max(0, nextVal)
    setAllocs(next)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget && step !== 1) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
          style={{ width: '100%', maxWidth: 460, background: 'rgba(13,17,23,0.95)', border: `1px solid ${profile.color}40`, borderRadius: 24, padding: '24px', fontFamily: F }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <profile.icon size={20} color={profile.color} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>{profile.title}</h2>
            </div>
            {step !== 1 && (
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={18} /></button>
            )}
          </div>

          {step === 0 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>Total Investment (USD)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    placeholder="1000"
                    value={totalStr}
                    onChange={e => setTotalStr(e.target.value)}
                    style={{ width: '100%', padding: '16px 50px 16px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, color: '#fff', fontSize: 22, outline: 'none', boxSizing: 'border-box', fontFamily: FNUM }}
                  />
                  <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(148,163,184,0.5)', fontWeight: 700, fontSize: 13 }}>USD</span>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Allocation Split</p>
                  {profile.allocations.length > 1 && (
                    <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'transparent', border: 'none', color: profile.color, fontSize: 10, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>
                      {isEditing ? 'Done' : 'Customize'}
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {['yoUSD', 'yoETH', 'yoBTC', 'yoEUR'].map(vid => {
                      const active = allocs.find(a => a.vaultId === vid)
                      return (
                        <button key={vid} onClick={() => toggleVault(vid)} style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
                          background: active ? `${VAULT_COLORS[vid]}15` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${active ? VAULT_COLORS[vid] : 'rgba(255,255,255,0.08)'}`,
                          color: active ? VAULT_COLORS[vid] : 'rgba(148,163,184,0.6)'
                        }}>
                          {vid}
                        </button>
                      )
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {allocs.map((a: any, i: number) => {
                    const priceKey = SYMBOL_TO_CG[VAULTS[a.vaultId as keyof typeof VAULTS].underlying?.symbol || ''] ?? 'usd-coin'
                    const price = (prices as any)?.[priceKey] ?? 1
                    const splitVal = (numeric * a.pct) / 100
                    const tokenAmt = splitVal / price
                    return (
                      <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEditing ? 12 : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{a.vaultId}</span>
                            {!isEditing && <span style={{ color: profile.color, fontSize: 10, fontWeight: 700, padding: '2px 6px', background: `${profile.color}10`, borderRadius: 4 }}>{a.pct}%</span>}
                          </div>
                          <span style={{ color: 'rgba(148,163,184,0.8)', fontSize: 11, fontFamily: FNUM }}>{tokenAmt.toLocaleString(undefined, { maximumFractionDigits: 4 })} Tokens</span>
                        </div>
                        {isEditing && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              step="1" 
                              value={a.pct} 
                              onChange={e => updatePct(i, parseInt(e.target.value))} 
                              style={{ flex: 1, accentColor: VAULT_COLORS[a.vaultId] || profile.color }} 
                            />
                            <span style={{ width: 44, textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: FNUM }}>{a.pct}%</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: totalPct === 100 ? '#10b981' : '#f87171', fontWeight: 700 }}>Total: {totalPct}%</span>
                  {totalPct !== 100 && <span style={{ fontSize: 9, color: 'rgba(248,113,113,0.6)' }}>Must equal 100%</span>}
                </div>
              </div>

              <button
                onClick={handleDeposit}
                disabled={!isValid}
                style={{ width: '100%', padding: '16px', background: profile.color, border: 'none', borderRadius: 14, color: '#000', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5, transition: 'all 0.2s', boxShadow: isValid ? `0 0 24px ${profile.color}30` : 'none' }}
              >
                Start Diversified Deposit
              </button>
            </>
          )}

          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Loader2 size={40} color={profile.color} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>Executing Portfolio</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 13 }}>Please approve the transactions in your wallet sequentially.</p>
            </div>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Assets Allocated</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 13, marginBottom: 24 }}>Your custom portfolio bundle has been successfully deposited.</p>
              <button onClick={onClose} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Return to App</button>
            </div>
          )}

          {step === -1 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <X size={48} color="#f87171" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>Execution Halted</h3>
              <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 13, marginBottom: 24 }}>A transaction was rejected or failed during core allocation.</p>
              <button onClick={() => setStep(0)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Try Again</button>
            </div>
          )}
        </motion.div>
      </motion.div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </AnimatePresence>
  )
}
