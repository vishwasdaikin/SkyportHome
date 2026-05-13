/**
 * AI orchestration — prompt contracts (classification + response drafting).
 *
 * v1: The app uses {@link ../api/mockTriage.js} for deterministic demo behavior.
 * Wire these templates to your LLM + embedding pipeline; keep human-in-the-loop
 * boundaries explicit (suggestions vs committed `finalResponse`).
 */

/** System + user shape for automatic triage after ticket creation. */
export const CLASSIFICATION_SYSTEM_PROMPT = `You are an internal SkyportCare support triage assistant.
Classify dealer/installer issues into ONE primary issue type and identify the affected product.
Output STRICT JSON only (no markdown), schema:
{
  "issueType": "connectivity" | "login" | "device_pairing" | "billing" | "data_sync" | "dealer_setup" | "commissioning" | "unknown",
  "affectedProduct": "skyportcare" | "skyport_home" | "thermostat" | "cloud_services" | "dealer_portal" | "other",
  "keywords": string[],
  "symptoms": string[],
  "confidence": number,
  "possibleKnowledgeGap": boolean
}
Rules:
- confidence is 0..1 reflecting certainty of issueType + affectedProduct together.
- possibleKnowledgeGap true if confidence < 0.55 OR issueType is unknown OR description is very vague.
- keywords: 5–12 salient tokens (no PII).
- symptoms: short phrases describing what the user experiences (max 5).`

export function classificationUserPrompt({ issueDescription, productHint, source }) {
  return `Ticket source: ${source}
Reporter-selected product (may be wrong): ${productHint}

Issue description:
"""
${issueDescription}
"""
Return JSON only.`
}

/** Grounded response draft — docs + similar tickets passed as context blocks. */
export const RESPONSE_DRAFT_SYSTEM_PROMPT = `You are drafting an INTERNAL suggested reply for a SkyportCare support agent.
The reply may be sent to a dealer/installer after human review. Do not promise legal commitments or unpublished roadmap.
Use ONLY the provided CONTEXT snippets; if context is insufficient, say what is missing and suggest next diagnostic questions.
Tone: concise, professional, helpful.
Output STRICT JSON: { "draft": string, "citations": { "docIds": string[], "ticketIds": string[] } }
citations must list ids you actually relied on from CONTEXT.`

export function responseDraftUserPrompt({ issueDescription, aiAnalysis, contextBlocks }) {
  const ctx = contextBlocks.join('\n---\n')
  return `AI triage summary:
${JSON.stringify(aiAnalysis, null, 2)}

CONTEXT (docs + resolved tickets):
---
${ctx}
---

Original issue:
"""
${issueDescription}
"""

Return JSON with "draft" and "citations".`
}

/** Optional: embedding query text builder (for your vector store). */
export function embeddingQueryForTicket(ticket) {
  const parts = [ticket.issueDescription, ticket.product, ticket.issueCategory].filter(Boolean)
  return parts.join('\n').slice(0, 8000)
}
