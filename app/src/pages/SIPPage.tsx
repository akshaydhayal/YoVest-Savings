import { useState } from 'react'
import { motion } from 'framer-motion'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useVaults, useDeposit } from '@yo-protocol/react'
import { VAULTS, parseTokenAmount } from '@yo-protocol/core'
import { Target, Calendar, TrendingUp, CheckCircle2, Loader2, Zap } from 'lucide-react'

const PERIODS = ['Daily', 'Weekly', 'Monthly'] as const
type Period = (typeof PERIODS)[number]

interface SIPGoal {
  vaultId: string
  amount: string
  period: Period
  createdAt: number
}

const STORAGE_KEY = 'yo_sip_goals'

function loadGoals(): SIPGoal[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveGoals(g: SIPGoal[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(g)) }

function isDue(goal: SIPGoal): boolean {
  const now = Date.now()
  const age = now - goal.createdAt
  const ms = { Daily: 86_400_000, Weekly: 604_800_000, Monthly: 2_592_000_000 }[goal.period]
  return age >= ms
}

export default function SIPPage() {
  const { isConnected } = useAccount()
  const { vaults } = useVaults()
  const [goals, setGoals] = useState<SIPGoal[]>(loadGoals)
  const [form, setForm] = useState({ vaultId: 'yoUSD', amount: '', period: 'Weekly' as Period })

  const getVaultConfig = (vaultId: string) =>
    vaults?.find((v: any) => v.contracts.vaultAddress.toLowerCase() === VAULTS[vaultId as keyof typeof VAULTS]?.address.toLowerCase())

  const addGoal = () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return
    const newGoal: SIPGoal = { ...form, createdAt: Date.now() }
    const updated = [...goals, newGoal]
    setGoals(updated)
    saveGoals(updated)
    setForm({ ...form, amount: '' })
  }

  const removeGoal = (idx: number) => {
    const updated = goals.filter((_, i) => i !== idx)
    setGoals(updated)
    saveGoals(updated)
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 rounded-full bg-yo-neon-dim border border-yo-neon/20 flex items-center justify-center">
          <Target size={28} className="text-yo-neon" />
        </div>
        <h2 className="text-2xl font-bold text-white text-center">Setup SIP Savings</h2>
        <p className="text-yo-muted text-center max-w-xs">
          Automate your DeFi savings goals on Base without custom smart contracts.
        </p>
        <ConnectButton />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Calendar className="text-yo-neon" size={32} />
          Smart SIP
        </h1>
        <p className="text-yo-muted font-medium">
          Automate your DeFi savings goals with one-click execution.
        </p>
      </div>

      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-[40px] p-10 space-y-8 relative overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-yo-neon/5 blur-[80px]" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em] px-1">Select Vault</label>
            <div className="relative">
              <select
                value={form.vaultId}
                onChange={(e) => setForm((f) => ({ ...f, vaultId: e.target.value }))}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white font-bold outline-none focus:border-yo-neon/50 transition-all appearance-none"
              >
                {Object.keys(VAULTS).map((id) => (
                  <option key={id} value={id} className="bg-yo-dark">{id}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-yo-muted">
                <Target size={18} />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em] px-1">Saving Frequency</label>
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 h-14">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm((f: any) => ({ ...f, period: p }))}
                  className={`flex-1 rounded-xl text-xs font-bold transition-all ${
                    form.period === p ? 'bg-yo-neon text-black shadow-lg' : 'text-yo-muted hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em] px-1">Saving Amount</label>
          <div className="group relative">
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f: any) => ({ ...f, amount: e.target.value }))}
              className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl px-6 text-3xl font-extrabold text-white outline-none focus:border-yo-neon/50 focus:bg-white/[0.08] transition-all"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/5">
              <span className="text-sm font-bold text-white">USDC</span>
            </div>
          </div>
        </div>

        <button
          onClick={addGoal}
          className="w-full h-16 rounded-[24px] bg-yo-neon text-black font-extrabold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(214,255,52,0.3)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
        >
          Initialize Plan
          <TrendingUp size={20} />
        </button>
      </motion.section>

      {goals.length > 0 && (
      <section className="space-y-6 pt-4">
        <h2 className="text-xl font-bold text-white tracking-tight px-1">Active Plans</h2>
          {goals.map((goal, i) => {
            const due = isDue(goal)
            const config = getVaultConfig(goal.vaultId)
            const vault = VAULTS[goal.vaultId as keyof typeof VAULTS]

            return (
              <GoalRow
                key={i}
                goal={goal}
                vault={vault}
                due={due}
                onRemove={() => removeGoal(i)}
                onExecuted={() => {
                  const updated = goals.map((g, gi) =>
                    gi === i ? { ...g, createdAt: Date.now() } : g
                  )
                  setGoals(updated)
                  saveGoals(updated)
                }}
              />
            )
          })}
        </section>
      )}

      {goals.length === 0 && (
        <div className="rounded-[32px] border border-dashed border-white/10 p-12 text-center glass">
          <p className="text-yo-muted font-medium">No active savings plans. Initialize your first SIP above.</p>
        </div>
      )}
    </div>
  )
}

function GoalRow({
  goal,
  vault,
  due,
  onRemove,
  onExecuted,
}: {
  goal: SIPGoal
  vault: any
  due: boolean
  onRemove: () => void
  onExecuted: () => void
}) {
  const { address } = useAccount()
  const { deposit, isLoading, isSuccess } = useDeposit({
    vault: vault?.address as `0x${string}`,
    slippageBps: 50,
  })

  // Need to handle the result of useDeposit to call onExecuted
  if (isSuccess) {
    onExecuted()
  }

  const handleExecute = async () => {
    if (!vault || !address) return
    // Handle both VaultConfig and VaultStatsItem structures
    const tokenAddress = vault.asset?.address || (vault.underlying?.address ? (vault.underlying.address[8453] || vault.underlying.address[Object.keys(vault.underlying.address)[0]]) : undefined)
    const decimals = (vault.asset?.decimals || vault.underlying?.decimals) ?? 6
    
    if (!tokenAddress) return

    await deposit({
      token: tokenAddress as `0x${string}`,
      amount: parseTokenAmount(goal.amount, decimals),
      chainId: 8453,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative glass rounded-[32px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden ${
        due ? 'border-yo-neon/30 shadow-[0_0_40px_rgba(214,255,52,0.05)]' : ''
      }`}
    >
      {due && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-yo-neon/5 blur-3xl -mr-16 -mt-16" />
      )}
      
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative shadow-inner">
          <Target size={24} className={due ? "text-yo-neon" : "text-yo-muted"} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight">
            Save {goal.amount} <span className="text-sm text-yo-muted uppercase font-bold">{(vault?.asset?.symbol || vault?.underlying?.symbol)}</span>
          </h4>
          <p className="text-xs font-bold text-yo-muted uppercase tracking-[0.2em]">{goal.period} Plan · {goal.vaultId}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        {due ? (
          <button
            onClick={handleExecute}
            disabled={isLoading || isSuccess}
            className="flex-1 sm:flex-none h-12 px-6 rounded-xl bg-yo-neon text-black text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {isSuccess ? 'Completed' : 'Execute SIP'}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-yo-muted uppercase tracking-widest">
            <CheckCircle2 size={12} className="text-yo-muted2" />
            On Schedule
          </div>
        )}
        <button 
          onClick={onRemove} 
          className="w-12 h-12 flex items-center justify-center rounded-xl text-yo-muted2 hover:text-red-400 hover:bg-white/5 transition-all"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}
