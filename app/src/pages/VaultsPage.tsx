import { motion } from 'framer-motion'
import { useVaults, useUserPositions } from '@yo-protocol/react'
import { useAccount } from 'wagmi'
import VaultCard from '../components/VaultCard'
import HeroStats from '../components/HeroStats'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
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
    <div className="space-y-10">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3 pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yo-neon-dim border border-yo-neon/20 text-yo-neon text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-yo-neon animate-pulse" />
          Live on Base · Zero fees to get started
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Your money,{' '}
          <span className="text-yo-neon text-glow-neon">working harder.</span>
        </h1>
        <p className="text-yo-muted text-lg max-w-xl mx-auto">
          Deposit into risk-adjusted, on-chain yield vaults. Withdraw anytime.
        </p>
      </motion.div>

      <HeroStats />

      {/* Vault Grid */}
      <section>
        <h2 className="text-sm font-semibold text-yo-muted uppercase tracking-widest mb-5">
          Available Vaults
        </h2>
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
