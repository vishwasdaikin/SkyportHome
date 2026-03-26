import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FY26_BASE, FY26_TOP_NAV_TITLES, getFy26PageNavGroups } from '../constants/fy26Nav'
import { Fy26PresentMode } from './Fy26PresentMode'

export default function FY26PageNav({
  sectionId,
  presentOpen,
  onPresentOpenChange,
  installedFunnelLicenseBreakdownOpen,
  onInstalledFunnelLicenseBreakdownOpenChange,
}) {
  const location = useLocation()
  const groups = useMemo(() => getFy26PageNavGroups(sectionId), [sectionId])
  /** Leaf targets for hash match, scroll spy, and observers (expands Results subitems). */
  const flatItems = useMemo(
    () =>
      groups.flatMap((g) =>
        g.items.flatMap((item) => (item.subitems?.length ? item.subitems : [item])),
      ),
    [groups],
  )
  /** Top-level nav rows only — Results stays one slide even when it has subitems. */
  const presentSlideItems = useMemo(
    () =>
      groups.flatMap((g) =>
        g.items.map((item) =>
          item.subitems?.length ? { id: item.id, label: item.label, num: item.num } : item,
        ),
      ),
    [groups],
  )

  /** Digital Apps: skip full `fy25-review` slice (would duplicate section header). */
  const presentSlides = useMemo(() => {
    if (sectionId !== 'digital-platform') return presentSlideItems
    return presentSlideItems.filter((i) => i.id !== 'fy25-review')
  }, [sectionId, presentSlideItems])

  const [activeId, setActiveId] = useState(() => {
    const h = location.hash.replace(/^#/, '')
    return flatItems.some((i) => i.id === h) ? h : flatItems[0]?.id ?? ''
  })

  useEffect(() => {
    const h = location.hash.replace(/^#/, '')
    if (h && flatItems.some((i) => i.id === h)) setActiveId(h)
  }, [location.hash, flatItems])

  useEffect(() => {
    setActiveId((prev) => (flatItems.some((i) => i.id === prev) ? prev : flatItems[0]?.id ?? ''))
  }, [flatItems])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && flatItems.some((i) => i.id === e.target.id))
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-32% 0px -52% 0px', threshold: [0, 0.05, 0.1] },
    )

    flatItems.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [flatItems])

  const base = `${FY26_BASE}/${sectionId}`

  return (
    <nav className="ds-nav fy26-page-nav" aria-label="Page sections">
      <p className="ds-nav-title">SECTIONS</p>
      {groups.map((group) => (
        <div key={group.label} className="ds-nav-group">
          <p className="ds-nav-group-title">{group.label}</p>
          <ol className="ds-nav-list">
            {group.items.map((item) =>
              item.subitems?.length ? (
                <li key={item.id}>
                  <Link
                    to={{ pathname: base, hash: `#${item.id}` }}
                    className={`ds-nav-link ${activeId === item.id ? 'active' : ''}`}
                  >
                    <span className="ds-nav-num">{String(item.num).padStart(2, '0')}</span>
                    {item.label}
                  </Link>
                  <ol className="ds-nav-sublist">
                    {item.subitems.map((sub) => (
                      <li key={`${item.id}-${sub.id}-${sub.label}`}>
                        <Link
                          to={{ pathname: base, hash: `#${sub.id}` }}
                          className={`ds-nav-link ds-nav-link--sub ${activeId === sub.id ? 'active' : ''}`}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </li>
              ) : (
                <li key={item.id}>
                  <Link
                    to={{ pathname: base, hash: `#${item.id}` }}
                    className={`ds-nav-link ${activeId === item.id ? 'active' : ''}`}
                  >
                    <span className="ds-nav-num">{String(item.num).padStart(2, '0')}</span>
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ol>
        </div>
      ))}
      <div className="fy26-page-nav-present">
        <button
          type="button"
          className="fy26-present-nav-btn--sidebar"
          onClick={() => onPresentOpenChange?.(true)}
        >
          Present
        </button>
      </div>
      <Fy26PresentMode
        open={presentOpen}
        onClose={() => onPresentOpenChange?.(false)}
        slides={presentSlides}
        deckTitle={`FY26 — ${FY26_TOP_NAV_TITLES[sectionId] ?? 'Playbook'}`}
        installedFunnelLicenseBreakdownOpen={installedFunnelLicenseBreakdownOpen}
        onInstalledFunnelLicenseBreakdownOpenChange={onInstalledFunnelLicenseBreakdownOpenChange}
      />
    </nav>
  )
}
