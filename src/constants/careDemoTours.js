/** Guided tour definitions for the SkyportCare dealer demo (CareDemoPage). */

export const CARE_DEMO_TOUR_ADD_TEAM_MEMBER = 'addTeamMember'
export const CARE_DEMO_TOUR_HOMEOWNER_INVITE = 'homeownerInvite'
/** Standard license renewal: Extend License → select plan ($400 Lifetime for demo) → Review Order → Checkout → KinPay. */
export const CARE_DEMO_TOUR_LICENSE_PURCHASE = 'licensePurchase'
/** Warranty Express path from Extend License → blue link + outdoor serial (2 steps). */
export const CARE_DEMO_TOUR_WARRANTY_EXPRESS_LICENSE = 'warrantyExpressLicense'
/** Dashboard — Alerts widget and drilling in. */
export const CARE_DEMO_TOUR_ALERTS_SYSTEM_HEALTH = 'alertsSystemHealth'
/** Dashboard — Reminders widget and Customers hub handoff. */
export const CARE_DEMO_TOUR_REMINDERS_OVERVIEW = 'remindersOverview'
/** Dashboard — Sold-home notice → modal → Current Customers. */
export const CARE_DEMO_TOUR_SOLD_HOMES_WORKFLOW = 'soldHomesWorkflow'

/** Ordered entries for Guided Tours menus (extend as new tours ship). */
export const CARE_DEMO_GUIDED_TOUR_OPTIONS = [
  { id: CARE_DEMO_TOUR_ADD_TEAM_MEMBER, label: 'Add team member' },
  { id: CARE_DEMO_TOUR_HOMEOWNER_INVITE, label: 'Homeowner invitation' },
  { id: CARE_DEMO_TOUR_LICENSE_PURCHASE, label: 'Standard License Renewal' },
  { id: CARE_DEMO_TOUR_WARRANTY_EXPRESS_LICENSE, label: 'Warranty Express License Purchase' },
  { id: CARE_DEMO_TOUR_ALERTS_SYSTEM_HEALTH, label: 'Alerts & system health' },
  { id: CARE_DEMO_TOUR_REMINDERS_OVERVIEW, label: 'Reminders overview' },
  { id: CARE_DEMO_TOUR_SOLD_HOMES_WORKFLOW, label: 'Sold home workflow' },
]

