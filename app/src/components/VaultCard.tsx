import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Lock, Unlock } from 'lucide-react'
import { useVaultState } from '@yo-protocol/react'
import { useAccount } from 'wagmi'
import { VAULTS, formatTokenAmount, type VaultConfig } from '@yo-protocol/core'
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

interface Props {
  vault: VaultConfig
  position?: { vault: any; position: { shares: bigint; assets: bigint } }
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
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative rounded-2xl bg-yo-card border border-yo-border overflow-hidden cursor-default group"
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }}
        />

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full bg-yo-black border border-yo-border flex items-center justify-center overflow-hidden"
                style={{ borderTopColor: accentColor }}
              >
                <TrendingUp size={20} style={{ color: accentColor }} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{vault.name ?? vaultId}</p>
                <p className="text-xs text-yo-muted">{vault.asset?.symbol || vault.underlying?.symbol}</p>
              </div>
            </div>
            {hasPosition ? (
              <span className="flex items-center gap-1 text-xs text-yo-neon bg-yo-neon-dim px-2 py-0.5 rounded-full">
                <Lock size={10} /> Earning
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-yo-muted2 px-2 py-0.5 rounded-full border border-yo-border">
                <Unlock size={10} /> Available
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yo-black rounded-xl p-3">
              <p className="text-xs text-yo-muted mb-1">Status</p>
              <p className="text-sm font-bold text-yo-neon">Live</p>
            </div>
            <div className="bg-yo-black rounded-xl p-3">
              <p className="text-xs text-yo-muted mb-1">Assets</p>
              <p className="text-sm font-bold text-white truncate">{tvl}</p>
            </div>
          </div>

          {hasPosition && (
            <div className="bg-yo-neon-dim border border-yo-neon/15 rounded-xl p-3">
              <p className="text-xs text-yo-neon mb-1">My Balance</p>
              <p className="text-sm font-semibold text-white">
                {formatTokenAmount(position!.position.assets, (vault.asset?.decimals || vault.underlying?.decimals) ?? 6)}{' '}
                {vault.asset?.symbol || vault.underlying?.symbol}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setModalOpen(true)}
              disabled={!address}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-yo-neon text-black hover:brightness-110 active:scale-95"
            >
              Deposit
            </button>
          </div>
        </div>
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
