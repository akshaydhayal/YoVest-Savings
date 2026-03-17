import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useUserPositions,
  useVaults,
} from '@yo-protocol/react'
import { VAULTS, formatTokenAmount } from '@yo-protocol/core'
import { ArrowUpRight, LayoutDashboard, Zap } from 'lucide-react'

const VAULT_COLORS: Record<string, string> = {
  yoUSD: '#00FF8B',
  yoETH: '#627EEA',
  yoBTC: '#FFAF4F',
  yoEUR: '#4E6FFF',
  yoGOLD: '#FFBF00',
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { positions, isLoading: posLoading } = useUserPositions(address)
  const { vaults } = useVaults()

  const getVaultConfig = (addr: any) => {
    const searchAddr = (addr?.address || addr)?.toString().toLowerCase()
    return vaults?.find((v: any) => v.contracts.vaultAddress.toLowerCase() === searchAddr)
  }

  const getVaultId = (addr: any) => {
    const searchAddr = (addr?.address || addr)?.toString().toLowerCase()
    return Object.entries(VAULTS).find(([, v]) => v.address.toLowerCase() === searchAddr)?.[0]
  }

  const activePositions = positions?.filter((p) => p.position.shares > 0n) ?? []

  const totalAssetsUsd = activePositions.reduce((acc, p: any) => {
    const config = getVaultConfig(p.vault)
    const assets = Number(formatTokenAmount(p.position.assets, (config as any)?.asset?.decimals ?? 6))
    return acc + assets
  }, 0)

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 rounded-full bg-yo-neon-dim border border-yo-neon/20 flex items-center justify-center">
          <ArrowUpRight size={28} className="text-yo-neon" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center">Connect your wallet</h2>
        <p className="text-yo-muted text-center max-w-xs">
          See your savings portfolio, P&L, and transaction history across all YO vaults.
        </p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Portfolio</h1>
        <p className="text-yo-muted font-medium">Your active savings positions on Base Mainnet.</p>
      </div>

      {/* Total balance card */}
      <div className="glass rounded-[40px] p-10 relative overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yo-neon/10 blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10 space-y-2">
          <p className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.3em]">Total Savings Value</p>
          <h2 className="text-7xl font-extrabold text-white tracking-tighter">
            <span className="text-yo-neon text-glow-neon">$</span>
            {totalAssetsUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-2 text-sm font-bold text-yo-neon uppercase tracking-widest mt-6">
            <Zap size={14} className="animate-pulse" />
            Across {activePositions.length} active {activePositions.length === 1 ? 'vault' : 'vaults'}
          </div>
        </div>
      </div>

      {/* Positions */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white tracking-tight px-2">Active Positions</h3>
        {posLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-yo-card animate-pulse" />
            ))}
          </div>
        ) : activePositions.length === 0 ? (
          <div className="rounded-2xl border border-yo-border bg-yo-card p-8 text-center">
            <p className="text-yo-muted">No active positions. Deposit into a vault to start saving.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activePositions.map(({ vault, position }: any, i) => {
              const config = getVaultConfig(vault)
              const vaultId = getVaultId(vault) ?? ''
              const accent = VAULT_COLORS[vaultId] ?? '#D6FF34'
              const assets = formatTokenAmount(position.assets, (config as any)?.underlying?.decimals ?? 6)

              return (
                <motion.div
                  key={vault.address}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass glass-hover rounded-3xl p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative shadow-inner overflow-hidden">
                      <div className="absolute inset-0 opacity-10" style={{ background: accent }} />
                      <LayoutDashboard size={24} style={{ color: accent }} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white tracking-tight">{(config as any)?.name ?? vaultId}</p>
                      <p className="text-xs font-bold text-yo-muted uppercase tracking-widest">{(config as any)?.asset?.symbol} · Base</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-extrabold text-white tracking-tight">
                      {assets}{' '}
                      <span className="text-sm font-bold text-yo-muted uppercase">{(config as any)?.asset?.symbol}</span>
                    </p>
                    <div className="flex items-center justify-end gap-1.5 px-3 py-1 rounded-full bg-yo-neon/5 border border-yo-neon/20 text-[10px] font-bold text-yo-neon uppercase tracking-widest">
                      <Zap size={10} />
                      Connected
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
