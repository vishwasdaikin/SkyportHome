import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CareDemoHelpModal from './CareDemoHelpModal.jsx'
import { isCareDemoAuthenticated, setCareDemoAuthenticated } from '../auth/careDemoSession.js'
import './SkyportCareLoginPage.css'

const CARE_DEMO_DASH = '/test-page/care-demo'
const HEADER_UNIBRAND_SVG = `${import.meta.env.BASE_URL}care-demo/footer-unibrand-logos.svg`
const SKYPORTCARE_BUTTERFLY_SVG = `${import.meta.env.BASE_URL}care-demo/skyportcare-butterfly-only.svg`
/** Same as Care Demo profile sample (CareDemoPage CARE_DEMO_PROFILE_SAMPLE.email). */
const CARE_DEMO_PROFILE_EMAIL_DEFAULT = 'morgan.chen@skyportcare-demo.example'
/** Demo-only; masked in the UI (type="password"). Not a real credential. */
const CARE_DEMO_PASSWORD_DEFAULT = 'SkyportCareDemo1'

export default function SkyportCareLoginPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('welcome')
  const [email, setEmail] = useState(CARE_DEMO_PROFILE_EMAIL_DEFAULT)
  const [password, setPassword] = useState(CARE_DEMO_PASSWORD_DEFAULT)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    if (isCareDemoAuthenticated()) {
      navigate(CARE_DEMO_DASH, { replace: true })
    }
  }, [navigate])

  const openHelp = () => setHelpOpen(true)

  const finishSignIn = () => {
    setCareDemoAuthenticated(true)
    navigate(CARE_DEMO_DASH, { replace: true })
  }

  if (step === 'email' || step === 'password') {
    return (
      <div className="skyport-care-login skyport-care-login--auth-flow">
        <div className="skyport-care-login__auth-wrap">
          <div className="skyport-care-login__auth-card">
            <a
              className="skyport-care-login__auth-help"
              href="https://universalloginsupport.helpdocsite.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Help Center
            </a>

            {step === 'email' ? (
              <>
                <h1 className="skyport-care-login__auth-title">Sign In</h1>
                <div className="skyport-care-login__field-box">
                  <label className="skyport-care-login__field-label" htmlFor="skyport-care-demo-email">
                    Email <span className="skyport-care-login__req">*</span>
                  </label>
                  <input
                    id="skyport-care-demo-email"
                    className="skyport-care-login__field-input"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="skyport-care-login__next-btn"
                  onClick={() => {
                    if (!email.trim()) return
                    setStep('password')
                  }}
                >
                  Next
                </button>
                <div className="skyport-care-login__auth-links">
                  <button type="button" className="skyport-care-login__text-link">
                    Forgot Password?
                  </button>
                  <button type="button" className="skyport-care-login__text-link">
                    Create Account
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="skyport-care-login__auth-title">Welcome</h1>
                <p className="skyport-care-login__auth-email">{email.trim() || '—'}</p>
                <div className="skyport-care-login__field-box">
                  <label className="skyport-care-login__field-label" htmlFor="skyport-care-demo-password">
                    Password <span className="skyport-care-login__req">*</span>
                  </label>
                  <input
                    id="skyport-care-demo-password"
                    className="skyport-care-login__field-input"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button type="button" className="skyport-care-login__next-btn" onClick={finishSignIn}>
                  Next
                </button>
                <div className="skyport-care-login__auth-links">
                  <button type="button" className="skyport-care-login__text-link">
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="button"
                  className="skyport-care-login__back-login"
                  onClick={() => {
                    setPassword(CARE_DEMO_PASSWORD_DEFAULT)
                    setStep('email')
                  }}
                >
                  Back to login
                </button>
              </>
            )}

            <div className="skyport-care-login__auth-foot">
              <span className="skyport-care-login__powered">Powered By Daikin</span>
              <div className="skyport-care-login__auth-legal">
                <a href="https://daikincomfort.com/privacy-notice" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                <a href="https://www.daikincity.com/DaikinCityB2BTermsOfUse.html" target="_blank" rel="noopener noreferrer">
                  B2B Terms
                </a>
              </div>
            </div>
          </div>
        </div>
        <CareDemoHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    )
  }

  return (
    <div className="skyport-care-login">
      <header className="skyport-care-login__header" aria-label="Brands">
        <img
          className="skyport-care-login__header-brands"
          src={HEADER_UNIBRAND_SVG}
          alt="Daikin, Amana, and Goodman"
          width={222}
          height={30}
          decoding="async"
        />
      </header>

      <div className="skyport-care-login__hero">
        <div className="skyport-care-login__hero-inner skyport-care-login__hero-inner--welcome">
          <div className="skyport-care-login__welcome-head">
            <h1 className="skyport-care-login__welcome-title">
              <span className="skyport-care-login__welcome-to">Welcome to</span>{' '}
              <span className="skyport-care-login__welcome-name">
                Skyport
                <span className="skyport-care-login__welcome-care-mark">
                  Care
                  <img
                    className="skyport-care-login__welcome-butterfly"
                    src={SKYPORTCARE_BUTTERFLY_SVG}
                    alt=""
                    width={16}
                    height={13}
                    decoding="async"
                  />
                </span>
              </span>
            </h1>
          </div>
          <p className="skyport-care-login__welcome-lead">
            View and manage your customer&apos;s Daikin, Amana® brand, and Goodman connected systems in one place.{' '}
            <button type="button" className="skyport-care-login__welcome-more" onClick={openHelp}>
              Learn more...
            </button>
          </p>

          <section className="skyport-care-login__card" aria-labelledby="skyport-care-login-sso">
            <h2 id="skyport-care-login-sso" className="visually-hidden">
              Sign in
            </h2>
            <p className="skyport-care-login__card-text">
              This website uses a single sign on service. Click the button below to open the sign in screen.
            </p>
            <button type="button" className="skyport-care-login__cta" onClick={() => setStep('email')}>
              Sign In
            </button>
          </section>
        </div>
      </div>

      <footer className="skyport-care-login__footer">
        <p className="skyport-care-login__footer-copy">
          © 2026 Daikin Comfort Technologies North America, Inc. All rights reserved.
        </p>
        <p className="skyport-care-login__footer-disclaimer">
          Amana® is a registered trademark of Maytag Corporation or its related companies and is used under license.
        </p>
        <nav className="skyport-care-login__footer-links" aria-label="Footer">
          <a href="https://daikincomfort.com/privacy-notice" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          <span className="skyport-care-login__footer-sep" aria-hidden>
            |
          </span>
          <a href="https://daikincomfort.com/terms-of-use" target="_blank" rel="noopener noreferrer">
            Terms of Use
          </a>
          <span className="skyport-care-login__footer-sep" aria-hidden>
            |
          </span>
          <a
            href="https://www.daikincity.com/DaikinCityB2BTermsOfUse.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            B2B Account Terms
          </a>
        </nav>
      </footer>

      <CareDemoHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
