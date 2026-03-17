import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import { TrendingUp, LayoutDashboard, Target, Zap } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Vaults', icon: Zap },
  { href: '/dashboard', label: 'My Savings', icon: LayoutDashboard },
  { href: '/sip', label: 'Smart SIP', icon: Target },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-yo-bg selection:bg-yo-neon selection:text-black flex flex-col relative overflow-hidden">
      <div className="bg-mesh" />
      <div className="bg-dot-pattern absolute inset-0 opacity-40 pointer-events-none" />

      {/* Header - Refined Frosted Look */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-yo-bg/30">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-yo-neon flex items-center justify-center shadow-[0_0_20px_rgba(214,255,52,0.2)] group-hover:scale-105 transition-transform">
              <TrendingUp size={16} className="text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-yo-neon transition-colors">
              YO Savings
            </span>
          </Link>

          {/* Desktop Nav - Tighter & More Professional */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-md">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-300 whitespace-nowrap ${
                    active
                      ? 'bg-yo-neon text-black shadow-lg'
                      : 'text-yo-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ConnectButton
                accountStatus="avatar"
                chainStatus="icon"
                showBalance={false}
              />
            </div>
            
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/5 text-yo-muted hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div className={`w-4 h-0.5 bg-current transition-all mb-1 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-4 h-0.5 bg-current transition-all mb-1 ${mobileOpen ? 'opacity-0' : ''}`} />
              <div className={`w-4 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-yo-border p-4 flex flex-col gap-1 mx-4 my-2 rounded-2xl"
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? 'bg-yo-neon text-black'
                      : 'text-yo-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
            <div className="pt-2 sm:hidden">
              <ConnectButton />
            </div>
          </motion.div>
        )}
      </header>

      {/* Page content - Centered & Better Spacing */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-10 py-16 md:py-24 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-12 text-center relative z-10">
        <div className="max-w-[1400px] mx-auto px-6 border-t border-white/5 pt-12">
          <p className="text-yo-muted text-xs font-semibold tracking-widest uppercase opacity-60">
            Powered by{' '}
            <a
              href="https://yo.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yo-neon hover:text-white transition-colors"
            >
              YO Protocol
            </a>
            <span className="mx-3 opacity-20">|</span>
            Secure Savings on Base Mainnet
          </p>
        </div>
      </footer>
    </div>
  )
}
