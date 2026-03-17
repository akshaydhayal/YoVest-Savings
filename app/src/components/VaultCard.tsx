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
        whileHover={{ y: -6, scale: 1.01 }}
        className="glass glass-hover relative rounded-[32px] overflow-hidden group p-7 flex flex-col gap-7"
      >
        {/* Multilayered Glows */}
        <div 
          className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-30"
          style={{ background: accentColor }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all duration-500 shadow-2xl"
            >
              <div 
                className="absolute inset-0 opacity-10"
                style={{ background: accentColor }}
              />
              <TrendingUp size={20} style={{ color: accentColor }} className="relative z-10" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg tracking-tight leading-tight">{vault.name ?? vaultId}</h3>
              <p className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em] mt-1">{vault.asset?.symbol || vault.underlying?.symbol} · Base</p>
            </div>
          </div>
          
          <div className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] border backdrop-blur-md transition-all ${
            hasPosition 
              ? 'bg-yo-neon-dim border-yo-neon/30 text-yo-neon shadow-[0_0_15px_rgba(214,255,52,0.1)]' 
              : 'bg-white/5 border-white/10 text-yo-muted opacity-60'
          }`}>
            {hasPosition ? 'Active Yield' : 'Vault Ready'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-1">
          <div className="space-y-1.5 flex flex-col items-start">
            <p className="text-[9px] font-bold text-yo-muted uppercase tracking-[0.3em] opacity-50">Est. Growth</p>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-yo-neon tracking-tight">LIVE</span>
            </div>
          </div>
          <div className="space-y-1.5 flex flex-col items-start border-l border-white/5 pl-8">
            <p className="text-[9px] font-bold text-yo-muted uppercase tracking-[0.3em] opacity-50">TVL Locked</p>
            <p className="text-sm font-extrabold text-white tracking-tight truncate">{tvl}</p>
          </div>
        </div>

        {/* Card-in-Card Balance Display */}
        <div className={`relative rounded-2xl p-4.5 border transition-all duration-500 overflow-hidden ${
          hasPosition 
            ? 'bg-white/[0.03] border-white/10' 
            : 'bg-black/20 border-white/5 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60'
        }`}>
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-[9px] font-bold text-yo-muted uppercase tracking-[0.3em]">Portfolio Balance</p>
            <Zap size={10} className={hasPosition ? 'text-yo-neon' : 'text-yo-muted'} />
          </div>
          <p className="text-base font-bold text-white tracking-tighter">
            {formatTokenAmount(hasPosition ? position!.position.assets : 0n, (vault.asset?.decimals || vault.underlying?.decimals) ?? 6)}{' '}
            <span className="text-[10px] text-yo-muted font-bold uppercase tracking-widest ml-1">{(vault as any).asset?.symbol || (vault as any).underlying?.symbol}</span>
          </p>
          {hasPosition && <div className="absolute top-0 right-0 w-24 h-full bg-yo-neon/5 blur-2xl -mr-12" />}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          disabled={!address}
          className="w-full h-11 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 disabled:opacity-30 disabled:grayscale bg-yo-neon text-black hover:shadow-[0_0_30px_rgba(214,255,52,0.3)] group-hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          {address ? (
            <>
              Enter Vault
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </>
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
    </>
  )
}
