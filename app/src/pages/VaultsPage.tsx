import { motion } from 'framer-motion'
import { useVaults, useUserPositions } from '@yo-protocol/react'
import { useAccount } from 'wagmi'
import { TrendingUp, ArrowUpRight } from 'lucide-react'
import VaultCard from '../components/VaultCard'
import HeroStats from '../components/HeroStats'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export default function VaultsPage() {
  const { address } = useAccount()
  const { vaults, isLoading } = useVaults()
  const { positions } = useUserPositions(address)

  const getPosition = (vaultAddress: string) =>
    positions?.find((p: any) => {
      const addr = p.vault?.address || p.vault;
      return typeof addr === 'string' && addr.toLowerCase() === vaultAddress?.toLowerCase();
    })

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-8 pt-10 pb-16"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl glass border-yo-neon/20 shadow-[0_0_20px_rgba(214,255,52,0.05)]">
          <span className="w-2 h-2 rounded-full bg-yo-neon shadow-[0_0_10px_#D6FF34]" />
          <span className="text-sm font-bold text-yo-neon tracking-tight uppercase">Live on Base Mainnet</span>
        </div>
        
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
            Secure <span className="text-neon inline-block mb-1">Yield</span> for the <br /> 
            <span className="text-gradient">Modern Investor.</span>
          </h1>
          <p className="text-yo-muted text-xl sm:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            Automated, non-custodial savings built on proven, institutional-grade infrastructure.
          </p>
        </div>
      </motion.div>

      <HeroStats />

      <section>
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-white tracking-tight">Investment Vaults</h2>
            <p className="text-yo-muted font-medium">Earn real-time yield on your favorite assets.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-yo-muted uppercase tracking-widest">
            <TrendingUp size={14} className="text-yo-neon" />
            Live APY Tracking
          </div>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-yo-card animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {vaults?.map((vault, i) => {
              const vaultAddr = (vault as any).contracts?.vaultAddress || (vault as any).address;
              return (
                <VaultCard
                  key={vaultAddr || i}
                  vault={vault}
                  position={getPosition(vaultAddr || '')}
                />
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  )
}
