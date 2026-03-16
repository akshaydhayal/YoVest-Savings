import { useVaults, useTotalTvl } from '@yo-protocol/react'
import { motion } from 'framer-motion'

export default function HeroStats() {
  const { vaults } = useVaults()
  const { tvl } = useTotalTvl()

  const currentTvlPoint = tvl?.[tvl.length - 1] as any
  const totalTvl = currentTvlPoint?.tvl
    ? `$${Number(currentTvlPoint.tvl).toLocaleString()}`
    : currentTvlPoint?.value
    ? `$${Number(currentTvlPoint.value).toLocaleString()}`
    : '—'

  const items = [
    { label: 'Total Value Locked', value: totalTvl },
    { label: 'Network', value: 'Base Mainnet' },
    { label: 'Active Vaults', value: vaults ? `${vaults.length}` : '—' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
    >
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="bg-yo-card border border-yo-border rounded-2xl px-5 py-4 space-y-1"
        >
          <p className="text-xs text-yo-muted">{label}</p>
          <p className="text-2xl font-bold text-yo-neon">{value}</p>
        </div>
      ))}
    </motion.div>
  )
}
