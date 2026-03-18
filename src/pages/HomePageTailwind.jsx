import { Link } from 'react-router-dom'
import './HomePageTailwind.css'

const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const imgBase = import.meta.env.BASE_URL || '/'

export default function HomePageTailwind() {
  return (
    <article className="min-h-screen bg-white home-repository-page">
      {/* Hero — full content width like SkyportCare (no max-w-4xl on image) */}
      <section className="pb-4 sm:pb-6 bg-gradient-to-b from-daikin-blue-light/40 via-white to-white">
        <header className="home-repository-header">
          <h1>Digital Solutions Central Repository</h1>
          <p className="home-repository-tagline">
            One place for documents, apps, playbooks, and reference material — easy to browse and
            share with leadership.
          </p>
        </header>
        <figure className="home-repository-hero">
          <img
            src={`${imgBase}images/home-repository-hero.png`}
            alt="Modern home with solar panels and electric vehicle charging"
            width={1024}
            height={477}
            loading="eager"
            decoding="async"
          />
        </figure>
        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
          <Link
            to="/apps"
            className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold text-white bg-daikin-blue hover:bg-daikin-blue-dark transition-colors shadow-lg shadow-daikin-blue/20"
          >
            App Suite
          </Link>
          <Link
            to="/strategy"
            className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold text-daikin-blue bg-white border-2 border-daikin-blue hover:bg-daikin-blue-light transition-colors"
          >
            All Strategy
          </Link>
          <button
            type="button"
            onClick={() => scrollToId('overview')}
            className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors"
          >
            What’s here
          </button>
        </div>
      </section>

      {/* Overview */}
      <section id="overview" className="pt-2 pb-14 sm:pt-3 sm:pb-20 bg-white scroll-mt-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">What you’ll find</h2>
        <ul className="mt-4 space-y-4 text-lg text-gray-600">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-daikin-blue" />
            <span>
              <strong className="text-gray-800">App Suite</strong> — SkyportHome, SkyportCare,
              SkyportEnergy, each with its own roadmap and materials
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-daikin-blue" />
            <span>
              <strong className="text-gray-800">Strategy &amp; playbooks</strong> — operating
              narrative, FY plans, and platform context
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-daikin-blue" />
            <span>
              <strong className="text-gray-800">Documents &amp; flows</strong> — PDFs, process
              views, and links surfaced where they’re relevant (e.g. energy programs)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-daikin-blue" />
            <span>
              <strong className="text-gray-800">Demos &amp; references</strong> — supporting
              artifacts as the repository grows
            </span>
          </li>
        </ul>
        <p className="mt-10 p-5 rounded-xl bg-daikin-blue-light border-l-4 border-daikin-blue text-gray-800 font-medium">
          Use the nav above to jump to apps, strategy sections, or other areas — everything here is
          meant to stay current as a single source of truth.
        </p>
      </section>
    </article>
  )
}
