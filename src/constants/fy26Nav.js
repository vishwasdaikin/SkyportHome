/** FY26 Playbook routes — shared by Layout (Strategy link) and FY26 page section dropdown. */
export const FY26_BASE = '/strategy/fy26'

export const FY26_NAV_ITEMS = [
  { sectionId: 'digital-platform', label: 'Digital Apps & Services' },
  { sectionId: 'digital-tools-services', label: 'Digital Tools' },
]

/** Default FY26 route when `/strategy/fy26` or an unknown `sectionId` is used. */
export const FY26_DEFAULT_SECTION_ID = FY26_NAV_ITEMS[0].sectionId

export const FY26_TOP_NAV_IDS = FY26_NAV_ITEMS.map((item) => item.sectionId)

export const FY26_TOP_NAV_TITLES = Object.fromEntries(
  FY26_NAV_ITEMS.map(({ sectionId, label }) => [sectionId, label]),
)

const FY26_PAGE_NAV_SIMPLE = [
  {
    label: 'FY26 PLAYBOOK',
    items: [
      { id: 'fy25-review', label: 'FY25 Review', num: 1 },
      { id: 'fy26-plan', label: 'FY26 Tracker', num: 2 },
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
            label: 'a — Thermostats: Sales & Connected',
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
    label: 'FY26 TRACKER',
    items: [
      { id: 'fy26-outcomes', label: 'Goals', num: 3 },
      {
        id: 'fy26-goals-business-model-tracking',
        label: 'Target Metrics',
        num: 4,
      },
      { id: 'fy26-strategic-themes', label: 'Strategic Themes', num: 5 },
      { id: 'fy26-execution-plan', label: 'Execution Plan', num: 6 },
      {
        id: 'fy26-interaction-alignment',
        label: 'Interaction & Alignment with Other Teams',
        num: 7,
      },
    ],
  },
  {
    label: 'FUSION30',
    items: [
      {
        id: 'fusion30-forecast-outlook',
        label: '5-Year Forecast',
        num: 8,
      },
      {
        id: 'fusion30-strategic-aims',
        label: 'Outcomes & Execution',
        num: 9,
      },
      { id: 'digital-platforms-business-model', label: 'Business model', num: 10 },
    ],
  },
]

export function getFy26PageNavGroups(sectionId) {
  return sectionId === 'digital-platform' ? FY26_PAGE_NAV_DIGITAL_PLATFORM : FY26_PAGE_NAV_SIMPLE
}
