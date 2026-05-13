import stepData from './skyportCareDealerSupportStepImages.json'
import highlightData from './skyportCareDealerSupportImageHighlights.json'

/** Public folder: `public/support/skyportcare-dealer-help/` */
export function supportGuideAssetUrl(filename) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  return `${base}support/skyportcare-dealer-help/${encodeURIComponent(filename)}`
}

/** Filenames for one numbered step (0-based index = Step 1). */
export function getStepImagesForArticle(articleId, stepIndex) {
  const m = stepData.stepImagesByArticleId[articleId]
  return m?.[String(stepIndex)] ?? []
}

/** Screenshots paired with a specific FAQ article (from the Word “Frequently Asked Questions” section). */
export function getFaqArticleImages(articleId) {
  return stepData.faqImagesByArticleId[articleId] ?? []
}

/**
 * Orange CTA highlight boxes (percent of image size). `instanceKey` e.g. `sso-account-setup:3:0`
 */
export function getImageCtaHighlights(filename, instanceKey) {
  if (instanceKey && highlightData.byInstanceKey?.[instanceKey]?.length) {
    return highlightData.byInstanceKey[instanceKey]
  }
  return highlightData.byFilename?.[filename] ?? []
}
