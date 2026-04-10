import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './auth/RequireAuth'
import SitePasswordGate from './auth/SitePasswordGate'
import HomePageTailwind from './pages/HomePageTailwind'
import AppSuiteTest from './pages/AppSuiteTest'
import AppSuiteTest2 from './pages/AppSuiteTest2'
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
import DemosSkyportHomeConcept from './pages/DemosSkyportHomeConcept'
import DemosAnnotated from './pages/DemosAnnotated'
import DemosCare from './pages/DemosCare'
import ImagePage from './pages/ImagePage'
import AppsPage from './pages/AppsPage'
import StrategyPage from './pages/StrategyPage'
import { FY26_BASE, FY26_DEFAULT_SECTION_ID, FY26_LEGACY_PLAYBOOK_REDIRECT } from './constants/fy26Nav'
import TestXlsxDemo from './pages/TestXlsxDemo'
import TestPage from './pages/TestPage'
import CareDemoPage from './pages/CareDemoPage'
import { TEST_PAGE_VISIBLE } from './constants/devOnlyNav'
import SkyportCareLoginPage from './pages/SkyportCareLoginPage'

export default function App() {
  return (
    <SitePasswordGate>
      <RequireAuth>
        <Layout>
        <Routes>
        <Route path="/" element={<HomePageTailwind />} />
        <Route path="/test-page" element={TEST_PAGE_VISIBLE ? <TestPage /> : <Navigate to="/" replace />} />
        <Route path="/test-page/care-demo/login" element={<SkyportCareLoginPage />} />
        <Route path="/test-page/care-demo/help" element={<CareDemoPage />} />
        <Route path="/test-page/care-demo" element={<CareDemoPage />} />
        <Route path="/demos" element={<Demos />} />
        <Route path="/demos/skyport-home-concept" element={<DemosSkyportHomeConcept />} />
        <Route path="/demos/annotated" element={<DemosAnnotated />} />
        <Route path="/demos/care" element={<DemosCare />} />
        <Route path="/image" element={<ImagePage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/apps/skyport-home" element={<AppSuiteTest />} />
        <Route path="/apps/test" element={<Navigate to="/apps/skyport-home" replace />} />
        <Route path="/apps/skyport-care" element={<AppSuiteTest2 />} />
        <Route path="/apps/test-2" element={<Navigate to="/apps/skyport-care" replace />} />
        <Route path="/apps/skyport-energy" element={<SkyportEnergy />} />
        <Route path="/strategy/fy25" element={<FY25 />} />
        <Route
          path="/strategy/fy26"
          element={<Navigate to={`${FY26_BASE}/${FY26_DEFAULT_SECTION_ID}`} replace />}
        />
        <Route path="/strategy/fy26/test" element={<Navigate to={FY26_LEGACY_PLAYBOOK_REDIRECT} replace />} />
        <Route path="/strategy/fy26/:sectionId" element={<FY26 />} />
        <Route path="/strategy/fy26-test" element={<Navigate to={FY26_LEGACY_PLAYBOOK_REDIRECT} replace />} />
        <Route path="/strategy/hcm" element={<Navigate to={FY26_LEGACY_PLAYBOOK_REDIRECT} replace />} />
        <Route path="/strategy/operating" element={<Navigate to="/strategy/operating/overview" replace />} />
        <Route path="/strategy/operating/overview" element={<DigitalStrategy />} />
        <Route path="/strategy/operating/platform" element={<Platform />} />
        <Route path="/strategy/operating/experiences" element={<Experiences />} />
        <Route path="/strategy/operating/experiences/capability-depth" element={<CapabilityDepth />} />
        <Route path="/strategy/operating/lifecycle-growth" element={<LifecycleGrowth />} />
        <Route path="/strategy/operating/reference" element={<Reference />} />
        <Route path="/strategy" element={<StrategyPage />} />
        <Route path="/dev/test-xlsx" element={<TestXlsxDemo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      </RequireAuth>
    </SitePasswordGate>
  )
}
