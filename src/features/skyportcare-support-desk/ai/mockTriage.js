/**
 * Deterministic stand-in for LLM triage + draft (v1 demo, no network).
 * Replace with server call that runs {@link ./promptTemplates.js} against your model.
 */

import {
  ISSUE_CATEGORY,
  ISSUE_CATEGORY_LABEL,
  SUPPORT_PRODUCT,
  TICKET_STATUS,
} from '../model/types.js'

const TYPE_KEYWORDS = [
  { type: ISSUE_CATEGORY.LOGIN, words: ['login', 'password', 'sign in', 'auth', 'locked', 'mfa', 'sso'] },
  { type: ISSUE_CATEGORY.CONNECTIVITY, words: ['offline', 'disconnect', 'wifi', 'network', 'latency', 'timeout', 'signal'] },
  { type: ISSUE_CATEGORY.DEVICE_PAIRING, words: ['pair', 'pairing', 'commission', 'thermostat', 'odu', 'idu', 'serial'] },
  { type: ISSUE_CATEGORY.BILLING, words: ['invoice', 'license', 'payment', 'renewal', 'subscription', 'billing'] },
  { type: ISSUE_CATEGORY.DATA_SYNC, words: ['sync', 'data', 'missing', 'delay', 'not updating', 'cloud'] },
  { type: ISSUE_CATEGORY.DEALER_SETUP, words: ['dealer', 'org', 'team', 'invite', 'role', 'permission'] },
  { type: ISSUE_CATEGORY.COMMISSIONING, words: ['commission', 'setup wizard', 'test', 'startup'] },
]

function scoreIssueType(text) {
  const t = text.toLowerCase()
  let best = { type: ISSUE_CATEGORY.UNKNOWN, score: 0 }
  for (const { type, words } of TYPE_KEYWORDS) {
    let s = 0
    for (const w of words) if (t.includes(w)) s += 1
    if (s > best.score) best = { type, score: s }
  }
  const confidence = Math.min(0.92, 0.35 + best.score * 0.12 + (t.length > 80 ? 0.08 : 0))
  return { issueType: best.score ? best.type : ISSUE_CATEGORY.UNKNOWN, confidence }
}

function tokens(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
}

function jaccard(a, b) {
  const A = new Set(a)
  const B = new Set(b)
  let inter = 0
  for (const x of A) if (B.has(x)) inter++
  const union = A.size + B.size - inter
  return union ? inter / union : 0
}

/**
 * @param {import('../model/types.js').SupportTicket} ticket
 * @param {{ tickets: import('../model/types.js').SupportTicket[], docs: Array<{ id: string, title: string, bodyMarkdown: string }> }} ctx
 */
export async function runMockTriage(ticket, ctx) {
  await new Promise((r) => setTimeout(r, 220))
  const text = `${ticket.customerEmail ? `${ticket.customerEmail} ` : ''}${ticket.issueDescription} ${ticket.product}`
  const { issueType, confidence } = scoreIssueType(text)
  const kw = [...new Set(tokens(ticket.issueDescription))].slice(0, 10)
  const symptoms = kw.slice(0, 3).map((k) => `Reports around “${k}”`)

  const others = ctx.tickets.filter((x) => x.id !== ticket.id && x.status === TICKET_STATUS.CLOSED)
  const scored = others
    .map((t) => ({ t, score: jaccard(kw, tokens(t.issueDescription)) }))
    .filter((x) => x.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  const similarTicketIds = scored.map((x) => x.t.id)
  const docHits = ctx.docs
    .map((d) => ({
      d,
      score: jaccard(kw, tokens(`${d.title} ${d.bodyMarkdown}`)),
    }))
    .filter((x) => x.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
  const linkedDocIds = docHits.map((x) => x.d.id)

  const product =
    ticket.product && ticket.product !== SUPPORT_PRODUCT.OTHER ? ticket.product : SUPPORT_PRODUCT.SKYPORTCARE

  const possibleKnowledgeGap = confidence < 0.55 || issueType === ISSUE_CATEGORY.UNKNOWN

  const aiAnalysis = {
    issueType,
    affectedProduct: product,
    keywords: kw,
    symptoms,
    confidence,
    similarTicketIds,
    linkedDocIds,
    possibleKnowledgeGap,
  }

  const docSnippets = docHits.map((x) => `[doc ${x.d.id}] ${x.d.title}: ${x.d.bodyMarkdown.slice(0, 280)}…`)
  const ticketSnippets = scored.map(
    (x) => `[ticket ${x.t.id}] (resolved) ${x.t.issueDescription.slice(0, 200)}…`,
  )
  const draftParts = [
    `Hi — thanks for reaching out regarding ${ISSUE_CATEGORY_LABEL[issueType] ?? 'your issue'}.`,
    possibleKnowledgeGap
      ? 'We may need one more detail: approximate time the issue started, and whether other sites/devices show the same behavior.'
      : 'Based on similar cases, please try: confirm the thermostat is online in SkyportHome, then refresh SkyportCare and re-open the customer record.',
    docSnippets.length ? `See internal: ${docSnippets[0]}` : '',
    ticketSnippets.length ? `Related resolved case: ${ticketSnippets[0]}` : '',
    'This is an AI-suggested draft — edit before sending.',
  ].filter(Boolean)

  const draftResponse = {
    text: draftParts.join('\n\n'),
    generatedAt: new Date().toISOString(),
    sourcesUsed: [
      ...linkedDocIds.map((id) => ({ type: 'doc', id })),
      ...similarTicketIds.map((id) => ({ type: 'ticket', id })),
    ],
  }

  return { aiAnalysis, draftResponse }
}
