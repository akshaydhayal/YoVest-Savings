import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react'
import { useDeposit, useVaultState } from '@yo-protocol/react'
import { parseTokenAmount } from '@yo-protocol/core'
import { useAccount, useChainId } from 'wagmi'

export default function DepositModal({ vaultId, vault, accentColor, onClose }: { vaultId: string; vault: any; accentColor: string; onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const { address } = useAccount()
  const chainId = useChainId()
  const decimals = (vault.asset?.decimals || vault.underlying?.decimals) ?? 6
  const vaultAddress = vault.contracts?.vaultAddress || vault.address
  const { vaultState } = useVaultState(vaultAddress)
  // Handle both possible address structures
  const tokenAddress = vault.asset?.address || (vault.underlying?.address ? (vault.underlying.address[chainId ?? 8453] || vault.underlying.address[8453]) : undefined)

  const { data: balanceData } = useBalance({
    address,
    token: tokenAddress as `0x${string}`,
  })

  const { deposit, step, isLoading, isError, error, isSuccess } = useDeposit({
    vault: vaultAddress as `0x${string}`,
    slippageBps: 50,
  })

  const handleDeposit = async () => {
    if (!tokenAddress || !address || !amount) return
    try {
      await deposit({
        token: tokenAddress as `0x${string}`,
        amount: parseTokenAmount(amount, decimals),
        chainId: chainId ?? 8453,
      })
    } catch (e) {
      // handled by hook
    }
  }

  const numericAmount = parseFloat(amount)
  const isValid = !isNaN(numericAmount) && numericAmount > 0

  const stepLabel: Record<string, string> = {
    idle: 'Deposit',
    'switching-chain': 'Switching to Base…',
    approving: 'Approving token…',
    depositing: 'Depositing…',
    waiting: 'Confirming…',
    success: 'Success!',
    error: 'Failed. Try again.',
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md glass rounded-[32px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)]"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Zap size={24} style={{ color: accentColor }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{vault.name ?? vaultId}</h2>
                    <p className="text-xs font-bold text-yo-muted uppercase tracking-widest">Deposit Assets · Base</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-yo-muted hover:text-white hover:bg-white/10 transition-all">
                  <X size={20} />
                </button>
              </div>

              {!isSuccess && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-bold text-yo-muted uppercase tracking-[0.2em]">Amount to Save</label>
                    <p className="text-[10px] font-bold text-yo-neon uppercase">Available: {vaultState?.userAssetBalance ? (Number(vaultState.userAssetBalance) / 10**decimals).toFixed(4) : '0.00'}</p>
                  </div>
                  <div className="group relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl px-6 text-3xl font-bold text-white outline-none focus:border-yo-neon/50 focus:bg-white/[0.08] transition-all placeholder:text-white/10"
                      disabled={isLoading}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/5">
                      <span className="text-sm font-bold text-white">{(vault.asset?.symbol || vault.underlying?.symbol)}</span>
                    </div>
                  </div>
                </div>
              )}

              {!isSuccess && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest mb-1">Expected APY</p>
                    <p className="text-lg font-bold text-yo-neon">Live</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-yo-muted uppercase tracking-widest mb-1">Fee</p>
                    <p className="text-lg font-bold text-white">0%</p>
                  </div>
                </div>
              )}

              {isSuccess && (
                <div className="flex flex-col items-center gap-6 py-8">
                  <div className="w-20 h-20 rounded-full bg-yo-neon/10 border border-yo-neon/20 flex items-center justify-center">
                    <CheckCircle2 size={40} className="text-yo-neon" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">Deposit Successful</h3>
                    <p className="text-yo-muted font-medium">Your assets are now earning smart yield.</p>
                  </div>
                </div>
              )}

              {isError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
                  {error?.message || 'Transaction encountered an error. Please try again.'}
                </div>
              )}

              <button
                onClick={isSuccess ? onClose : handleDeposit}
                disabled={(!isSuccess && !isValid) || isLoading}
                className="w-full h-16 rounded-2xl text-md font-bold transition-all duration-300 disabled:opacity-30 disabled:grayscale bg-yo-neon text-black hover:shadow-[0_0_40px_rgba(214,255,52,0.3)] hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
              >
                {isLoading && <Loader2 size={20} className="animate-spin" />}
                <span className="uppercase tracking-widest">{isSuccess ? 'Done' : stepLabel[step] ?? 'Deposit'}</span>
                {!isLoading && !isSuccess && <ArrowUpRight size={20} />}
              </button>
            </div>
          </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
