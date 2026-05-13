import { nextTicketId, TICKET_SOURCE, TICKET_STATUS } from '../model/types.js'
import { SEED_KNOWLEDGE_DOCS } from '../knowledge/seedDocs.js'
import { loadDeskState, saveDeskState } from '../storage/localTicketStore.js'
import { runMockTriage } from '../ai/mockTriage.js'
import {
  notifyCustomerTicketConfirmation,
  notifyTicketAssigned,
  notifyTicketCreated,
} from '../notifications/outboundEmails.js'

function cloneState() {
  const s = loadDeskState()
  return {
    tickets: [...s.tickets],
    docs: s.docs.length ? [...s.docs] : [...SEED_KNOWLEDGE_DOCS],
    seq: s.seq || 0,
  }
}

/** Seed a few resolved tickets for similarity search when store is empty. */
function seedResolvedIfEmpty(tickets) {
  if (tickets.length > 0) return tickets
  const now = new Date().toISOString()
  return [
    {
      id: 'SC-2026-00001',
      createdAt: now,
      issueDescription:
        'Dealer reports thermostat offline after router swap — SkyportHome shows disconnected.',
      product: 'thermostat',
      issueCategory: 'connectivity',
      issueCategoryConfidence: 0.82,
      status: TICKET_STATUS.CLOSED,
      owner: 'demo.agent',
      source: TICKET_SOURCE.EMAIL,
      aiAnalysis: null,
      draftResponse: null,
      finalResponse: {
        text: 'Asked dealer to re-pair stat to Wi-Fi and confirm UDP outbound; resolved after firmware refresh.',
        sentAt: now,
        editedFromDraft: true,
      },
      firstResponseAt: now,
      closedAt: now,
      reopenedCount: 0,
      assignedAt: null,
      customerEmail: null,
      customerAttachments: null,
    },
    {
      id: 'SC-2026-00002',
      createdAt: now,
      issueDescription: 'Cannot renew license — Extend License button greyed out for one customer.',
      product: 'skyportcare',
      issueCategory: 'billing',
      issueCategoryConfidence: 0.76,
      status: TICKET_STATUS.CLOSED,
      owner: null,
      source: TICKET_SOURCE.WEB,
      aiAnalysis: null,
      draftResponse: null,
      finalResponse: {
        text: 'Access expired banner; dealer purchased lifetime renewal via standard checkout.',
        sentAt: now,
        editedFromDraft: false,
      },
      firstResponseAt: now,
      closedAt: now,
      reopenedCount: 0,
      assignedAt: null,
      customerEmail: null,
      customerAttachments: null,
    },
  ]
}

export async function listTickets({ status, product, q } = {}) {
  let { tickets, docs } = cloneState()
  tickets = seedResolvedIfEmpty(tickets)
  if (status) tickets = tickets.filter((t) => t.status === status)
  if (product) tickets = tickets.filter((t) => t.product === product)
  if (q?.trim()) {
    const n = q.trim().toLowerCase()
    tickets = tickets.filter(
      (t) =>
        t.issueDescription.toLowerCase().includes(n) ||
        t.id.toLowerCase().includes(n) ||
        (t.owner && t.owner.toLowerCase().includes(n)),
    )
  }
  tickets.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return { tickets, docs }
}

export async function getTicket(ticketId) {
  const { tickets, docs } = await listTickets({})
  const t = tickets.find((x) => x.id === ticketId)
  return t ? { ticket: t, docs } : { ticket: null, docs }
}

export async function createTicket({
  issueDescription,
  product,
  source = TICKET_SOURCE.WEB,
  owner = null,
  customerEmail = null,
  customerAttachments = null,
}) {
  let state = cloneState()
  state.tickets = seedResolvedIfEmpty(state.tickets)
  const id = nextTicketId(state.tickets.map((t) => t.id))
  const createdAt = new Date().toISOString()
  const cust = customerEmail && String(customerEmail).trim() ? String(customerEmail).trim().toLowerCase() : null
  const atts =
    Array.isArray(customerAttachments) && customerAttachments.length > 0
      ? customerAttachments.slice(0, 3)
      : null
  /** @type {import('../model/types.js').SupportTicket} */
  const ticket = {
    id,
    createdAt,
    issueDescription: String(issueDescription || '').trim(),
    product,
    issueCategory: 'unknown',
    issueCategoryConfidence: 0,
    status: TICKET_STATUS.NEW,
    owner,
    source,
    aiAnalysis: null,
    draftResponse: null,
    finalResponse: null,
    firstResponseAt: null,
    closedAt: null,
    reopenedCount: 0,
    assignedAt: null,
    customerEmail: cust,
    customerAttachments: atts,
  }
  if (!ticket.issueDescription) throw new Error('Issue description is required')
  if (source === TICKET_SOURCE.CUSTOMER_WEB && !cust) {
    throw new Error('Customer email is required for public intake tickets')
  }

  const { aiAnalysis, draftResponse } = await runMockTriage(ticket, {
    tickets: state.tickets,
    docs: state.docs.length ? state.docs : [...SEED_KNOWLEDGE_DOCS],
  })
  ticket.aiAnalysis = aiAnalysis
  ticket.issueCategory = aiAnalysis.issueType
  ticket.issueCategoryConfidence = aiAnalysis.confidence
  ticket.draftResponse = draftResponse

  state.tickets = [ticket, ...state.tickets]
  saveDeskState(state)
  void notifyTicketCreated(ticket).catch(() => {})
  if (cust) {
    void notifyCustomerTicketConfirmation({ ticket, customerEmail: cust }).catch(() => {})
  }
  return ticket
}

