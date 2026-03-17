import { Link } from 'react-router-dom'
import { sections } from '../content/content'

const scrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function HomePageTailwind() {
  const takeaways = sections.map((s) => {
    const match = s.content.match(/Takeaway:\s*(.+?)(?:\n|$)/)
    return match ? match[1].trim() : null
  }).filter(Boolean)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-gradient-to-br from-daikin-blue-light via-white to-daikin-blue-light/50">
        <div className="max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-daikin-blue tracking-tight">
            Skyport
          </h1>
          <p className="mt-4 text-xl sm:text-2xl text-gray-600 font-medium">
            Digital Strategy & Operating Playbook
          </p>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl">
            Creating the digital foundation for scalable growth through homeowner and dealer engagement.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/strategy/operating/overview"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-daikin-blue hover:bg-daikin-blue-dark transition-colors shadow-lg shadow-daikin-blue/25"
            >
              Open Playbook
            </Link>
            <button
              type="button"
              onClick={() => scrollToId('overview')}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-daikin-blue bg-white border-2 border-daikin-blue hover:bg-daikin-blue-light transition-colors"
            >
              Scroll to overview
            </button>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section id="overview" className="py-16 sm:py-24 px-6 sm:px-12 lg:px-24 bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            What this playbook enables
          </h2>
          <ul className="mt-8 space-y-4 text-lg text-gray-600">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-daikin-blue" />
              A consistent, always‑on experience across the homeowner and dealer lifecycle
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-daikin-blue" />
              Engagement that spans before, during, and beyond install and replacement events
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-daikin-blue" />
              The operating layer required to support scalable growth across products, services, and lifecycle value
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-daikin-blue" />
              The foundation for repeat sales, loyalty, and lifetime value
            </li>
          </ul>
          <p className="mt-10 p-5 rounded-xl bg-daikin-blue-light border-l-4 border-daikin-blue text-gray-800 font-medium">
            Takeaway: This is the foundation for scalable growth and lifetime value — not a collection of apps.
          </p>
        </div>
      </section>

      {/* Pillars from playbook sections */}
      <section id="pillars" className="py-16 sm:py-24 px-6 sm:px-12 lg:px-24 bg-gray-50 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center">
            Playbook at a glance
          </h2>
          <p className="mt-4 text-center text-gray-500 max-w-2xl mx-auto">
            Key sections from the Digital Strategy & Operating Playbook.
          </p>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.slice(0, 6).map((sec, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-daikin-blue/30 transition-all"
              >
                <span className="inline-block text-sm font-bold text-daikin-blue">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2">
                  {sec.title}
                </h3>
                {takeaways[i] && (
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2">
                    {takeaways[i]}
                  </p>
                )}
                <Link
                  to="/strategy/operating/overview"
                  className="mt-4 inline-block text-sm font-semibold text-daikin-blue hover:text-daikin-blue-dark"
                >
                  Read in playbook →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-6 sm:px-12 lg:px-24 bg-daikin-blue scroll-mt-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to dive in?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Open the full Operating Playbook for details, platform strategy, experiences, and metrics.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/strategy/operating/overview"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-daikin-blue bg-white hover:bg-gray-100 transition-colors"
            >
              Operating Playbook
            </Link>
            <Link
              to="/strategy/fy25"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white border-2 border-white hover:bg-white/10 transition-colors"
            >
              FY25 Playbook
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 sm:px-12 lg:px-24 bg-gray-900 text-gray-400 text-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span>Skyport — Digital Strategy</span>
          <div className="flex gap-6">
            <Link to="/strategy/operating/overview" className="hover:text-white transition-colors">
              Strategy
            </Link>
            <Link to="/apps/skyport-home" className="hover:text-white transition-colors">
              SkyportHome
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
