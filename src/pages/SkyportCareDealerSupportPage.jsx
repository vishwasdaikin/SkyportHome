import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import {
  SKYPORT_CARE_DEALER_SUPPORT_ARTICLES,
  filterSupportArticles,
  getOrderedSupportCategories,
} from '../content/skyportCareDealerSupportGuide.js'
import {
  getFaqArticleImages,
  getImageCtaHighlights,
  getStepImagesForArticle,
  supportGuideAssetUrl,
} from '../content/skyportCareDealerSupportGuideFigures.js'
import './SkyportCareDealerSupportPage.css'

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Split plain text on search query and wrap matches (Jetboost-style highlight). */
function highlightPlainNodes(text, query) {
  const q = query.trim()
  if (!q || !text) return text
  const re = new RegExp(`(${escapeRegExp(q)})`, 'gi')
  const parts = text.split(re)
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark key={idx} className="support-faq__hl">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

function linkifyLine(text, searchQuery = '') {
  const urlRegex = /(https?:\/\/[^\s<]+[^\s<.,;:"')\]]?)/g
  const parts = text.split(urlRegex)
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="support-faq__link">
          {part}
        </a>
      )
    }
    return (
      <span key={i}>
        {highlightPlainNodes(part, searchQuery)}
      </span>
    )
  })
}