export async function updateTicket(ticketId, patch) {
  const state = cloneState()
  state.tickets = seedResolvedIfEmpty(state.tickets)
  const i = state.tickets.findIndex((t) => t.id === ticketId)
  if (i === -1) throw new Error('Ticket not found')
  const prev = state.tickets[i]
  const next = { ...prev, ...patch }
  if (patch.humanCategoryOverride) {
    next.issueCategory = patch.humanCategoryOverride
    next.issueCategoryConfidence = 1
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'owner')) {
    const raw = patch.owner
    next.owner = typeof raw === 'string' && raw.trim() ? raw.trim().toLowerCase() : null
    const prevOwner = prev.owner ?? null
    const newOwner = next.owner
    if (newOwner && newOwner !== prevOwner) {
      next.assignedAt = new Date().toISOString()
    }
  }
  if (patch.status === TICKET_STATUS.RESPONDED && !prev.firstResponseAt) {
    next.firstResponseAt = new Date().toISOString()
  }
  if (patch.status === TICKET_STATUS.CLOSED) {
    next.closedAt = new Date().toISOString()
  }
  state.tickets[i] = next
  saveDeskState(state)
  if (Object.prototype.hasOwnProperty.call(patch, 'owner')) {
    const prevOwner = prev.owner ?? null
    const newOwner = next.owner ?? null
    if (newOwner && newOwner !== prevOwner) {
      void notifyTicketAssigned(next, { previousOwner: prevOwner }).catch(() => {})
    }
  }
  return next
}

export async function regenerateDraft(ticketId) {
  const { ticket } = await getTicket(ticketId)
  if (!ticket) throw new Error('Ticket not found')
  const { tickets, docs } = await listTickets({})
  const { draftResponse, aiAnalysis } = await runMockTriage(ticket, { tickets, docs })
  return updateTicket(ticketId, { draftResponse, aiAnalysis })
}

export async function listKnowledgeDocs() {
  const { docs } = cloneState()
  return docs.length ? docs : [...SEED_KNOWLEDGE_DOCS]
}

export async function addKnowledgeDoc({ title, product, bodyMarkdown }) {
  const state = cloneState()
  const docs = state.docs.length ? state.docs : [...SEED_KNOWLEDGE_DOCS]
  const id = `doc-${Date.now()}`
  docs.push({
    id,
    title: title || 'Untitled',
    product: product || 'other',
    bodyMarkdown: bodyMarkdown || '',
  })
  state.docs = docs
  saveDeskState(state)
  return docs[docs.length - 1]
}

export async function analyticsSnapshot() {
  const { tickets } = await listTickets({})
  const open = tickets.filter((t) => t.status !== TICKET_STATUS.CLOSED).length
  const closed = tickets.length - open
  const byType = {}
  const byProduct = {}
  let lowConfidence = 0
  for (const t of tickets) {
    const cat = t.humanCategoryOverride || t.issueCategory || 'unknown'
    byType[cat] = (byType[cat] || 0) + 1
    byProduct[t.product] = (byProduct[t.product] || 0) + 1
    const c = t.aiAnalysis?.confidence ?? t.issueCategoryConfidence ?? 0
    if (t.aiAnalysis?.possibleKnowledgeGap || c < 0.55) lowConfidence += 1
  }
  const responseTimesMin = tickets
    .filter((t) => t.firstResponseAt && t.createdAt)
    .map((t) => (new Date(t.firstResponseAt) - new Date(t.createdAt)) / 60000)
  const avgFirstResponseMin =
    responseTimesMin.length > 0
      ? Math.round(responseTimesMin.reduce((a, b) => a + b, 0) / responseTimesMin.length)
      : null
  return {
    total: tickets.length,
    open,
    closed,
    byType,
    byProduct,
    knowledgeGapTickets: lowConfidence,
    avgFirstResponseMin,
    reopened: tickets.reduce((n, t) => n + (t.reopenedCount || 0), 0),
  }
}
