/** FY26 Playbook routes — shared by Layout (Strategy link) and FY26 page section dropdown. */
export const FY26_BASE = '/strategy/fy26'

export const FY26_NAV_ITEMS = [
  { sectionId: 'res-solutions', label: 'Res Solutions' },
  { sectionId: 'digital-platform', label: 'Digital Platform' },
  { sectionId: 'digital-tools-services', label: 'Digital Tools & Services' },
  { sectionId: 'res-controls-thermostats', label: 'Res Controls & Thermostats' },
  { sectionId: 'vrv-controls-solutions', label: 'VRV Controls & Solutions' },
  { sectionId: 'lc-controls-solutions', label: 'LC Controls & Solutions' },
  { sectionId: 'iaq-energy', label: 'IAQ & Energy' },
  { sectionId: 'hot-water-solutions', label: 'Hot Water Solutions' },
]

export const FY26_TOP_NAV_IDS = FY26_NAV_ITEMS.map((item) => item.sectionId)

export const FY26_TOP_NAV_TITLES = Object.fromEntries(
  FY26_NAV_ITEMS.map(({ sectionId, label }) => [sectionId, label]),
)

const FY26_PAGE_NAV_SIMPLE = [
  {
    label: 'FY26 PLAYBOOK',
    items: [
      { id: 'fy25-review', label: 'FY25 Review', num: 1 },
      { id: 'fy26-plan', label: 'FY26 Plan', num: 2 },
      { id: 'fusion30-summary', label: 'Fusion30 Summary', num: 3 },
    ],
  },
]

const FY26_PAGE_NAV_DIGITAL_PLATFORM = [
  {
    label: 'FY25 REVIEW',
    items: [
      { id: 'fy25-review', label: 'FY25 Review', num: 1 },
      {
        id: 'fy25-thermostat-sales-skyportcare',
        label: 'Thermostat sales & SkyportCare adoption',
        num: 2,
      },
      {
        id: 'fy25-skyporthome-experience-sentiment',
        label: 'SkyportHome Experience Quality & Sentiment',
        num: 3,
      },
      {
        id: 'fy25-planned-vs-actual',
        label: 'Planned vs Actual initiatives',
        num: 4,
      },
    ],
  },
  {
    label: 'FY26 PLAN',
    items: [
      { id: 'fy26-plan', label: 'FY26 Review', num: 5 },
      { id: 'fy26-outcomes', label: 'Goals', num: 6 },
      { id: 'fy26-strategic-themes', label: 'Strategic Themes', num: 7 },
      { id: 'fy26-execution-plan', label: 'Execution Plan', num: 8 },
      {
        id: 'fy26-interaction-alignment',
        label: 'Interaction & Alignment with Other Teams',
        num: 9,
      },
    ],
  },
  {
    label: 'FUSION30',
    items: [{ id: 'fusion30-summary', label: 'Fusion30 Summary', num: 10 }],
  },
  {
    label: 'REFERENCE',
    items: [{ id: 'digital-platforms-business-model', label: 'Business model', num: 11 }],
  },
]

export function getFy26PageNavGroups(sectionId) {
  return sectionId === 'digital-platform' ? FY26_PAGE_NAV_DIGITAL_PLATFORM : FY26_PAGE_NAV_SIMPLE
}