function AnnotatedScreenshot({ filename, instanceKey, alt }) {
  const [dims, setDims] = useState(null)
  const highlights = getImageCtaHighlights(filename, instanceKey)
  const src = supportGuideAssetUrl(filename)

  if (!highlights.length) {
    return (
      <img src={src} alt={alt} loading="lazy" decoding="async" className="support-faq__img" />
    )
  }

  return (
    <div className="support-faq__annotated">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="support-faq__annotated-img"
        onLoad={(e) => {
          const el = e.currentTarget
          setDims({ w: el.naturalWidth, h: el.naturalHeight })
        }}
      />
      {dims ? (
        <svg
          className="support-faq__annotated-svg"
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {highlights.map((b, i) => {
            const x = (b.xPct / 100) * dims.w
            const y = (b.yPct / 100) * dims.h
            const rw = (b.wPct / 100) * dims.w
            const rh = (b.hPct / 100) * dims.h
            const strokeW = Math.max(2.5, dims.w * 0.0055)
            const rx = Math.min(10, strokeW * 2.5)
            const fontSz = Math.max(11, Math.min(18, dims.w * 0.022))
            const labelBelowY = y + rh + fontSz * 0.85
            const placeLabelBelow = labelBelowY < dims.h - fontSz * 0.5
            const labelY = placeLabelBelow ? labelBelowY : y - strokeW * 1.5
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={rw}
                  height={rh}
                  rx={rx}
                  ry={rx}
                  fill="rgba(234, 88, 12, 0.14)"
                  stroke="#ea580c"
                  strokeWidth={strokeW}
                />
                {b.label ? (
                  <text
                    x={x + rw / 2}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline={placeLabelBelow ? 'hanging' : 'auto'}
                    fill="#9a3412"
                    fontSize={fontSz}
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    stroke="#fff"
                    strokeWidth={fontSz * 0.1}
                    paintOrder="stroke fill"
                  >
                    {b.label}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      ) : null}
    </div>
  )
}

function FigureTile({ fn, instanceKey }) {
  const alt = `Dealer help guide figure (${fn})`
  return (
    <figure className="support-faq__figure">
      {fn.toLowerCase().endsWith('.emf') ? (
        <div className="support-faq__emf-card">
          <p className="support-faq__emf-name">{fn}</p>
          <p className="support-faq__emf-note">
            Vector format (EMF) — open in Word or Office on desktop, or download to view.
          </p>
          <a href={supportGuideAssetUrl(fn)} download className="support-faq__emf-link">
            Download {fn}
          </a>
        </div>
      ) : (
        <AnnotatedScreenshot filename={fn} instanceKey={instanceKey} alt={alt} />
      )}
    </figure>
  )
}

/** Images placed directly under a single numbered step. */
function StepFigures({ articleId, stepIndex, files }) {
  if (!files?.length) return null
  return (
    <div className="support-faq__step-figures" aria-label="Screenshots for this step">
      <div className="support-faq__step-figure-grid">
        {files.map((fn, i) => (
          <FigureTile
            key={`${fn}-step-${i}`}
            fn={fn}
            instanceKey={`${articleId}:${stepIndex}:${i}`}
          />
        ))}
      </div>
    </div>
  )
}

/** Images for FAQ-style articles (full width below text). */
function FaqArticleFigures({ articleId, files }) {
  if (!files?.length) return null
  return (
    <div className="support-faq__figures">
      <p className="support-faq__figures-title">Screenshots from the help guide</p>
      <div className="support-faq__figure-grid">
        {files.map((fn, i) => (
          <FigureTile key={`faq-${i}-${fn}`} fn={fn} instanceKey={`faq:${articleId}:${i}`} />
        ))}
      </div>
    </div>
  )
}

function ArticleBody({ article, searchQuery }) {
  if (article.kind === 'steps' && article.steps?.length) {
    return (
      <ol className="support-faq__steps">
        {article.steps.map((step, i) => {
          const stepFiles = getStepImagesForArticle(article.id, i)
          return (
            <li key={`${article.id}-s${i}`} className="support-faq__step">
              <span className="support-faq__step-label">{highlightPlainNodes(step.label, searchQuery)}</span>
              <p className="support-faq__step-text">{linkifyLine(step.text, searchQuery)}</p>
              <StepFigures articleId={article.id} stepIndex={i} files={stepFiles} />
            </li>
          )
        })}
      </ol>
    )
  }
  const faqFiles = getFaqArticleImages(article.id)
  return (
    <div className="support-faq__body">
      {article.body?.map((p, i) => (
        <p key={`${article.id}-p${i}`} className="support-faq__p">
          {linkifyLine(p, searchQuery)}
        </p>
      ))}
      {article.bullets?.length ? (
        <ul className="support-faq__bullets">
          {article.bullets.map((b, i) => (
            <li key={`${article.id}-b${i}`}>{linkifyLine(b, searchQuery)}</li>
          ))}
        </ul>
      ) : null}
      <FaqArticleFigures articleId={article.id} files={faqFiles} />
    </div>
  )
}

export default function SkyportCareDealerSupportPage() {
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)

  const categories = useMemo(
    () => getOrderedSupportCategories(SKYPORT_CARE_DEALER_SUPPORT_ARTICLES),
    [],
  )

  const filtered = useMemo(
    () => filterSupportArticles(SKYPORT_CARE_DEALER_SUPPORT_ARTICLES, query, categoryFilter),
    [query, categoryFilter],
  )

  const byCategory = useMemo(() => {
    const map = new Map()
    for (const a of filtered) {
      if (!map.has(a.category)) map.set(a.category, [])
      map.get(a.category).push(a)
    }
    return Array.from(map.entries())
  }, [filtered])

  const hasActiveFilters = Boolean(query.trim() || categoryFilter)
  const totalCount = SKYPORT_CARE_DEALER_SUPPORT_ARTICLES.length

  return (
    <article className="support-faq">
      <header className="support-faq__hero">
        <div className="support-faq__hero-inner">
          <p className="support-faq__breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden> / </span>
            <span>Support</span>
          </p>
          <h1 className="support-faq__title">SkyportCare dealer support</h1>
          <p className="support-faq__lead">
            Search or pick a category — same pattern as a modern help center (search + topic filters).
          </p>

          <div className="support-faq__search-block">
            <label className="support-faq__search-label" htmlFor="support-faq-search">
              Search help topics
            </label>
            <div className="support-faq__search-field">
              <Search className="support-faq__search-icon" size={20} strokeWidth={2} aria-hidden />
              <input
                id="support-faq-search"
                type="search"
                className="support-faq__search"
                placeholder="Type keywords — e.g. license, SSO, Warranty, admin, KinPay…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
            </div>
            <p className="support-faq__count" role="status">
              {filtered.length === totalCount && !categoryFilter
                ? `${totalCount} topics`
                : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
              {categoryFilter ? ` · ${categoryFilter}` : null}
              {query.trim() ? ` · matching “${query.trim()}”` : null}
            </p>
          </div>

          <div className="support-faq__categories-block">
            <p className="support-faq__categories-label" id="support-faq-cats-label">
              Category
            </p>
            <div
              className="support-faq__chips"
              role="group"
              aria-labelledby="support-faq-cats-label"
            >
              <button
                type="button"
                className={`support-faq__chip ${categoryFilter === null ? 'support-faq__chip--active' : ''}`}
                onClick={() => setCategoryFilter(null)}
                aria-pressed={categoryFilter === null}
              >
                All topics
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`support-faq__chip ${categoryFilter === cat ? 'support-faq__chip--active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                  aria-pressed={categoryFilter === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                className="support-faq__clear"
                onClick={() => {
                  setQuery('')
                  setCategoryFilter(null)
                }}
              >
                Clear search &amp; category
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className="support-faq__empty">
          No topics match your filters. Try clearing the search, choosing <strong>All topics</strong>, or a different
          keyword.
        </p>
      ) : (
        <div className="support-faq__sections">
          {byCategory.map(([category, articles], ci) => (
            <section key={category} className="support-faq__section" aria-labelledby={`support-cat-${ci}`}>
              <h2 id={`support-cat-${ci}`} className="support-faq__category">
                {category}
              </h2>
              <div className="support-faq__list">
                {articles.map((article) => (
                  <details key={article.id} className="support-faq__details">
                    <summary className="support-faq__summary">
                      {highlightPlainNodes(article.title, query)}
                    </summary>
                    <div className="support-faq__content">
                      <ArticleBody article={article} searchQuery={query} />
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </article>
  )
}
