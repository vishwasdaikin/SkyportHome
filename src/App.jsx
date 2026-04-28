import { Routes, Route } from 'react-router-dom'
import SitePasswordGate from './auth/SitePasswordGate'
import CustomerSupportRequestPage from './features/skyportcare-support-desk/public/CustomerSupportRequestPage.jsx'
import AppAuthenticatedShell from './AppAuthenticatedShell.jsx'

export default function App() {
  return (
    <SitePasswordGate>
      <Routes>
        <Route path="/support/request" element={<CustomerSupportRequestPage />} />
        <Route path="*" element={<AppAuthenticatedShell />} />
      </Routes>
    </SitePasswordGate>
  )
}
