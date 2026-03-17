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
  const [goals, setGoals] = useState<SIPGoal[]>(loadGoals)
  const [form, setForm] = useState({ vaultId: 'yoUSD', amount: '', period: 'Weekly' as Period })


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
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto space-y-12 pb-24 pt-8">
      <header className="space-y-4 text-center max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yo-neon/10 border border-yo-neon/20">
          <Calendar size={12} className="text-yo-neon" />
          <span className="text-[10px] font-bold text-yo-neon tracking-[0.2em] uppercase">Smart Savings</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Recurring SIP</h1>
        <p className="text-yo-muted text-sm font-medium leading-relaxed max-w-sm mx-auto">
          Automate your wealth building with scheduled deposits into high-yield YO vaults.
        </p>
      </header>

      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-[32px] p-8 space-y-8 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-yo-neon/5 blur-[80px]" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.3em] px-1">Select Vault</label>
            <div className="relative group">
              <select
                value={form.vaultId}
                onChange={(e) => setForm((f) => ({ ...f, vaultId: e.target.value }))}
                className="w-full h-12 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 text-[13px] font-bold text-white outline-none focus:border-yo-neon/40 focus:bg-white/[0.06] transition-all appearance-none cursor-pointer"
              >
                {Object.keys(VAULTS).map((id) => (
                  <option key={id} value={id} className="bg-yo-dark">{id}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-yo-muted group-hover:text-yo-neon transition-colors">
                <Target size={14} />
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.3em] px-1">Frequency</label>
            <div className="flex bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1 h-12">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setForm((f: any) => ({ ...f, period: p }))}
                  className={`flex-1 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest ${
                    form.period === p 
                      ? 'bg-yo-neon text-black shadow-[0_4px_12px_rgba(214,255,52,0.2)]' 
                      : 'text-yo-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.3em] px-1">Saving Amount</label>
          <div className="group relative">
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((f: any) => ({ ...f, amount: e.target.value }))}
              className="w-full h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 text-xl font-black text-white outline-none focus:border-yo-neon/40 focus:bg-white/[0.06] transition-all group-hover:border-white/20"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
              <span className="text-[11px] font-black text-white uppercase tracking-widest">USDC</span>
            </div>
          </div>
        </div>

        <button
          onClick={addGoal}
          className="w-full h-14 rounded-2xl bg-yo-neon text-black font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 hover:shadow-[0_0_40px_rgba(214,255,52,0.3)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
        >
          Initialize Plan
          <TrendingUp size={18} />
        </button>
      </motion.section>

      {goals.length > 0 && (
      <section className="space-y-8 pt-6">
        <div className="flex items-center justify-between px-2 text-yo-muted">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">Active Strategies</h2>
          <span className="text-[10px] font-bold uppercase">{goals.length} Plans</span>
        </div>
          <div className="space-y-4">
            {goals.map((goal, i) => {
              const due = isDue(goal)
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
          </div>
        </section>
      )}

      {goals.length === 0 && (
        <div className="rounded-[40px] border border-dashed border-white/10 p-16 text-center glass group hover:border-yo-neon/20 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4 text-yo-muted opacity-40 group-hover:opacity-100 group-hover:text-yo-neon transition-all">
            <Calendar size={20} />
          </div>
          <p className="text-yo-muted text-sm font-medium tracking-tight">No active savings plans.</p>
          <p className="text-yo-muted opacity-40 text-xs mt-1">Initialize your first SIP to start automated growth.</p>
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

  if (isSuccess) {
    onExecuted()
  }

  const handleExecute = async () => {
    if (!vault || !address) return
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
      className={`relative glass rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden group transition-all duration-700 ${
        due ? 'border-yo-neon/30 bg-yo-neon/[0.02]' : 'border-white/[0.03]'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-yo-neon/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex items-center gap-5 relative z-10">
        <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center transition-all duration-500 group-hover:border-white/10 ${due ? 'shadow-[0_0_20px_rgba(214,255,52,0.1)]' : ''}`}>
          <Target size={24} className={due ? "text-yo-neon" : "text-yo-muted opacity-50"} />
        </div>
        <div>
          <h4 className="text-lg font-black text-white tracking-tight leading-none mb-1.5 flex items-center gap-2">
            {goal.amount} <span className="text-[10px] text-yo-muted uppercase font-bold tracking-widest">{(vault?.asset?.symbol || vault?.underlying?.symbol)}</span>
          </h4>
          <p className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em] opacity-60">Scheduled {goal.period} · {goal.vaultId}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto relative z-10">
        {due ? (
          <button
            onClick={handleExecute}
            disabled={isLoading || isSuccess}
            className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-yo-neon text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={14} />}
            {isSuccess ? 'Verified' : 'Execute SIP'}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em]">
            <CheckCircle2 size={12} className="text-yo-accent opacity-60" />
            Confirmed
          </div>
        )}
        <button 
          onClick={onRemove} 
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-yo-muted/20 hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
