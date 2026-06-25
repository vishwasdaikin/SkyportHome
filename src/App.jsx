import { Routes, Route } from 'react-router-dom'
import CustomerSupportRequestPage from './features/skyportcare-support-desk/public/CustomerSupportRequestPage.jsx'
import LoginPage from './auth/LoginPage.jsx'
import AppAuthenticatedShell from './AppAuthenticatedShell.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/support/request" element={<CustomerSupportRequestPage />} />
      {/* Public: magic-link sign-in. Must stay outside RequireAuth or it would loop. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<AppAuthenticatedShell />} />
    </Routes>
  )
}
