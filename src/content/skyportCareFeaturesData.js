/**
 * SkyportCare features: Attribute (featureGroup), Feature / Function, Initiative Type, End User Category,
 * Monetization Model, Target, Priority (1–3), Development (UI / Data / Algorithm scope).
 * Empty featureGroup means same group as previous row.
 */
const _skyportCareFeaturesRowsRaw = [
  { featureGroup: 'Dealer Operations & Experience', feature: 'Dealer On-boarding & Set-up', initiativeType: 'New Feature Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI only' },
  { featureGroup: '', feature: 'Aggregated summary view', initiativeType: 'New Feature Introduction', endUserCategory: 'Ease of Use & Accessibility', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI only' },
  { featureGroup: '', feature: 'Dealer Report', initiativeType: 'New Feature Introduction', endUserCategory: 'Ease of Use & Accessibility', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI only' },
  { featureGroup: '', feature: 'Homeowner Report', initiativeType: 'New Feature Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI only' },
  { featureGroup: '', feature: 'SkyportHome communication w/homeowner (including Dealer brand)', initiativeType: 'New Feature Introduction', endUserCategory: 'Engagement & Personalization', monetizationModel: 'Paid', priority: 1, development: 'UI + Data' },
  { featureGroup: '', feature: 'Home Sale Alert', initiativeType: 'New Feature Introduction', endUserCategory: 'Engagement & Personalization', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI only' },
  { featureGroup: '', feature: 'Remote Adjust', initiativeType: 'New Feature Introduction', endUserCategory: 'Ease of Use & Accessibility', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI only' },
  { featureGroup: 'Predictive Maintenance, & Diagnostics', feature: 'Predictive Maintenance (reminders)', initiativeType: 'New Feature Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI only' },
  { featureGroup: '', feature: 'Technician Support Tools Alerts (minor & critical errors)', initiativeType: 'New Feature Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI only' },
  { featureGroup: '', feature: 'Automated diagnostics - root cause + parts (AI‑Powered)', initiativeType: 'New Function Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Paid', priority: 3, development: 'UI + Data + Algorithm' },
  { featureGroup: '', feature: 'Automated parts ordering (AI‑Powered)', initiativeType: 'New Function Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Paid', priority: 3, development: 'UI + Data + Algorithm' },
  { featureGroup: 'Quality Install, Commissioning & Compliance', feature: 'Quality Install', initiativeType: 'New Feature Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI + Data' },
  { featureGroup: '', feature: 'Quality install Climate profiles: Go from basic two to cover all climate zones nationwide', initiativeType: 'New Feature Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI + Data' },
  { featureGroup: '', feature: 'State & Utility Assisted Commissioning compliance', initiativeType: 'New Technical Integration', endUserCategory: 'Energy & Sustainability', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: 'Compliance documentation & reports', initiativeType: 'New Feature Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: 'Performance, Energy & Runtime Intelligence', feature: 'Energy runtime - heating/cooling hours/total heating & cooling hours (real-time, historical) for ODU, IDU for selected time frame', initiativeType: 'New Feature Introduction', endUserCategory: 'Energy & Sustainability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI + Data' },
  { featureGroup: '', feature: 'Energy usage (real-time, historical) for ODU, IDU for selected time frame', initiativeType: 'New Feature Introduction', endUserCategory: 'Energy & Sustainability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI + Data' },
  { featureGroup: '', feature: 'Energy Usage: System comparison with similar in neighborhood', initiativeType: 'New Feature Introduction', endUserCategory: 'Energy & Sustainability', monetizationModel: 'Paid', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: 'Performance Insights', initiativeType: 'New Feature Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI + Data' },
  { featureGroup: 'Equipment Data – Indoor & Outdoor (All Telemetry)', feature: 'Support RAQA product line', initiativeType: 'New Product Integration', endUserCategory: 'Ease of Use & Accessibility', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI + Data' },
  { featureGroup: '', feature: 'Equipment Data: Key summary metrics, refrigerant diagram w/below visual indication: No refrigerant flow; Low temp low pressure gas; Low temp low pressure liquid; High temp high pressure liquid; High temp high pressure gas', initiativeType: 'New Feature Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI + Data' },
  { featureGroup: '', feature: 'Indoor Equipment Data (real-time, historical) for selected time frame: Cool setpoint; Heat setpoint; Indoor EV opening; Indoor gas pipe temp.; Indoor liquid pipe temp.; Indoor unit On/Off; Indoor unit subcool; Indoor unit superheat; Operation mode; Room temp; Suction air temp', initiativeType: 'New Feature Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: `Outdoor Equipment Data (real-time, historical) for selected time frame
Compressor health check
o Target condensing temp, Evaporation temp. (TE), Target evaporation temp & Outside air temp.
o Compressor discharge pipe temp.`, initiativeType: 'New Feature Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: `Capacity check
o Defrost
o Oil return
o Evaporation temp. (TE), Target evaporation temp & Outside air temp.
o Compressor target rotation speed`, initiativeType: 'New Feature Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: `Main heat exchanger component health
o Outside air temp. & Condensing temp. (TC)
o Heat exchanger gas/liquid pipe temp. (upper)
o Subcooling heat exchanger gas pipe temp
o Four-way valve (heat exchanger upper & HP/LP gas pipe)
o EV pulse (heat/subcooling exchanger upper)`, initiativeType: 'New Feature Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: `Subcool heat exchanger component health
o System consumed current
o Defrost
o Backup operation, Operation mode
o Oil return
o Restart stand by, Thermo state
o Outside air temp.
o Compressor & Fan target rotation speed
o Four-way valve (heat exchanger upper & HP/LP gas pipe)
o EV pulse (heat/subcooling exchanger upper)`, initiativeType: 'New Feature Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: 'Enterprise, New Construction & Multi‑Tenant', feature: 'User profile & permissions', initiativeType: 'New Feature Introduction', endUserCategory: 'Ease of Use & Accessibility', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: 'Hierarchical access & data visibility', initiativeType: 'New Function Introduction', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: 'Role-based workflows', initiativeType: 'New Feature Introduction', endUserCategory: 'Ease of Use & Accessibility', monetizationModel: 'Paid', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: 'SkyportHome tenant access linkage', initiativeType: 'New Feature Introduction', endUserCategory: 'Ease of Use & Accessibility', monetizationModel: 'Basic (Free)', priority: 2, development: 'UI + Data' },
  { featureGroup: 'Premium Capabilities (AI‑Powered)', feature: 'Autonomous preventative maintenance cycles', initiativeType: 'New Feature Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Paid', priority: 3, development: 'UI + Data + Algorithm' },
  { featureGroup: '', feature: 'Auto‑calibration & optimization', initiativeType: 'New Technical Integration', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Paid', priority: 3, development: 'UI + Data + Algorithm' },
  { featureGroup: '', feature: 'Virtual Service Visit (AR)', initiativeType: 'New Feature Introduction', endUserCategory: 'Intelligence & Automation', monetizationModel: 'Paid', priority: 3, development: 'UI + Data + Algorithm' },
  { featureGroup: 'Dealer–Homeowner Relationship & Growth (AI‑Powered)', feature: 'Personalized efficiency reports', initiativeType: 'New Feature Introduction', endUserCategory: 'Engagement & Personalization', monetizationModel: 'Paid', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: 'Proactive referral program', initiativeType: 'New Feature Introduction', endUserCategory: 'Engagement & Personalization', monetizationModel: 'Paid', priority: 2, development: 'UI + Data' },
  { featureGroup: '', feature: 'Predictive upselling (EOL systems)', initiativeType: 'New Function Introduction', endUserCategory: 'Engagement & Personalization', monetizationModel: 'Paid', priority: 3, development: 'UI + Data + Algorithm' },
  { featureGroup: 'Platform Maintenance', feature: 'Ongoing platform maintenance', initiativeType: 'Sustaining', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI only' },
  { featureGroup: '', feature: 'Data accuracy, uptime & security', initiativeType: 'Sustaining', endUserCategory: 'Trust, Security & Reliability', monetizationModel: 'Basic (Free)', priority: 1, development: 'UI + Data' },
]

/** Execution focus / sequencing; index aligns with `_skyportCareFeaturesRowsRaw`. */
const SKYPORT_CARE_FEATURE_FOCUS_TIMEFRAMES = [
  'Q2 FY26',
  'Q1 FY26',
  'Q1 FY26',
  'Q1 FY26',
  'Q2 FY26',
  'Q2 FY26',
  'Q2 FY26',
  'Q2 FY26',
  'Q2 FY26',
  'FY27+',
  'FY27+',
  'Q3 FY26',
  'Q3 FY26',
  'FY27+',
  'FY27+',
  'Q3 FY26',
  'Q3 FY26',
  'Q3 FY26',
  'Q1 FY26',
  'Q4 FY26',
  'Q3 FY26',
  'Q3 FY26',
  'Q3 FY26',
  'Q3 FY26',
  'Q3 FY26',
  'Q3 FY26',
  'Q4 FY26',
  'Q4 FY26',
  'Q4 FY26',
  'Q4 FY26',
  'FY27+',
  'FY27+',
  'FY27+',
  'FY27+',
  'FY27+',
  'FY27+',
  'FY26 (ongoing)',
  'FY26 (ongoing)',
]

export const skyportCareFeaturesRows = _skyportCareFeaturesRowsRaw.map((row, i) => ({
  ...row,
  focusTimeframe: SKYPORT_CARE_FEATURE_FOCUS_TIMEFRAMES[i] ?? '—',
}))

export const skyportCareFeaturesDone = new Set([])
export const skyportCareFeaturesPartial = new Set([
  'Dealer On-boarding & Set-up',
  'Aggregated summary view',
  'Dealer Report',
  'Homeowner Report',
  'SkyportHome communication w/homeowner (including Dealer brand)',
  'Home Sale Alert',
  'Remote Adjust',
  'Predictive Maintenance (reminders)',
  'Technician Support Tools Alerts (minor & critical errors)',
  'Quality Install',
  'Performance Insights',
])
