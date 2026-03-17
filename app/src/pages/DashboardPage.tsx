import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useUserPositions,
  useVaults,
} from '@yo-protocol/react'
import { VAULTS, formatTokenAmount } from '@yo-protocol/core'
import { ArrowUpRight, TrendingUp, Zap } from 'lucide-react'

const VAULT_COLORS: Record<string, string> = {
  yoUSD: '#00FF8B',
  yoETH: '#627EEA',
  yoBTC: '#FFAF4F',
  yoEUR: '#4E6FFF',
  yoGOLD: '#FFBF00',
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { positions } = useUserPositions(address)
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
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1 pt-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-yo-accent/10 border border-yo-accent/20">
            <span className="w-1.5 h-1.5 rounded-full bg-yo-accent" />
            <span className="text-[10px] font-bold text-yo-accent tracking-widest uppercase">Portfolio Secure</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Overview</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest transition-all hover:bg-white/10">
            Export History
          </button>
          <Link to="/sip" className="h-9 px-4 rounded-xl bg-yo-neon text-black text-[10px] font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(214,255,52,0.3)] flex items-center">
            New Savings Plan
          </Link>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-[32px] p-8 space-y-4 relative overflow-hidden group border-white/[0.03]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yo-neon/5 blur-3xl -mr-16 -mt-16 group-hover:bg-yo-neon/10 transition-colors" />
          <div className="flex items-center gap-3 text-yo-muted">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <TrendingUp size={14} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Net Savings Value</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              ${totalAssetsUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-[10px] font-bold text-yo-accent tracking-widest uppercase flex items-center gap-1.5 opacity-80">
              <ArrowUpRight size={12} />
              +2.4% Est. Yield 24h
            </p>
          </div>
        </div>

        <div className="glass rounded-[32px] p-8 space-y-4 border-white/[0.03]">
          <div className="flex items-center gap-3 text-yo-muted">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <Zap size={14} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Active Capital</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">{activePositions.length} Positions</h2>
            <p className="text-[10px] font-bold text-yo-muted tracking-widest uppercase opacity-60">Across Asset Classes</p>
          </div>
        </div>

        <div className="glass rounded-[32px] p-8 space-y-4 border-white/[0.03]">
          <div className="flex items-center gap-3 text-yo-muted">
            <div className="p-2 rounded-lg bg-white/5 border border-white/5">
              <TrendingUp size={14} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Total Earned</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-yo-accent tracking-tight">$0.00</h2>
            <p className="text-[10px] font-bold text-yo-muted tracking-widest uppercase opacity-60">Real-time Accrual</p>
          </div>
        </div>
      </div>

      {/* Portfolio Table/List */}
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 mb-2">
            <Zap size={10} className="text-yo-neon" />
            <span className="text-[9px] font-black text-yo-muted uppercase tracking-widest">Active Positions</span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">Allocated Assets</h3>
        </div>

        <div className="glass rounded-[32px] overflow-hidden border-white/[0.03]">
          {activePositions.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <p className="text-yo-muted text-sm font-medium">No active positions found.</p>
              <Link to="/" className="text-yo-neon text-xs font-bold uppercase tracking-widest hover:underline text-glow-neon">
                Start Saving Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {activePositions.map((pos: any, i) => {
                const config = getVaultConfig(pos.vault)
                const vaultId = getVaultId(pos.vault) ?? ''
                const accent = VAULT_COLORS[vaultId] ?? '#D6FF34'
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ background: accent }} />
                        <TrendingUp size={16} style={{ color: accent }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{(config as any)?.name || vaultId}</p>
                        <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest">Base Mainnet</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white tracking-tight">
                        {formatTokenAmount(pos.position.assets, (config as any)?.asset?.decimals || 6)} {(config as any)?.asset?.symbol}
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yo-neon-dim border border-yo-neon/10 text-[8px] font-bold text-yo-neon uppercase tracking-widest">
                        <Zap size={8} />
                        Growth Live
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
