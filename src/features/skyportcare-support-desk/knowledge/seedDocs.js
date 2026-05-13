/** @typedef {{ id: string, title: string, product: string, bodyMarkdown: string }} KnowledgeDoc */

/** @type {KnowledgeDoc[]} */
export const SEED_KNOWLEDGE_DOCS = [
  {
    id: 'doc-login-skyportcare',
    title: 'SkyportCare: login and session issues',
    product: 'skyportcare',
    bodyMarkdown:
      'If dealers cannot log in, verify SSO vs local account, clear site data for skyportcare domain, and confirm the user is not locked after repeated failures. Escalate to identity if MFA loops.',
  },
  {
    id: 'doc-connectivity-thermostat',
    title: 'Thermostat offline / connectivity triage',
    product: 'thermostat',
    bodyMarkdown:
      'Check Wi-Fi signal at the stat, router firewall rules, and whether SkyportHome shows the device online. Ask for outdoor unit serial if cloud path is suspected.',
  },
  {
    id: 'doc-license-renewal',
    title: 'Cloud Services license renewal',
    product: 'cloud_services',
    bodyMarkdown:
      'Lifetime vs annual renewal flows, Extend License CTA in customer detail, and KinPay handoff. Warranty Express uses outdoor serial activation path.',
  },
  {
    id: 'doc-dealer-invite',
    title: 'Inviting customers and team roles',
    product: 'skyportcare',
    bodyMarkdown:
      'Add Customer uses SkyportHome email. Team Members: admin vs tech permissions for invites and billing visibility.',
  },
]
