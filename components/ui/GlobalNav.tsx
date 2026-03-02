'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useActiveUser } from '@/lib/hooks/useActiveUser'

const navItems = [
  { href: '/learn',     label: 'Learn',     icon: '📚' },
  { href: '/drill',     label: 'Drill',     icon: '🎯' },
  { href: '/scenarios', label: 'Scenarios', icon: '🎭' },
  { href: '/journey',   label: 'Journey',   icon: '🗺️' },
]

export default function GlobalNav() {
  const pathname = usePathname()
  const { user, clearUser } = useActiveUser()

  // Don't show nav on the home/picker page
  if (!user || pathname === '/') return null

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-porto-green-600">🇵🇹</span>
            <span className="font-bold text-gray-900 hidden sm:block">Tele-Porto</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={clearUser}
              className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <span className="text-base">{user === 'Harry' ? '👨' : '👩'}</span>
              <span>{user}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-2xl mx-auto px-2 h-16 flex items-center justify-around">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 min-w-[60px]
                  ${isActive
                    ? 'text-porto-green-600 bg-porto-green-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="text-xl leading-none">{icon}</span>
                <span className={`text-xs font-medium ${isActive ? 'text-porto-green-600' : 'text-gray-500'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
