/**
 * Nest, Ecobee & Trane Home capability comparison (SkyportHome page).
 * Synced to product research reference matrix.
 */
export const SKYPORT_HOME_NEST_ECOBEE_COMPARISON = [
  {
    title: 'Admin Controls',
    rows: [
      { feature: 'Account Transfer', nest: 'Hard', ecobee: 'Easy', trane: 'Easy' },
      { feature: 'Multi-User Support', nest: '✅ Household', ecobee: '✅ Shared Account', trane: '✅ Multiple Devices' },
      { feature: 'Face ID login support', nest: '✅', ecobee: '✅', trane: '❌' },
      { feature: 'Fingerprint authentication', nest: '✅', ecobee: '✅', trane: '❌' },
      { feature: 'Password update prompts', nest: '❌ web only', ecobee: '❌ web only', trane: '❌ web only' },
    ],
  },
  {
    title: 'User Experience',
    rows: [
      { feature: 'In-app guidance', nest: '❌', ecobee: '✅ Moderate', trane: '❌' },
      { feature: 'Navigation ease', nest: '❌ Mixed', ecobee: '✅ Good', trane: '❌ Clunky' },
      { feature: 'AI Chat', nest: '✅ Gemini', ecobee: '❌', trane: '❌' },
      { feature: 'Unavailable feature visibility', nest: 'Mixed', ecobee: '✅ Hidden', trane: '✅ Hidden' },
      { feature: 'Blue butterfly equivalent', nest: '✅', ecobee: '❌', trane: '❌' },
    ],
  },
  {
    title: 'Remote Control',
    rows: [
      { feature: 'Adjust Temperature', nest: '✅', ecobee: '✅', trane: '✅' },
      {
        feature: 'Schedule comfort settings',
        nest: '✅ Manual, Learning algo',
        ecobee: '✅ Comfort settings: Home, Away, Sleep',
        trane: '✅ Manual but easy set-up',
      },
      { feature: 'Fan Control', nest: 'Limited', ecobee: 'Good', trane: 'Good' },
      { feature: 'Performance Monitoring', nest: 'Energy History', ecobee: 'Energy Reports', trane: 'Diagnostics + IAQ' },
    ],
  },
  {
    title: 'Smart Home & Device Integration',
    rows: [
      { feature: 'Mini splits', nest: '❌ Limited', ecobee: '❌ Limited', trane: '✅ Via Kumo Cloud' },
      { feature: 'Alexa & Google', nest: '✅', ecobee: '✅', trane: '✅' },
      { feature: 'Apple HomeKit', nest: '❌', ecobee: '✅', trane: '❌' },
      { feature: 'Desktop/Web Access', nest: '✅', ecobee: '✅', trane: '✅' },
      { feature: 'Smart watch', nest: 'Limited', ecobee: '✅', trane: '❌' },
      { feature: 'Security Sync', nest: 'Via routines', ecobee: '✅ (Smart security)', trane: '✅ (Z-wave)' },
      { feature: 'Sleep Sync', nest: 'Third-party', ecobee: 'Limited', trane: 'Limited' },
      {
        feature: 'IAQ Integration',
        nest: 'Basic (Nest Protect)',
        ecobee: 'Basic (Humidity)',
        trane: '✅ Advanced (Awair sensors)',
      },
    ],
  },
  {
    title: 'Home Energy Report, Forecasting & Recommendations',
    rows: [
      { feature: 'Daily/Weekly/Monthly Graphs', nest: '✅ (limited)', ecobee: '✅', trane: '✅' },
      { feature: 'Indoor/Outdoor T&H', nest: '✅', ecobee: '✅', trane: '✅' },
      { feature: 'Timestamp-Level Detail', nest: '❌', ecobee: '✅', trane: '✅' },
      { feature: 'Fan Status', nest: '❌', ecobee: '✅', trane: '✅' },
      { feature: 'Run time', nest: '✅', ecobee: '✅', trane: '✅' },
      { feature: 'Inverter vs. Non-Inverter Simulation', nest: '❌', ecobee: '❌', trane: '❌' },
      { feature: 'Recommendations (Carbon/$)', nest: '❌', ecobee: '❌ Very limited', trane: '❌ Very limited' },
      { feature: 'Savings comparison & Improvements', nest: '❌', ecobee: '✅ (efficiency rank)', trane: '❌' },
    ],
  },
  {
    title: 'Adaptive Learning',
    rows: [
      { feature: 'Seasonal Adjustments', nest: '✅ (auto schedule)', ecobee: '✅ (eco+)', trane: '❌' },
      { feature: 'Time of Use ($)', nest: 'Partial', ecobee: 'Partial', trane: '❌' },
      { feature: 'Time of Use (carbon)', nest: '❌', ecobee: '❌', trane: '❌' },
      { feature: 'Predictive Preconditioning', nest: '✅', ecobee: '✅', trane: 'Limited' },
      { feature: 'Smart routines', nest: '✅', ecobee: '✅', trane: 'Limited' },
    ],
  },
  {
    title: 'Away & Geofencing Mode',
    rows: [
      { feature: 'Away Mode', nest: '✅', ecobee: '✅', trane: '✅' },
      { feature: 'Geo-fencing', nest: '✅', ecobee: '✅', trane: '❌' },
      { feature: 'Multiuser presence', nest: '✅', ecobee: '❌', trane: '❌' },
    ],
  },
  {
    title: 'Room & Zone Level Intelligence',
    rows: [
      { feature: 'Zone: Dynamic damper control', nest: '❌', ecobee: '❌', trane: '✅' },
      { feature: 'Zone: Occupancy-Based control', nest: '❌', ecobee: '✅', trane: '❌' },
      { feature: 'Average Temp Across Sensors', nest: '❌', ecobee: '✅', trane: '✅' },
      { feature: 'Setpoint Based on Specific Sensor', nest: '❌', ecobee: '✅', trane: '❌' },
      { feature: 'Pet mode', nest: '❌', ecobee: '❌', trane: '❌' },
    ],
  },
  {
    title: 'Demand Response',
    rows: [{ feature: 'Demand Response', nest: '✅', ecobee: '✅', trane: '✅' }],
  },
  {
    title: 'Smart Maintenance & Diagnostics',
    rows: [
      { feature: 'Self-Diagnosis & Reporting', nest: '❌ Limited', ecobee: '❌ Limited', trane: '✅' },
      { feature: 'Filter Health & Air-quality Monitoring', nest: '❌ Limited', ecobee: '❌ Limited', trane: '✅' },
      { feature: 'Determine runtime anomalies', nest: '❌ Limited', ecobee: '❌ Limited', trane: '✅' },
    ],
  },
  {
    title: 'Mood & Activity Based Settings',
    rows: [
      { feature: 'Mood from smart wearables or voice tone', nest: '❌', ecobee: '❌', trane: '❌' },
      { feature: 'Activity (party, workout, etc.)', nest: '❌', ecobee: '❌', trane: '❌' },
    ],
  },
  {
    title: 'Solar Sync',
    rows: [{ feature: 'HVAC optimization w/solar', nest: '❌', ecobee: '❌', trane: '❌' }],
  },
  {
    title: 'Compressor Lockout',
    rows: [{ feature: 'Fully automatic', nest: '❌', ecobee: '❌', trane: '❌' }],
  },
  {
    title: 'Product & Warranty',
    rows: [
      { feature: 'Auto warranty registration', nest: '❌', ecobee: '❌', trane: '❌' },
      { feature: 'Easy access to all products purchased', nest: '❌', ecobee: '❌', trane: '❌' },
      { feature: 'Easy access to warranty certificates', nest: '❌', ecobee: '❌', trane: '❌' },
    ],
  },
  {
    title: 'Customization & Accessibility',
    rows: [
      { feature: 'Custom Skins & Themes', nest: '❌', ecobee: '❌', trane: '❌' },
      { feature: 'Multi-Language App & Voice Support', nest: '✅', ecobee: '✅', trane: '✅ Limited' },
      { feature: 'Accessibility Mode', nest: '❌', ecobee: '❌', trane: '❌' },
    ],
  },
]
