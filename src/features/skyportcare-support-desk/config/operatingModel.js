/**
 * Internal support desk — ownership & notification audience (v1 config via env).
 * Email delivery is delegated to {@link ../notifications/outboundEmails.js} (webhook or future worker).
 */

function splitEmails(raw) {
  if (!raw || typeof raw !== 'string') return []
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** Primary owner (1) — receives operational payloads in notification webhook body. */
export function getSupportDeskPrimaryOwnerEmail() {
  const v = import.meta.env.VITE_SUPPORT_DESK_OWNER_EMAIL
  return typeof v === 'string' && v.includes('@') ? v.trim().toLowerCase() : ''
}

/** Optional backup inboxes (comma / semicolon / whitespace separated). */
export function getSupportDeskBackupOwnerEmails() {
  return splitEmails(import.meta.env.VITE_SUPPORT_DESK_BACKUP_EMAILS ?? '')
}

/** All configured owner inboxes for “who to alert” metadata (server should dedupe). */
export function getSupportDeskOwnerInboxList() {
  const primary = getSupportDeskPrimaryOwnerEmail()
  const backups = getSupportDeskBackupOwnerEmails()
  return [...new Set([...(primary ? [primary] : []), ...backups])]
}
