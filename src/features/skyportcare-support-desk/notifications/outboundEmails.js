/**
 * Outbound alerting for the support desk.
 *
 * v1: POST JSON to `VITE_SUPPORT_DESK_NOTIFY_WEBHOOK_URL` (e.g. Zapier, n8n, Azure Logic App, or a tiny
 * serverless that calls SendGrid/Resend). The SPA must not hold SMTP secrets — email is always server-side.
 *
 * When no webhook is configured, logs a structured line so devs see what would fire in production.
 */

import { getSupportDeskOwnerInboxList } from '../config/operatingModel.js'

const WEBHOOK = typeof import.meta.env?.VITE_SUPPORT_DESK_NOTIFY_WEBHOOK_URL === 'string'
  ? import.meta.env.VITE_SUPPORT_DESK_NOTIFY_WEBHOOK_URL.trim()
  : ''

function basePayload() {
  return {
    app: 'skyportcare-support-desk',
    ownerInboxes: getSupportDeskOwnerInboxList(),
    ts: new Date().toISOString(),
  }
}

function logDev(event, body) {
  if (import.meta.env.DEV) {
    const log = typeof console !== 'undefined' && console.info ? console.info.bind(console) : () => {}
    log(`[support-desk:notify] ${event}`, body)
  }
}

async function postWebhook(body) {
  if (!WEBHOOK) {
    logDev(body.event, body)
    return { ok: true, mode: 'log' }
  }
  try {
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'omit',
    })
    if (!res.ok) {
      logDev('webhook_error', { status: res.status, body })
      return { ok: false, mode: 'webhook', status: res.status }
    }
    return { ok: true, mode: 'webhook' }
  } catch (e) {
    logDev('webhook_exception', { message: String(e?.message || e) })
    return { ok: false, mode: 'webhook', error: String(e?.message || e) }
  }
}

/** New ticket — interrupt so owners do not rely on checking the app. */
export async function notifyTicketCreated(ticket) {
  const body = {
    ...basePayload(),
    event: 'ticket.created',
    subject: `[Support desk] New ticket ${ticket.id}`,
    ticket: {
      id: ticket.id,
      createdAt: ticket.createdAt,
      product: ticket.product,
      category: ticket.issueCategory,
      preview: ticket.issueDescription.slice(0, 200),
      owner: ticket.owner ?? null,
      customerEmail: ticket.customerEmail ?? null,
      source: ticket.source ?? null,
      attachmentCount: ticket.customerAttachments?.length ?? 0,
    },
    /** Hint for mailer: deep link into app (adjust origin in server template if needed). */
    suggestedAppUrl:
      typeof window !== 'undefined'
        ? `${window.location.origin}/internal/support-desk/tickets/${encodeURIComponent(ticket.id)}`
        : null,
  }
  return postWebhook(body)
}

/** Assignment changed — alert the assignee (and optionally owners per server policy). */
export async function notifyTicketAssigned(ticket, { previousOwner } = {}) {
  const body = {
    ...basePayload(),
    event: 'ticket.assigned',
    subject: `[Support desk] Assigned: ${ticket.id}`,
    ticket: {
      id: ticket.id,
      product: ticket.product,
      owner: ticket.owner ?? null,
      previousOwner: previousOwner ?? null,
      preview: ticket.issueDescription.slice(0, 200),
    },
    suggestedAppUrl:
      typeof window !== 'undefined'
        ? `${window.location.origin}/internal/support-desk/tickets/${encodeURIComponent(ticket.id)}`
        : null,
  }
  return postWebhook(body)
}

/**
 * Customer-facing confirmation — must be sent by your mailer (webhook).
 * All ongoing dialogue with the customer is by email; they never use the internal app.
 */
export async function notifyCustomerTicketConfirmation({ ticket, customerEmail }) {
  const body = {
    ...basePayload(),
    event: 'ticket.customer_confirmation',
    subject: `We received your request — ticket ${ticket.id}`,
    toCustomer: customerEmail,
    ticket: {
      id: ticket.id,
      product: ticket.product,
    },
    /** Mailer should send plain email with ticket ID + “support is reviewing”. */
    emailTemplate: {
      headline: 'Thanks — we have your request',
      bodyLines: [
        `Your ticket ID is ${ticket.id}.`,
        'Our support team is reviewing your issue.',
        'You will receive follow-up by email from our team. Please do not share this link; there is no customer portal for this request.',
      ],
    },
  }
  return postWebhook(body)
}
