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
    <div className="min-h-screen bg-yo-bg selection:bg-yo-neon selection:text-black flex flex-col">
      <div className="bg-mesh" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-yo-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-yo-neon flex items-center justify-center shadow-[0_0_20px_rgba(214,255,52,0.3)]">
              <TrendingUp size={20} className="text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-yo-neon transition-colors">
              YO Savings
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center bg-yo-black/40 rounded-2xl p-1 border border-yo-border">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    active
                      ? 'bg-yo-neon text-black shadow-[0_0_15px_rgba(214,255,52,0.2)]'
                      : 'text-yo-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ConnectButton
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'avatar',
              }}
              chainStatus="icon"
              showBalance={false}
            />
            
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2.5 rounded-xl bg-yo-black/40 border border-yo-border text-yo-muted hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div className={`w-5 h-0.5 bg-current transition-all mb-1.5 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`w-5 h-0.5 bg-current transition-all mb-1.5 ${mobileOpen ? 'opacity-0' : ''}`} />
              <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:hidden glass border-t border-yo-border px-4 py-4 flex flex-col gap-2"
          >
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-md font-bold transition-all ${
                    active
                      ? 'bg-yo-neon text-black'
                      : 'text-yo-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </motion.div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass border-t border-yo-border py-8 text-center">
        <p className="text-yo-muted text-sm font-medium">
          Built with{' '}
          <a
            href="https://yo.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yo-neon hover:text-white transition-colors"
          >
            YO Protocol
          </a>
          <span className="mx-2 opacity-30">|</span>
          Savings on Base Mainnet
        </p>
      </footer>
    </div>
  )
}
