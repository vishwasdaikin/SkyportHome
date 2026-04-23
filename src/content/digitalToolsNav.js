/**
 * Digital Tools top nav + `/digital-tools` tiles: Product Board deep links (`?product=`).
 */

export const DIGITAL_TOOLS_PATH = '/digital-tools'

/** @type {{ productId: string, label: string, summary: string }[]} */
export const DIGITAL_TOOLS_ITEMS = [
  {
    productId: 'techhub',
    label: 'TechHub',
    summary:
      'One place for technical content, tools, and answers for dealers and field teams.',
  },
  {
    productId: 'hvac-learning-campus',
    label: 'HVAC Learning Campus',
    summary:
      'Training and certification for HVAC professionals—role-relevant paths aligned to products and field needs.',
  },
  {
    productId: 'daikin-city',
    label: 'Daikin City',
    summary:
      "Empower HVAC professionals to learn, grow, and perform at their best through a centralized, intuitive learning ecosystem—aligned with Daikin's products, technologies, and long-term business needs.",
  },
]

export function productBoardPathForDigitalTool(productId) {
  return `/product-board?product=${encodeURIComponent(productId)}`
}
