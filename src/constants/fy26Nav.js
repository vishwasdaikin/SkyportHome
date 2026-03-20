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
