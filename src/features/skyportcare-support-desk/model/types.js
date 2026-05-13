/**
 * SkyportCare internal support desk — canonical enums and field shapes.
 * Persistence: see ../storage/localTicketStore.js (v1: localStorage demo).
 */

/** @typedef {'new' | 'in_review' | 'responded' | 'closed'} TicketStatus */
export const TICKET_STATUS = {
  NEW: 'new',
  IN_REVIEW: 'in_review',
  RESPONDED: 'responded',
  CLOSED: 'closed',
}

/** @typedef {'skyportcare' | 'skyport_home' | 'thermostat' | 'cloud_services' | 'dealer_portal' | 'other'} SupportProduct */
export const SUPPORT_PRODUCT = {
  SKYPORTCARE: 'skyportcare',
  SKYPORT_HOME: 'skyport_home',
  THERMOSTAT: 'thermostat',
  CLOUD_SERVICES: 'cloud_services',
  DEALER_PORTAL: 'dealer_portal',
  OTHER: 'other',
}

export const SUPPORT_PRODUCT_LABEL = {
  [SUPPORT_PRODUCT.SKYPORTCARE]: 'SkyportCare',
  [SUPPORT_PRODUCT.SKYPORT_HOME]: 'SkyportHome',
  [SUPPORT_PRODUCT.THERMOSTAT]: 'Thermostat',
  [SUPPORT_PRODUCT.CLOUD_SERVICES]: 'Cloud Services',
  [SUPPORT_PRODUCT.DEALER_PORTAL]: 'Dealer portal',
  [SUPPORT_PRODUCT.OTHER]: 'Other',
}

/**
 * AI / human issue taxonomy (subset aligned with triage prompt).
 * @typedef {'connectivity' | 'login' | 'device_pairing' | 'billing' | 'data_sync' | 'dealer_setup' | 'commissioning' | 'unknown'} IssueCategory
 */
export const ISSUE_CATEGORY = {
  CONNECTIVITY: 'connectivity',
  LOGIN: 'login',
  DEVICE_PAIRING: 'device_pairing',
  BILLING: 'billing',
  DATA_SYNC: 'data_sync',
  DEALER_SETUP: 'dealer_setup',
  COMMISSIONING: 'commissioning',
  UNKNOWN: 'unknown',
}

export const ISSUE_CATEGORY_LABEL = {
  [ISSUE_CATEGORY.CONNECTIVITY]: 'Connectivity',
  [ISSUE_CATEGORY.LOGIN]: 'Login / auth',
  [ISSUE_CATEGORY.DEVICE_PAIRING]: 'Device pairing',
  [ISSUE_CATEGORY.BILLING]: 'Billing / licenses',
  [ISSUE_CATEGORY.DATA_SYNC]: 'Data sync',
  [ISSUE_CATEGORY.DEALER_SETUP]: 'Dealer setup',
  [ISSUE_CATEGORY.COMMISSIONING]: 'Commissioning',
  [ISSUE_CATEGORY.UNKNOWN]: 'Unknown',
}

/** @typedef {'web' | 'email' | 'internal' | 'customer_web'} TicketSource */
export const TICKET_SOURCE = {
  WEB: 'web',
  EMAIL: 'email',
  INTERNAL: 'internal',
  /** Public customer intake — no portal; channel is email-only after submit. */
  CUSTOMER_WEB: 'customer_web',
}

export const TICKET_SOURCE_LABEL = {
  [TICKET_SOURCE.WEB]: 'Web form',
  [TICKET_SOURCE.EMAIL]: 'Email',
  [TICKET_SOURCE.INTERNAL]: 'Internal',
  [TICKET_SOURCE.CUSTOMER_WEB]: 'Customer (public form)',
}

/**
 * @typedef {Object} CitationRef
 * @property {'doc' | 'ticket'} type
 * @property {string} id
 * @property {string} [title]
 */

/**
 * @typedef {Object} AiAnalysis
 * @property {IssueCategory} issueType
 * @property {SupportProduct} affectedProduct
 * @property {string[]} keywords
 * @property {string[]} symptoms
 * @property {number} confidence — 0..1
 * @property {string[]} similarTicketIds
 * @property {string[]} linkedDocIds
 * @property {boolean} possibleKnowledgeGap — low confidence or unknown type
 */

/**
 * @typedef {Object} DraftResponse
 * @property {string} text
 * @property {string} generatedAt — ISO
 * @property {CitationRef[]} sourcesUsed
 */

/**
 * @typedef {Object} FinalResponse
 * @property {string} text
 * @property {string} [sentAt] — ISO
 * @property {boolean} editedFromDraft
 */

/**
 * @typedef {Object} SupportTicket
 * @property {string} id
 * @property {string} createdAt
 * @property {string} issueDescription
 * @property {SupportProduct} product
 * @property {IssueCategory} issueCategory
 * @property {number} issueCategoryConfidence
 * @property {TicketStatus} status
 * @property {string|null} owner
 * @property {TicketSource} source
 * @property {AiAnalysis|null} aiAnalysis
 * @property {DraftResponse|null} draftResponse
 * @property {FinalResponse|null} finalResponse
 * @property {IssueCategory|null} [humanCategoryOverride]
 * @property {string|null} [firstResponseAt]
 * @property {string|null} [closedAt]
 * @property {number} reopenedCount
 * @property {string|null} [customerEmail] — public intake only; never shown to customer in-app (no portal)
 * @property {Array<{ filename: string, mimeType: string, sizeBytes: number, dataUrl: string }>|null} [customerAttachments]
 */

export function nextTicketId(existingIds) {
  const year = new Date().getFullYear()
  let max = 0
  const re = new RegExp(`^SC-${year}-(\\d+)$`)
  for (const id of existingIds) {
    const m = id.match(re)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  const n = String(max + 1).padStart(5, '0')
  return `SC-${year}-${n}`
}
