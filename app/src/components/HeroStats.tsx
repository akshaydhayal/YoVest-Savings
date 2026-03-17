import { useVaults, useTotalTvl } from '@yo-protocol/react'
import { motion } from 'framer-motion'
import { Globe, Zap, BarChart3 } from 'lucide-react'

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
    { label: 'Total Value Locked', value: totalTvl, icon: BarChart3, color: 'var(--color-yo-neon)' },
    { label: 'Network', value: 'Base Mainnet', icon: Globe, color: 'var(--color-yo-eth)' },
    { label: 'Active Vaults', value: vaults ? `${vaults.length}` : '—', icon: Zap, color: 'var(--color-yo-usd)' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
      {items.map(({ label, value, icon: Icon, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className="glass glass-hover rounded-2xl p-5 relative overflow-hidden group border-white/5"
        >
          {/* Subtle Glow */}
          <div 
            className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-3xl opacity-5 transition-opacity group-hover:opacity-10"
            style={{ background: color }}
          />

          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5">
              <Icon size={14} style={{ color }} />
            </div>
            <p className="text-[8px] font-bold text-yo-muted uppercase tracking-[0.3em]">{label}</p>
          </div>
          <p className="text-lg font-extrabold text-white tracking-tight">{value}</p>
        </motion.div>
      ))}
    </div>
  )
}
