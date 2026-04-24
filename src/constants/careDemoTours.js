/** Guided tour definitions for the SkyportCare dealer demo (CareDemoPage). */

/** End-to-end intro + key dashboard widgets (Care demo). */
export const CARE_DEMO_TOUR_COMPLETE = 'completeTour'
export const CARE_DEMO_TOUR_ADD_TEAM_MEMBER = 'addTeamMember'
export const CARE_DEMO_TOUR_HOMEOWNER_INVITE = 'homeownerInvite'
/** Standard license renewal: Extend License → select plan ($400 Lifetime for demo) → Review Order → Checkout → KinPay. */
export const CARE_DEMO_TOUR_LICENSE_PURCHASE = 'licensePurchase'
/** Warranty Express path from Extend License → blue link + outdoor serial (2 steps). */
export const CARE_DEMO_TOUR_WARRANTY_EXPRESS_LICENSE = 'warrantyExpressLicense'
/** Dashboard — Alerts widget and alert detail (internal id unchanged for routing). */
export const CARE_DEMO_TOUR_ALERTS_SYSTEM_HEALTH = 'alertsSystemHealth'
/** Dashboard — Reminders widget and Customers hub handoff. */
export const CARE_DEMO_TOUR_REMINDERS_OVERVIEW = 'remindersOverview'
/** Dashboard — Sold-home notice → modal → Current Customers. */
export const CARE_DEMO_TOUR_SOLD_HOMES_WORKFLOW = 'soldHomesWorkflow'

/**
 * Step indices for {@link CARE_DEMO_TOUR_COMPLETE} (single mega-tour; keep in sync with CareDemoPage.jsx).
 * 0 intro, 1–2 dashboard widgets, 3–5 add team member, 6 customers widget, 7–8 invite, 9–11 sold homes, 12–14 alerts, 15–17 reminders.
 */
export const CARE_DEMO_COMPLETE_TOUR = {
  INTRO: 0,
  SYSTEM_ACCESS: 1,
  TEAM_WIDGET: 2,
  ADD_TEAM_1: 3,
  ADD_TEAM_2: 4,
  ADD_TEAM_3: 5,
  CUSTOMERS_WIDGET: 6,
  INVITE_1: 7,
  INVITE_2: 8,
  SOLD_1: 9,
  SOLD_2: 10,
  SOLD_3: 11,
  ALERTS_1: 12,
  ALERTS_2: 13,
  ALERTS_3: 14,
  REMINDERS_1: 15,
  REMINDERS_2: 16,
  REMINDERS_3: 17,
}

/** Guided Tours dropdown: numbered rows; License Renewal is a group with a/b sub-tours. */
export const CARE_DEMO_GUIDED_TOUR_MENU_ENTRIES = [
  { kind: 'tour', number: '1', id: CARE_DEMO_TOUR_COMPLETE, label: 'Complete Tour' },
  { kind: 'tour', number: '2', id: CARE_DEMO_TOUR_ADD_TEAM_MEMBER, label: 'Add team member' },
  { kind: 'tour', number: '3', id: CARE_DEMO_TOUR_HOMEOWNER_INVITE, label: 'Add Customer' },
  {
    kind: 'group',
    number: '4',
    title: 'License Renewal',
    items: [
      { letter: 'a', id: CARE_DEMO_TOUR_LICENSE_PURCHASE, label: 'Standard' },
      { letter: 'b', id: CARE_DEMO_TOUR_WARRANTY_EXPRESS_LICENSE, label: 'Warranty Express' },
    ],
  },
  { kind: 'tour', number: '5', id: CARE_DEMO_TOUR_ALERTS_SYSTEM_HEALTH, label: 'Alerts overview' },
  { kind: 'tour', number: '6', id: CARE_DEMO_TOUR_REMINDERS_OVERVIEW, label: 'Reminders overview' },
  { kind: 'tour', number: '7', id: CARE_DEMO_TOUR_SOLD_HOMES_WORKFLOW, label: 'Sold home workflow' },
]

