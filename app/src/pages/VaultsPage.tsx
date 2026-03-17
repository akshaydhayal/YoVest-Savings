import { motion } from 'framer-motion'
import { useVaults, useUserPositions } from '@yo-protocol/react'
import { useAccount } from 'wagmi'
import { TrendingUp, Zap } from 'lucide-react'
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
      {/* Hero - Centered & Professional Scale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-8 mb-24 relative px-4 pt-4"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yo-neon/5 blur-[120px] -z-10 rounded-full" />
        
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yo-neon animate-pulse" />
            <span className="text-[10px] font-bold text-yo-neon tracking-[0.2em] uppercase">Built on Base</span>
          </div>
          <div className="w-px h-3 bg-white/10 mx-1" />
          <span className="text-[10px] font-bold text-yo-muted tracking-widest uppercase">Institutional Grade</span>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
            Professional <span className="text-neon">Yield</span> for <br />
            <span className="text-gradient">Modern Capital.</span>
          </h1>
          <p className="text-yo-muted text-base max-w-xl mx-auto leading-relaxed font-medium opacity-80">
            Non-custodial savings architecture built for stability, transparency, and superior capital efficiency.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Base Mainnet</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">YO Protocol</span>
          </div>
        </div>
      </motion.div>

      <HeroStats />

      <section className="mt-12 mb-20">
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-2xl font-black text-white tracking-tight">Investment Vaults</h2>
          <p className="text-yo-muted text-sm font-medium mt-1">Earn real-time yield on your favorite assets.</p>
          <div className="flex items-center gap-2 text-[10px] font-black text-yo-neon uppercase tracking-widest mt-4 px-3 py-1 rounded-full bg-yo-neon/5 border border-yo-neon/10">
            <TrendingUp size={12} />
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
