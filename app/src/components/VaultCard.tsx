import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, ArrowUpRight } from 'lucide-react'
import { useVaultState } from '@yo-protocol/react'
import { useAccount } from 'wagmi'
import { VAULTS, formatTokenAmount } from '@yo-protocol/core'
import DepositModal from './DepositModal'

const VAULT_COLORS: Record<string, string> = {
  yoUSD: '#00FF8B',
  yoETH: '#627EEA',
  yoBTC: '#FFAF4F',
  yoEUR: '#4E6FFF',
  yoGOLD: '#FFBF00',
}

const card = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function VaultCard({ vault, position }: { vault: any; position?: any }) {
  const [modalOpen, setModalOpen] = useState(false)
  const { address } = useAccount()
  const vaultAddress = vault.contracts?.vaultAddress || vault.address
  const { vaultState } = useVaultState(vaultAddress)

  const vaultId = Object.entries(VAULTS).find(
    ([, v]) => v.address.toLowerCase() === vaultAddress.toLowerCase()
  )?.[0] as string | undefined

  const accentColor = vaultId ? VAULT_COLORS[vaultId] ?? '#D6FF34' : '#D6FF34'
  const tvl = vaultState?.totalAssets ? formatTokenAmount(vaultState.totalAssets, (vault.asset?.decimals || vault.underlying?.decimals) ?? 6) : '—'
  const hasPosition = position && position.position.shares > 0n

  return (
    <>
      <motion.div
        variants={card}
        className="glass glass-hover relative rounded-[32px] overflow-hidden group p-6 flex flex-col gap-6"
      >
        {/* Accent Glow */}
        <div 
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-opacity group-hover:opacity-40"
          style={{ background: accentColor }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
            >
              <div 
                className="absolute inset-0 opacity-10"
                style={{ background: accentColor }}
              />
              <TrendingUp size={24} style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight">{vault.name ?? vaultId}</h3>
              <p className="text-xs font-medium text-yo-muted uppercase tracking-widest">{vault.asset?.symbol || vault.underlying?.symbol} · Base</p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
            hasPosition 
              ? 'bg-yo-neon-dim border-yo-neon/30 text-yo-neon' 
              : 'bg-white/5 border-white/10 text-yo-muted'
          }`}>
            {hasPosition ? 'Earning' : 'Available'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest">Growth</p>
            <p className="text-xl font-extrabold text-yo-neon leading-none">Live</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest">Total Assets</p>
            <p className="text-xl font-extrabold text-white leading-none truncate">{tvl}</p>
          </div>
        </div>

        {hasPosition && (
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest">Your Savings</p>
              <Zap size={10} className="text-yo-neon" />
            </div>
            <p className="text-lg font-bold text-white leading-none">
              {formatTokenAmount(position!.position.assets, (vault.asset?.decimals || vault.underlying?.decimals) ?? 6)}{' '}
              <span className="text-yo-muted text-sm font-medium">{vault.asset?.symbol || vault.underlying?.symbol}</span>
            </p>
          </div>
        )}

        <button
          onClick={() => setModalOpen(true)}
          disabled={!address}
          className="w-full h-14 rounded-2xl text-sm font-bold transition-all duration-300 disabled:opacity-30 disabled:grayscale bg-yo-neon text-black hover:shadow-[0_0_30px_rgba(214,255,52,0.4)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          {address ? (
            <>
              Deposit Now
              <ArrowUpRight size={18} />
            </>
          ) : (
            'Connect to Start'
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
    </>
  )
}
