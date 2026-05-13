import React from 'react'
import {
  LayoutDashboard,
  Users,
  Activity,
  DollarSign,
  Sparkles,
  Menu,
  Search,
  HelpCircle,
  User,
  Palette,
  MapPin,
  UserCircle,
} from 'lucide-react'
import { useTheme } from '../AppCare'

export function DealerNav({ activePage, onPageChange }) {
  const { theme, toggleTheme } = useTheme()
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'map', icon: MapPin, label: 'Map View' },
    { id: 'customer-detail', icon: UserCircle, label: 'Customer Detail' },
    { id: 'fleet', icon: Users, label: 'Fleet' },
    { id: 'equipment', icon: Activity, label: 'Equipment' },
    { id: 'opportunities', icon: DollarSign, label: 'Sales' },
    { id: 'ai-features', icon: Sparkles, label: 'AI Premium' },
  ]
  const headerBg =
    theme === 'skyport' ? 'bg-[#4A4A4A]' : 'bg-white border-b border-gray-200'
  const headerText = theme === 'skyport' ? 'text-white' : 'text-gray-800'
  const searchBg = theme === 'skyport' ? 'bg-gray-600' : 'bg-gray-100'
  const searchFocus =
    theme === 'skyport'
      ? 'focus:bg-gray-500'
      : 'focus:bg-white focus:ring-2 focus:ring-blue-500'
  const sidebarBg =
    theme === 'skyport' ? 'bg-[#4A4A4A]' : 'bg-white border-r border-gray-200'
  return (
    <>
      <nav
        className={`${headerBg} ${headerText} fixed top-0 left-0 right-0 z-50 shadow-sm`}
      >
        <div className="flex items-center justify-between px-4 h-11">
          <div className="flex items-center gap-4">
            <button
              className={`p-2 rounded ${theme === 'skyport' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              <span className="font-light text-lg">SkyportCare</span>
              <span className="text-blue-400 text-xs">®</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded flex items-center gap-2 ${theme === 'skyport' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
              title={`Switch to ${theme === 'skyport' ? 'Modern' : 'Classic'} theme`}
            >
              <Palette className="w-5 h-5" />
              <span className="text-xs">
                {theme === 'skyport' ? 'Modern' : 'Classic'}
              </span>
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className={`${searchBg} ${headerText} placeholder-gray-400 pl-9 pr-3 py-1.5 rounded text-sm focus:outline-none ${searchFocus} w-64`}
              />
            </div>
            <button
              className={`p-2 rounded ${theme === 'skyport' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${theme === 'skyport' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
      <div
        className={`${sidebarBg} fixed left-0 top-11 bottom-0 w-10 flex flex-col items-center py-4 gap-4 z-40`}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${theme === 'skyport' ? (isActive ? 'text-white bg-gray-600' : 'text-gray-400 hover:bg-gray-600 hover:text-white') : isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </div>
    </>
  )
}
