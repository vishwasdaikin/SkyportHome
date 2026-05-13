/** FY26 Playbook routes — shared by Layout (Strategy link) and FY26 page section dropdown. */
export const FY26_BASE = '/strategy/fy26'

/**
 * HCM playbook: shown under Strategy / FY26 in local `vite` dev; hidden in production builds (`vite build`).
 * To enable on a deployed site, set `VITE_SHOW_FY26_HCM=true` in the host environment (no code change).
 */
export const FY26_HCM_VISIBLE =
  import.meta.env.VITE_SHOW_FY26_HCM === 'true' || Boolean(import.meta.env.DEV)

const FY26_NAV_ITEMS_ALL = [
  { sectionId: 'digital-platform', label: 'Digital Apps & Services' },
  { sectionId: 'hcm', label: 'HCM' },
  { sectionId: 'digital-tools-services', label: 'Digital Tools' },
]

export const FY26_NAV_ITEMS = FY26_NAV_ITEMS_ALL.filter(
  (item) => item.sectionId !== 'hcm' || FY26_HCM_VISIBLE,
)

/** Playbook sections that share the Digital Apps layout, nav, and embedded roadmaps. */
export const FY26_DIGITAL_APPS_STYLE_SECTION_IDS = new Set(['digital-platform', 'hcm'])

export function isFy26DigitalAppsStyleSection(sectionId) {
  return FY26_DIGITAL_APPS_STYLE_SECTION_IDS.has(sectionId)
}

/** Default FY26 route when `/strategy/fy26` or an unknown `sectionId` is used. */
export const FY26_DEFAULT_SECTION_ID = FY26_NAV_ITEMS[0].sectionId

/** Legacy redirects (`/strategy/hcm`, `/strategy/fy26/test`, …) — HCM when enabled, else default section. */
export const FY26_LEGACY_PLAYBOOK_REDIRECT = FY26_HCM_VISIBLE
  ? `${FY26_BASE}/hcm`
  : `${FY26_BASE}/${FY26_DEFAULT_SECTION_ID}`

export const FY26_TOP_NAV_IDS = FY26_NAV_ITEMS.map((item) => item.sectionId)

export const FY26_TOP_NAV_TITLES = Object.fromEntries(
  FY26_NAV_ITEMS.map(({ sectionId, label }) => [sectionId, label]),
)

const FY26_PAGE_NAV_SIMPLE = [
  {
    label: 'FY26 PLAYBOOK',
    items: [
      { id: 'fy25-review', label: 'FY25 Review', num: 1 },
      { id: 'fy26-plan', label: 'FY26 Goals & Objectives', num: 2 },
      { id: 'fusion30-summary', label: 'Fusion30 Summary', num: 3 },
    ],
  },
]

const FY26_PAGE_NAV_DIGITAL_PLATFORM = [
  {
    label: 'FY25 REVIEW',
    items: [
      {
        id: 'fy25-thermostat-sales-skyportcare',
        label: 'Results',
        num: 1,
        subitems: [
          {
            id: 'fy25-thermostat-sales-skyportcare',
            label: 'a — Thermostats',
          },
          {
            id: 'fy25-skyport-home-charts',
            label: 'b — SkyportHome',
          },
          {
            id: 'fy25-skyportcare-charts',
            label: 'c — SkyportCare',
          },
        ],
      },
      {
        id: 'fy25-planned-vs-actual',
        label: 'Planned vs Actual initiatives',
        num: 2,
      },
    ],
  },
  {
    label: 'FY26 GOALS & OBJECTIVES',
    items: [
      {
        id: 'fy26-outcomes',
        label: 'Goals',
        num: 3,
        subitems: [
          {
            id: 'fy26-goals-business-model-tracking',
            label: 'a — Target Metrics',
          },
        ],
      },
      { id: 'fy26-strategic-themes', label: 'Strategic Themes', num: 4 },
      { id: 'fy26-execution-plan', label: 'Execution Plan', num: 5 },
      {
        id: 'fy26-interaction-alignment',
        label: 'Interaction & Alignment with Other Teams',
        num: 6,
      },
    ],
  },
  {
    label: 'FUSION30',
    items: [
      {
        id: 'fusion30-forecast-outlook',
        label: '5-Year Forecast',
        num: 7,
        subitems: [
          {
            id: 'fusion30-fy26-pillar-thermostats',
            label: 'a — Thermostats (FIT only)',
          },
          {
            id: 'fusion30-fy26-pillar-skyport-home',
            label: 'b — SkyportHome',
          },
          {
            id: 'fusion30-fy26-pillar-skyport-care',
            label: 'c — SkyportCare',
          },
        ],
      },
      {
        id: 'fusion30-strategic-aims',
        label: 'Outcomes & Execution',
        num: 8,
      },
      { id: 'digital-platforms-business-model', label: 'Business model', num: 9 },
    ],
  },
]

function filterHcmPageNav(groups) {
  return groups.map((g) => {
    if (g.label === 'FY25 REVIEW') {
      return {
        ...g,
        items: g.items.filter((item) => item.id !== 'fy25-planned-vs-actual'),
      }
    }
    if (g.label === 'FUSION30') {
      return {
        ...g,
        items: g.items.filter((item) => item.id !== 'digital-platforms-business-model'),
      }
    }
    return g
  })
}

export function getFy26PageNavGroups(sectionId) {
  const base = isFy26DigitalAppsStyleSection(sectionId) ? FY26_PAGE_NAV_DIGITAL_PLATFORM : FY26_PAGE_NAV_SIMPLE
  if (sectionId === 'hcm') return filterHcmPageNav(base)
  return base
}