export const careDemoTourCopy = {
  [CARE_DEMO_TOUR_COMPLETE]: {
    title: 'Complete Tour',
    skipOpenModalOnFirstNext: true,
    skipCloseModalWhenBackFromStep1: true,
    steps: [
      {
        key: 'complete-intro-overview',
        title: '',
        body:
          'We support you throughout the life-cycle — from install to on-going protection all the way to creating opportunities to replace the system and to sell more services.',
        tooltipOnly: true,
        dimFullscreen: true,
        introOverview: true,
        hideStepProgress: true,
        hideStepTitle: true,
      },
      {
        key: 'complete-widget-system-access',
        title: 'Your dashboard',
        body:
          'Your dealer dashboard summarizes key information segmented through six widgets. The System Access widget tells you how many systems are connected. Click Next to continue.',
        targetSelector: '[data-care-demo-tour="dashboard-system-access-card"]',
        primaryOrangeRing: true,
      },
      {
        key: 'complete-widget-team',
        title: 'Team Members',
        body:
          'Team Members shows details about people in your organization along with their role and status. Click Next to continue.',
        targetSelector: '[data-care-demo-tour="dashboard-team-card"]',
        primaryOrangeRing: true,
      },
      {
        key: 'complete-add-team-dashboard',
        title: 'Step 3 — Click on "Add a team member"',
        body: '',
        targetSelector: '[data-care-demo-tour="dashboard-team-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-add-member-widget"]',
      },
      {
        key: 'complete-add-team-role',
        title: 'Step 4 — Choose a role',
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
        key: 'complete-add-team-details',
        title: 'Step 5 — Enter details and send',
        body: 'Sample values are filled in. Click Invite Member to finish.',
        targetSelector: '[data-care-demo-tour="add-member-form-details"]',
        secondaryHighlightSelector: '[data-care-demo-tour="add-member-invite-btn"]',
      },
      {
        key: 'complete-widget-customers',
        title: 'Customers',
        body:
          'Customer status summarizes Active, Invited, and License renewal counts so you can see pipeline health at a glance.',
        targetSelector: '[data-care-demo-tour="dashboard-customers-card"]',
        primaryOrangeRing: true,
      },
      {
        key: 'complete-invite-dashboard',
        title: 'Step 7 — Add Customer',
        body: '',
        targetSelector: '[data-care-demo-tour="dashboard-customers-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-invite-customers-btn"]',
      },
      {
        key: 'complete-invite-send',
        title: 'Step 8 — Send invitation',
        body: 'Pre-filled for demo.',
        targetSelector: '[data-care-demo-tour="invite-customers-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="invite-customers-send"]',
      },
      {
        key: 'complete-sold-entry',
        title: 'Step 9 — Sold-home notice',
        body:
          'When public records suggest a sale, SkyportCare flags it here. Open View details to review addresses and decide how to follow up.',
        targetSelector: '[data-care-demo-tour="dashboard-customers-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-sold-homes-notice"]',
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        dockTooltipTrailingAlignTop: true,
      },
      {
        key: 'complete-sold-modal',
        title: 'Step 10 — Review and act',
        body:
          'Review the list, then click Next to continue. To open the same list as in the product, use View in Customer List — that button jumps to Current Customers in this demo.',
        targetSelector: '[data-care-demo-tour="sold-homes-modal-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="sold-homes-view-customers-btn"]',
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        dockTooltipTrailingAlignTop: true,
      },
      {
        key: 'complete-sold-hub',
        title: 'Step 11 — Home Sold in Current Customers',
        body:
          'The list is filtered to Home Sold so you only see accounts that match a sold-home signal.',
        targetSelector: '[data-care-demo-tour="customers-hub-current-customers-panel"]',
        tooltipOnly: true,
        tooltipSpotlightHoleSelector: '[data-care-demo-tour="sold-home-current-customers-highlight"]',
        tooltipLayoutFixedBelow: true,
        dockTooltipBelowPrimaryGap: 18,
      },
      {
        key: 'complete-alerts-widget',
        title: 'Step 12 — Alerts on the dashboard',
        body:
          'The Alerts card surfaces equipment and communication issues. New items appear here so the team can triage without opening every customer.',
        targetSelector: '[data-care-demo-tour="dashboard-alerts-card"]',
      },
      {
        key: 'complete-alerts-row',
        title: 'Step 13 — Read an alert row',
        body: 'Each row summarizes the fault code and when it was detected.',
        targetSelector: '[data-care-demo-tour="dashboard-alerts-first-row"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-alerts-first-row-chevron"]',
        tooltipDockSelector: '[data-care-demo-tour="dashboard-alerts-first-row-chevron"]',
      },
      {
        key: 'complete-alerts-detail',
        title: 'Step 14 — Communication error',
        body: 'Fault detail shows severity, code, possible causes, and corrective guidance.',
        targetSelector: '[data-care-demo-tour="care-demo-customer-detail-root"]',
        tooltipOnly: true,
      },
      {
        key: 'complete-reminders-widget',
        title: 'Step 15 — Reminders on the dashboard',
        body:
          'Groups upcoming service and media filter reminders by time window so techs and coordinators can prioritize the next visits.',
        targetSelector: '[data-care-demo-tour="dashboard-reminders-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-reminders-first-row"]',
      },
      {
        key: 'complete-reminders-row',
        title: 'Step 16 — Open a reminder bucket',
        body: 'Click a row to jump into customer details.',
        targetSelector: '[data-care-demo-tour="dashboard-reminders-first-row"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-reminders-first-row-chevron"]',
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        dockTooltipTrailingAlignTop: true,
        dockTooltipTrailingPreferLeft: true,
      },
      {
        key: 'complete-reminders-hub',
        title: 'Step 17 — Customers with items due',
        body:
          'The Reminders view lists accounts with open service and media-filter work so your team can work the queue from one place.',
        targetSelector: '[data-care-demo-tour="customers-hub-reminders-panel"]',
        tooltipOnly: true,
        tooltipSpotlightHoleSelector: '[data-care-demo-tour="reminders-tour-step3-highlight"]',
        tooltipLayoutFixedBelow: true,
        dockTooltipBelowPrimaryGap: 18,
      },
    ],
  },
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
    title: 'Add Customer',
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
    title: 'Alerts overview',
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
        key: 'alerts-communication-detail',
        title: 'Step 3 — Communication error',
        body: 'Fault detail shows severity, code, possible causes, and corrective guidance.',
        targetSelector: '[data-care-demo-tour="care-demo-customer-detail-root"]',
        /** Full page stays sharp — no dim overlay or orange frame (contrast with sold-home / reminders step 3). */
        tooltipOnly: true,
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
          'Groups upcoming service and media filter reminders by time window so techs and coordinators can prioritize the next visits.',
        targetSelector: '[data-care-demo-tour="dashboard-reminders-card"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-reminders-first-row"]',
      },
      {
        key: 'reminders-row',
        title: 'Step 2 — Open a reminder bucket',
        body: 'Click a row to jump into customer details.',
        targetSelector: '[data-care-demo-tour="dashboard-reminders-first-row"]',
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-reminders-first-row-chevron"]',
        /** Tour card to the left of the row (avoids covering the orange highlight). */
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        dockTooltipTrailingAlignTop: true,
        dockTooltipTrailingPreferLeft: true,
      },
      {
        key: 'reminders-hub-due',
        title: 'Step 3 — Customers with items due',
        body:
          'The Reminders view lists accounts with open service and media-filter work so your team can work the queue from one place.',
        targetSelector: '[data-care-demo-tour="customers-hub-reminders-panel"]',
        tooltipOnly: true,
        tooltipSpotlightHoleSelector: '[data-care-demo-tour="reminders-tour-step3-highlight"]',
        tooltipLayoutFixedBelow: true,
        dockTooltipBelowPrimaryGap: 18,
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
        /** Whole notice block so the highlight ring does not sit on top of the sentence above the link. */
        secondaryHighlightSelector: '[data-care-demo-tour="dashboard-sold-homes-notice"]',
        /** Tour card to the right of the Customers tile (not below). */
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        dockTooltipTrailingAlignTop: true,
      },
      {
        key: 'sold-modal',
        title: 'Step 2 — Review and act',
        body:
          'Review the list, then click Next to continue. To open the same list as in the product, use View in Customer List — that button jumps to Current Customers in this demo.',
        targetSelector: '[data-care-demo-tour="sold-homes-modal-dialog"]',
        secondaryHighlightSelector: '[data-care-demo-tour="sold-homes-view-customers-btn"]',
        dockTooltipTrailingPrimary: true,
        dockTooltipTrailingGap: 20,
        /** Align panel to the top of the modal so tall steps stay in view (avoids clipping below the fold). */
        dockTooltipTrailingAlignTop: true,
      },
      {
        key: 'sold-customers-filtered',
        title: 'Step 3 — Home Sold in Current Customers',
        body:
          'The list is filtered to Home Sold so you only see accounts that match a sold-home signal.',
        /** Current Customers table (header + rows) — tooltip sits below it in the grey pager/footer band. */
        targetSelector: '[data-care-demo-tour="customers-hub-current-customers-panel"]',
        tooltipOnly: true,
        /** Same four-panel dim as steps 1–2, with a “hole” over the orange-highlighted rows only. */
        tooltipSpotlightHoleSelector: '[data-care-demo-tour="sold-home-current-customers-highlight"]',
        /** Bypass trailing/side dock (clips on narrow viewports) — fixed row under Customers + centered width. */
        tooltipLayoutFixedBelow: true,
        dockTooltipBelowPrimaryGap: 18,
      },
    ],
  },
}