export const careDemoTourCopy = {
  [CARE_DEMO_TOUR_ADD_TEAM_MEMBER]: {
    title: '',
    steps: [
      {
        key: 'team-card-and-add',
        title: 'Step 1 — Click on "Add a team member"',
        body: '',
        targetSelector: '[data-care-demo-tour="dashboard-team-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-add-member-widget"]',
      },
      {
        key: 'modal-role',
        title: 'Step 2 — Choose a role',
        body: '',
        targetSelector: '[data-care-demo-tour="add-member-form-details"]',
        secondaryHighlightSelector: '[data-care-demo-tour="add-member-role-field"]',
        roleMatrix: {
          rows: [
            {
              label: 'Commission systems in the mobile app',
              installer: true,
              tech: true,
              admin: true,
            },
            { label: 'Invite and edit customers', installer: false, tech: true, admin: true },
            { label: 'Delete customers', installer: false, tech: false, admin: true },
            {
              label: 'Invite, update, and delete team members',
              installer: false,
              tech: false,
              admin: true,
            },
            {
              label: 'Edit billing information and customer communications',
              installer: false,
              tech: false,
              admin: true,
            },
            { label: 'See transaction history', installer: false, tech: false, admin: true },
            { label: 'Purchase licenses', installer: false, tech: false, admin: true },
          ],
        },
      },
      {
        key: 'modal-details',
        title: 'Step 3 — Enter details and send',
        body: 'Sample values are filled in. Click Invite Member to finish.',
        targetSelector: '[data-care-demo-tour="add-member-form-details"]',
        secondaryHighlightSelector: '[data-care-demo-tour="add-member-invite-btn"]',
      },
    ],
  },
  [CARE_DEMO_TOUR_HOMEOWNER_INVITE]: {
    title: '',
    steps: [
      {
        key: 'dashboard-invite-entry',
        title: 'Step 1 — Add Customer',
        body: '',
        targetSelector: '[data-care-demo-tour="dashboard-customers-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-invite-customers-btn"]',
      },
      {
        key: 'invite-send',
        title: 'Step 2 — Send invitation',
        body: 'Pre-filled for demo.',
        targetSelector: '[data-care-demo-tour="invite-customers-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="invite-customers-send"]',
      },
    ],
  },
  [CARE_DEMO_TOUR_LICENSE_PURCHASE]: {
    title: 'Standard License Renewal',
    steps: [
      {
        key: 'extend-license-cta',
        title: 'Step 1 — Extend License',
        body:
          'Click Extend License to purchase or extend this customer’s license. The yellow banner highlights access that needs renewal.',
        targetSelector: '[data-care-demo-tour="customer-detail-license-banner"]',
        secondaryHighlightSelector: '[data-care-demo-tour="customer-detail-extend-license"]',
        /** Used with `dockTooltipBelowPrimary` to center the panel under the Extend control. */
        tooltipDockSelector: '[data-care-demo-tour="customer-detail-extend-license"]',
        /** Popover sits under the yellow strip (not overlapping it), aligned with Extend License. */
        dockTooltipBelowPrimary: true,
        dockTooltipBelowPrimaryGap: 28,
      },
      {
        key: 'select-and-review',
        title: 'Step 2 — Select license type',
        body:
          'Select type of license and click Review Order. For this tour the demo shows Lifetime ($400.00) selected.',
        targetSelector: '[data-care-demo-tour="license-modal-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="license-review-order-btn"]',
        /** Tour card to the right of the modal with a gap; bottom-aligned with the modal. */
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
      },
      {
        key: 'review-checkout',
        title: 'Step 3 — Review and Checkout',
        body:
          'Review and click Checkout if everything is correct. After checkout, the payer sees the secure payment screen from your provider (example in the next step). This demo does not process payment.',
        targetSelector: '[data-care-demo-tour="license-modal-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="license-checkout-btn"]',
        /** Same as step 2: tour card to the right with a gap; bottom-aligned with the modal. */
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
      },
      {
        key: 'kinpay-after-checkout',
        title: 'After checkout — Payment provider',
        tooltipOnly: true,
        dimFullscreen: true,
        referenceImageFile: 'care-demo/standard-license-kinpay-checkout.png',
        referenceImageCaption: 'Example: KinPay — Total Amount Due ($400.00 USD)',
      },
    ],
  },
  [CARE_DEMO_TOUR_WARRANTY_EXPRESS_LICENSE]: {
    title: 'Warranty Express License Purchase',
    steps: [
      {
        key: 'we-extend-license-cta',
        title: 'Step 1 — Extend License',
        body:
          'Click Extend License to purchase or extend this customer’s license. The yellow banner highlights access that needs renewal.',
        targetSelector: '[data-care-demo-tour="customer-detail-license-banner"]',
        secondaryHighlightSelector: '[data-care-demo-tour="customer-detail-extend-license"]',
        tooltipDockSelector: '[data-care-demo-tour="customer-detail-extend-license"]',
        dockTooltipBelowPrimary: true,
        dockTooltipBelowPrimaryGap: 28,
      },
      {
        key: 'we-warranty-link',
        title: 'Step 2 — Warranty Express',
        body: 'Click on the blue link Already purchased with Warranty Express?',
        targetSelector: '[data-care-demo-tour="license-modal-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="license-warranty-express-link"]',
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
      },
      {
        key: 'we-activation-serial',
        title: 'Step 3 — License activation',
        body:
          'Enter the outdoor unit serial number for the selected location, then click Activate License when ready.',
        targetSelector: '[data-care-demo-tour="license-modal-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="license-warranty-serial-input"]',
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
      },
    ],
  },
  [CARE_DEMO_TOUR_ALERTS_SYSTEM_HEALTH]: {
    title: 'Alerts & system health',
    skipOpenModalOnFirstNext: true,
    steps: [
      {
        key: 'alerts-widget',
        title: 'Step 1 — Alerts on the dashboard',
        body:
          'The Alerts card surfaces equipment and communication issues. New items appear here so the team can triage without opening every customer.',
        targetSelector: '[data-care-demo-tour="dashboard-alerts-card"]',
      },
      {
        key: 'alerts-sample-row',
        title: 'Step 2 — Read an alert row',
        body: 'Each row summarizes the fault code and when it was detected.',
        targetSelector: '[data-care-demo-tour="dashboard-alerts-first-row"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-alerts-first-row-chevron"]',
        tooltipDockSelector: '[data-care-demo-tour="dashboard-alerts-first-row-chevron"]',
      },
      {
        key: 'alerts-follow-up',
        title: 'Step 3 — Current Customers',
        body:
          'From here you search and filter the account list, open a customer, and align with your service workflow. In the full product, opening an alert can land you on the customer record as well.',
        targetSelector: '[data-care-demo-tour="customers-hub-current-customers-panel"]',
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        dockTooltipTrailingAlignTop: true,
      },
    ],
  },
  [CARE_DEMO_TOUR_REMINDERS_OVERVIEW]: {
    title: 'Reminders overview',
    skipOpenModalOnFirstNext: true,
    steps: [
      {
        key: 'reminders-widget',
        title: 'Step 1 — Reminders on the dashboard',
        body:
          'Reminders group upcoming service and license work by time window so techs and coordinators can prioritize the next visits.',
        targetSelector: '[data-care-demo-tour="dashboard-reminders-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-reminders-first-row"]',
      },
      {
        key: 'reminders-row',
        title: 'Step 2 — Open a reminder bucket',
        body:
          'Click a row to jump into the Customers hub with the matching reminder filter applied (demo opens the Customers view).',
        targetSelector: '[data-care-demo-tour="dashboard-reminders-first-row"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-reminders-first-row-chevron"]',
        tooltipDockSelector: '[data-care-demo-tour="dashboard-reminders-first-row-chevron"]',
      },
      {
        key: 'reminders-sidebar',
        title: 'Step 3 — Customers navigation',
        body:
          'You can return here any time from the Customers icon in the sidebar. Use search and filters in the hub to work the list you just opened.',
        targetSelector: '[data-care-demo-tour="care-demo-sidebar-customers"]',
      },
    ],
  },
  [CARE_DEMO_TOUR_SOLD_HOMES_WORKFLOW]: {
    title: 'Sold home workflow',
    steps: [
      {
        key: 'sold-entry',
        title: 'Step 1 — Sold-home notice',
        body:
          'When public records suggest a sale, SkyportCare flags it here. Open View details to review addresses and decide how to follow up.',
        targetSelector: '[data-care-demo-tour="dashboard-customers-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-sold-homes-entry"]',
        /** Tour card to the right of the Customers tile (not below). */
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        dockTooltipTrailingAlignTop: true,
      },
      {
        key: 'sold-modal',
        title: 'Step 2 — Review and act',
        body: '',
        targetSelector: '[data-care-demo-tour="sold-homes-modal-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="sold-homes-view-customers-btn"]',
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        /** Align panel to the top of the modal so tall steps stay in view (avoids clipping below the fold). */
        dockTooltipTrailingAlignTop: true,
      },
    ],
  },
}
