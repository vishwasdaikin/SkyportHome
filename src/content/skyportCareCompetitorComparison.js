/**
 * Dealer / HO platform comparison including SkyportCare (SkyportCare page).
 * Synced to reference matrix (Shipshape through SkyportCare).
 */
export const SKYPORT_CARE_COMPETITOR_COLUMNS = [
  { key: 'shipshape', label: 'Shipshape.ai', audience: 'HO' },
  { key: 'resideo', label: 'Resideo ProIQ', audience: 'Dealer' },
  { key: 'comfortAi', label: 'Comfort AI', audience: 'Dealer' },
  { key: 'smartac', label: 'SmartAC.com', audience: 'HO & Dealer' },
  { key: 'measureQuick', label: 'MeasureQuick', audience: 'Dealer' },
  { key: 'skyportCare', label: 'SkyportCare', audience: 'HO & Dealer' },
]

/** First data row: audience by platform (not yes/no icons). */
export const SKYPORT_CARE_FOCUS_ROW = {
  feature: 'Focus',
  ...Object.fromEntries(SKYPORT_CARE_COMPETITOR_COLUMNS.map((c) => [c.key, c.audience])),
}

/** @type {{ feature: string, shipshape: string, resideo: string, comfortAi: string, smartac: string, measureQuick: string, skyportCare: string }[]} */
export const SKYPORT_CARE_COMPETITOR_ROWS = [
  {
    feature: 'Install & commission',
    shipshape: '❌',
    resideo: '✅ (ProIQ Install)',
    comfortAi: '❌',
    smartac: '❌',
    measureQuick: '✅',
    skyportCare: '✅ (QI)',
  },
  {
    feature: 'Dealer Report',
    shipshape: '❌',
    resideo: '❌',
    comfortAi: '❌',
    smartac: '❌',
    measureQuick: '✅',
    skyportCare: '✅',
  },
  {
    feature: 'HO Report',
    shipshape: '❌',
    resideo: '❌',
    comfortAi: '❌',
    smartac: '❌',
    measureQuick: '✅',
    skyportCare: '✅',
  },
  {
    feature: 'Home Sale Alert',
    shipshape: '❌',
    resideo: '❌',
    comfortAi: '❌',
    smartac: '❌',
    measureQuick: '❌',
    skyportCare: '✅',
  },
  {
    feature: 'Predictive Maintenance',
    shipshape: '✅ (Alert Actions)',
    resideo: '✅ (ProIQ Advanced)',
    comfortAi: '✅',
    smartac: '✅',
    measureQuick: '✅ (VitalsScore) Health scoring',
    skyportCare: '✅',
  },
  {
    feature: 'AI Diagnostics',
    shipshape: '✅',
    resideo: '✅',
    comfortAi: '✅',
    smartac: '❌ Basic',
    measureQuick: '❌ Basic',
    skyportCare: '❌',
  },
  {
    feature: 'Internal Telemetry',
    shipshape: '❌',
    resideo: '❌',
    comfortAi: '✅',
    smartac: '❌',
    measureQuick: '✅',
    skyportCare: '✅',
  },
  {
    feature: 'Remote Adjust',
    shipshape: '❌',
    resideo: '❌',
    comfortAi: '❌',
    smartac: '❌',
    measureQuick: '❌',
    skyportCare: '✅',
  },
  {
    feature: 'Auto-Fix Error',
    shipshape: '❌',
    resideo: '❌',
    comfortAi: '❌',
    smartac: '❌',
    measureQuick: '❌',
    skyportCare: '❌',
  },
  {
    feature: 'Technician Support Tools Alerts',
    shipshape: '❌',
    resideo: '✅ (Resideo Academy)',
    comfortAi: '✅',
    smartac: '✅',
    measureQuick: '✅ (Diagnostics, training)',
    skyportCare: '✅',
  },
  {
    feature: 'Upgrade Recommendation',
    shipshape: '❌',
    resideo: '✅ (Analyze module)',
    comfortAi: '❌',
    smartac: '❌',
    measureQuick: '❌',
    skyportCare: '❌',
  },
  {
    feature: 'Membership Monetization',
    shipshape: '❌',
    resideo: '❌',
    comfortAi: '❌',
    smartac: '✅ (Accelerator Program) - grow recurring revenue',
    measureQuick: '❌',
    skyportCare: '❌',
  },
  {
    feature: 'Dealer Branding',
    shipshape: '✅',
    resideo: '✅ ProIQ Engage',
    comfortAi: '❌',
    smartac: '✅',
    measureQuick: '❌',
    skyportCare: '❌',
  },
]
