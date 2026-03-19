import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, ArrowUpRight, Wallet, Target } from 'lucide-react'
import { useVaultState } from '@yo-protocol/react'
import { useAccount, useChainId, useBalance } from 'wagmi'
import { VAULTS, formatTokenAmount } from '@yo-protocol/core'
import DepositModal from './DepositModal'
import MilestoneModal from './MilestoneModal'

const F    = "'Outfit', system-ui, sans-serif"
const FNUM = "'DM Mono', 'Fira Code', monospace"

const VAULT_COLORS: Record<string, string> = {
  yoUSD:  '#00FF8B',
  yoETH:  '#627EEA',
  yoBTC:  '#FFAF4F',
  yoEUR:  '#4E6FFF',
  yoGOLD: '#FFBF00',
}

const card = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38 } },
}

export default function VaultCard({ vault, position }: { vault: any; position?: any }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const { address }  = useAccount()
  const chainId      = useChainId()
  const vaultAddress = vault.contracts?.vaultAddress || vault.address
  const { vaultState } = useVaultState(vaultAddress)
  const vaultId = Object.entries(VAULTS).find(
    ([, v]) => v.address.toLowerCase() === vaultAddress.toLowerCase()
  )?.[0] as string | undefined

  const actualVaultConfig = VAULTS[vaultId as keyof typeof VAULTS]
  const tokenAddr = actualVaultConfig?.underlying?.address?.[chainId ?? 8453] as `0x${string}`
  const { data: walletBalance } = useBalance({ address, token: tokenAddr })

  const accentColor = vaultId ? (VAULT_COLORS[vaultId] ?? '#D6FF34') : '#D6FF34'
  const tvl         = vaultState?.totalAssets
    ? formatTokenAmount(vaultState.totalAssets, (vault.asset?.decimals || vault.underlying?.decimals) ?? 6)
    : '—'
  const hasPosition = position && position.position.shares > 0n
  const assetSymbol = vault.asset?.symbol || vault.underlying?.symbol
  
  const balance = hasPosition 
    ? formatTokenAmount(position!.position.assets, (vault.asset?.decimals || vault.underlying?.decimals) ?? 6)
    : walletBalance?.formatted ? parseFloat(walletBalance.formatted).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'
  
  const balanceLabel = hasPosition ? 'Portfolio Balance' : 'Available in Wallet'

  const isGold = vaultId === 'yoGOLD'

  return (
    <>
      <motion.div
        variants={card}
        whileHover={{
          y: -4,
          scale: 1.005,
          borderColor: hasPosition ? `${accentColor}35` : 'rgba(219, 207, 207, 0.65)'
        }}
        transition={{ duration: 0.22 }}
        style={{
          background: 'rgba(13,17,23,0.95)',
          // background: 'rgba(27, 35, 46, 0.85)',
          border: `1px solid ${hasPosition ? `${accentColor}20` : 'rgba(219, 207, 207, 0.47)'}`,
          borderRadius: 22, padding: '22px 22px 20px',
          display: 'flex', flexDirection: 'column', gap: 18,
          position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(16px)',
          fontFamily: F,
          cursor: 'default',
          transition: 'border-color 0.3s',
        }}
      >
        {/* Accent glow */}
        <div aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`, pointerEvents: 'none', transition: 'opacity 0.3s' }} />
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.015) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Vault icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: `${accentColor}12`,
              border: `1px solid ${accentColor}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <TrendingUp size={18} color={accentColor} />
            </div>
            <div>
              <h3 style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', margin: '0 0 3px' }}>
                {vault.name ?? vaultId} Vault
              </h3>
              <p style={{ fontFamily: F, fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                {assetSymbol} · Base
              </p>
            </div>
          </div>

            {/* Status badge & Goal button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isGold && address && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setMilestoneOpen(true) }}
                  title="Set Savings Goal"
                  style={{
                    width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <Target size={14} color={accentColor} />
                </button>
              )}
              <div style={{
                padding: '4px 10px', borderRadius: 100,
                fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em',
                background: isGold ? 'rgba(255,255,255,0.03)' : hasPosition ? `${accentColor}10` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isGold ? 'rgba(255,255,255,0.06)' : hasPosition ? `${accentColor}25` : 'rgba(255,255,255,0.08)'}`,
                color: isGold ? 'rgba(255,255,255,0.3)' : hasPosition ? accentColor : 'rgba(255,255,255,0.85)',
                flexShrink: 0,
              }}>
                {isGold ? 'Coming Soon' : hasPosition ? 'Active' : 'Available'}
              </div>
            </div>
          </div>

        {/* ── Metrics row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 6px' }}>
              Est. Growth
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d6ff34', display: 'inline-block', boxShadow: '0 0 5px rgba(214,255,52,0.7)', animation: 'cardPulse 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: '#d6ff34', letterSpacing: '0.05em' }}>LIVE</span>
            </div>
          </div>
          <div style={{ padding: '12px 14px', borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0 0 6px' }}>
              TVL Locked
            </p>
            <p style={{ fontFamily: FNUM, fontSize: 14, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tvl}
            </p>
          </div>
        </div>

        {/* ── Balance card ── */}
        <div style={{
          borderRadius: 14, padding: '13px 15px',
          background: hasPosition ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
          border: `1px solid ${hasPosition ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
          position: 'relative', overflow: 'hidden',
          opacity: hasPosition ? 1 : 0.8,
          transition: 'opacity 0.3s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: hasPosition ? accentColor : '#fff', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>
              {balanceLabel}
            </p>
            {hasPosition && <Zap size={10} color={accentColor} />}
            {!hasPosition && <Wallet size={10} color="rgba(255,255,255,0.7)" />}
          </div>
          <p style={{ fontFamily: FNUM, fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
            {balance}{' '}
            <span style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {assetSymbol}
            </span>
          </p>
          {hasPosition && (
            <div aria-hidden style={{ position: 'absolute', top: 0, right: -12, width: 80, height: '100%', background: `${accentColor}08`, filter: 'blur(16px)', pointerEvents: 'none' }} />
          )}
        </div>

        {/* ── CTA ── */}
        <button
          onClick={() => setModalOpen(true)}
          disabled={!address || isGold}
          style={{
            width: '100%', height: 44, borderRadius: 12,
            border: 'none', cursor: (!address || isGold) ? 'not-allowed' : 'pointer',
            background: isGold ? 'rgba(255,255,255,0.05)' : '#d6ff34', 
            color: isGold ? 'rgba(255,255,255,0.3)' : '#05070A',
            fontFamily: F, fontSize: 12, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.22s',
            boxShadow: isGold ? 'none' : '0 0 20px rgba(214,255,52,0.14)',
            opacity: address || isGold ? 1 : 0.35,
          }}
          onMouseEnter={e => { if (address && !isGold) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 32px rgba(214,255,52,0.32)' }}
          onMouseLeave={e => { if (address && !isGold) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(214,255,52,0.14)' }}
        >
          {isGold ? (
            'Not Supported on Base'
          ) : address ? (
            <><span>Deposit & Earn</span><ArrowUpRight size={14} /></>
          ) : (
            'Connect Wallet'
          )}
        </button>
      </motion.div>

      {modalOpen && vaultId && (
        <DepositModal
          vaultId={vaultId}
          vault={vault}
          accentColor={accentColor}
          onClose={() => setModalOpen(false)}
        />
      )}

      {milestoneOpen && vaultId && (
        <MilestoneModal
          vaultId={vaultId}
          vault={vault}
          accentColor={accentColor}
          onClose={() => setMilestoneOpen(false)}
          onSuccess={() => {
            setMilestoneOpen(false)
            // If the user set a goal, maybe we should show a notification or just rely on the dashboard
          }}
        />
      )}

      <style>{`
        @keyframes cardPulse { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
      `}</style>
    </>
  )
}
