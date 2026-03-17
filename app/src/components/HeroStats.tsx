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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
      {items.map(({ label, value, icon: Icon, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className="glass glass-hover rounded-[32px] p-8 relative overflow-hidden group"
        >
          {/* Subtle Glow */}
          <div 
            className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20"
            style={{ background: color }}
          />

          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
              <Icon size={20} style={{ color }} />
            </div>
            <p className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em]">{label}</p>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
        </motion.div>
      ))}
    </div>
  )
}
