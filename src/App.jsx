import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './auth/RequireAuth'
import HomePageTailwind from './pages/HomePageTailwind'
import SkyportHome from './pages/SkyportHome'
import SkyportCare from './pages/SkyportCare'
import SkyportEnergy from './pages/SkyportEnergy'
import FY25 from './pages/FY25'
import FY26 from './pages/FY26'
import DigitalStrategy from './pages/DigitalStrategy'
import Platform from './pages/Platform'
import Experiences from './pages/Experiences'
import LifecycleGrowth from './pages/LifecycleGrowth'
import Reference from './pages/Reference'
import CapabilityDepth from './pages/CapabilityDepth'
import Demos from './pages/Demos'
import DemosAnnotated from './pages/DemosAnnotated'
import ImagePage from './pages/ImagePage'
import AppsPage from './pages/AppsPage'
import StrategyPage from './pages/StrategyPage'

export default function App() {
  return (
    <RequireAuth>
      <Layout>
        <Routes>
        <Route path="/" element={<HomePageTailwind />} />
        <Route path="/demos" element={<Demos />} />
        <Route path="/demos/annotated" element={<DemosAnnotated />} />
        <Route path="/image" element={<ImagePage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/apps/skyport-home" element={<SkyportHome />} />
        <Route path="/apps/skyport-care" element={<SkyportCare />} />
        <Route path="/apps/skyport-energy" element={<SkyportEnergy />} />
        <Route path="/strategy/fy25" element={<FY25 />} />
        <Route path="/strategy/fy26" element={<Navigate to="/strategy/fy26/res-solutions" replace />} />
        <Route path="/strategy/fy26/:sectionId" element={<FY26 />} />
        <Route path="/strategy/operating" element={<Navigate to="/strategy/operating/overview" replace />} />
        <Route path="/strategy/operating/overview" element={<DigitalStrategy />} />
        <Route path="/strategy/operating/platform" element={<Platform />} />
        <Route path="/strategy/operating/experiences" element={<Experiences />} />
        <Route path="/strategy/operating/experiences/capability-depth" element={<CapabilityDepth />} />
        <Route path="/strategy/operating/lifecycle-growth" element={<LifecycleGrowth />} />
        <Route path="/strategy/operating/reference" element={<Reference />} />
        <Route path="/strategy" element={<StrategyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </RequireAuth>
  )
}
