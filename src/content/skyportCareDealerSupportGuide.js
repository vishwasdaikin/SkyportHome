/**
 * SkyportCare Dealer Support Help Guide — structured from the official dealer help document.
 * Used by the Support FAQ page (search indexes title, category, and all text fields).
 */

import stepImages from './skyportCareDealerSupportStepImages.json'

/** @typedef {{ id: string, category: string, title: string, kind: 'steps' | 'faq', steps?: { label: string, text: string }[], body?: string[], bullets?: string[] }} SupportArticle */

/** @type {SupportArticle[]} */
export const SKYPORT_CARE_DEALER_SUPPORT_ARTICLES = [
  {
    id: 'sso-account-setup',
    category: 'Account',
    title: 'SSO Account Set-up Process',
    kind: 'steps',
    steps: [
      {
        label: 'Step 1',
        text: 'Go to https://skyportcare.daikincomfort.com and click Sign In.',
      },
      { label: 'Step 2', text: 'Click Continue.' },
      { label: 'Step 3', text: 'Click Create Account.' },
      { label: 'Step 4', text: 'Provide all the requested information and click Next.' },
      {
        label: 'Step 5',
        text: 'Type your complete business name (you can filter by state) so we can check if the business already exists in our system.',
      },
      {
        label: 'Step 6',
        text: 'If your business name does not appear, click Add a New Business at the bottom and continue to Step 8. If your business name appears in the dropdown, choose your business and click Next.',
      },
      {
        label: 'Step 7 (final registration)',
        text: 'Check that all the information is correct and click Register.',
      },
      { label: 'Step 8', text: 'Choose your role and click Next.' },
      { label: 'Step 9', text: 'Fill in all the information and click Next.' },
      {
        label: 'Step 10',
        text: 'You may see this step if we find your business in our system from the information you provided. If you see your business name, select it and click Next; you will then see Step 7 (final registration).',
      },
      {
        label: 'Step 11',
        text: 'Select your Distributor and click Next; you will then see Step 7 (final registration).',
      },
    ],
  },
  {
    id: 'sso-account-activation',
    category: 'Account',
    title: 'SSO Account Activation Process',
    kind: 'steps',
    steps: [
      {
        label: 'Step 1',
        text: 'Go to https://skyportcare.daikincomfort.com and click Sign In.',
      },
      {
        label: 'Step 2',
        text: 'Click “I’m the account administrator”.',
      },
      {
        label: 'Step 3',
        text: 'The registration PIN code is sent to the primary email listed for the dealer in PAP (see registration email). Try your 10-digit phone number if you did not receive the email. If it still cannot be found, contact your TSM, who can retrieve the code from the SkyportCare team. Enter the registration code and click Confirm.',
      },
      {
        label: 'Step 4',
        text: 'Confirm business information and click Next.',
      },
      {
        label: 'Step 5',
        text: 'Confirm billing information and click Next.',
      },
      {
        label: 'Step 6',
        text: 'Confirm customer-facing information (information shown on reports, etc.) and upload your business logo (see file requirements in the product).',
      },
      {
        label: 'Step 7',
        text: 'Click Preview Communications to see what your assets will look like, then click Next.',
      },
      {
        label: 'Step 8',
        text: 'Add team members and select the appropriate role. Click Next when done.',
      },
      {
        label: 'Step 9',
        text: 'You can enable automatic invites to customers whose systems are commissioned with the Quality Install process, then click Finish.',
      },
    ],
  },
  {
    id: 'team-member-invite',
    category: 'Invitations',
    title: 'Team Member Invitation Process',
    kind: 'steps',
    steps: [
      { label: 'Step 1', text: 'Click Add Member.' },
      {
        label: 'Step 2',
        text: 'Review role permissions in the product and assign the appropriate role when inviting.',
      },
    ],
  },
  {
    id: 'homeowner-invitation',
    category: 'Invitations',
    title: 'Homeowner Invitation Process',
    kind: 'steps',
    steps: [
      { label: 'Step 1', text: 'Click Add Customer.' },
      {
        label: 'Step 2',
        text: 'Only the email associated with the SkyportHome app account must be entered. All systems and customer contact information load automatically in SkyportCare when the homeowner accepts the invitation.',
      },
    ],
  },
  {
    id: 'license-purchase-renewal',
    category: 'Licenses',
    title: 'License Purchase / Renewal: SkyportCare & Warranty Express',
    kind: 'steps',
    steps: [
      {
        label: 'Step 1',
        text: 'Click Extend License to purchase or extend the customer’s license.',
      },
      {
        label: 'Step 2',
        text: 'Standard purchase: Select the license type and follow the steps to Review Order and Checkout. Warranty Express: Click the blue link “Already purchased with Warranty Express?” and enter the outdoor unit serial number. Coupon code: Use the same blue link and enter the code provided by the Daikin team in the outdoor unit serial number section.',
      },
      {
        label: 'Step 3',
        text: 'Complete payment through KinPay.',
      },
    ],
  },
  {
    id: 'warranty-express-license-purchase',
    category: 'Licenses',
    title: 'Warranty Express License Purchase Process',
    kind: 'steps',
    steps: [
      {
        label: 'Step 1',
        text: 'Go to Warranty Express (Warranty.goodmanmfg.com) and log in with the email address and password from PartnerLink sign-up. Note: The invitation must come from your distributor. The dealer must sign up for Asure (free) and be TIN validated.',
      },
      {
        label: 'Step 2',
        text: 'Select your Distributor and location in the drop-down. If no distributor appears, contact your distributor directly for access.',
      },
      {
        label: 'Step 3',
        text: 'Provide a unique internal contract number (created by you). Enter the serial number of either the furnace or outdoor unit to purchase the plan. Do not use the thermostat serial number. Use ODU or IDU serial number.',
      },
      {
        label: 'Step 4',
        text: 'Complete e-sign and enter the homeowner’s email address. You can choose to send in French if needed.',
      },
      {
        label: 'Step 5',
        text: 'The contract must be on Warranty Express or through Branch in Mincron. Use the blue links to print or view confirmation documents.',
      },
    ],
  },
  {
    id: 'faq-free-lifetime-licenses',
    category: 'FAQ',
    title: 'Dealer: Get 2 Free Lifetime Licenses',
    kind: 'faq',
    body: [
      'The dealer receives two free lifetime licenses when they sign up for SkyportCare, to use at their discretion. During renew/extend, they can choose which system to apply a free lifetime license to.',
    ],
  },
  {
    id: 'faq-license-association',
    category: 'FAQ',
    title: 'License Association: Thermostat, Indoor, or Outdoor System?',
    kind: 'faq',
    body: [
      'On a zoned system you can have multiple indoor units (IDUs); if they connect to one outdoor unit (ODU), you only need one license. The exception is an IDU-only install (furnace or AHU only with no ODU). When commissioning, use the same homeowner email as for the thermostat.',
    ],
  },
  {
    id: 'faq-change-installer',
    category: 'FAQ',
    title: 'Homeowner Instructions: Change Installer',
    kind: 'faq',
    bullets: [
      'Homeowner emails Skyport clearly authorizing removal of their account from the current installer.',
      'Go to the current installer’s organization in the Admin Portal (https://admin.daikinonedealer.com/login), find the customer, and delete the customer.',
      'The new installer invites the customer.',
    ],
  },
  {
    id: 'faq-change-business-email',
    category: 'FAQ',
    title: 'Dealer Instructions: Change Business Information Email',
    kind: 'faq',
    body: [
      'Only the business owner can change this under Business Info; the business owner’s email is required.',
    ],
  },
  {
    id: 'faq-support-emails',
    category: 'FAQ',
    title: 'Support Email: SkyportCare & Warranty Express',
    kind: 'faq',
    bullets: [
      'Warranty Express: warrantyclaims@daikincomfort.com, matthew.cantillon@daikincomfort.com',
      'SkyportCare: daikinone.support@daikincomfort.com',
    ],
  },
  {
    id: 'faq-invite-customers',
    category: 'FAQ',
    title: 'Dealer: Invite Customers',
    kind: 'faq',
    body: [
      'Use Add Customer and the homeowner invitation flow described in “Homeowner Invitation Process” above.',
    ],
  },
  {
    id: 'faq-system-not-showing',
    category: 'FAQ',
    title: 'Homeowner System & Thermostat: Not Showing up on SkyportCare',
    kind: 'faq',
    body: [
      'Confirm the homeowner accepted the invite with the correct SkyportHome email, notifications are enabled, and equipment is commissioned. If issues persist, contact SkyportCare support at daikinone.support@daikincomfort.com with account details.',
    ],
  },
  {
    id: 'faq-skyport-home-setup',
    category: 'FAQ',
    title: 'Homeowner: SkyportHome Account Set-Up',
    kind: 'faq',
    body: [
      'Follow the SkyportHome app onboarding to create the homeowner account and associate equipment. Use the same email the dealer will use when sending the SkyportCare invitation.',
    ],
  },
  {
    id: 'faq-give-dealer-access',
    category: 'FAQ',
    title: 'Homeowner: Give System Access to Their Dealer',
    kind: 'faq',
    body: [
      'Ask the customer to enable notifications; this is required for the customer to receive the invite from the dealer.',
    ],
  },
  {
    id: 'faq-getting-started-videos',
    category: 'FAQ',
    title: 'Getting Started Videos',
    kind: 'faq',
    body: [
      'Open Help (footer) or the “?” icon (top right) in SkyportCare for videos on adding and activating customers, requesting remote access, generating commissioning reports, and general navigation and platform overview.',
    ],
  },
  {
    id: 'faq-check-invited-active',
    category: 'Dealer & TSM',
    title: 'Dealer: Check Status (Invited and/or Active)',
    kind: 'faq',
    bullets: [
      'Go to https://admin.daikinonedealer.com/login. Under Organizations (left), use the view described in the Admin Portal.',
      'Search using dealer name, dealer ID, or dealer phone number (sometimes only one will find the record).',
      'Click the three dots on the right and choose View Details for the dealer.',
      'Navigate to Users to review status.',
    ],
  },
  {
    id: 'faq-tsm-dealer-signup',
    category: 'Dealer & TSM',
    title: 'TSM Instructions: Check Dealer in System & Sign-Up',
    kind: 'faq',
    bullets: [
      'First follow the steps above to see if the dealer is already in the system. If not, continue.',
      'Send the Cloud Services Registration Code Request sheet (e.g. “2024 Cloud Services Registration Code Request Sheet 4.1.24”) from the Sales Excellence Library for the dealer to complete.',
      'Click Invite Organization (blue button, top right) and complete the form.',
      'Enter details from the sheet; a PIN code is created and sent to the TSM/dealer for SkyportCare access.',
    ],
  },
  {
    id: 'faq-promotion-checks',
    category: 'Dealer & TSM',
    title: 'Dealer: Promotion Checks',
    kind: 'faq',
    body: [
      'Installations are tracked automatically on SkyportCare; checks are sent to dealers at the end of the promotion program.',
    ],
  },
  {
    id: 'faq-change-dealer-ownership',
    category: 'Dealer & TSM',
    title: 'Dealer Instructions: Change of Dealer Ownership',
    kind: 'faq',
    bullets: [
      'When a dealer requests an owner change (old to new), contact the old owner’s email to notify them of the request.',
      'Wait up to three days for a response before completing the ownership change.',
      'If the old owner confirms no interest in the account, make the change immediately.',
      'If the old owner objects, the request requires internal review.',
    ],
  },
  {
    id: 'faq-delete-old-homeowner',
    category: 'FAQ',
    title: 'Homeowner: Delete Old Homeowner & New Account Set-Up',
    kind: 'faq',
    bullets: [
      'The new customer deletes the previous customer’s account from the thermostat.',
      'The new customer creates a homeowner account and associates it with the thermostat.',
      'The dealer invites the new customer using the new homeowner’s recently registered email.',
    ],
  },
  {
    id: 'faq-demo-tsm',
    category: 'Dealer & TSM',
    title: 'Demo Account Set-Up Instructions (TSMs)',
    kind: 'faq',
    body: [
      'A meaningful demo account requires an installed system. Provide the existing email and address of the system; the team will set up the demo.',
    ],
  },
]

