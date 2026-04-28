import { Navigate, Route, Routes } from 'react-router-dom'
import RequireSupportDeskSession from './RequireSupportDeskSession.jsx'
import SupportDeskLayout from './SupportDeskLayout.jsx'
import TicketListPage from './pages/TicketListPage.jsx'
import TicketDetailPage from './pages/TicketDetailPage.jsx'
import NewTicketPage from './pages/NewTicketPage.jsx'
import KnowledgePage from './pages/KnowledgePage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import SupportDeskLoginPage from './pages/SupportDeskLoginPage.jsx'
import SupportDeskVerifyMagicPage from './pages/SupportDeskVerifyMagicPage.jsx'

/**
 * Internal support desk. Mount at `/internal/support-desk/*`.
 * Auth: magic link + domain allowlist (see README); login/verify are outside the session gate.
 */
export default function SupportDeskRoutes() {
  return (
    <Routes>
      <Route path="login" element={<SupportDeskLoginPage />} />
      <Route path="auth/verify" element={<SupportDeskVerifyMagicPage />} />
      <Route element={<RequireSupportDeskSession />}>
        <Route element={<SupportDeskLayout />}>
          <Route index element={<Navigate to="tickets" replace />} />
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/new" element={<NewTicketPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
