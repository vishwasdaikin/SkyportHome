import React, { useState, createContext, useContext } from 'react'
import { DealerNav } from './components/DealerNav'
import { DealerDashboard } from './components/DealerDashboard'
import { FleetMonitoring } from './components/FleetMonitoring'
import { EquipmentDataDashboard } from './components/EquipmentDataDashboard'
import { SalesOpportunities } from './components/SalesOpportunities'
import { AIPremiumHub } from './components/AIPremiumHub'
import { MapView } from './components/MapView'
import { CustomerDetailView } from './components/CustomerDetailView'

const ThemeContext = createContext({
  theme: 'skyport',
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function AppCare() {
  const [activePage, setActivePage] = useState('dashboard')
  const [theme, setTheme] = useState('modern')
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'skyport' ? 'modern' : 'skyport'))
  }
  const bgColor = theme === 'skyport' ? 'bg-[#F5F5F5]' : 'bg-gray-50'
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DealerDashboard onNavigate={setActivePage} />
      case 'fleet':
        return <FleetMonitoring />
      case 'equipment':
        return <EquipmentDataDashboard />
      case 'opportunities':
        return <SalesOpportunities />
      case 'ai-features':
        return <AIPremiumHub />
      case 'map':
        return <MapView />
      case 'customer-detail':
        return <CustomerDetailView onBack={() => setActivePage('map')} />
      default:
        return <DealerDashboard onNavigate={setActivePage} />
    }
  }
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`min-h-screen ${bgColor}`}>
        <DealerNav activePage={activePage} onPageChange={setActivePage} />
        <div className="pt-11 pl-10">{renderPage()}</div>
      </div>
    </ThemeContext.Provider>
  )
}