/** Lowercase string for client-side search (title + category + all text). */
export function supportArticleSearchText(article) {
  const parts = [article.category, article.title]
  if (article.steps) {
    for (const s of article.steps) {
      parts.push(s.label, s.text)
    }
    const byStep = stepImages.stepImagesByArticleId[article.id]
    if (byStep) {
      for (const files of Object.values(byStep)) {
        parts.push(...files)
      }
    }
  }
  if (article.body) parts.push(...article.body)
  if (article.bullets) parts.push(...article.bullets)
  const faqFiles = stepImages.faqImagesByArticleId[article.id]
  if (faqFiles?.length) parts.push(...faqFiles)
  return parts.join(' ').toLowerCase()
}

/**
 * Category tabs order (matches PrivateAir-style FAQ: browse by topic, then search within).
 * Only categories that exist in the articles list are shown.
 */
export const SUPPORT_CATEGORIES_ORDER = ['Account', 'Invitations', 'Licenses', 'FAQ', 'Dealer & TSM']

export function getOrderedSupportCategories(articles) {
  const present = new Set(articles.map((a) => a.category))
  return SUPPORT_CATEGORIES_ORDER.filter((c) => present.has(c))
}

/** @param {string | null} categoryFilter — null = all categories */
export function filterSupportArticles(articles, query, categoryFilter = null) {
  let list = categoryFilter ? articles.filter((a) => a.category === categoryFilter) : articles
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list.filter((a) => supportArticleSearchText(a).includes(q))
}
