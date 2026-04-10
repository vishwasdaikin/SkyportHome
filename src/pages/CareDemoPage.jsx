import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts'
import {
  LayoutGrid,
  IdCard,
  MapPin,
  HelpCircle,
  User,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Menu,
  Search,
  Calendar,
  CalendarCheck,
  History,
  Plus,
  Download,
  MoreHorizontal,
  ChevronDown,
  Filter,
  AlertTriangle,
  AlertCircle,
  Clock,
  Check,
  CheckCircle2,
  CircleAlert,
  Minus,
  Calendar as CalendarIcon,
  X,
  Phone,
  MessageCircle,
  Mail,
  WifiOff,
  Info,
  FileCheck,
  Thermometer,
} from 'lucide-react'
import CareDemoLocationsMap from './CareDemoLocationsMap.jsx'
import CareDemoHelpContent from './CareDemoHelpContent.jsx'
import { isCareDemoAuthenticated, setCareDemoAuthenticated } from '../auth/careDemoSession.js'
import './CareDemoPage.css'

/** System Access — copy matches product screenshot (order, lowercase labels, counts). */
const SYSTEM_ACCESS_ROWS = [
  { count: 59, label: 'adjust settings' },
  { count: 87, label: 'view only' },
  { count: 10, label: 'no access' },
  { count: 28, label: 'offline' },
]
const SYSTEM_ACCESS_MAX = Math.max(...SYSTEM_ACCESS_ROWS.map((r) => r.count))

/**
 * System Health — pie shows 3 segments only (red / blue / green); Minor Error appears in legend only.
 * Segment sizes ~5% / ~5% / ~90% per product screenshot.
 */
const HEALTH_PIE_SEGMENTS = [
  { name: 'Critical Error', value: 5, color: '#FF3B30' },
  { name: 'Reminder', value: 5, color: '#0095DD' },
  { name: 'OK', value: 90, color: '#28CD41' },
]

const HEALTH_LEGEND_ITEMS = [
  { name: 'Critical Error', color: '#FF3B30' },
  { name: 'Minor Error', color: '#FFCC00' },
  { name: 'Reminder', color: '#0095DD' },
  { name: 'OK', color: '#28CD41' },
]

const SC_ACCENT = '#0096db'
const ICON_STROKE = 2.35

/** Alerts — two pages of mock rows (dashboard pager: 1 of 2 / 2 of 2). */
const ALERT_PAGES = [
  [
    { title: '51 - Communication error', when: '4 days ago' },
    { title: '51 - Communication error', when: '4 days ago' },
    { title: 'U5 - Communication error', when: '46 days ago' },
  ],
  [
    { title: 'A3 - Indoor unit fault', when: '12 days ago' },
    { title: 'H8 - Water level warning', when: '3 days ago' },
    { title: 'E6 - Outdoor fan stall', when: '28 days ago' },
  ],
]

/** Reminders — bold leading number + grey rest; `range` sets Customers hub Reminder dropdown. */
const REMINDER_ROWS = [
  { num: '6', rest: ' active reminders', variant: 'active', range: 'active' },
  { num: '61', rest: ' within 30 days', variant: 'scheduled', range: '30' },
  { num: '64', rest: ' within 60 days', variant: 'scheduled', range: '60' },
  { num: '66', rest: ' within 90 days', variant: 'scheduled', range: '90' },
]

const CUSTOMERS_VIEW_KEYS = ['current', 'invited', 'reminders', 'licenses']

const CUSTOMERS_VIEW_LABELS = {
  current: 'Current Customers',
  invited: 'Invited Customers',
  reminders: 'Reminders',
  licenses: 'Licenses',
}

const REMINDER_FILTER_LABELS = {
  active: 'Active',
  30: 'within 30 days',
  60: 'within 60 days',
  90: 'within 90 days',
}

/** Licenses toolbar — checkbox options (order: Active → Expiring Soon → Expired). */
const DEFAULT_LICENSE_STATUS_CHECKBOXES = {
  active: true,
  expiringSoon: true,
  expired: true,
}

const LICENSE_STATUS_MENU_KEYS = ['active', 'expiringSoon', 'expired']

const LICENSE_STATUS_MENU = {
  active: { label: 'Active License', icon: 'active' },
  expiringSoon: { label: 'Expiring Soon', icon: 'soon' },
  expired: { label: 'Expired', icon: 'expired' },
}

const DEFAULT_CUSTOMERS_HUB = {
  customerView: 'reminders',
  reminderFilter: 'active',
  licenseStatusCheckboxes: { ...DEFAULT_LICENSE_STATUS_CHECKBOXES },
}

const CUSTOMER_ROWS = [
  { num: '97', label: 'active customers', customerView: 'current' },
  { num: '8', label: 'invited customers', customerView: 'invited' },
  { num: '34', label: 'plan activations needed', customerView: 'current' },
]

/** Dashboard Team Members widget — counts match Organization → Members (demo). */
const TEAM_ROWS = [
  { num: '5', label: 'administrators', faded: false, orgNav: 'members-active' },
  { num: '2', label: 'technicians', faded: false, orgNav: 'members-active' },
  { num: '0', label: 'installers', faded: true, orgNav: null },
  { num: '2', label: 'invited members', faded: false, orgNav: 'members-invited' },
]

const CUSTOMERS_BLUE = '#0072b1'
const TEAM_BLUE = '#007ba7'

/** Demo domain for generated customer emails (fictional data). */
const DEMO_FAKE_EMAIL_DOMAIN = 'skyportcare.demo'
const SKYPORT_CARE_DEMO_EMAIL = `care-inbox@${DEMO_FAKE_EMAIL_DOMAIN}`
const DEMO_DEFAULT_CUSTOMER_PHONE = '+1 (555) 020-0100'

/** SkyportCare redirect screen → “Go to SkyportCare” returns to dashboard. */
const CARE_DEMO_LOGIN_PATH = '/test-page/care-demo/login'
const CARE_DEMO_BASE_PATH = '/test-page/care-demo'
const CARE_DEMO_HELP_PATH = `${CARE_DEMO_BASE_PATH}/help`
const CARE_DEMO_BRAND_LOGO_SRC = `${import.meta.env.BASE_URL}care-demo/brand-logo-skyportcare.svg`
const CARE_DEMO_FOOTER_BRANDS_SVG = `${import.meta.env.BASE_URL}care-demo/footer-unibrand-logos.svg`
/** Sample report PDF (served from `public/care-demo/reports/`) — report row ⋮ menu → template → viewer. */
const CARE_DEMO_REPORT_QA_PDF = `${import.meta.env.BASE_URL}care-demo/reports/QA-tj-qa_-upstairs.pdf`

/**
 * Mock customer rows for Care Demo (table + XLSX). Shaped like Customer_Reminders_*.xlsx:
 * one spreadsheet row per reminder line; system / thermostat fields are dummy data.
 */
const MOCK_ACTIVE_REMINDER_CUSTOMERS = [
  {
    id: '1',
    linkedCustomerId: 'c1',
    name: 'Avery North',
    location: '100 Sample Maple Ln, Sampleton, CO 80977',
    reminders: [{ kind: 'Media filter', daysAgo: 590 }],
    indoor: 'DV36FECC14AA',
    outdoor: 'DZ17VSA361AA',
    systemName: 'main room',
    license: 'Expired',
    thermostatName: 'main room',
    access: 'Full access',
  },
  {
    id: '2',
    linkedCustomerId: 'c2',
    name: 'Blake East',
    location: '220 Demo Harbor Ct, Fictown, SC 29488',
    reminders: [{ kind: 'Media filter', daysAgo: 255 }],
    indoor: 'DFVE48DP1300AA',
    outdoor: 'DH6VSA4210',
    systemName: 'upstairs',
    license: 'Lifetime License',
    thermostatName: 'upstairs',
    access: 'Monitor',
  },
  {
    id: '3',
    linkedCustomerId: 'c3',
    name: 'Casey Vale',
    location: '340 Training Lake Blvd, Demo Vista, TX 78788',
    reminders: [{ kind: 'Media filter', daysAgo: 152 }],
    indoor: 'DFVE36CP0400AA',
    outdoor: 'DZ6VSA3610',
    systemName: 'Upstairs',
    license: 'One Year License',
    thermostatName: 'Master Bedroom',
    access: 'Monitor',
  },
  {
    id: '4',
    linkedCustomerId: 'c4',
    name: 'Drew Mercer',
    location: '18 Practice Row, Sample Grove, MN 55999',
    reminders: [
      { kind: 'Service', daysAgo: 51 },
      { kind: 'Media filter', daysAgo: 22 },
    ],
    indoor: 'DV36FECC14FC',
    outdoor: 'DZ17VSA601BA',
    systemName: 'CCHP-3',
    license: 'Lifetime License',
    thermostatName: 'CCHP-3',
    access: 'Full access',
  },
  {
    id: '5',
    linkedCustomerId: 'c5',
    name: 'Emery Hill',
    location: '560 Boilerplate St, Testville, OR 97288',
    reminders: [{ kind: 'Media filter', daysAgo: 49 }],
    indoor: 'DV36FECC14AA',
    outdoor: 'DZ17VSA361BA',
    systemName: 'upstairs',
    license: 'Lifetime License',
    thermostatName: 'upstairs',
    access: 'Monitor',
  },
  {
    id: '6',
    linkedCustomerId: 'c6',
    name: 'Finley Cruz',
    location: '410 Placeholder Ave, Training City, TN 37299',
    reminders: [{ kind: 'Service', daysAgo: 18 }],
    indoor: 'DV24FECC11AA',
    outdoor: 'DZ14VSA241AA',
    systemName: 'downstairs',
    license: 'One Year License',
    thermostatName: 'downstairs',
    access: 'Full access',
  },
  {
    id: '7',
    linkedCustomerId: 'c10',
    name: 'Gray Lennon',
    location: '900 Fictional Market Way, Demo Borough, PA 19188',
    reminders: [{ kind: 'Media filter', daysAgo: 48 }],
    indoor: 'DFVE36CP0400AA',
    outdoor: 'DZ6VSA3610',
    systemName: 'main',
    license: 'Lifetime License',
    thermostatName: 'main',
    access: 'Monitor',
  },
  {
    id: '8',
    linkedCustomerId: 'c11',
    name: 'Harper Sloan',
    location: '77 Sample Peachtree Ln, Sample Springs, GA 30388',
    reminders: [{ kind: 'Media filter', daysAgo: 82 }],
    indoor: 'DV36FECC14AA',
    outdoor: 'DZ17VSA361BA',
    systemName: 'upstairs',
    license: 'Expired',
    thermostatName: 'upstairs',
    access: 'Full access',
  },
]

function customerMatchesReminderFilter(cust, range) {
  if (range === 'active') return cust.reminders?.length > 0
  const max = range === '30' ? 30 : range === '60' ? 60 : 90
  return cust.reminders?.some((r) => r.daysAgo <= max) ?? false
}

/** Modal + Current Customers — sold-home sheet matches product reference (demo addresses/names). */
const SOLD_HOMES_MODAL_ROWS = [
  {
    address: '19001 Kermier Road, Waller, TX, USA, Waller, TX 77484',
    customerId: 'sold-shingo',
    customerName: 'Shingo Kise',
    sellerEmail: `shingo.kise.seller@${DEMO_FAKE_EMAIL_DOMAIN}`,
  },
  {
    address: '11330 Leeds Drive, Spring Hill, FL 34609',
    customerId: 'sold-daniel',
    customerName: 'Daniel Olrich',
    sellerEmail: `daniel.olrich.seller@${DEMO_FAKE_EMAIL_DOMAIN}`,
  },
]

const EXPAND_DETAIL_SHINGO_KISE = {
  fullAddress: '19001 Kermier Road, Waller, TX 77484',
  zones: [
    {
      system: '24V',
      thermostat: '24V',
      thermostatKind: 'alert',
      equipment: ['DH6VSA4210'],
    },
    {
      system: '24v',
      thermostat: 'THERMOSTAT',
      thermostatKind: 'ok',
      equipment: ['DFVE48DP1300AA'],
    },
  ],
}

/** “Current Customers” — first rows match product-style demo; list padded to 97 for pagination. */
const MOCK_CURRENT_CUSTOMERS_SEED = [
  {
    id: 'sold-eldie',
    name: 'Edie Sampleton',
    loc1: '18 Demo Placeholder Rd NE',
    loc2: 'Sampleton, OR 97299',
    homeSold: true,
    licenseOk: false,
    licenseBad: false,
    status: 'offline',
    assigned: '—',
  },
  {
    id: 'sold-shingo',
    name: 'Shingo Kise',
    loc1: '19001 Kermier Road',
    loc2: 'Waller, TX 77484',
    homeSold: true,
    phone: '+1 (555) 011-2200',
    email: `shingo.kise@${DEMO_FAKE_EMAIL_DOMAIN}`,
    licenseOk: false,
    licenseBad: false,
    status: 'offline',
    assigned: '—',
  },
  {
    id: 'sold-daniel',
    name: 'Daniel Olrich',
    loc1: '11330 Leeds Drive',
    loc2: 'Spring Hill, FL 34609',
    homeSold: true,
    email: `daniel.olrich@${DEMO_FAKE_EMAIL_DOMAIN}`,
    licenseOk: false,
    licenseBad: false,
    status: 'ok',
    assigned: '—',
  },
  {
    id: 'c1',
    name: 'Morgan Vale',
    loc1: '100 Practice Row',
    loc2: 'Sampleville, NC 28599',
    licenseOk: true,
    licenseBad: false,
    status: 'reminder',
    assigned: 'Riley Test',
  },
  {
    id: 'c2',
    name: 'Taylor Reed',
    loc1: '200 Skyport Demo Way',
    loc2: 'Fictown, AZ 85099',
    licenseOk: true,
    licenseBad: false,
    status: 'ok',
    assigned: 'Casey Demo',
  },
  {
    id: 'c3',
    name: 'Sloane Park',
    loc1: '—',
    loc2: '',
    licenseOk: false,
    licenseBad: true,
    status: 'offline',
    assigned: '—',
    email: `sloane.park@${DEMO_FAKE_EMAIL_DOMAIN}`,
    phone: DEMO_DEFAULT_CUSTOMER_PHONE,
  },
  {
    id: 'c4',
    name: 'Reese Lane',
    loc1: '2 locations',
    loc2: '',
    licenseOk: true,
    licenseBad: false,
    status: 'reminder',
    assigned: '2 assigned',
  },
  {
    id: 'c5',
    name: 'Parker Moss',
    loc1: '88 Training Terrace',
    loc2: 'Demo Heights, CA 91399',
    licenseOk: true,
    licenseBad: true,
    status: 'ok',
    assigned: 'Dana Sample',
  },
  {
    id: 'c6',
    name: 'Quinn Birch',
    loc1: '300 Sample Court',
    loc2: 'Placeholder, QC J5Y 9X9',
    licenseOk: true,
    licenseBad: false,
    status: 'reminder',
    assigned: '—',
  },
]

const CURRENT_CUSTOMERS_TOTAL = 97

const ASSIGNEE_POOL = ['Dana Sample', 'Casey Demo', 'Riley Test', 'Morgan Fictive', 'Jordan Placeholder']

/** Pools for generated “current customer” rows (deterministic from index — feels real, stays stable). */
const MOCK_GEN_FIRST_NAMES = [
  'James',
  'Maria',
  'Robert',
  'Priya',
  'Michael',
  'Sofia',
  'David',
  'Emily',
  'Daniel',
  'Aisha',
  'Chris',
  'Hannah',
  'Kevin',
  'Yuki',
  'Ryan',
  'Olivia',
  'Brandon',
  'Nina',
  'Jordan',
  'Diego',
  'Amanda',
  'Ethan',
  'Rachel',
  'Tyler',
  'Mei',
  'Andrew',
  'Fatima',
  'Jason',
  'Laura',
  'Marcus',
  'Angela',
  'Steven',
  'Gabriela',
  'Brian',
  'Keiko',
]

const MOCK_GEN_LAST_NAMES = [
  'Nguyen',
  'Patel',
  'Okafor',
  'Kowalski',
  'Fernandez',
  'Nakamura',
  'Hughes',
  'Silva',
  'Park',
  'Ibrahim',
  'Murphy',
  'Chen',
  'Larsson',
  'Okonkwo',
  'Romano',
  'Thompson',
  'Singh',
  'Bergstrom',
  'Alvarez',
  'Khan',
  'Fischer',
  'Olsen',
  'Reyes',
  'Walsh',
  'Sato',
  'Mensah',
  'Lindberg',
  'Costa',
  'Haddad',
  'Novak',
  'Brooks',
  'Tanaka',
  'Vasquez',
  'Andersen',
  'Kaur',
  'Morrison',
  'Dubois',
  'Yamamoto',
  'Carvalho',
]

const MOCK_GEN_STREET_NAMES = [
  'Maple',
  'Cedar',
  'Willow',
  'Highland',
  'River',
  'Lakeview',
  'Sunset',
  'Orchard',
  'Birch',
  'Aspen',
  'Magnolia',
  'Sycamore',
  'Hawthorne',
  'Dogwood',
  'Redwood',
  'Prairie',
  'Meadow',
  'Stonebridge',
  'Clearwater',
  'Ridgewood',
  'Fox Run',
  'Blue Heron',
  'Cottonwood',
  'Silver Creek',
  'Harbor',
  'Pinewood',
  'Elm',
  'Oak',
  'Summit',
  'Brookside',
]

const MOCK_GEN_STREET_TYPES = ['Dr', 'Ave', 'Blvd', 'Ln', 'Ct', 'Way', 'Rd', 'Pl', 'Cir', 'Trl', 'Pkwy']

const MOCK_GEN_CITY_ROWS = Array.from({ length: 32 }, (_, i) => ({
  city: `Sample City ${String.fromCharCode(65 + (i % 26))}`,
  state: ['KS', 'CO', 'MN', 'WI', 'IA', 'NE', 'OK', 'AR', 'MO', 'SD', 'ND', 'MT', 'WY', 'ID', 'UT', 'NM'][i % 16],
  zipBase: 55000 + ((i * 137) % 4200),
}))

function pickGenPool(arr, i, salt) {
  const n = arr.length
  if (n === 0) return ''
  return arr[(i * 31 + salt * 17) % n]
}

function syntheticCustomerDisplayName(i) {
  return `${pickGenPool(MOCK_GEN_FIRST_NAMES, i, 1)} ${pickGenPool(MOCK_GEN_LAST_NAMES, i, 2)}`
}

function syntheticCustomerAddress(i) {
  const num = 104 + ((i * 104729) % 9899)
  const street = pickGenPool(MOCK_GEN_STREET_NAMES, i, 3)
  const stype = pickGenPool(MOCK_GEN_STREET_TYPES, i, 4)
  const loc1 = `${num} ${street} ${stype}`
  const cr = pickGenPool(MOCK_GEN_CITY_ROWS, i, 5)
  const zip = String(cr.zipBase + (i % 42)).padStart(5, '0')
  const loc2 = `${cr.city}, ${cr.state} ${zip}`
  return { loc1, loc2 }
}

/** Product-style drill-down (Locations / Systems / Thermostats / Equipment). */
const EXPAND_DETAIL_ROB_BARNES = {
  fullAddress: '100 Practice Row, Sampleville, NC 28599',
  zones: [
    {
      system: 'upstairs',
      thermostat: 'upstairs',
      thermostatKind: 'reminder',
      equipment: ['DH6VSA4210', 'DFVE48DP1300AA'],
    },
    {
      system: 'downstairs',
      thermostat: 'downstairs',
      thermostatKind: 'ok',
      equipment: ['DH6VSA4210', 'DFVE48DP1300AA'],
    },
  ],
}

function getAddressDisplayLines(customer, ex, fullAddress) {
  if (ex.addressLine1 != null || ex.addressLine2 != null) {
    return { addressLine1: ex.addressLine1 ?? '', addressLine2: ex.addressLine2 ?? '' }
  }
  const loc1 = customer.loc1?.trim()
  const loc2 = customer.loc2?.trim()
  if (loc1 && loc1 !== '—') {
    return { addressLine1: loc1, addressLine2: loc2 || '' }
  }
  if (!fullAddress || fullAddress === '—') return { addressLine1: '—', addressLine2: '' }
  const idx = fullAddress.indexOf(', ')
  if (idx === -1) return { addressLine1: fullAddress, addressLine2: '' }
  return { addressLine1: fullAddress.slice(0, idx).trim(), addressLine2: fullAddress.slice(idx + 2).trim() }
}

function makeExpandDetailFromRow(row) {
  const parts = [row.loc1, row.loc2].filter((s) => s && String(s).trim() && String(s).trim() !== '—')
  const fullAddress = parts.join(', ') || '—'
  const upstairsKind = row.status === 'reminder' ? 'reminder' : row.status === 'offline' ? 'alert' : 'ok'
  return {
    fullAddress,
    zones: [
      {
        system: 'upstairs',
        thermostat: 'upstairs',
        thermostatKind: upstairsKind,
        equipment: ['DH6VSA4210', 'DFVE48DP1300AA'],
      },
      {
        system: 'downstairs',
        thermostat: 'downstairs',
        thermostatKind: 'ok',
        equipment: ['DH6VSA4210', 'DFVE48DP1300AA'],
      },
    ],
  }
}

function careDemoDetailIdChecksum(id) {
  return String(id)
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
}

/** Product-style System Overview fields for any current customer (merged with `expandDetail`). */
/** Digits only for `tel:` / `sms:` links from formatted phone strings. */
function careDemoPhoneDigits(display) {
  return String(display ?? '').replace(/\D/g, '')
}

function getCustomerOverviewData(customer) {
  const ex = customer.expandDetail ?? {}
  const base = makeExpandDetailFromRow(customer)
  const fullAddress = ex.fullAddress ?? base.fullAddress
  const { addressLine1, addressLine2 } = getAddressDisplayLines(customer, ex, fullAddress)
  const zones = ex.zones?.length ? ex.zones : base.zones
  const h = careDemoDetailIdChecksum(customer.id)
  const hasReminder =
    !customer.homeSold &&
    (customer.status === 'reminder' || zones.some((z) => z.thermostatKind === 'reminder'))
  const daysAgo = 100 + (h % 500)
  const reminderZone = zones.find((z) => z.thermostatKind === 'reminder') || zones[0]
  const serialA = String(2410271000 + (h % 899999))
  const serialB = String(2410182000 + ((h + 17) % 899999))
  const defaultEquipment = [
    { type: 'Air Handler', model: 'DFVE48DP1300AA', serial: serialA, status: 'ok' },
    { type: 'Heat Pump', model: 'DH6VSA4210', serial: serialB, status: 'ok' },
  ]
  const defaultReports = [
    { type: 'Homeowner', name: 'QA', date: 'December 15, 2022, 5:15 AM', createdBy: 'Test Admin' },
    { type: 'Commissioning', name: 'comm test report', date: 'December 12, 2022, 12:08 AM', createdBy: 'Test Admin' },
  ]
  const online = customer.status !== 'offline'
  const lifetimeLicenseActivated = !customer.homeSold && !!customer.licenseOk && !customer.licenseBad
  const assignedTech =
    customer.assigned && String(customer.assigned).trim() !== '—' ? customer.assigned : 'Bhavesh bharat'
  const phones = customer.phone
    ? [customer.phone, customer.phone]
    : ['(800) 838-9349', '(800) 838-9349']
  const reminderDaysShown =
    hasReminder && lifetimeLicenseActivated ? 255 : hasReminder ? daysAgo : null

  return {
    fullAddress,
    addressLine1,
    addressLine2,
    zones,
    equipmentRows: ex.equipmentRows ?? defaultEquipment,
    reportsRows: (ex.reportsRows ?? defaultReports).map((r) => ({
      ...r,
      createdBy: r.createdBy ?? 'Test Admin',
    })),
    activeReminderTitle: hasReminder ? 'Change media filter' : null,
    activeReminderSub: hasReminder ? `${reminderDaysShown} days ago` : null,
    thermostat: {
      zoneLabel: ex.thermostat?.zoneLabel ?? reminderZone?.system ?? 'upstairs',
      tempF: ex.thermostat?.tempF ?? 69,
      online: ex.thermostat?.online ?? online,
      hasActiveReminder: ex.thermostat?.hasActiveReminder ?? hasReminder,
      model: ex.thermostat?.model ?? 'One+Smart Thermostat',
      thermostatId: ex.thermostat?.thermostatId ?? 'DKN_100010997',
      serialNumber: ex.thermostat?.serialNumber ?? '',
    },
    lifetimeLicenseActivated,
    assignedTech,
    contactPhones: ex.contactPhones ?? phones,
    displayEmail: customer.email ?? `t_${String(customer.id).replace(/[^a-z0-9]/gi, '')}@${DEMO_FAKE_EMAIL_DOMAIN}`,
  }
}

function buildMockCurrentCustomers() {
  const rows = MOCK_CURRENT_CUSTOMERS_SEED.map((r) => ({
    ...r,
    expandDetail:
      r.id === 'c1'
        ? EXPAND_DETAIL_ROB_BARNES
        : r.id === 'sold-shingo'
          ? EXPAND_DETAIL_SHINGO_KISE
          : makeExpandDetailFromRow(r),
  }))
  const statuses = ['reminder', 'ok', 'offline']
  for (let i = rows.length + 1; i <= CURRENT_CUSTOMERS_TOTAL; i++) {
    const st = statuses[i % 3]
    const { loc1, loc2 } = syntheticCustomerAddress(i)
    const row = {
      id: `c${i}`,
      name: syntheticCustomerDisplayName(i),
      loc1,
      loc2,
      licenseOk: i % 4 !== 0,
      licenseBad: i % 7 === 0,
      status: st,
      assigned: ASSIGNEE_POOL[i % ASSIGNEE_POOL.length],
    }
    rows.push({ ...row, expandDetail: makeExpandDetailFromRow(row) })
  }
  return rows
}

const MOCK_CURRENT_CUSTOMERS = buildMockCurrentCustomers()

/** Demo “current user” for Only my Customers filter */
const CURRENT_CUSTOMERS_FILTER_ASSIGNED_ME = 'Dana Sample'

const CURRENT_CUSTOMER_TABLE_FILTERS_INITIAL = {
  criticalError: false,
  needsAttention: false,
  minorError: false,
  reminder: false,
  ok: false,
  offline: false,
  noAccess: false,
  onlyMine: false,
  activated: false,
  expiringSoon: false,
  expired: false,
  homeSold: false,
}

const CURRENT_CUSTOMER_STATUS_FILTER_KEYS = [
  'criticalError',
  'needsAttention',
  'minorError',
  'reminder',
  'ok',
  'offline',
  'noAccess',
]

const CURRENT_CUSTOMER_ACCOUNT_FILTER_KEYS = ['activated', 'expiringSoon', 'expired', 'homeSold']

function hashCustomerRowId(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

/** Tags used by the Customers header filter (demo heuristics + row fields). */
function getCurrentCustomerFilterTags(row) {
  const tags = new Set()
  if (row.homeSold) {
    tags.add('homeSold')
    tags.add('offline')
    return tags
  }

  if (row.status === 'reminder') tags.add('reminder')
  if (row.status === 'ok') tags.add('ok')
  if (row.status === 'offline') tags.add('offline')

  const h = hashCustomerRowId(row.id)
  if (h % 11 === 1) tags.add('criticalError')
  if (h % 13 === 2) tags.add('minorError')
  if (row.licenseBad || row.status === 'reminder') tags.add('needsAttention')

  if (!row.assigned || row.assigned === '—') tags.add('noAccess')

  if (row.licenseOk && !row.licenseBad) tags.add('activated')
  if (row.licenseBad) tags.add('expired')
  if (h % 17 === 3 && row.licenseOk && !row.licenseBad) tags.add('expiringSoon')

  return tags
}

function currentCustomerMatchesTableFilters(filters, row) {
  const tags = getCurrentCustomerFilterTags(row)

  const anyStatus = CURRENT_CUSTOMER_STATUS_FILTER_KEYS.some((k) => filters[k])
  if (anyStatus) {
    const ok = CURRENT_CUSTOMER_STATUS_FILTER_KEYS.some((k) => filters[k] && tags.has(k))
    if (!ok) return false
  }

  const anyAccount = CURRENT_CUSTOMER_ACCOUNT_FILTER_KEYS.some((k) => filters[k])
  if (anyAccount) {
    const ok = CURRENT_CUSTOMER_ACCOUNT_FILTER_KEYS.some((k) => filters[k] && tags.has(k))
    if (!ok) return false
  }

  if (filters.onlyMine && row.assigned !== CURRENT_CUSTOMERS_FILTER_ASSIGNED_ME) return false

  return true
}

/** “Invited Customers” table — mock rows */
const MOCK_INVITED_CUSTOMERS = [
  {
    id: 'i1',
    email: `invited.one@${DEMO_FAKE_EMAIL_DOMAIN}`,
    kind: 'sent',
    detail: 'Invitation sent - March 14, 2026 at 11:44 AM',
  },
  {
    id: 'i2',
    email: `invited.two@${DEMO_FAKE_EMAIL_DOMAIN}`,
    kind: 'sent',
    detail: 'Invitation sent - March 12, 2026 at 9:15 AM',
  },
  {
    id: 'i3',
    email: `invited.three@${DEMO_FAKE_EMAIL_DOMAIN}`,
    kind: 'sent',
    detail: 'Invitation sent - March 10, 2026 at 3:22 PM',
  },
  {
    id: 'i4',
    email: `declined.demo.a@${DEMO_FAKE_EMAIL_DOMAIN}`,
    kind: 'declined',
    detail: 'Declined - March 8, 2026 at 8:01 AM',
  },
  {
    id: 'i5',
    email: `declined.demo.b@${DEMO_FAKE_EMAIL_DOMAIN}`,
    kind: 'declined',
    detail: 'Declined - March 5, 2026 at 2:40 PM',
  },
]

/** “Licenses” view — Name, Location, License Status, System, Action (demo). */
const MOCK_LICENSE_ROWS = [
  {
    id: 'lic-1',
    linkedCustomerId: 'c1',
    name: 'Indigo Shaw',
    location: '150 Demo Saguaro Way, Sampleton, AZ 85088',
    licenseTier: 'expired',
    daysAgo: 1669,
    systemLabel: 'main room',
    systemIds: ['DV36FECC14AA'],
  },
  {
    id: 'lic-2',
    linkedCustomerId: 'c2',
    name: 'Jules Winter',
    location: '240 Fictional Creek Ln, Training City, CO 80388',
    licenseTier: 'expired',
    daysAgo: 892,
    systemLabel: 'home',
    systemIds: ['DFVE48DP1300AA'],
  },
  {
    id: 'lic-3',
    linkedCustomerId: 'c3',
    name: 'Kai Rowan',
    location: '19 Practice Harbor Rd, Demo Vista, WA 98188',
    licenseTier: 'expired',
    daysAgo: 340,
    systemLabel: 'downstairs',
    systemIds: ['DH6VSA4210', 'DZ17VSA361AA'],
  },
  {
    id: 'lic-4',
    linkedCustomerId: 'c4',
    name: 'Logan Pike',
    location: '880 Sample Lakeside Dr, Fictown, GA 30388',
    licenseTier: 'expiringSoon',
    expiresInDays: 18,
    systemLabel: 'basement',
    systemIds: ['DV36FECC14AA', 'DFVE48DP1300AA'],
  },
  {
    id: 'lic-5',
    linkedCustomerId: 'c5',
    name: 'Marin Dale',
    location: '55 Boilerplate Point Ct, Testville, ME 04188',
    licenseTier: 'expiringSoon',
    expiresInDays: 45,
    systemLabel: 'main floor',
    systemIds: ['DZ6VSA3610'],
  },
  {
    id: 'lic-6',
    linkedCustomerId: 'c6',
    name: 'Noel Avery',
    location: '120 Training Rue Demo, Sampleburg, QC H2Y 9Z9',
    licenseTier: 'active',
    systemLabel: 'primary',
    systemIds: ['DH6VSA4210'],
    /** Multi-zone extend flow (product-style). */
    licenseZoneGroups: ['primary', 'zix_living', 'gameroom', 'Ryka', 'Room1'],
  },
]

function licenseRowMatchesCheckboxes(row, boxes) {
  const b = boxes ?? DEFAULT_LICENSE_STATUS_CHECKBOXES
  const anyChecked = b.active || b.expiringSoon || b.expired
  if (!anyChecked) return true
  const tier = row.licenseTier ?? 'expired'
  return (b.active && tier === 'active') || (b.expiringSoon && tier === 'expiringSoon') || (b.expired && tier === 'expired')
}

/** License purchase modal — zones from optional `licenseZoneGroups`, multiple `systemIds`, or single zone. */
function licenseZonesFromRow(row) {
  const ids = row.systemIds ?? []
  const base = String(row.systemLabel ?? 'system').trim() || 'system'
  const groups = row.licenseZoneGroups
  if (Array.isArray(groups) && groups.length > 0) {
    return groups.map((g, i) => {
      const label = String(g).replace(/:\s*$/, '').trim() || `zone-${i + 1}`
      return { id: `${row.id}-z${i}`, groupLabel: `${label}:`, checked: true, plan: 'oneYear' }
    })
  }
  if (ids.length >= 2) {
    return [
      { id: `${row.id}-z0`, groupLabel: `${base}:`, checked: true, plan: 'oneYear' },
      { id: `${row.id}-z1`, groupLabel: 'main room:', checked: true, plan: 'oneYear' },
    ]
  }
  return [{ id: `${row.id}-z0`, groupLabel: `${base}:`, checked: true, plan: 'oneYear' }]
}

/** Top-bar search: substring match on display name (case-insensitive). */
function customerNameSearchMatches(displayName, query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return true
  return String(displayName ?? '').toLowerCase().includes(q)
}

function invitedRowMatchesSearch(row, query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return true
  return String(row.email ?? '').toLowerCase().includes(q)
}

/** Download XLSX modal — default checkbox state matches product screenshot. */
const INITIAL_DOWNLOAD_COLS = {
  cust_firstName: true,
  cust_lastName: true,
  therm_name: true,
  therm_access: true,
  loc_address1: true,
  loc_address2: true,
  loc_city: true,
  loc_state: true,
  loc_postal: true,
  indoor_model: true,
  sys_name: true,
  sys_license: true,
  outdoor_model: true,
  rem_electronic: true,
  rem_hepa: true,
  rem_media: true,
  rem_dehum: true,
  rem_humPad: true,
  rem_service: true,
  rem_uv: true,
  rem_ventilation: true,
  alert_critical: true,
  alert_attention: true,
}

/** Exact header strings & column order — matches Customer_Reminders_*.xlsx “Reminders” sheet. */
const EXPORT_HEADER_BY_ID = {
  cust_firstName: 'First name',
  cust_lastName: 'Last name',
  loc_address1: 'Address 1',
  loc_address2: 'Address 2',
  loc_city: 'City',
  loc_state: 'State',
  loc_postal: 'Postal code',
  sys_name: 'System name',
  sys_license: 'License',
  rem_electronic: 'Electronic filter',
  rem_hepa: 'Hepa filter',
  rem_media: 'Media filter',
  rem_dehum: 'Dehum filter',
  rem_humPad: 'Hum pad',
  rem_service: 'Service',
  rem_uv: 'Uv filter',
  rem_ventilation: 'Ventilation',
  therm_name: 'Thermostat name',
  therm_access: 'Access',
  indoor_model: 'Indoor unit',
  outdoor_model: 'Outdoor unit',
  alert_critical: 'Critical fault',
  alert_attention: 'Needs attention',
}

const EXPORT_COLUMN_ORDER = [
  'cust_firstName',
  'cust_lastName',
  'loc_address1',
  'loc_address2',
  'loc_city',
  'loc_state',
  'loc_postal',
  'sys_name',
  'sys_license',
  'rem_electronic',
  'rem_hepa',
  'rem_media',
  'rem_dehum',
  'rem_humPad',
  'rem_service',
  'rem_uv',
  'rem_ventilation',
  'therm_name',
  'therm_access',
  'indoor_model',
  'outdoor_model',
  'alert_critical',
  'alert_attention',
]

const DOWNLOAD_XLSX_MODAL_LAYOUT = [
  [
    {
      title: 'Customer',
      items: [
        { id: 'cust_firstName', label: 'First name' },
        { id: 'cust_lastName', label: 'Last name' },
      ],
    },
    {
      title: 'Thermostat',
      items: [
        { id: 'therm_name', label: 'Name' },
        { id: 'therm_access', label: 'Access' },
      ],
    },
  ],
  [
    {
      title: 'Location',
      items: [
        { id: 'loc_address1', label: 'Address 1' },
        { id: 'loc_address2', label: 'Address 2' },
        { id: 'loc_city', label: 'City' },
        { id: 'loc_state', label: 'State' },
        { id: 'loc_postal', label: 'Postal code' },
      ],
    },
    {
      title: 'Indoor Unit',
      items: [{ id: 'indoor_model', label: 'Model' }],
    },
  ],
  [
    {
      title: 'System',
      items: [
        { id: 'sys_name', label: 'Name' },
        { id: 'sys_license', label: 'License' },
      ],
    },
    {
      title: 'Outdoor Unit',
      items: [{ id: 'outdoor_model', label: 'Model' }],
    },
  ],
  [
    {
      title: 'Reminders',
      items: [
        { id: 'rem_electronic', label: 'Electronic filter' },
        { id: 'rem_hepa', label: 'Hepa filter' },
        { id: 'rem_media', label: 'Media filter' },
        { id: 'rem_dehum', label: 'Dehum filter' },
        { id: 'rem_humPad', label: 'Hum pad' },
        { id: 'rem_service', label: 'Service' },
        { id: 'rem_uv', label: 'Uv filter' },
        { id: 'rem_ventilation', label: 'Ventilation' },
      ],
    },
    {
      title: 'Alerts',
      items: [
        { id: 'alert_critical', label: 'Critical fault' },
        { id: 'alert_attention', label: 'Needs attention' },
      ],
    },
  ],
]

function splitFirstLast(name) {
  const i = name.indexOf(' ')
  if (i === -1) return { first: name, last: '' }
  return { first: name.slice(0, i), last: name.slice(i + 1).trim() }
}

function parseLocationForExport(location) {
  const i = location.indexOf(',')
  if (i === -1) return { address1: location, address2: '', city: '', state: '', postal: '' }
  const address1 = location.slice(0, i).trim()
  const rest = location.slice(i + 1).trim()
  const m = rest.match(/^(.+),\s*([A-Za-z]{2})\s+(.+)$/)
  if (m)
    return {
      address1,
      address2: '',
      city: m[1].trim(),
      state: m[2].trim(),
      postal: m[3].trim(),
    }
  return { address1, address2: '', city: rest, state: '', postal: '' }
}

const REMINDER_COLUMN_IDS = [
  'rem_electronic',
  'rem_hepa',
  'rem_media',
  'rem_dehum',
  'rem_humPad',
  'rem_service',
  'rem_uv',
  'rem_ventilation',
]

const EXPORT_NA = 'N/A'

function kindToReminderColumnId(kind) {
  const k = kind.toLowerCase()
  if (k.includes('electronic')) return 'rem_electronic'
  if (k.includes('hepa')) return 'rem_hepa'
  if (k.includes('media')) return 'rem_media'
  if (k.includes('dehum')) return 'rem_dehum'
  if (k.includes('hum') && k.includes('pad')) return 'rem_humPad'
  if (k.includes('service')) return 'rem_service'
  if (k.includes('uv')) return 'rem_uv'
  if (k.includes('ventil')) return 'rem_ventilation'
  return null
}

function formatDaysAgo(n) {
  return `${n} Days ago`
}

function buildReminderExportRow(selectedIds, cust, reminder) {
  const loc = parseLocationForExport(cust.location)
  const { first, last } = splitFirstLast(cust.name)
  const activeRemId = kindToReminderColumnId(reminder.kind)
  const row = {}
  for (const id of selectedIds) {
    const header = EXPORT_HEADER_BY_ID[id]
    switch (id) {
      case 'cust_firstName':
        row[header] = first
        break
      case 'cust_lastName':
        row[header] = last || ' '
        break
      case 'loc_address1':
        row[header] = loc.address1
        break
      case 'loc_address2':
        row[header] = loc.address2 && loc.address2.trim() ? loc.address2 : EXPORT_NA
        break
      case 'loc_city':
        row[header] = loc.city
        break
      case 'loc_state':
        row[header] = loc.state
        break
      case 'loc_postal':
        row[header] = loc.postal
        break
      case 'sys_name':
        row[header] = cust.systemName ?? EXPORT_NA
        break
      case 'sys_license':
        row[header] = cust.license ?? EXPORT_NA
        break
      case 'therm_name':
        row[header] = cust.thermostatName ?? cust.systemName ?? EXPORT_NA
        break
      case 'therm_access':
        row[header] = cust.access ?? EXPORT_NA
        break
      case 'indoor_model':
        row[header] = cust.indoor
        break
      case 'outdoor_model':
        row[header] = cust.outdoor
        break
      case 'alert_critical':
      case 'alert_attention':
        row[header] = EXPORT_NA
        break
      default:
        if (REMINDER_COLUMN_IDS.includes(id)) {
          row[header] = id === activeRemId ? formatDaysAgo(reminder.daysAgo) : EXPORT_NA
        }
    }
  }
  return row
}

function exportCustomersXlsx(selected, customers) {
  const ids = EXPORT_COLUMN_ORDER.filter((id) => selected[id])
  if (ids.length === 0) return

  const rows = []
  for (const cust of customers) {
    for (const reminder of cust.reminders) {
      rows.push(buildReminderExportRow(ids, cust, reminder))
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Reminders')
  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `Customer_Reminders_${stamp}.xlsx`)
}

function DownloadXlsxModal({ open, onClose, customers }) {
  const [cols, setCols] = useState(() => ({ ...INITIAL_DOWNLOAD_COLS }))

  useEffect(() => {
    if (open) setCols({ ...INITIAL_DOWNLOAD_COLS })
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const toggle = (id) => {
    setCols((c) => ({ ...c, [id]: !c[id] }))
  }

  const selectedCount = Object.values(cols).filter(Boolean).length

  const handleDownload = () => {
    if (selectedCount === 0) return
    exportCustomersXlsx(cols, customers)
    onClose()
  }

  const modal = (
    <div
      className="care-demo-xlsx-modal__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-demo-xlsx-modal-title"
        className="care-demo-xlsx-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="care-demo-xlsx-modal-title" className="care-demo-xlsx-modal__title">
          Download XLSX
        </h2>
        <p className="care-demo-xlsx-modal__intro">
          Choose the columns you would like to include in the downloaded spreadsheet:
        </p>
        <div className="care-demo-xlsx-modal__grid">
          {DOWNLOAD_XLSX_MODAL_LAYOUT.map((column, ci) => (
            <div key={ci} className="care-demo-xlsx-modal__col">
              {column.map((group) => (
                <div key={group.title} className="care-demo-xlsx-modal__group">
                  <h3 className="care-demo-xlsx-modal__group-title">{group.title}</h3>
                  <ul className="care-demo-xlsx-modal__items">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <label className="care-demo-xlsx-modal__check">
                          <input
                            type="checkbox"
                            className="care-demo-xlsx-modal__input"
                            checked={cols[item.id]}
                            onChange={() => toggle(item.id)}
                          />
                          <span className="care-demo-xlsx-modal__label">{item.label}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="care-demo-xlsx-modal__footer">
          <button type="button" className="care-demo-xlsx-modal__btn care-demo-xlsx-modal__btn--close" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="care-demo-xlsx-modal__btn care-demo-xlsx-modal__btn--download"
            onClick={handleDownload}
            disabled={selectedCount === 0}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

/** Widget link / arrow blue (screenshots: Alerts #0072A6, Reminders #0072A0 — single token) */
const WIDGET_LINK_BLUE = '#0072a6'

function AlertDangerIcon() {
  return (
    <svg className="care-demo-alerts__triangle" width="24" height="22" viewBox="0 0 24 22" aria-hidden>
      <path d="M12 1.2L22.2 19.5H1.8L12 1.2z" fill="#E84135" />
      <path d="M12 7.2v4.8" stroke="#fff" strokeWidth="1.85" strokeLinecap="round" />
      <circle cx="12" cy="15.6" r="1.25" fill="#fff" />
    </svg>
  )
}

function ReminderGreyCalendarIcon() {
  return (
    <span className="care-demo-reminders__icon-composite" aria-hidden>
      <Calendar className="care-demo-reminders__cal" size={18} strokeWidth={2} color="#888888" />
      <History className="care-demo-reminders__history" size={11} strokeWidth={2.2} color="#888888" />
    </span>
  )
}

/** Folder + person + lines — matches Customers “Add Customer” icon (outline). */
function AddCustomerIcon() {
  return (
    <svg
      className="care-demo-customers__add-icon"
      width="24"
      height="20"
      viewBox="0 0 24 20"
      aria-hidden
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        d="M2.5 5h5.2L9.5 3h12V17.5H2.5V5z"
      />
      <circle cx="9.2" cy="11.2" r="2.15" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" d="M15 10h5M15 12.5h5M15 15h4" />
    </svg>
  )
}

function SystemAccessPanel() {
  return (
    <div className="care-demo-sa">
      {SYSTEM_ACCESS_ROWS.map(({ count, label }) => {
        const pct = SYSTEM_ACCESS_MAX > 0 ? (count / SYSTEM_ACCESS_MAX) * 100 : 0
        return (
          <div className="care-demo-sa__row" key={label}>
            <div className="care-demo-sa__text">
              <span className="care-demo-sa__num">{count}</span>
              <span className="care-demo-sa__label"> {label}</span>
            </div>
            <div className="care-demo-sa__track" aria-hidden>
              <div
                className="care-demo-sa__bar"
                style={{ width: `clamp(6px, ${pct}%, 100%)` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AlertsPanel() {
  const [alertPage, setAlertPage] = useState(0)
  const totalPages = ALERT_PAGES.length
  const rows = ALERT_PAGES[alertPage] ?? ALERT_PAGES[0]
  const canPrev = alertPage > 0
  const canNext = alertPage < totalPages - 1

  return (
    <div className="care-demo-alerts">
      <div className="care-demo-alerts__list">
        {rows.map((row, i) => (
          <div className="care-demo-alerts__row" key={`${alertPage}-${i}-${row.title}`}>
            <div className="care-demo-alerts__main">
              <AlertDangerIcon />
              <div className="care-demo-alerts__text-col">
                <div className="care-demo-alerts__item-title">{row.title}</div>
                <div className="care-demo-alerts__item-when">{row.when}</div>
              </div>
            </div>
            <ArrowRight
              className="care-demo-alerts__arrow"
              size={20}
              strokeWidth={2.25}
              color={WIDGET_LINK_BLUE}
              aria-hidden
            />
          </div>
        ))}
      </div>
      <nav className="care-demo-alerts__pagination" aria-label="Alert pages">
        <button
          type="button"
          className="care-demo-alerts__page-btn"
          aria-label="Previous page"
          disabled={!canPrev}
          onClick={() => setAlertPage((p) => Math.max(0, p - 1))}
        >
          <ChevronLeft size={18} strokeWidth={2.25} aria-hidden />
        </button>
        <span className="care-demo-alerts__page-label">
          {alertPage + 1} of {totalPages}
        </span>
        <button
          type="button"
          className="care-demo-alerts__page-btn"
          aria-label="Next page"
          disabled={!canNext}
          onClick={() => setAlertPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          <ChevronRight size={18} strokeWidth={2.25} aria-hidden />
        </button>
      </nav>
    </div>
  )
}

function RemindersPanel({ onRowNavigate }) {
  return (
    <ul className="care-demo-reminders">
      {REMINDER_ROWS.map((row) => {
        const inner = (
          <>
            <span className="care-demo-reminders__leading">
              {row.variant === 'active' ? (
                <CalendarCheck
                  className="care-demo-reminders__icon-active"
                  size={20}
                  strokeWidth={2}
                  color="#0072a0"
                  aria-hidden
                />
              ) : (
                <ReminderGreyCalendarIcon />
              )}
              <span className="care-demo-reminders__copy">
                <strong className="care-demo-reminders__num">{row.num}</strong>
                <span className="care-demo-reminders__rest">{row.rest}</span>
              </span>
            </span>
            <ArrowRight
              className="care-demo-reminders__arrow"
              size={20}
              strokeWidth={2.25}
              color="#0072a0"
              aria-hidden
            />
          </>
        )
        return (
          <li key={row.num + row.rest} className="care-demo-reminders__item">
            <button
              type="button"
              className="care-demo-reminders__row care-demo-reminders__row--clickable"
              onClick={() => onRowNavigate(row.range)}
            >
              {inner}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** Split "street, city, ST zip" at first comma for two-line location (product-style). */
function splitStreetAndRest(location) {
  const i = location.indexOf(',')
  if (i === -1) return { line1: location, line2: null }
  return { line1: location.slice(0, i).trim(), line2: location.slice(i + 1).trim() }
}

function InviteCustomersModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setDone(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const canSend = email.trim().length > 3 && email.includes('@')

  const modal = (
    <div
      className="care-demo-invite-modal__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-demo-invite-title"
        className="care-demo-invite-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="care-demo-invite-title" className="care-demo-invite-modal__title">
          Invite Customers
        </h2>
        {done ? (
          <>
            <p className="care-demo-invite-modal__success" role="status">
              We have sent an invitation to {email.trim()}.
            </p>
            <p className="care-demo-invite-modal__note">Demo only — no email was sent.</p>
            <div className="care-demo-invite-modal__footer">
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="care-demo-invite-modal__intro">
              Invite customers using their SkyportHome account. Enter the same email address the homeowner uses for their account in the
              SkyportHome mobile app.
            </p>
            <label className="care-demo-invite-modal__label" htmlFor="care-demo-invite-email">
              Email
            </label>
            <input
              id="care-demo-invite-email"
              type="email"
              className="care-demo-invite-modal__input"
              placeholder={`homeowner@${DEMO_FAKE_EMAIL_DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <div className="care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary"
                disabled={!canSend}
                onClick={() => setDone(true)}
              >
                Send Invitation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function splitCustomerDisplayName(fullName) {
  const s = String(fullName ?? '').trim()
  if (!s) return { firstName: '', lastName: '' }
  const i = s.indexOf(' ')
  if (i === -1) return { firstName: s, lastName: '' }
  return { firstName: s.slice(0, i), lastName: s.slice(i + 1).trim() }
}

function currentRowToEditCustomerPayload(row) {
  const { firstName, lastName } = splitCustomerDisplayName(row.name)
  const slug =
    String(row.name ?? 'customer')
      .toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '') || 'customer'
  const email = row.email ?? `${slug}@${DEMO_FAKE_EMAIL_DOMAIN}`
  const phone = row.phone ?? DEMO_DEFAULT_CUSTOMER_PHONE
  return { id: row.id, firstName, lastName, email, phone }
}

function reminderCustomerToEditPayload(cust) {
  const { firstName, lastName } = splitCustomerDisplayName(cust.name)
  const slug =
    String(cust.name ?? 'customer')
      .toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '') || 'customer'
  return {
    id: cust.id,
    firstName,
    lastName,
    email: `${slug}@${DEMO_FAKE_EMAIL_DOMAIN}`,
    phone: DEMO_DEFAULT_CUSTOMER_PHONE,
  }
}

function EditCustomerModal({ open, customer, onClose }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open || !customer) return
    setFirstName(customer.firstName)
    setLastName(customer.lastName)
    setPhone(customer.phone)
    setDone(false)
  }, [open, customer])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !customer) return null

  const canUpdate = firstName.trim().length > 0 && phone.trim().length > 0

  const modal = (
    <div
      className="care-demo-invite-modal__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-demo-editcust-title"
        className="care-demo-invite-modal care-demo-edit-customer-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="care-demo-editcust-title" className="care-demo-invite-modal__title">
          Edit Customer
        </h2>
        {done ? (
          <>
            <p className="care-demo-invite-modal__success" role="status">
              Customer updated.
            </p>
            <div className="care-demo-invite-modal__footer">
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="care-demo-edit-customer-modal__grid">
              <div className="care-demo-edit-customer-modal__field">
                <label className="care-demo-invite-modal__label" htmlFor="care-demo-editcust-first">
                  First Name<span className="care-demo-edit-customer-modal__req" aria-hidden="true">*</span>
                </label>
                <input
                  id="care-demo-editcust-first"
                  type="text"
                  className="care-demo-invite-modal__input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="care-demo-edit-customer-modal__field">
                <label className="care-demo-invite-modal__label" htmlFor="care-demo-editcust-last">
                  Last Name<span className="care-demo-edit-customer-modal__req" aria-hidden="true">*</span>
                </label>
                <input
                  id="care-demo-editcust-last"
                  type="text"
                  className="care-demo-invite-modal__input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
              <div className="care-demo-edit-customer-modal__field">
                <label className="care-demo-invite-modal__label" htmlFor="care-demo-editcust-email">
                  Email Address<span className="care-demo-edit-customer-modal__req" aria-hidden="true">*</span>
                </label>
                <input
                  id="care-demo-editcust-email"
                  type="email"
                  className="care-demo-invite-modal__input care-demo-invite-modal__input--readonly"
                  value={customer.email}
                  readOnly
                  disabled
                  aria-readonly="true"
                />
              </div>
              <div className="care-demo-edit-customer-modal__field">
                <label className="care-demo-invite-modal__label" htmlFor="care-demo-editcust-phone">
                  Phone Number<span className="care-demo-edit-customer-modal__req" aria-hidden="true">*</span>
                </label>
                <input
                  id="care-demo-editcust-phone"
                  type="tel"
                  className="care-demo-invite-modal__input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--muted" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary"
                disabled={!canUpdate}
                onClick={() => setDone(true)}
              >
                Update Customer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

/** Customers “+” — email only (SkyportHome account), same validation as Invite Customers. */
function AddCustomerModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setDone(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const canAdd = email.trim().length > 3 && email.includes('@')

  const modal = (
    <div
      className="care-demo-invite-modal__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-demo-addcust-title"
        className="care-demo-invite-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="care-demo-addcust-title" className="care-demo-invite-modal__title">
          Add Customer
        </h2>
        {done ? (
          <>
            <p className="care-demo-invite-modal__success" role="status">
              We have sent an invitation to {email.trim()}.
            </p>
            <p className="care-demo-invite-modal__note">Demo only — no email was sent.</p>
            <div className="care-demo-invite-modal__footer">
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="care-demo-invite-modal__label" htmlFor="care-demo-addcust-email">
              Email
            </label>
            <input
              id="care-demo-addcust-email"
              type="email"
              className="care-demo-invite-modal__input"
              placeholder={`homeowner@${DEMO_FAKE_EMAIL_DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <div className="care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary"
                disabled={!canAdd}
                onClick={() => setDone(true)}
              >
                Add customer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function locationRadioLabelFromZone(z) {
  return String(z.groupLabel ?? '').replace(/:\s*$/, '').trim() || 'Location'
}

function licenseZoneLinePrice(plan) {
  return plan === 'lifetime' ? 400 : 60
}

function licensePlanLineLabel(plan) {
  return plan === 'lifetime' ? 'Lifetime License' : 'One Year License'
}

function formatLicenseMoney(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function SkyportCareLicenseModal({ row, onClose }) {
  /** Sync with `row` on mount (`key={row.id}` remounts when row changes). */
  const [zones, setZones] = useState(() => licenseZonesFromRow(row))
  /** Card purchase vs post-purchase activation (Warranty Express). */
  const [mode, setMode] = useState('renew')
  const [warrantyLocationId, setWarrantyLocationId] = useState(() => {
    const z = licenseZonesFromRow(row)
    return z.length >= 2 ? z[1].id : z[0]?.id ?? null
  })
  const [outdoorSerial, setOutdoorSerial] = useState('')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const { line1, line2 } = splitStreetAndRest(row.location)

  const setZoneChecked = (id, checked) => {
    setZones((zs) => zs.map((z) => (z.id === id ? { ...z, checked } : z)))
  }

  const setZonePlan = (id, plan) => {
    setZones((zs) => zs.map((z) => (z.id === id ? { ...z, plan } : z)))
  }

  const canActivateWarranty = outdoorSerial.trim().length > 0
  const canProceedToReview = zones.some((z) => z.checked)
  const checkoutZones = zones.filter((z) => z.checked)
  const orderSubtotal = checkoutZones.reduce((sum, z) => sum + licenseZoneLinePrice(z.plan), 0)
  const orderEstimatedTax = 0
  const orderTotal = orderSubtotal

  const renewLead =
    'SkyportCare license can be renewed using your credit card either for one year or for the lifetime of the system.'

  const modalTitle = 'SkyportCare License'

  /** Review / Warranty Express — “Customer:” block (matches order review screenshot). */
  const customerBlock = (
    <div className="care-demo-license-modal__customer">
      <div className="care-demo-license-modal__customer-label">Customer:</div>
      <div className="care-demo-license-modal__customer-lines">
        <div>{row.name}</div>
        <div>{line1}</div>
        {line2 ? <div>{line2}</div> : null}
      </div>
    </div>
  )

  /** Zone picker step — “Customer Name:” / “Address:” (matches extend flow screenshot). */
  const customerBlockRenew = (
    <div className="care-demo-license-modal__customer care-demo-license-modal__customer--renew-kv">
      <div className="care-demo-license-modal__renew-kv">
        <div className="care-demo-license-modal__renew-kv-label">Customer Name:</div>
        <div className="care-demo-license-modal__renew-kv-value">{row.name}</div>
      </div>
      <div className="care-demo-license-modal__renew-kv">
        <div className="care-demo-license-modal__renew-kv-label">Address:</div>
        <div className="care-demo-license-modal__renew-kv-value">
          <div>{line1}</div>
          {line2 ? <div>{line2}</div> : null}
        </div>
      </div>
    </div>
  )

  const modal = (
    <div
      className="care-demo-invite-modal__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-demo-skyport-license-title"
        className="care-demo-invite-modal care-demo-license-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="care-demo-skyport-license-title" className="care-demo-license-modal__title">
          {modalTitle}
        </h2>

        {mode === 'renew' ? (
          <>
            <p className="care-demo-license-modal__lead">{renewLead}</p>
            <div className="care-demo-license-modal__rule" aria-hidden />
            {customerBlockRenew}

            <div className="care-demo-license-modal__zones">
              {zones.map((z) => (
                <div key={z.id} className="care-demo-license-modal__zone">
                  <label className="care-demo-license-modal__zone-head">
                    <input
                      type="checkbox"
                      className="care-demo-license-modal__zone-check"
                      checked={z.checked}
                      onChange={(e) => setZoneChecked(z.id, e.target.checked)}
                    />
                    <span className="care-demo-license-modal__zone-name">{z.groupLabel}</span>
                  </label>
                  {z.checked ? (
                    <div className="care-demo-license-modal__plans" role="group" aria-label={`License for ${z.groupLabel}`}>
                      <label className="care-demo-license-modal__plan-row">
                        <span className="care-demo-license-modal__plan-left">
                          <input
                            type="radio"
                            name={`care-license-plan-${z.id}`}
                            className="care-demo-license-modal__radio"
                            checked={z.plan === 'lifetime'}
                            onChange={() => setZonePlan(z.id, 'lifetime')}
                          />
                          <span>Lifetime License</span>
                        </span>
                        <span className="care-demo-license-modal__plan-price">$400.00</span>
                      </label>
                      <label className="care-demo-license-modal__plan-row">
                        <span className="care-demo-license-modal__plan-left">
                          <input
                            type="radio"
                            name={`care-license-plan-${z.id}`}
                            className="care-demo-license-modal__radio"
                            checked={z.plan === 'oneYear'}
                            onChange={() => setZonePlan(z.id, 'oneYear')}
                          />
                          <span>One Year License</span>
                        </span>
                        <span className="care-demo-license-modal__plan-price">$60.00</span>
                      </label>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="care-demo-license-modal__rule" aria-hidden />
            <button
              type="button"
              className="care-demo-license-modal__warranty-link"
              onClick={() => {
                setMode('warrantyExpress')
                setOutdoorSerial('')
                const z = licenseZonesFromRow(row)
                setWarrantyLocationId(z.length >= 2 ? z[1].id : z[0]?.id ?? null)
              }}
            >
              <FileCheck className="care-demo-license-modal__warranty-icon" size={20} strokeWidth={2} aria-hidden />
              Already purchased with Warranty Express?
            </button>

            <div className="care-demo-license-modal__footer care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary"
                disabled={!canProceedToReview}
                onClick={() => setMode('reviewOrder')}
              >
                Review Order
              </button>
            </div>
          </>
        ) : null}

        {mode === 'warrantyExpress' ? (
          <>
            <p className="care-demo-license-modal__lead care-demo-license-modal__lead--warranty">
              A SkyportCare license can be purchased through Warranty Express.{' '}
              <a
                className="care-demo-license-modal__inline-link"
                href="https://daikincomfort.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                See how to purchase a plan.
              </a>{' '}
              It may take up to two hours to reflect new plan purchases in the SkyportCare portal.{' '}
              <a
                className="care-demo-license-modal__inline-link"
                href="https://warranty.goodmanmfg.com/WCS/Account/Login.aspx?ReturnUrl=%2fWCS"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Warranty Express.
              </a>
            </p>
            <div className="care-demo-license-modal__rule" aria-hidden />
            {customerBlock}

            <fieldset className="care-demo-license-modal__location-fieldset">
              <legend className="care-demo-license-modal__location-legend">Location</legend>
              <div className="care-demo-license-modal__location-radios">
                {zones.map((z) => (
                  <label key={z.id} className="care-demo-license-modal__location-row">
                    <input
                      type="radio"
                      className="care-demo-license-modal__radio"
                      name="care-license-warranty-location"
                      checked={warrantyLocationId === z.id}
                      onChange={() => setWarrantyLocationId(z.id)}
                    />
                    <span>{locationRadioLabelFromZone(z)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="care-demo-license-modal__activation">
              <div className="care-demo-license-modal__activation-title" id="care-demo-license-activation-label">
                License Activation
              </div>
              <p className="care-demo-license-modal__activation-copy">
                To activate a license after purchase, enter the outdoor unit serial number.
              </p>
              <label className="care-demo-license-modal__sr-only" htmlFor="care-demo-license-outdoor-serial">
                Outdoor unit serial number (required)
              </label>
              <input
                id="care-demo-license-outdoor-serial"
                type="text"
                className="care-demo-license-modal__serial-input"
                placeholder="Enter outdoor unit serial number*"
                value={outdoorSerial}
                onChange={(e) => setOutdoorSerial(e.target.value)}
                autoComplete="off"
                aria-labelledby="care-demo-license-activation-label"
              />
            </div>

            <div className="care-demo-license-modal__footer care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-invite-modal__btn--cancel"
                onClick={() => setMode('renew')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary"
                disabled={!canActivateWarranty}
                onClick={onClose}
              >
                Activate License
              </button>
            </div>
          </>
        ) : null}

        {mode === 'reviewOrder' ? (
          <>
            <p className="care-demo-license-modal__lead">{renewLead}</p>
            <div className="care-demo-license-modal__rule" aria-hidden />
            {customerBlock}

            <div className="care-demo-license-modal__review">
              {checkoutZones.map((z) => (
                <div key={z.id} className="care-demo-license-modal__review-zone">
                  <div className="care-demo-license-modal__review-zone-title">{z.groupLabel}</div>
                  <div className="care-demo-license-modal__review-row">
                    <span>{licensePlanLineLabel(z.plan)}</span>
                    <span className="care-demo-license-modal__review-row-price">{formatLicenseMoney(licenseZoneLinePrice(z.plan))}</span>
                  </div>
                </div>
              ))}
              <div className="care-demo-license-modal__review-row care-demo-license-modal__review-row--tax">
                <span>Estimated tax*</span>
                <span className="care-demo-license-modal__review-row-price">{formatLicenseMoney(orderEstimatedTax)}</span>
              </div>
              <div className="care-demo-license-modal__review-row care-demo-license-modal__review-row--total">
                <span>Total</span>
                <span className="care-demo-license-modal__review-row-price">{formatLicenseMoney(orderTotal)}</span>
              </div>
              <p className="care-demo-license-modal__review-footnote">
                *The final sales tax will be displayed once the order is confirmed.
              </p>
            </div>

            <div className="care-demo-license-modal__rule" aria-hidden />
            <div className="care-demo-license-modal__footer care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-license-modal__btn--back"
                onClick={() => setMode('renew')}
              >
                Back
              </button>
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary" onClick={onClose}>
                Checkout
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

const ADD_MEMBER_ROLES = ['Admin', 'Tech', 'Installer']

function AddMemberModal({ open, onClose }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Admin')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) return
    setFirstName('')
    setLastName('')
    setEmail('')
    setRole('Admin')
    setDone(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const emailOk = email.trim().length > 3 && email.includes('@')
  const canInvite = firstName.trim().length > 0 && lastName.trim().length > 0 && emailOk

  const modal = (
    <div
      className="care-demo-invite-modal__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-demo-add-member-title"
        className="care-demo-invite-modal care-demo-add-member-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {done ? (
          <>
            <div className="care-demo-add-member-modal__header">
              <h2 id="care-demo-add-member-title" className="care-demo-invite-modal__title care-demo-add-member-modal__title-only">
                Add Member
              </h2>
              <button type="button" className="care-demo-add-member-modal__close" onClick={onClose} aria-label="Close">
                <X size={20} strokeWidth={2} color="#888" />
              </button>
            </div>
            <p className="care-demo-invite-modal__success" role="status">
              We have invited {email.trim()} as {role}.
            </p>
            <p className="care-demo-invite-modal__note">Demo only — no email was sent.</p>
            <div className="care-demo-invite-modal__footer care-demo-add-member-modal__footer-success">
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-add-member-modal__btn-primary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="care-demo-add-member-modal__header">
              <h2 id="care-demo-add-member-title" className="care-demo-invite-modal__title care-demo-add-member-modal__title-only">
                Add Member
              </h2>
              <button type="button" className="care-demo-add-member-modal__close" onClick={onClose} aria-label="Close">
                <X size={20} strokeWidth={2} color="#888" />
              </button>
            </div>
            <div className="care-demo-add-member-modal__grid">
              <div className="care-demo-add-member-modal__field">
                <label className="care-demo-add-member-modal__label" htmlFor="care-demo-add-member-first">
                  First Name<span aria-hidden> *</span>
                </label>
                <input
                  id="care-demo-add-member-first"
                  type="text"
                  className="care-demo-invite-modal__input care-demo-add-member-modal__input"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="care-demo-add-member-modal__field">
                <label className="care-demo-add-member-modal__label" htmlFor="care-demo-add-member-last">
                  Last Name<span aria-hidden> *</span>
                </label>
                <input
                  id="care-demo-add-member-last"
                  type="text"
                  className="care-demo-invite-modal__input care-demo-add-member-modal__input"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>
              <div className="care-demo-add-member-modal__field">
                <label className="care-demo-add-member-modal__label" htmlFor="care-demo-add-member-email">
                  Email Address<span aria-hidden> *</span>
                </label>
                <input
                  id="care-demo-add-member-email"
                  type="email"
                  className="care-demo-invite-modal__input care-demo-add-member-modal__input"
                  placeholder={`homeowner@${DEMO_FAKE_EMAIL_DOMAIN}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="care-demo-add-member-modal__field">
                <label className="care-demo-add-member-modal__label" htmlFor="care-demo-add-member-role">
                  Role
                </label>
                <select
                  id="care-demo-add-member-role"
                  className="care-demo-add-member-modal__select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ADD_MEMBER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
              <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-add-member-modal__btn-primary"
                disabled={!canInvite}
                onClick={() => setDone(true)}
              >
                Invite Member
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function careDemoPublicFileUrl(filename) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  return new URL(`${base}${filename}`, window.location.origin).href
}

/** Fetch from `public/` and save as a file (blob + delayed revoke so the browser can finish the download). */
async function careDemoDownloadPublicFile(path, saveAs) {
  const res = await fetch(careDemoPublicFileUrl(path))
  if (!res.ok) throw new Error(`Could not download ${saveAs} (${res.status})`)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = saveAs
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2500)
  }
}

function SoldHomesModal({ open, onClose, onViewInCustomerList, onSelectCustomerName }) {
  const [menuOpenFor, setMenuOpenFor] = useState(null)
  const [dismissedRowIds, setDismissedRowIds] = useState(() => new Set())
  const [reachOutOpen, setReachOutOpen] = useState(false)
  const [introLetter, setIntroLetter] = useState(true)
  const [homeownerGuide, setHomeownerGuide] = useState(true)
  const [mailerDownloadError, setMailerDownloadError] = useState(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    setMenuOpenFor(null)
    setDismissedRowIds(new Set())
    setReachOutOpen(false)
    setMailerDownloadError(null)
  }, [open])

  useEffect(() => {
    if (!reachOutOpen) return
    setMailerDownloadError(null)
  }, [reachOutOpen])

  useEffect(() => {
    if (!open || !menuOpenFor) return
    const onDocMouseDown = (e) => {
      const t = e.target
      if (t.closest?.('.care-demo-sold-homes-modal__menu')) return
      if (t.closest?.('.care-demo-sold-homes-modal__ellipsis')) return
      setMenuOpenFor(null)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open, menuOpenFor])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (reachOutOpen) {
        e.stopPropagation()
        setReachOutOpen(false)
        return
      }
      if (menuOpenFor) {
        e.stopPropagation()
        setMenuOpenFor(null)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, menuOpenFor, reachOutOpen])

  if (!open) return null

  const visibleRows = SOLD_HOMES_MODAL_ROWS.filter((r) => !dismissedRowIds.has(r.customerId))

  const downloadMaterials = async () => {
    setMailerDownloadError(null)
    try {
      if (introLetter) {
        await careDemoDownloadPublicFile('Introductory-Letter.docx', 'Introductory-Letter.docx')
      }
      if (homeownerGuide) {
        if (introLetter) await new Promise((r) => setTimeout(r, 450))
        await careDemoDownloadPublicFile('Homeowner-Guide.docx', 'Homeowner-Guide.docx')
      }
      setReachOutOpen(false)
    } catch (err) {
      console.error(err)
      setMailerDownloadError(err instanceof Error ? err.message : 'Download failed.')
    }
  }

  const modal = (
    <div
      className="care-demo-invite-modal__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-demo-sold-homes-title"
        className="care-demo-invite-modal care-demo-sold-homes-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="care-demo-sold-homes-title" className="care-demo-sold-homes-modal__title">
          Some Customers May Have Sold Their Home
        </h2>
        <div className="care-demo-sold-homes-modal__body">
          <p className="care-demo-sold-homes-modal__intro">
            With the SkyportCare system still in place in these homes you have an opportunity to reach out to the new homeowner
            and continue SkyportCare with a new customer. Download, print, and send out mailers to the addresses below.
          </p>
          <p className="care-demo-sold-homes-modal__intro">
            Also, contact your customer who has sold their home and see if you can offer your services in their new home.
          </p>
          <div className="care-demo-sold-homes-modal__table-wrap">
            <table className="care-demo-sold-homes-modal__table">
              <thead>
                <tr>
                  <th scope="col">Address</th>
                  <th scope="col">Your Customer</th>
                  <th scope="col" className="care-demo-sold-homes-modal__th-actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="care-demo-sold-homes-modal__empty">
                      No pending sold-home notifications (demo).
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.customerId}>
                      <td className="care-demo-sold-homes-modal__addr">{row.address}</td>
                      <td>
                        <button
                          type="button"
                          className="care-demo-sold-homes-modal__name-btn"
                          onClick={() => onSelectCustomerName(row.customerId)}
                        >
                          {row.customerName}
                        </button>
                      </td>
                      <td className="care-demo-sold-homes-modal__row-actions">
                        <div className="care-demo-sold-homes-modal__menu-wrap">
                          <button
                            type="button"
                            className="care-demo-sold-homes-modal__ellipsis"
                            aria-label="Row actions"
                            aria-expanded={menuOpenFor === row.customerId}
                            aria-haspopup="menu"
                            aria-controls={`sold-homes-menu-${row.customerId}`}
                            id={`sold-homes-trigger-${row.customerId}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setMenuOpenFor((id) => (id === row.customerId ? null : row.customerId))
                            }}
                          >
                            <MoreHorizontal size={20} strokeWidth={2} color={CUSTOMERS_BLUE} />
                          </button>
                          {menuOpenFor === row.customerId ? (
                            <ul
                              className="care-demo-sold-homes-modal__menu"
                              id={`sold-homes-menu-${row.customerId}`}
                              role="menu"
                              aria-labelledby={`sold-homes-trigger-${row.customerId}`}
                            >
                              <li role="none">
                                <a
                                  role="menuitem"
                                  className="care-demo-sold-homes-modal__menu-item"
                                  href={`mailto:${row.sellerEmail}?subject=${encodeURIComponent('SkyportCare follow-up')}`}
                                  onClick={() => setMenuOpenFor(null)}
                                >
                                  Email Customer (seller)
                                </a>
                              </li>
                              <li role="none">
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="care-demo-sold-homes-modal__menu-item"
                                  onClick={() => {
                                    setIntroLetter(true)
                                    setHomeownerGuide(true)
                                    setReachOutOpen(true)
                                    setMenuOpenFor(null)
                                  }}
                                >
                                  Download Mailer (buyer)
                                </button>
                              </li>
                              <li role="none">
                                <button
                                  type="button"
                                  role="menuitem"
                                  className="care-demo-sold-homes-modal__menu-item care-demo-sold-homes-modal__menu-item--danger"
                                  onClick={() => {
                                    setDismissedRowIds((prev) => new Set([...prev, row.customerId]))
                                    setMenuOpenFor(null)
                                  }}
                                >
                                  Delete Notification
                                </button>
                              </li>
                            </ul>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="care-demo-sold-homes-modal__zillow">
            Data is provided &quot;as is&quot; via Zillow Public Record API.
          </p>
          <p className="care-demo-sold-homes-modal__zillow-sub">
            © Zillow, Inc., 2006-2026. Use is subject to{' '}
            <a href="https://bridgedataoutput.com/zillowterms" target="_blank" rel="noopener noreferrer">
              Terms of Use
            </a>
            .
          </p>
        </div>
        <div className="care-demo-invite-modal__footer care-demo-invite-modal__footer--spread care-demo-sold-homes-modal__footer">
          <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--muted" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="care-demo-sold-homes-modal__btn-list" onClick={onViewInCustomerList}>
            View in Customer List
          </button>
        </div>
      </div>

      {reachOutOpen ? (
        <div
          className="care-demo-reach-out-modal__backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setReachOutOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="care-demo-reach-out-title"
            className="care-demo-reach-out-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 id="care-demo-reach-out-title" className="care-demo-reach-out-modal__title">
              Reach Out to New Homeowner
            </h2>
            <p className="care-demo-reach-out-modal__intro">
              We suggest downloading, printing, and mailing materials to the address of the new homeowner.
            </p>
            {mailerDownloadError ? (
              <p className="care-demo-reach-out-modal__error" role="alert">
                {mailerDownloadError}
              </p>
            ) : null}
            <div className="care-demo-reach-out-modal__checks">
              <label className="care-demo-reach-out-modal__check">
                <input
                  type="checkbox"
                  checked={introLetter}
                  onChange={(e) => setIntroLetter(e.target.checked)}
                />
                <span>Introductory Letter</span>
              </label>
              <label className="care-demo-reach-out-modal__check">
                <input
                  type="checkbox"
                  checked={homeownerGuide}
                  onChange={(e) => setHomeownerGuide(e.target.checked)}
                />
                <span>Homeowner Guide</span>
              </label>
            </div>
            <div className="care-demo-reach-out-modal__footer">
              <button
                type="button"
                className="care-demo-invite-modal__btn care-demo-invite-modal__btn--muted"
                onClick={() => setReachOutOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="care-demo-sold-homes-modal__btn-list"
                disabled={!introLetter && !homeownerGuide}
                onClick={downloadMaterials}
              >
                Download Materials
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )

  return createPortal(modal, document.body)
}

const ALERT_HISTORY_TOTAL_ENTRIES = 10396
const ALERT_HISTORY_PAGE_SIZE = 10

/** Demo Alert History table (View History from System Overview). */
const ALERT_HISTORY_SAMPLE_ROWS = [
  { code: '10', daysAgo: 89 },
  { code: '10', daysAgo: 473 },
  { code: '10', daysAgo: 12 },
  { code: '10', daysAgo: 326, hilite: true },
  { code: '10', daysAgo: 44 },
  { code: '10', daysAgo: 156 },
  { code: '10', daysAgo: 8 },
  { code: '05', daysAgo: 201 },
  { code: '10', daysAgo: 92 },
  { code: '10', daysAgo: 33 },
]

const ALERT_HISTORY_TOTAL_PAGES = Math.max(1, Math.ceil(ALERT_HISTORY_TOTAL_ENTRIES / ALERT_HISTORY_PAGE_SIZE))

const ALERT_COMM_DETAIL_CAUSES = [
  'Manual reboot of thermostat.',
  'Loss of power to system.',
  'Thermostat software update (OTA).',
]

/** Demo “now” anchor for consistent Alert History timestamps (matches product-style copy). */
const ALERT_DEMO_NOW = new Date('2026-04-02T12:30:00')

function formatAlertTriggeredAt(daysAgo) {
  const d = new Date(ALERT_DEMO_NOW)
  d.setDate(d.getDate() - Number(daysAgo))
  const s = d.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `Triggered: ${s}`
}

/** Daikin wordmark from `footer-unibrand-logos.svg` (Daikin | Amana | Goodman), cropped to Daikin only. */
function CareDemoThermDaikinMark({ inverse = false }) {
  return (
    <div
      className={`care-demo-cdetail__therm-daikin-mark${inverse ? ' care-demo-cdetail__therm-daikin-mark--inverse' : ''}`}
      aria-hidden
    >
      <img src={CARE_DEMO_FOOTER_BRANDS_SVG} alt="" width={222} height={30} decoding="async" />
    </div>
  )
}

/** Row wrapper — width cap lives in CSS (--cdetail-notif-tile-row-max on overview-body) */
const CDETAIL_NOTIFICATIONS_SCALE_STYLE = {
  width: '100%',
  boxSizing: 'border-box',
}

const CDETAIL_NOTIFICATIONS_GRID_STYLE = {
  display: 'grid',
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  gap: '1rem',
  justifyItems: 'stretch',
  alignItems: 'stretch',
}

const CDETAIL_NOTIF_CARD_STYLE = {
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  boxSizing: 'border-box',
}

function CustomerDetailView({ customer, onBack, onEditCustomer }) {
  const overview = useMemo(() => getCustomerOverviewData(customer), [customer])
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0)
  const [detailMainView, setDetailMainView] = useState('overview')
  const [alertDetailIndex, setAlertDetailIndex] = useState(null)
  const [thermOverflowOpen, setThermOverflowOpen] = useState(false)
  const [thermOverflowPos, setThermOverflowPos] = useState({ top: 0, right: 0 })
  const [thermInfoOpen, setThermInfoOpen] = useState(false)
  const thermOverflowPanelRef = useRef(null)
  const mainElRef = useRef(null)
  const skipZonePulseRef = useRef(true)

  const [reportExpandedKey, setReportExpandedKey] = useState(null)
  const [reportMenuOpen, setReportMenuOpen] = useState(false)
  const [reportMenuPos, setReportMenuPos] = useState({ top: 0, right: 0 })
  const [reportMenuRow, setReportMenuRow] = useState(null)
  const [reportPdfOpen, setReportPdfOpen] = useState(false)
  /** Which template was chosen from the ⋮ menu (drives PDF modal title in demo). */
  const [reportPdfKind, setReportPdfKind] = useState(null)
  const [addEquipOpen, setAddEquipOpen] = useState(false)
  const [addEquipModel, setAddEquipModel] = useState('')
  const [addEquipSerial, setAddEquipSerial] = useState('')
  const reportMenuAnchorKeyRef = useRef(null)
  const reportOverflowPanelRef = useRef(null)
  const [customerNavMenuOpen, setCustomerNavMenuOpen] = useState(false)
  const [customerNavMenuPos, setCustomerNavMenuPos] = useState({ top: 0, right: 0 })
  const customerNavMenuPanelRef = useRef(null)
  const [generateReportMenuOpen, setGenerateReportMenuOpen] = useState(false)
  const [generateReportMenuPos, setGenerateReportMenuPos] = useState({ top: 0, right: 0 })
  const generateReportMenuPanelRef = useRef(null)
  const [assignCustomerModalOpen, setAssignCustomerModalOpen] = useState(false)
  const [assignSearchInput, setAssignSearchInput] = useState('')
  const [assignSelectedTechs, setAssignSelectedTechs] = useState([])

  const closeAddEquipModal = useCallback(() => {
    setAddEquipOpen(false)
    setAddEquipModel('')
    setAddEquipSerial('')
  }, [])

  const onAddEquipDemoSubmit = () => {
    window.alert('Demo only — equipment was not saved.')
    closeAddEquipModal()
  }

  const closeAssignCustomerModal = useCallback(() => {
    setAssignCustomerModalOpen(false)
    setAssignSearchInput('')
    setAssignSelectedTechs([])
  }, [])

  const assignModalSuggestions = useMemo(() => {
    const set = new Set(ASSIGNEE_POOL)
    const cur = overview.assignedTech && String(overview.assignedTech).trim()
    if (cur) set.add(cur)
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  }, [overview.assignedTech])

  const openAssignCustomerModal = useCallback(() => {
    const cur = overview.assignedTech && String(overview.assignedTech).trim()
    setAssignSelectedTechs(cur ? [cur] : [])
    setAssignSearchInput('')
    setAssignCustomerModalOpen(true)
  }, [overview.assignedTech])

  const onThermOverflowTriggerClick = (e) => {
    setCustomerNavMenuOpen(false)
    setGenerateReportMenuOpen(false)
    closeAssignCustomerModal()
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    setThermOverflowPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) })
    setThermOverflowOpen((o) => !o)
  }

  useEffect(() => {
    skipZonePulseRef.current = true
    setSelectedZoneIdx(0)
    setDetailMainView('overview')
    setAlertDetailIndex(null)
    setThermOverflowOpen(false)
    setThermInfoOpen(false)
    setReportExpandedKey(null)
    setReportMenuOpen(false)
    setReportMenuRow(null)
    setReportPdfOpen(false)
    setReportPdfKind(null)
    closeAddEquipModal()
    closeAssignCustomerModal()
    reportMenuAnchorKeyRef.current = null
    setCustomerNavMenuOpen(false)
    setGenerateReportMenuOpen(false)
  }, [customer.id, closeAddEquipModal, closeAssignCustomerModal])

  useEffect(() => {
    if (!thermOverflowOpen) return undefined
    const onDown = (e) => {
      if (thermOverflowPanelRef.current?.contains(e.target)) return
      if (e.target.closest?.('.care-demo-cdetail__therm-overflow-trigger')) return
      setThermOverflowOpen(false)
    }
    const onResize = () => setThermOverflowOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', onResize)
    }
  }, [thermOverflowOpen])

  useEffect(() => {
    if (
      !thermInfoOpen &&
      !thermOverflowOpen &&
      !reportMenuOpen &&
      !reportPdfOpen &&
      !addEquipOpen &&
      !customerNavMenuOpen &&
      !generateReportMenuOpen &&
      !assignCustomerModalOpen
    )
      return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setThermInfoOpen(false)
        setThermOverflowOpen(false)
        setReportMenuOpen(false)
        setReportPdfOpen(false)
        setReportPdfKind(null)
        closeAddEquipModal()
        closeAssignCustomerModal()
        setCustomerNavMenuOpen(false)
        setGenerateReportMenuOpen(false)
        reportMenuAnchorKeyRef.current = null
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [
    thermInfoOpen,
    thermOverflowOpen,
    reportMenuOpen,
    reportPdfOpen,
    addEquipOpen,
    customerNavMenuOpen,
    generateReportMenuOpen,
    assignCustomerModalOpen,
    closeAddEquipModal,
    closeAssignCustomerModal,
  ])

  useEffect(() => {
    if (!reportMenuOpen) return undefined
    const onDown = (e) => {
      if (reportOverflowPanelRef.current?.contains(e.target)) return
      if (e.target.closest?.('.care-demo-cdetail__reports-row-menu')) return
      setReportMenuOpen(false)
      reportMenuAnchorKeyRef.current = null
      setReportMenuRow(null)
    }
    const onResize = () => {
      setReportMenuOpen(false)
      reportMenuAnchorKeyRef.current = null
      setReportMenuRow(null)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', onResize)
    }
  }, [reportMenuOpen])

  useEffect(() => {
    if (!generateReportMenuOpen) return undefined
    const onDown = (e) => {
      if (generateReportMenuPanelRef.current?.contains(e.target)) return
      if (e.target.closest?.('.care-demo-cdetail__generate-report-menu-trigger')) return
      setGenerateReportMenuOpen(false)
    }
    const onResize = () => setGenerateReportMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', onResize)
    }
  }, [generateReportMenuOpen])

  useEffect(() => {
    if (!customerNavMenuOpen) return undefined
    const onDown = (e) => {
      if (customerNavMenuPanelRef.current?.contains(e.target)) return
      if (e.target.closest?.('.care-demo-cdetail__customer-nav-menu-trigger')) return
      setCustomerNavMenuOpen(false)
    }
    const onResize = () => setCustomerNavMenuOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('resize', onResize)
    }
  }, [customerNavMenuOpen])

  useEffect(() => {
    setThermOverflowOpen(false)
    setReportMenuOpen(false)
    reportMenuAnchorKeyRef.current = null
    setReportMenuRow(null)
    closeAddEquipModal()
    setCustomerNavMenuOpen(false)
    setGenerateReportMenuOpen(false)
    closeAssignCustomerModal()
  }, [detailMainView, closeAddEquipModal, closeAssignCustomerModal])

  useEffect(() => {
    if (
      detailMainView === 'alert-detail' &&
      alertDetailIndex != null &&
      (alertDetailIndex < 0 || alertDetailIndex >= ALERT_HISTORY_SAMPLE_ROWS.length)
    ) {
      setDetailMainView('alert-history')
      setAlertDetailIndex(null)
    }
  }, [detailMainView, alertDetailIndex])

  useEffect(() => {
    if (skipZonePulseRef.current) {
      skipZonePulseRef.current = false
      return
    }
    const el = mainElRef.current
    if (!el) return undefined
    const done = () => {
      el.classList.remove('care-demo-cdetail__main--zone-pulse')
    }
    el.classList.remove('care-demo-cdetail__main--zone-pulse')
    void el.offsetWidth
    el.classList.add('care-demo-cdetail__main--zone-pulse')
    el.addEventListener('animationend', done, { once: true })
    return () => {
      el.removeEventListener('animationend', done)
      el.classList.remove('care-demo-cdetail__main--zone-pulse')
    }
  }, [selectedZoneIdx])

  const selZone = overview.zones[selectedZoneIdx] ?? overview.zones[0]
  const thermZoneLabel = selZone?.system ?? overview.thermostat.zoneLabel

  const zoneShell = useMemo(() => {
    const zi = selectedZoneIdx
    const bump = zi * 2
    const thermostatTempF = overview.thermostat.tempF + (zi === 0 ? 0 : 1)
    const equipmentRows = overview.equipmentRows.map((eq, i) => {
      const n = Number(eq.serial)
      const nextSerial = Number.isFinite(n) ? String(n + bump * 7 + i * 3) : eq.serial
      return { ...eq, serial: nextSerial }
    })
    return { thermostatTempF, equipmentRows }
  }, [overview.equipmentRows, overview.thermostat.tempF, selectedZoneIdx])

  const thermReminderStrip =
    overview.thermostat.online && overview.thermostat.hasActiveReminder && selZone?.thermostatKind === 'reminder'

  const activeReminderForSelectedZone =
    Boolean(overview.activeReminderTitle) && selZone?.thermostatKind === 'reminder'

  const alertDetailRow =
    detailMainView === 'alert-detail' &&
    alertDetailIndex != null &&
    alertDetailIndex >= 0 &&
    alertDetailIndex < ALERT_HISTORY_SAMPLE_ROWS.length
      ? ALERT_HISTORY_SAMPLE_ROWS[alertDetailIndex]
      : null

  const reportRowKey = (r) => `${r.type}::${r.name}`

  const onReportMenuTriggerClick = (e, row) => {
    setCustomerNavMenuOpen(false)
    setGenerateReportMenuOpen(false)
    closeAssignCustomerModal()
    const bb = e.currentTarget.getBoundingClientRect()
    const key = reportRowKey(row)
    setReportMenuPos({ top: bb.bottom + 6, right: Math.max(8, window.innerWidth - bb.right) })
    if (reportMenuOpen && reportMenuAnchorKeyRef.current === key) {
      setReportMenuOpen(false)
      reportMenuAnchorKeyRef.current = null
      setReportMenuRow(null)
      return
    }
    reportMenuAnchorKeyRef.current = key
    setReportMenuRow(row)
    setReportMenuOpen(true)
  }

  const openReportPdfFromMenu = (kind, { clearReportRow = false } = {}) => {
    setReportMenuOpen(false)
    setGenerateReportMenuOpen(false)
    closeAssignCustomerModal()
    reportMenuAnchorKeyRef.current = null
    if (clearReportRow) setReportMenuRow(null)
    setReportPdfKind(kind)
    setReportPdfOpen(true)
  }

  /** Row ⋮ → View Report — keep `reportMenuRow` for title; clear template kind. */
  const openReportRowPdfViewer = () => {
    setReportMenuOpen(false)
    setGenerateReportMenuOpen(false)
    closeAssignCustomerModal()
    reportMenuAnchorKeyRef.current = null
    setReportPdfKind(null)
    setReportPdfOpen(true)
  }

  const downloadReportPdf = () => {
    const a = document.createElement('a')
    a.href = CARE_DEMO_REPORT_QA_PDF
    a.download = 'QA-tj-qa_-upstairs.pdf'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setReportMenuOpen(false)
    reportMenuAnchorKeyRef.current = null
  }

  const reportPdfModalTitle = (() => {
    if (reportPdfKind === 'homeowner') return 'Homeowner Report — PDF'
    if (reportPdfKind === 'commissioning') return 'Commissioning Report — PDF'
    if (reportMenuRow) return `${reportMenuRow.name} — PDF`
    return 'Report'
  })()

  const callPhoneDisplay = overview.contactPhones[0] ?? ''
  const textPhoneDisplay = overview.contactPhones[1] ?? overview.contactPhones[0] ?? ''
  const callTelDigits = careDemoPhoneDigits(callPhoneDisplay)
  const textSmsDigits = careDemoPhoneDigits(textPhoneDisplay)
  const mailtoHref =
    overview.displayEmail != null && String(overview.displayEmail).trim() !== ''
      ? `mailto:${encodeURIComponent(String(overview.displayEmail).trim())}`
      : ''

  const flushAssignSearchPick = () => {
    const v = assignSearchInput.trim()
    if (!v) return
    const lower = v.toLowerCase()
    const exact = assignModalSuggestions.find((s) => s.toLowerCase() === lower)
    const prefix = assignModalSuggestions.find((s) => lower.length >= 2 && s.toLowerCase().startsWith(lower))
    const match = exact ?? prefix
    if (!match) return
    setAssignSelectedTechs((prev) => (prev.includes(match) ? prev : [...prev, match]))
    setAssignSearchInput('')
  }

  const onCustomerNavMenuTriggerClick = (e) => {
    setThermOverflowOpen(false)
    closeAssignCustomerModal()
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    setCustomerNavMenuPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) })
    setCustomerNavMenuOpen((wasOpen) => {
      if (!wasOpen) {
        setReportMenuOpen(false)
        setGenerateReportMenuOpen(false)
        reportMenuAnchorKeyRef.current = null
        setReportMenuRow(null)
      }
      return !wasOpen
    })
  }

  const onGenerateReportMenuTriggerClick = (e) => {
    setThermOverflowOpen(false)
    setCustomerNavMenuOpen(false)
    closeAssignCustomerModal()
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    setGenerateReportMenuPos({ top: r.bottom + 6, right: Math.max(8, window.innerWidth - r.right) })
    setGenerateReportMenuOpen((wasOpen) => {
      if (!wasOpen) {
        setReportMenuOpen(false)
        reportMenuAnchorKeyRef.current = null
        setReportMenuRow(null)
      }
      return !wasOpen
    })
  }

  return (
    <div className="care-demo-cdetail care-demo-cdetail--immersive">
      <header className="care-demo-cdetail__page-head">
        <div className="care-demo-cdetail__page-head-nav">
          <div className="care-demo-cdetail__aside-rail care-demo-cdetail__aside-rail--left" aria-hidden />
          <div className="care-demo-cdetail__aside-sheet care-demo-cdetail__page-head-sheet">
            <div className="care-demo-cdetail__nav-row">
              <button type="button" className="care-demo-cdetail__back care-demo-cdetail__back--row" onClick={onBack}>
                ← All Customers
              </button>
              <button
                type="button"
                className="care-demo-cdetail__nav-menu care-demo-cdetail__customer-nav-menu-trigger"
                aria-label="Customer menu"
                aria-expanded={customerNavMenuOpen}
                aria-haspopup="menu"
                aria-controls="cdetail-customer-nav-menu"
                onClick={onCustomerNavMenuTriggerClick}
              >
                <MoreHorizontal size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
          <div className="care-demo-cdetail__aside-rail care-demo-cdetail__aside-rail--right" aria-hidden />
        </div>
        {!customer.homeSold && overview.lifetimeLicenseActivated ? (
          <div className="care-demo-cdetail__page-head-banner">
            <div className="care-demo-cdetail__lic-banner care-demo-cdetail__lic-banner--inline" role="status">
              <span className="care-demo-cdetail__lic-banner-inner">
                <CheckCircle2
                  size={22}
                  strokeWidth={2}
                  color="#2e7d32"
                  className="care-demo-cdetail__lic-banner-icon"
                  aria-hidden
                />
                <span>Lifetime license activated</span>
              </span>
            </div>
          </div>
        ) : null}
      </header>

      {customer.homeSold ? (
        <div className="care-demo-cdetail__sold-banner care-demo-cdetail__banner-row" role="region" aria-label="Sold home notice">
          <p className="care-demo-cdetail__sold-banner-title">This Customer May Have Sold Their Home.</p>
          <ul className="care-demo-cdetail__sold-list">
            <li>
              <span>Contact your customer that may have sold their home.</span>
              <button type="button" className="care-demo-cdetail__sold-more" aria-label="More options">
                <MoreHorizontal size={18} strokeWidth={2} />
              </button>
            </li>
            <li>
              <span>Reach out to new homeowner.</span>
              <button type="button" className="care-demo-cdetail__sold-more" aria-label="More options">
                <MoreHorizontal size={18} strokeWidth={2} />
              </button>
            </li>
          </ul>
        </div>
      ) : null}

      <div className="care-demo-cdetail__layout">
        <aside className="care-demo-cdetail__aside" aria-label="Customer profile">
          <div className="care-demo-cdetail__aside-rail care-demo-cdetail__aside-rail--left" aria-hidden />
          <div className="care-demo-cdetail__aside-sheet">
          <h1 className="care-demo-cdetail__name">{customer.name}</h1>
          {overview.contactPhones.map((num, pi) => (
            <p key={`ph-${pi}`} className="care-demo-cdetail__contact">
              {pi === 1 ? (
                <MessageCircle size={16} strokeWidth={2} className="care-demo-cdetail__contact-icon" aria-hidden />
              ) : (
                <Phone size={16} strokeWidth={2} className="care-demo-cdetail__contact-icon" aria-hidden />
              )}
              <span>{num}</span>
            </p>
          ))}
          <p className="care-demo-cdetail__contact">
            <Mail size={16} strokeWidth={2} className="care-demo-cdetail__contact-icon" aria-hidden />
            <span>{overview.displayEmail}</span>
          </p>

          <h2 className="care-demo-cdetail__section-title care-demo-cdetail__section-title--systems">Systems</h2>
          <div className="care-demo-cdetail__section-rule" aria-hidden="true" />
          <p className="care-demo-cdetail__address-line">
            <span className="care-demo-cdetail__address-line1">{overview.addressLine1}</span>
            {overview.addressLine2 ? (
              <span className="care-demo-cdetail__address-line2">{overview.addressLine2}</span>
            ) : null}
          </p>
          <ul className="care-demo-cdetail__systems">
            {overview.zones.map((z, zi) => (
              <li key={`${z.system}-${zi}`} className="care-demo-cdetail__system-li">
                <button
                  type="button"
                  className={`care-demo-cdetail__system-pick${zi === selectedZoneIdx ? ' care-demo-cdetail__system-pick--selected' : ''}`}
                  onClick={() => setSelectedZoneIdx(zi)}
                >
                  <span className="care-demo-cdetail__system-pick-main">
                    <span className="care-demo-cdetail__system-pick-leading">
                      {zi === selectedZoneIdx && z.thermostatKind === 'reminder' ? (
                        <CalendarIcon size={18} strokeWidth={2} className="care-demo-cdetail__system-pick-cal" aria-hidden />
                      ) : (
                        <span className="care-demo-custrm__dot care-demo-custrm__dot--green" aria-hidden />
                      )}
                    </span>
                    <span className="care-demo-cdetail__system-pick-name">{z.system}</span>
                  </span>
                  <span className="care-demo-cdetail__system-pick-trail">
                    <span className="care-demo-cdetail__system-pick-check-slot">
                      {z.thermostatKind === 'alert' ? (
                        <CircleAlert size={16} strokeWidth={2} className="care-demo-cdetail__sys-icon care-demo-cdetail__sys-icon--bad" aria-hidden />
                      ) : (
                        <CheckCircle2 size={22} strokeWidth={2} className="care-demo-cdetail__sys-icon care-demo-cdetail__sys-icon--ok" aria-hidden />
                      )}
                    </span>
                    <span className="care-demo-cdetail__system-pick-more-slot">
                      {zi === selectedZoneIdx ? (
                        <span className="care-demo-cdetail__system-pick-more" aria-hidden>
                          <MoreHorizontal size={18} strokeWidth={2} />
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="care-demo-cdetail__assigned">
            <div className="care-demo-cdetail__assigned-head">
              <span className="care-demo-cdetail__assigned-label">Assigned Techs</span>
              <button type="button" className="care-demo-cdetail__add-tech" aria-label="Add technician" onClick={openAssignCustomerModal}>
                <Plus size={14} strokeWidth={2.25} />
              </button>
            </div>
            <div className="care-demo-cdetail__assigned-rule" aria-hidden="true" />
            <p className="care-demo-cdetail__assigned-val">{overview.assignedTech}</p>
          </div>
          </div>
          <div className="care-demo-cdetail__aside-rail care-demo-cdetail__aside-rail--right" aria-hidden />
        </aside>

        <div ref={mainElRef} className="care-demo-cdetail__main">
          {alertDetailRow ? (
            <>
              <button
                type="button"
                className="care-demo-cdetail__back care-demo-cdetail__back--stack"
                onClick={() => {
                  setAlertDetailIndex(null)
                  setDetailMainView('alert-history')
                }}
              >
                ← Alert History
              </button>
              <div className="care-demo-cdetail__alert-detail-head">
                <h2 className="care-demo-cdetail__alert-detail-title">Communication error</h2>
                <span className="care-demo-cdetail__alert-detail-status">{alertDetailRow.status ?? 'Resolved'}</span>
              </div>
              <div className="care-demo-cdetail__alert-detail-rule" aria-hidden="true" />
              <div className="care-demo-cdetail__alert-detail-summary">
                <AlertTriangle size={18} strokeWidth={2.25} className="care-demo-cdetail__alert-detail-warn" aria-hidden />
                <span>{`Minor Error | Code ${alertDetailRow.code} | Thermostat`}</span>
              </div>
              <p className="care-demo-cdetail__alert-detail-desc">{alertDetailRow.detailSubtitle ?? 'Thermostat reboot'}</p>
              <div className="care-demo-cdetail__alert-detail-card">
                <div className="care-demo-cdetail__alert-detail-cols">
                  <div className="care-demo-cdetail__alert-detail-col">
                    <h3 className="care-demo-cdetail__alert-detail-col-title">Possible Causes</h3>
                    <div className="care-demo-cdetail__alert-detail-col-rule" aria-hidden="true" />
                    <ol className="care-demo-cdetail__alert-detail-causes">
                      {ALERT_COMM_DETAIL_CAUSES.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="care-demo-cdetail__alert-detail-col">
                    <h3 className="care-demo-cdetail__alert-detail-col-title">Corrective Actions</h3>
                    <div className="care-demo-cdetail__alert-detail-col-rule" aria-hidden="true" />
                    <p className="care-demo-cdetail__alert-detail-corrective">No action needed.</p>
                  </div>
                </div>
              </div>
              <p className="care-demo-cdetail__alert-detail-triggered">{formatAlertTriggeredAt(alertDetailRow.daysAgo)}</p>
            </>
          ) : detailMainView === 'alert-history' ? (
            <>
              <button
                type="button"
                className="care-demo-cdetail__back care-demo-cdetail__back--stack"
                onClick={() => {
                  setAlertDetailIndex(null)
                  setDetailMainView('overview')
                }}
              >
                ← System Overview
              </button>
              <h2 className="care-demo-cdetail__alert-hist-h1">Alert History</h2>
              <div className="care-demo-cdetail__alert-hist-card">
                <div className="care-demo-cdetail__alert-hist-table-wrap">
                  <table className="care-demo-cdetail__alert-hist-table">
                    <thead>
                      <tr>
                        <th className="care-demo-cdetail__alert-hist-level" scope="col">
                          Level
                        </th>
                        <th scope="col">Description</th>
                        <th scope="col">Unit Type</th>
                        <th scope="col">Triggered</th>
                        <th className="care-demo-cdetail__alert-hist-go" scope="col">
                          <span className="visually-hidden">Open</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALERT_HISTORY_SAMPLE_ROWS.map((row, ri) => (
                        <tr
                          key={`ah-${row.code}-${row.daysAgo}-${ri}`}
                          role="button"
                          tabIndex={0}
                          aria-label={`${row.code}: Communication error, ${row.daysAgo} days ago — view details`}
                          className={`care-demo-cdetail__alert-hist-row--clickable${row.hilite ? ' care-demo-cdetail__alert-hist-row--hilite' : ''}`}
                          onClick={() => {
                            setAlertDetailIndex(ri)
                            setDetailMainView('alert-detail')
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setAlertDetailIndex(ri)
                              setDetailMainView('alert-detail')
                            }
                          }}
                        >
                          <td className="care-demo-cdetail__alert-hist-level">
                            <AlertTriangle size={18} strokeWidth={2.25} aria-hidden />
                          </td>
                          <td>{`${row.code}: Communication error`}</td>
                          <td>Thermostat</td>
                          <td className="care-demo-cdetail__alert-hist-triggered">{`${row.daysAgo} days ago`}</td>
                          <td className="care-demo-cdetail__alert-hist-go">
                            <span className="care-demo-cdetail__alert-hist-go-btn" aria-hidden>
                              <ChevronRight size={18} strokeWidth={2.25} />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="care-demo-cdetail__alert-hist-foot">
                  <label className="care-demo-cdetail__alert-hist-page-size">
                    <span>Rows per page:</span>
                    <select className="care-demo-cdetail__alert-hist-select" defaultValue={String(ALERT_HISTORY_PAGE_SIZE)} aria-label="Rows per page">
                      <option value="10">10</option>
                    </select>
                  </label>
                  <span>Total Entries: {ALERT_HISTORY_TOTAL_ENTRIES.toLocaleString()}</span>
                  <span>
                    Page 1 of {ALERT_HISTORY_TOTAL_PAGES.toLocaleString()}
                  </span>
                  <div className="care-demo-cdetail__alert-hist-pager-btns">
                    <button type="button" className="care-demo-cdetail__alert-hist-page-btn" disabled aria-label="Previous page">
                      <ChevronLeft size={20} strokeWidth={2.25} aria-hidden />
                    </button>
                    <button type="button" className="care-demo-cdetail__alert-hist-page-btn" disabled aria-label="Next page">
                      <ChevronRight size={20} strokeWidth={2.25} aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
          <div className="care-demo-cdetail__overview-section">
          <h2 className="care-demo-cdetail__overview-title">System Overview</h2>

          <div className="care-demo-cdetail__overview-body">
          <section className="care-demo-cdetail__notifications" aria-labelledby="cdetail-notifications">
            <h3 id="cdetail-notifications" className="care-demo-cdetail__therm-title">
              Notifications
            </h3>
            <div
              className="care-demo-cdetail__cards-scale care-demo-cdetail__cards-scale--tiled-row"
              style={CDETAIL_NOTIFICATIONS_SCALE_STYLE}
            >
            <div
              className="care-demo-cdetail__cards care-demo-cdetail__cards--notifications"
              style={CDETAIL_NOTIFICATIONS_GRID_STYLE}
            >
            <section
              className="care-demo-cdetail__card care-demo-cdetail__card--notif care-demo-cdetail__card--alerts"
              style={CDETAIL_NOTIF_CARD_STYLE}
              aria-labelledby="cdetail-alerts"
            >
              <h3 id="cdetail-alerts" className="care-demo-cdetail__card-title">
                Alerts
              </h3>
              <div className="care-demo-cdetail__card-body care-demo-cdetail__card-body--alerts-empty">
                <span className="care-demo-cdetail__alerts-ok-badge" aria-hidden>
                  <Check size={24} strokeWidth={2.2} className="care-demo-cdetail__alerts-ok-check" />
                </span>
                <p className="care-demo-cdetail__card-msg care-demo-cdetail__card-msg--muted">No Active Alerts</p>
              </div>
              <button
                type="button"
                className="care-demo-cdetail__linkish care-demo-cdetail__linkish--footer"
                onClick={() => setDetailMainView('alert-history')}
              >
                View History
              </button>
            </section>
            <section
              className="care-demo-cdetail__card care-demo-cdetail__card--notif"
              style={CDETAIL_NOTIF_CARD_STYLE}
              aria-labelledby="cdetail-reminders"
            >
              <h3 id="cdetail-reminders" className="care-demo-cdetail__card-title">
                Active Reminders
              </h3>
              {activeReminderForSelectedZone ? (
                <div className="care-demo-cdetail__card-body care-demo-cdetail__card-body--reminder">
                  <CalendarIcon size={38} strokeWidth={2} className="care-demo-cdetail__rem-cal" aria-hidden />
                  <div className="care-demo-cdetail__reminder-copy">
                    <p className="care-demo-cdetail__reminder-title">{overview.activeReminderTitle}</p>
                    {overview.activeReminderSub ? (
                      <p className="care-demo-cdetail__reminder-sub">{overview.activeReminderSub}</p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="care-demo-cdetail__card-body care-demo-cdetail__card-body--reminders-empty">
                  <p className="care-demo-cdetail__card-msg care-demo-cdetail__card-msg--muted">No Active Reminders</p>
                </div>
              )}
            </section>
            </div>
            </div>
          </section>

          <section className="care-demo-cdetail__therm" aria-labelledby="cdetail-therm">
            <h3 id="cdetail-therm" className="care-demo-cdetail__therm-title">
              Thermostats
            </h3>
            <div className="care-demo-cdetail__cards-scale care-demo-cdetail__cards-scale--therm care-demo-cdetail__cards-scale--tiled-row">
              <div className="care-demo-cdetail__cards care-demo-cdetail__cards--therm-slot">
                <div className="care-demo-cdetail__therm-card">
                  <div
                    className={`care-demo-cdetail__therm-visual${overview.thermostat.online ? ' care-demo-cdetail__therm-visual--online' : ''}`}
                  >
                    <button
                      type="button"
                      className="care-demo-cdetail__therm-overflow-trigger care-demo-cdetail__therm-overflow-btn care-demo-cdetail__therm-overflow-btn--visual"
                      aria-label="Thermostat menu"
                      aria-expanded={thermOverflowOpen}
                      aria-haspopup="menu"
                      aria-controls="cdetail-therm-overflow-menu"
                      onClick={onThermOverflowTriggerClick}
                    >
                      <MoreHorizontal size={20} strokeWidth={2} aria-hidden />
                    </button>
                {overview.thermostat.online ? (
                  <>
                    <span className="care-demo-cdetail__therm-corner">
                      <Thermometer size={16} strokeWidth={2} className="care-demo-cdetail__therm-corner-ic" aria-hidden />
                      <span>{thermZoneLabel}</span>
                    </span>
                    <span className="care-demo-cdetail__therm-temp">
                      {zoneShell.thermostatTempF}
                      <span className="care-demo-cdetail__therm-temp-deg" aria-hidden>
                        °
                      </span>
                    </span>
                    <CareDemoThermDaikinMark inverse />
                  </>
                ) : (
                  <>
                    <span className="care-demo-cdetail__therm-corner care-demo-cdetail__therm-corner--dim">
                      <Thermometer size={15} strokeWidth={2} className="care-demo-cdetail__therm-corner-ic" aria-hidden />
                      <span>{thermZoneLabel}</span>
                    </span>
                    <div className="care-demo-cdetail__therm-wifi-center">
                      <WifiOff size={36} strokeWidth={1.5} className="care-demo-cdetail__wifi-off" aria-hidden />
                    </div>
                    <CareDemoThermDaikinMark />
                  </>
                )}
                  </div>
                  {thermReminderStrip ? (
                <div className="care-demo-cdetail__therm-foot care-demo-cdetail__therm-foot--reminder">
                  <CalendarIcon size={18} strokeWidth={2} className="care-demo-cdetail__therm-foot-cal" aria-hidden />
                  <span className="care-demo-cdetail__therm-foot-reminder-label">Active Reminder</span>
                  <button
                    type="button"
                    className="care-demo-cdetail__therm-foot-menu care-demo-cdetail__therm-overflow-trigger"
                    aria-label="Thermostat menu"
                    aria-expanded={thermOverflowOpen}
                    aria-haspopup="menu"
                    aria-controls="cdetail-therm-overflow-menu"
                    onClick={onThermOverflowTriggerClick}
                  >
                    <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
                  </button>
                </div>
              ) : (
                <div className="care-demo-cdetail__therm-foot">
                  {overview.thermostat.online ? (
                    <span className="care-demo-cdetail__therm-foot-ok">
                      <span className="care-demo-cdetail__therm-ok-badge" aria-hidden>
                        <Check size={11} strokeWidth={3} className="care-demo-cdetail__therm-ok-check" />
                      </span>
                      <span className="care-demo-cdetail__therm-foot-ok-label">OK</span>
                    </span>
                  ) : (
                    <span className="care-demo-cdetail__therm-offline">
                      <span className="care-demo-custrm__dot care-demo-custrm__dot--grey" aria-hidden />
                      Offline
                    </span>
                  )}
                  <button
                    type="button"
                    className="care-demo-cdetail__therm-menu care-demo-cdetail__therm-overflow-trigger"
                    aria-label="Thermostat menu"
                    aria-expanded={thermOverflowOpen}
                    aria-haspopup="menu"
                    aria-controls="cdetail-therm-overflow-menu"
                    onClick={onThermOverflowTriggerClick}
                  >
                    <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
                  </button>
                </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="care-demo-cdetail__equip" aria-labelledby="cdetail-equip">
            <div className="care-demo-cdetail__equip-shell">
              <div className="care-demo-cdetail__equip-head">
                <h3 id="cdetail-equip" className="care-demo-cdetail__equip-title">
                  Other Equipment
                </h3>
                <button type="button" className="care-demo-cdetail__add-equip-link" onClick={() => setAddEquipOpen(true)}>
                  <span className="care-demo-cdetail__plus-circle" aria-hidden>
                    <Plus size={12} strokeWidth={2.25} />
                  </span>
                  Add Equipment
                </button>
              </div>
              <div className="care-demo-cdetail__equip-table-wrap">
                <table className="care-demo-cdetail__equip-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Model</th>
                    <th>Serial</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneShell.equipmentRows.map((eq) => (
                    <tr key={`${eq.type}-${eq.serial}-${selectedZoneIdx}`}>
                      <td>{eq.type}</td>
                      <td>{eq.model}</td>
                      <td>{eq.serial}</td>
                      <td>
                        <span className="care-demo-cdetail__eq-status">
                          <span className="care-demo-custrm__dot care-demo-custrm__dot--green" aria-hidden />
                          OK
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </section>

          <section className="care-demo-cdetail__reports" aria-labelledby="cdetail-reports">
            <div className="care-demo-cdetail__reports-shell">
              <div className="care-demo-cdetail__reports-head">
                <h3 id="cdetail-reports" className="care-demo-cdetail__reports-title">
                  Reports
                </h3>
                <button
                  type="button"
                  className="care-demo-cdetail__add-report-link care-demo-cdetail__generate-report-menu-trigger"
                  aria-expanded={generateReportMenuOpen}
                  aria-haspopup="menu"
                  aria-controls="cdetail-generate-report-menu"
                  onClick={onGenerateReportMenuTriggerClick}
                >
                  <span className="care-demo-cdetail__plus-circle" aria-hidden>
                    <Plus size={12} strokeWidth={2.25} />
                  </span>
                  Generate Report
                </button>
              </div>
              <div className="care-demo-cdetail__reports-table-card">
              <table className="care-demo-cdetail__reports-table">
                <thead>
                  <tr>
                    <th className="care-demo-cdetail__reports-th-expand" scope="col">
                      <span className="visually-hidden">Expand row</span>
                    </th>
                    <th scope="col">Type</th>
                    <th scope="col">Name</th>
                    <th scope="col">Date</th>
                    <th className="care-demo-cdetail__reports-th-actions" scope="col">
                      <span className="visually-hidden">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {overview.reportsRows.map((r) => {
                    const rk = reportRowKey(r)
                    const expanded = reportExpandedKey === rk
                    return (
                      <tr key={rk}>
                        <td className="care-demo-cdetail__reports-td-expand">
                          <button
                            type="button"
                            className="care-demo-cdetail__reports-expand-btn"
                            aria-expanded={expanded}
                            aria-label={expanded ? 'Collapse row details' : 'Expand row details'}
                            onClick={() => setReportExpandedKey((cur) => (cur === rk ? null : rk))}
                          >
                            <ChevronDown
                              size={18}
                              strokeWidth={2}
                              className={`care-demo-cdetail__reports-expand-icon${expanded ? ' care-demo-cdetail__reports-expand-icon--open' : ''}`}
                              aria-hidden
                            />
                          </button>
                        </td>
                        <td>
                          <span className="care-demo-cdetail__reports-type-cell">{r.type}</span>
                          {expanded ? (
                            <p className="care-demo-cdetail__reports-created">Created by: {r.createdBy ?? 'Test Admin'}</p>
                          ) : null}
                        </td>
                        <td>{r.name}</td>
                        <td>{r.date}</td>
                        <td className="care-demo-cdetail__reports-td-actions">
                          <button
                            type="button"
                            className="care-demo-cdetail__reports-row-menu"
                            aria-label="Report row actions"
                            aria-expanded={Boolean(
                              reportMenuOpen && reportMenuRow && reportRowKey(reportMenuRow) === rk,
                            )}
                            aria-haspopup="menu"
                            aria-controls="cdetail-report-overflow-menu"
                            onClick={(e) => onReportMenuTriggerClick(e, r)}
                          >
                            <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="care-demo-cdetail__reports-pager">
                <label className="care-demo-cdetail__reports-page-size">
                  <span>Rows per page:</span>
                  <select className="care-demo-cdetail__reports-select" defaultValue="10" aria-label="Rows per page">
                    <option value="10">10</option>
                  </select>
                </label>
                <span className="care-demo-cdetail__reports-range">
                  1–{overview.reportsRows.length} of {overview.reportsRows.length}
                </span>
                <span className="care-demo-cdetail__reports-pager-nav" aria-label="Pagination">
                  <button type="button" className="care-demo-cdetail__reports-page-arrow" disabled aria-label="Previous page">
                    <ChevronLeft size={18} strokeWidth={2} aria-hidden />
                  </button>
                  <button type="button" className="care-demo-cdetail__reports-page-arrow" disabled aria-label="Next page">
                    <ChevronRight size={18} strokeWidth={2} aria-hidden />
                  </button>
                </span>
              </div>
            </div>
            </div>
          </section>
          </div>
          </div>
            </>
          )}
        </div>
      </div>

      {customerNavMenuOpen
        ? createPortal(
            <div
              ref={customerNavMenuPanelRef}
              id="cdetail-customer-nav-menu"
              className="care-demo-cdetail__therm-overflow-pop care-demo-cdetail__customer-nav-menu-pop"
              role="menu"
              style={{
                position: 'fixed',
                top: customerNavMenuPos.top,
                right: customerNavMenuPos.right,
                zIndex: 4505,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <a
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item care-demo-cdetail__customer-nav-menu-item-link"
                href={callTelDigits ? `tel:${callTelDigits}` : '#'}
                onClick={(e) => {
                  if (!callTelDigits) e.preventDefault()
                  setCustomerNavMenuOpen(false)
                }}
              >
                Call Customer
              </a>
              <a
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item care-demo-cdetail__customer-nav-menu-item-link"
                href={textSmsDigits ? `sms:${textSmsDigits}` : '#'}
                onClick={(e) => {
                  if (!textSmsDigits) e.preventDefault()
                  setCustomerNavMenuOpen(false)
                }}
              >
                Text Customer
              </a>
              <a
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item care-demo-cdetail__customer-nav-menu-item-link"
                href={mailtoHref || '#'}
                onClick={(e) => {
                  if (!mailtoHref) e.preventDefault()
                  setCustomerNavMenuOpen(false)
                }}
              >
                Email Customer
              </a>
              <div className="care-demo-cdetail__customer-nav-menu-divider" role="separator" />
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item"
                onClick={() => {
                  setCustomerNavMenuOpen(false)
                  window.alert('Demo only — customer data was not refreshed.')
                }}
              >
                Refresh
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item"
                onClick={() => {
                  setCustomerNavMenuOpen(false)
                  openAssignCustomerModal()
                }}
              >
                Assign Customer
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item"
                onClick={() => {
                  setCustomerNavMenuOpen(false)
                  onEditCustomer?.()
                }}
              >
                Edit Customer
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item care-demo-cdetail__therm-overflow-item--delete"
                onClick={() => {
                  setCustomerNavMenuOpen(false)
                  window.confirm('Delete Customer is not available in this demo.')
                }}
              >
                Delete Customer
              </button>
            </div>,
            document.body,
          )
        : null}
      {thermOverflowOpen
        ? createPortal(
            <div
              ref={thermOverflowPanelRef}
              id="cdetail-therm-overflow-menu"
              className="care-demo-cdetail__therm-overflow-pop"
              role="menu"
              style={{
                position: 'fixed',
                top: thermOverflowPos.top,
                right: thermOverflowPos.right,
                zIndex: 4500,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item"
                onClick={() => {
                  setThermOverflowOpen(false)
                  setThermInfoOpen(true)
                }}
              >
                Thermostat Info
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item care-demo-cdetail__therm-overflow-item--delete"
                onClick={() => {
                  setThermOverflowOpen(false)
                  window.confirm('Delete Thermostat is not available in this demo.')
                }}
              >
                Delete Thermostat
              </button>
            </div>,
            document.body,
          )
        : null}
      {thermInfoOpen
        ? createPortal(
            <div
              className="care-demo-invite-modal__backdrop care-demo-cdetail-therm-info-backdrop"
              role="presentation"
              onClick={() => setThermInfoOpen(false)}
            >
              <div
                className="care-demo-cdetail-therm-info-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cdetail-therm-info-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="cdetail-therm-info-title" className="care-demo-cdetail-therm-info-modal__title">
                  Thermostat Info
                </h2>
                <div className="care-demo-cdetail-therm-info-modal__field">
                  <span className="care-demo-cdetail-therm-info-modal__label">Model</span>
                  <p className="care-demo-cdetail-therm-info-modal__value">{overview.thermostat.model}</p>
                </div>
                <div className="care-demo-cdetail-therm-info-modal__field">
                  <span className="care-demo-cdetail-therm-info-modal__label">Thermostat ID*</span>
                  <p className="care-demo-cdetail-therm-info-modal__value">{overview.thermostat.thermostatId}</p>
                </div>
                <div className="care-demo-cdetail-therm-info-modal__field">
                  <span className="care-demo-cdetail-therm-info-modal__label">Serial Number*</span>
                  <p
                    className={`care-demo-cdetail-therm-info-modal__value${overview.thermostat.serialNumber ? '' : ' care-demo-cdetail-therm-info-modal__value--empty'}`}
                  >
                    {overview.thermostat.serialNumber || '\u00a0'}
                  </p>
                </div>
                <div className="care-demo-cdetail-therm-info-modal__footer">
                  <button
                    type="button"
                    className="care-demo-invite-modal__btn care-demo-invite-modal__btn--muted"
                    onClick={() => setThermInfoOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      {addEquipOpen
        ? createPortal(
            <div
              className="care-demo-invite-modal__backdrop care-demo-cdetail-add-equip-backdrop"
              role="presentation"
              onClick={closeAddEquipModal}
            >
              <div
                className="care-demo-invite-modal care-demo-cdetail-add-equip-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cdetail-add-equip-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="cdetail-add-equip-title" className="care-demo-invite-modal__title">
                  Add Equipment
                </h2>
                <div className="care-demo-cdetail-add-equip__outline">
                  <span className="care-demo-cdetail-add-equip__outline-legend">Model*</span>
                  <div className="care-demo-cdetail-add-equip__model-row">
                    <Search size={18} strokeWidth={2} className="care-demo-cdetail-add-equip__row-icon" aria-hidden />
                    <input
                      id={`cdetail-add-equip-model-${customer.id}`}
                      type="text"
                      className="care-demo-cdetail-add-equip__model-input"
                      list={`cdetail-add-equip-models-${customer.id}`}
                      value={addEquipModel}
                      onChange={(e) => setAddEquipModel(e.target.value)}
                      autoComplete="off"
                      aria-label="Model"
                    />
                    <ChevronDown
                      size={18}
                      strokeWidth={2}
                      className="care-demo-cdetail-add-equip__row-icon care-demo-cdetail-add-equip__row-icon--caret"
                      aria-hidden
                    />
                  </div>
                </div>
                <datalist id={`cdetail-add-equip-models-${customer.id}`}>
                  <option value="DFVE48DP1300AA" />
                  <option value="MXS Series outdoor unit" />
                  <option value="FVXS indoor unit" />
                </datalist>
                <label htmlFor={`cdetail-add-equip-serial-${customer.id}`} className="visually-hidden">
                  Serial number
                </label>
                <input
                  id={`cdetail-add-equip-serial-${customer.id}`}
                  type="text"
                  className="care-demo-invite-modal__input"
                  placeholder="Serial Number*"
                  value={addEquipSerial}
                  onChange={(e) => setAddEquipSerial(e.target.value)}
                  autoComplete="off"
                />
                <div className="care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
                  <button
                    type="button"
                    className="care-demo-invite-modal__btn care-demo-invite-modal__btn--cancel"
                    onClick={closeAddEquipModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary"
                    onClick={onAddEquipDemoSubmit}
                  >
                    Add Equipment
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      {assignCustomerModalOpen
        ? createPortal(
            <div
              className="care-demo-invite-modal__backdrop care-demo-cdetail-assign-customer-backdrop"
              role="presentation"
              onClick={closeAssignCustomerModal}
            >
              <div
                className="care-demo-invite-modal care-demo-cdetail-assign-customer-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cdetail-assign-customer-title"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="cdetail-assign-customer-title" className="care-demo-invite-modal__title">
                  Assign Customer
                </h2>
                <p className="care-demo-cdetail-assign-customer__intro">Assign customer to :</p>
                <div className="care-demo-cdetail-assign-customer__search-wrap">
                  <Search size={18} strokeWidth={2} className="care-demo-cdetail-assign-customer__search-icon" aria-hidden />
                  <input
                    id={`cdetail-assign-tech-search-${customer.id}`}
                    type="text"
                    className="care-demo-cdetail-assign-customer__search-input"
                    list={`cdetail-assign-tech-datalist-${customer.id}`}
                    value={assignSearchInput}
                    onChange={(e) => setAssignSearchInput(e.target.value)}
                    onBlur={flushAssignSearchPick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        flushAssignSearchPick()
                      }
                    }}
                    autoComplete="off"
                    aria-label="Search technicians"
                  />
                  <ChevronDown size={18} strokeWidth={2} className="care-demo-cdetail-assign-customer__search-caret" aria-hidden />
                </div>
                <datalist id={`cdetail-assign-tech-datalist-${customer.id}`}>
                  {assignModalSuggestions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <div className="care-demo-cdetail-assign-customer__list" role="list">
                  {assignSelectedTechs.map((name) => (
                    <div key={name} className="care-demo-cdetail-assign-customer__row" role="listitem">
                      <span>{name}</span>
                      <button
                        type="button"
                        className="care-demo-cdetail-assign-customer__remove"
                        aria-label={`Remove ${name}`}
                        onClick={() => setAssignSelectedTechs((prev) => prev.filter((x) => x !== name))}
                      >
                        <Minus size={14} strokeWidth={2.5} aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="care-demo-invite-modal__footer care-demo-invite-modal__footer--spread">
                  <button type="button" className="care-demo-invite-modal__btn care-demo-invite-modal__btn--cancel" onClick={closeAssignCustomerModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="care-demo-invite-modal__btn care-demo-invite-modal__btn--primary"
                    disabled
                    title="Not available in this demo"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      {generateReportMenuOpen
        ? createPortal(
            <div
              ref={generateReportMenuPanelRef}
              id="cdetail-generate-report-menu"
              className="care-demo-cdetail__therm-overflow-pop care-demo-cdetail__reports-overflow-pop"
              role="menu"
              style={{
                position: 'fixed',
                top: generateReportMenuPos.top,
                right: generateReportMenuPos.right,
                zIndex: 4510,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item"
                onClick={() => openReportPdfFromMenu('homeowner', { clearReportRow: true })}
              >
                Homeowner Report
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item"
                onClick={() => openReportPdfFromMenu('commissioning', { clearReportRow: true })}
              >
                Commissioning Report
              </button>
            </div>,
            document.body,
          )
        : null}
      {reportMenuOpen
        ? createPortal(
            <div
              ref={reportOverflowPanelRef}
              id="cdetail-report-overflow-menu"
              className="care-demo-cdetail__therm-overflow-pop care-demo-cdetail__reports-overflow-pop"
              role="menu"
              style={{
                position: 'fixed',
                top: reportMenuPos.top,
                right: reportMenuPos.right,
                zIndex: 4510,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button type="button" role="menuitem" className="care-demo-cdetail__therm-overflow-item" onClick={openReportRowPdfViewer}>
                View Report
              </button>
              <button type="button" role="menuitem" className="care-demo-cdetail__therm-overflow-item" onClick={downloadReportPdf}>
                Download Report
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-cdetail__therm-overflow-item care-demo-cdetail__therm-overflow-item--delete"
                onClick={() => {
                  setReportMenuOpen(false)
                  reportMenuAnchorKeyRef.current = null
                  setReportMenuRow(null)
                  window.confirm('Delete Report is not available in this demo.')
                }}
              >
                Delete Report
              </button>
            </div>,
            document.body,
          )
        : null}
      {reportPdfOpen
        ? createPortal(
            <div
              className="care-demo-invite-modal__backdrop care-demo-cdetail-report-pdf-backdrop"
              role="presentation"
              onClick={() => {
                setReportPdfOpen(false)
                setReportPdfKind(null)
              }}
            >
              <div
                className="care-demo-cdetail-report-pdf-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cdetail-report-pdf-title"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="care-demo-cdetail-report-pdf-modal__head">
                  <h2 id="cdetail-report-pdf-title" className="care-demo-cdetail-report-pdf-modal__title">
                    {reportPdfModalTitle}
                  </h2>
                  <button
                    type="button"
                    className="care-demo-cdetail-report-pdf-modal__close"
                    aria-label="Close PDF viewer"
                    onClick={() => {
                      setReportPdfOpen(false)
                      setReportPdfKind(null)
                    }}
                  >
                    <X size={22} strokeWidth={2} aria-hidden />
                  </button>
                </header>
                <iframe
                  title="Report PDF"
                  src={`${CARE_DEMO_REPORT_QA_PDF}#view=FitH`}
                  className="care-demo-cdetail-report-pdf-modal__frame"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function ExpandZoneKindLabel({ label, kind }) {
  return (
    <span className="care-demo-custrm__expand-zone-label">
      {kind === 'alert' ? (
        <>
          <CircleAlert size={14} strokeWidth={2} className="care-demo-custrm__expand-alert" aria-hidden />
          <span>{label}</span>
        </>
      ) : kind === 'reminder' ? (
        <>
          <CalendarIcon size={14} strokeWidth={2} className="care-demo-custrm__expand-cal" aria-hidden />
          <span>{label}</span>
        </>
      ) : (
        <>
          <span className="care-demo-custrm__dot care-demo-custrm__dot--green" aria-hidden />
          <span>{label}</span>
        </>
      )}
    </span>
  )
}

/** Aligns with parent columns: Name → Locations; Status / Assigned / Actions → Systems / Thermostats / Equipment */
function CurrentCustomerExpandRows({ detail, rowId }) {
  const zones = detail.zones ?? []
  const n = zones.length
  if (n === 0) return null

  return (
    <>
      <tr className="care-demo-custrm__expand-holder care-demo-custrm__expand-holder--labels">
        <td className="care-demo-custrm__expand-cell care-demo-custrm__expand-cell--chev" />
        <td className="care-demo-custrm__expand-label">Locations</td>
        <td className="care-demo-custrm__expand-cell care-demo-custrm__expand-cell--spacer" />
        <td className="care-demo-custrm__expand-cell care-demo-custrm__expand-cell--spacer" />
        <td className="care-demo-custrm__expand-label">Systems</td>
        <td className="care-demo-custrm__expand-label">Thermostats</td>
        <td className="care-demo-custrm__expand-label">Equipment</td>
      </tr>
      {zones.map((z, zi) => (
        <tr
          key={`${rowId}-zone-${zi}`}
          className={`care-demo-custrm__expand-holder${zi === n - 1 ? ' care-demo-custrm__expand-holder--segment-end' : ''}`}
        >
          <td className="care-demo-custrm__expand-cell care-demo-custrm__expand-cell--chev" />
          {zi === 0 ? (
            <td className="care-demo-custrm__expand-loc" rowSpan={n}>
              {detail.fullAddress}
            </td>
          ) : null}
          <td className="care-demo-custrm__expand-cell care-demo-custrm__expand-cell--spacer" />
          <td className="care-demo-custrm__expand-cell care-demo-custrm__expand-cell--spacer" />
          <td className="care-demo-custrm__expand-sys">
            <ExpandZoneKindLabel label={z.system} kind={z.thermostatKind} />
          </td>
          <td className="care-demo-custrm__expand-tstat">
            <ExpandZoneKindLabel label={z.thermostat} kind={z.thermostatKind} />
          </td>
          <td className="care-demo-custrm__expand-equip">
            <ul className="care-demo-custrm__equip-list">
              {z.equipment.map((model) => (
                <li key={model}>
                  <span className="care-demo-custrm__dot care-demo-custrm__dot--green" aria-hidden />
                  <span className="care-demo-custrm__equip-model">{model}</span>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      ))}
    </>
  )
}

function CurrentCustomersFilterPanel({ open, box, panelRef, filters, onToggle, onClose }) {
  if (!open || !box) return null

  const row = (key, iconEl, label) => (
    <label key={key} className="care-demo-custrm__cust-filter-row">
      <input
        type="checkbox"
        className="care-demo-custrm__cust-filter-check"
        checked={!!filters[key]}
        onChange={() => onToggle(key)}
      />
      <span className="care-demo-custrm__cust-filter-row__icon">{iconEl}</span>
      <span className="care-demo-custrm__cust-filter-row__label">{label}</span>
    </label>
  )

  return createPortal(
    <div
      ref={panelRef}
      className="care-demo-custrm__cust-filter"
      style={{
        position: 'fixed',
        top: box.top,
        left: box.left,
        width: box.width,
        maxHeight: box.maxHeight,
        zIndex: 5000,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="care-demo-cc-filter-title"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="care-demo-custrm__cust-filter__header">
        <Filter size={20} strokeWidth={2} className="care-demo-custrm__cust-filter__funnel" aria-hidden />
        <h2 id="care-demo-cc-filter-title" className="care-demo-custrm__cust-filter__title">
          Customers
        </h2>
        <button type="button" className="care-demo-custrm__cust-filter__x" aria-label="Close filter menu" onClick={onClose}>
          <X size={20} strokeWidth={2} />
        </button>
      </div>
      <div className="care-demo-custrm__cust-filter__body">
        <div className="care-demo-custrm__cust-filter__section">
          {row(
            'criticalError',
            <AlertTriangle size={18} strokeWidth={2.25} className="care-demo-custrm__cust-filter-ic--critical" />,
            'Critical Error',
          )}
          {row(
            'needsAttention',
            <AlertCircle size={18} strokeWidth={2.25} className="care-demo-custrm__cust-filter-ic--warn" />,
            'Needs Attention',
          )}
          {row(
            'minorError',
            <AlertTriangle size={18} strokeWidth={2.25} className="care-demo-custrm__cust-filter-ic--minor" />,
            'Minor Error',
          )}
          {row(
            'reminder',
            <span className="care-demo-custrm__cust-filter-sq" aria-hidden />,
            'Reminder',
          )}
          {row(
            'ok',
            <span className="care-demo-custrm__cust-filter-dot care-demo-custrm__cust-filter-dot--ok" aria-hidden />,
            'OK',
          )}
          {row(
            'offline',
            <span className="care-demo-custrm__cust-filter-dot care-demo-custrm__cust-filter-dot--off" aria-hidden />,
            'Offline',
          )}
          {row(
            'noAccess',
            <span className="care-demo-custrm__cust-filter-dot care-demo-custrm__cust-filter-dot--noacc" aria-hidden />,
            'No Access',
          )}
        </div>
        <div className="care-demo-custrm__cust-filter__sep" role="separator" />
        <div className="care-demo-custrm__cust-filter__section">
          <label className="care-demo-custrm__cust-filter-row">
            <input
              type="checkbox"
              className="care-demo-custrm__cust-filter-check"
              checked={!!filters.onlyMine}
              onChange={() => onToggle('onlyMine')}
            />
            <span className="care-demo-custrm__cust-filter-row__icon care-demo-custrm__cust-filter-row__icon--empty" aria-hidden />
            <span className="care-demo-custrm__cust-filter-row__label">Only my Customers</span>
          </label>
        </div>
        <div className="care-demo-custrm__cust-filter__sep" role="separator" />
        <div className="care-demo-custrm__cust-filter__section">
          {row(
            'activated',
            <CheckCircle2 size={18} strokeWidth={2} className="care-demo-custrm__cust-filter-ic--activated" />,
            'Activated',
          )}
          {row(
            'expiringSoon',
            <Clock size={18} strokeWidth={2} className="care-demo-custrm__cust-filter-ic--clock" />,
            'Expiring Soon',
          )}
          {row(
            'expired',
            <CircleAlert size={18} strokeWidth={2} className="care-demo-custrm__cust-filter-ic--bad" />,
            'Expired',
          )}
          {row(
            'homeSold',
            <span className="care-demo-custrm__cust-filter-sold" aria-hidden>
              SOLD
            </span>,
            'Home Sold',
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Fictional profile row for UI demo only (555 = placeholder range). */
const CARE_DEMO_PROFILE_SAMPLE = {
  firstName: 'Morgan',
  lastName: 'Chen',
  email: `morgan.chen@${DEMO_FAKE_EMAIL_DOMAIN}`,
  phone: '+1 (555) 342-8100',
}

const CARE_DEMO_PROFILE_INITIAL = {
  firstName: CARE_DEMO_PROFILE_SAMPLE.firstName.trim(),
  lastName: CARE_DEMO_PROFILE_SAMPLE.lastName.trim(),
  email: CARE_DEMO_PROFILE_SAMPLE.email.trim(),
  phone: CARE_DEMO_PROFILE_SAMPLE.phone.trim(),
}

/** Demo-only organization / business info (matches product-style layout). */
const CARE_DEMO_ORG_SAMPLE = {
  businessName: 'Sample Valley HVAC (Demo)',
  businessEmail: `office@${DEMO_FAKE_EMAIL_DOMAIN}`,
  address1: '100 Training Commerce Blvd',
  address2: 'Suite 200',
  businessPhone: '+1 (555) 800-4400',
  website: 'www.sample-valley-hvac.example',
  country: 'United States',
  city: 'Demo Vista',
  state: 'CO',
  postalCode: '80988',
}

const CARE_DEMO_ORG_COUNTRIES = ['United States', 'Canada', 'Mexico']

const CARE_DEMO_ORG_US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA',
  'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
  'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]

const CARE_DEMO_ORG_INITIAL = {
  businessName: CARE_DEMO_ORG_SAMPLE.businessName.trim(),
  businessEmail: CARE_DEMO_ORG_SAMPLE.businessEmail.trim(),
  businessPhone: CARE_DEMO_ORG_SAMPLE.businessPhone.trim(),
  website: CARE_DEMO_ORG_SAMPLE.website.trim(),
  address1: CARE_DEMO_ORG_SAMPLE.address1.trim(),
  address2: CARE_DEMO_ORG_SAMPLE.address2.trim(),
  country: CARE_DEMO_ORG_SAMPLE.country,
  city: CARE_DEMO_ORG_SAMPLE.city.trim(),
  state: CARE_DEMO_ORG_SAMPLE.state.trim(),
  postalCode: CARE_DEMO_ORG_SAMPLE.postalCode.trim(),
}

/** Demo transaction rows; receipt uses full fields below. */
const CARE_DEMO_ORG_TXN_ROWS = [
  {
    id: 'txn-annual',
    customer: 'Finley Cruz',
    date: 'April 2, 2026',
    card: 'VISA ...8844',
    cardReceipt: 'VISA ending in 8844',
    totalLabel: '$60.00',
    status: 'Transaction authorized',
    confirmation: '5501984320',
    orderedByName: 'Jordan Blake',
    orderedByEmail: `jordan.blake@${DEMO_FAKE_EMAIL_DOMAIN}`,
    customerName: 'Finley Cruz',
    customerAddress: '142 Sample Creek Rd, Training City, TX 78688',
    roomLabel: 'Main floor',
    lineItems: [{ label: 'Annual service plan', amount: 60 }],
    tax: 0,
  },
  {
    id: 'txn-lifetime',
    customer: 'Harper Sloan',
    date: 'April 3, 2026',
    card: 'MASTERCARD ...5512',
    cardReceipt: 'MASTERCARD ending in 5512',
    totalLabel: '$400.00',
    status: 'Transaction authorized',
    confirmation: '5501984411',
    orderedByName: 'Jordan Blake',
    orderedByEmail: `jordan.blake@${DEMO_FAKE_EMAIL_DOMAIN}`,
    customerName: 'Harper Sloan',
    customerAddress: '880 Fictional River Bend Dr, Sampleton, TX 78688',
    roomLabel: 'Main floor',
    lineItems: [{ label: 'Lifetime service plan', amount: 400 }],
    tax: 0,
  },
]

const CARE_DEMO_ORG_TABS = [
  { id: 'business', label: 'Business Info' },
  { id: 'billing', label: 'Billing Info' },
  { id: 'transactions', label: 'Transaction History' },
  { id: 'communications', label: 'Communications' },
  { id: 'members', label: 'Members' },
]

/** Active member list: demo shows 5 members on one page. */
const ORG_MEMBERS_PAGE_SIZE = 5

const ORG_ACTIVE_MEMBER_SEED = [
  { firstName: 'Riley', lastName: 'Mercer', email: `riley.mercer@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Admin', showMenu: true },
  { firstName: 'Sage', lastName: 'Okonkwo', email: `sage.okonkwo@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Admin', showMenu: true },
  { firstName: 'Drew', lastName: 'Patel', email: `drew.patel@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Admin', showMenu: true },
  { firstName: 'Robin', lastName: 'Kade', email: `robin.kade@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Admin', showMenu: true },
  { firstName: 'Avery', lastName: 'Quinn', email: `avery.quinn@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Admin', showMenu: false },
  { firstName: 'Jordan', lastName: 'Blake', email: `jordan.blake@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Tech', showMenu: true },
  { firstName: 'Casey', lastName: 'Nguyen', email: `casey.nguyen@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Tech', showMenu: true },
]

function buildOrgActiveMembers() {
  return ORG_ACTIVE_MEMBER_SEED.map((r, i) => ({ ...r, id: `oa-${i}` }))
}

const CARE_DEMO_ORG_MEMBERS_ACTIVE = buildOrgActiveMembers()

const CARE_DEMO_ORG_MEMBERS_INVITED = [
  { id: 'inv-0', firstName: 'Blake', lastName: 'Turner', email: `blake.turner@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Admin' },
  { id: 'inv-1', firstName: 'Rowan', lastName: 'Pike', email: `rowan.pike@${DEMO_FAKE_EMAIL_DOMAIN}`, role: 'Tech' },
]

/** View Member → Assigned Customers table (demo). */
const CARE_DEMO_ORG_VIEW_MEMBER_ASSIGNED = [
  { id: 'asg-0', name: 'Jordan Vale', location: 'Sampleton, AZ' },
  { id: 'asg-1', name: 'Taylor Reed', location: 'Demo Vista, CA' },
  { id: 'asg-2', name: 'Morgan Vale', location: 'Fictown, AZ' },
]

function careDemoOrgMemberDemoPhone(row) {
  const m = /^oa-(\d+)$/.exec(row.id)
  const i = m ? parseInt(m[1], 10) : 0
  const last4 = String(7700 + (i % 900)).padStart(4, '0')
  return `+1 (555) 201-${last4}`
}

const CARE_DEMO_ORG_MEMBER_ROLES = ['Owner', 'Admin', 'Tech']

const CARE_DEMO_ORG_ADD_MEMBER_ROLES = ['Admin', 'Tech', 'Installer']

/** Member Roles matrix (Team Members — info icon for Active and Invited). */
const CARE_DEMO_ORG_MEMBER_ROLES_MATRIX = [
  {
    key: 'commission',
    label: 'commission systems in the mobile app',
    installer: true,
    tech: true,
    admin: true,
  },
  {
    key: 'customers',
    label: 'invite, view, and edit customers',
    installer: false,
    tech: true,
    admin: true,
  },
  { key: 'delcust', label: 'delete customers', installer: false, tech: false, admin: true },
  {
    key: 'team',
    label: 'invite, update, and delete team members',
    installer: false,
    tech: false,
    admin: true,
  },
  {
    key: 'billing',
    label: 'edit billing information and customer communications',
    installer: false,
    tech: false,
    admin: true,
  },
  { key: 'txn', label: 'see transaction history', installer: false, tech: false, admin: true },
  { key: 'lic', label: 'purchase licenses', installer: false, tech: false, admin: true },
]

function CareDemoOrgMemberRolesMatrixCell({ allowed }) {
  if (allowed) {
    return (
      <span className="care-demo-org-mem__roles-check-wrap" aria-label="Yes">
        <Check className="care-demo-org-mem__roles-check-icon" size={11} strokeWidth={3} aria-hidden />
      </span>
    )
  }
  return <span className="care-demo-org-mem__roles-cell-empty" aria-hidden="true" />
}

function CareDemoOrgMemberRolesModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const modal = (
    <div
      className="care-demo-org-mem__roles-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="care-demo-org-mem__roles"
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-org-mem-roles-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="care-org-mem-roles-title" className="care-demo-org-mem__roles-title">
          Member Roles
        </h2>
        <div className="care-demo-org-mem__roles-table-wrap">
          <table className="care-demo-org-mem__roles-table">
            <thead>
              <tr>
                <th scope="col" className="care-demo-org-mem__roles-th-role">
                  Installer
                </th>
                <th scope="col" className="care-demo-org-mem__roles-th-role">
                  Tech
                </th>
                <th scope="col" className="care-demo-org-mem__roles-th-role">
                  Admin
                </th>
                <th scope="col" className="care-demo-org-mem__roles-th-permissions">
                  have permissions to:
                </th>
              </tr>
            </thead>
            <tbody>
              {CARE_DEMO_ORG_MEMBER_ROLES_MATRIX.map((row) => (
                <tr key={row.key}>
                  <td className="care-demo-org-mem__roles-cell">
                    <CareDemoOrgMemberRolesMatrixCell allowed={row.installer} />
                  </td>
                  <td className="care-demo-org-mem__roles-cell">
                    <CareDemoOrgMemberRolesMatrixCell allowed={row.tech} />
                  </td>
                  <td className="care-demo-org-mem__roles-cell">
                    <CareDemoOrgMemberRolesMatrixCell allowed={row.admin} />
                  </td>
                  <th scope="row" className="care-demo-org-mem__roles-row-label">
                    {row.label}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="care-demo-org-mem__roles-footer">
          <button type="button" className="care-demo-org-mem__roles-ok" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function CareDemoOrgAddMemberModal({ open, onClose, onToast }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Admin')

  useEffect(() => {
    if (!open) return
    setFirstName('')
    setLastName('')
    setEmail('')
    setRole('Admin')
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  if (!open) return null

  const handleInvite = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      onToast('Fill required fields')
      return
    }
    onToast(`Confirmation: invitation sent to ${email.trim()}.`)
    onClose()
  }

  const modal = (
    <div
      className="care-demo-org-mem__edit-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="care-demo-org-mem__edit"
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-org-mem-add-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="care-demo-org-mem__edit-head">
          <h2 id="care-org-mem-add-title" className="care-demo-org-mem__edit-title">
            Add Member
          </h2>
          <button type="button" className="care-demo-org-mem__edit-x" onClick={onClose} aria-label="Close">
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="care-demo-org-mem__edit-grid">
          <label className="care-demo-org-mem__edit-field">
            <span className="care-demo-org-mem__edit-label">
              First Name<span className="care-demo-org__req">*</span>
            </span>
            <input
              className="care-demo-org-mem__edit-input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              autoComplete="off"
            />
          </label>
          <label className="care-demo-org-mem__edit-field">
            <span className="care-demo-org-mem__edit-label">
              Last Name<span className="care-demo-org__req">*</span>
            </span>
            <input
              className="care-demo-org-mem__edit-input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              autoComplete="off"
            />
          </label>
          <label className="care-demo-org-mem__edit-field">
            <span className="care-demo-org-mem__edit-label">
              Email Address<span className="care-demo-org__req">*</span>
            </span>
            <input
              className="care-demo-org-mem__edit-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`homeowner@${DEMO_FAKE_EMAIL_DOMAIN}`}
              autoComplete="off"
            />
          </label>
          <label className="care-demo-org-mem__edit-field">
            <span className="care-demo-org-mem__edit-label">Role</span>
            <select className="care-demo-org-mem__edit-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {CARE_DEMO_ORG_ADD_MEMBER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="care-demo-org-mem__edit-actions">
          <button type="button" className="care-demo-org-mem__edit-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="care-demo-org-mem__edit-update" onClick={handleInvite}>
            Invite Member
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function CareDemoOrgEditMemberModal({ row, isInvited, onClose, onToast }) {
  const [firstName, setFirstName] = useState(row.firstName)
  const [lastName, setLastName] = useState(row.lastName)
  const [role, setRole] = useState(row.role)

  useEffect(() => {
    setFirstName(row.firstName)
    setLastName(row.lastName)
    setRole(row.role)
  }, [row])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const modal = (
    <div
      className="care-demo-org-mem__edit-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="care-demo-org-mem__edit"
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-org-mem-edit-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="care-demo-org-mem__edit-head">
          <h2 id="care-org-mem-edit-title" className="care-demo-org-mem__edit-title">
            {isInvited ? 'Edit Invited Member' : 'Edit Team Member'}
          </h2>
          <button type="button" className="care-demo-org-mem__edit-x" onClick={onClose} aria-label="Close">
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="care-demo-org-mem__edit-grid">
          <label className="care-demo-org-mem__edit-field">
            <span className="care-demo-org-mem__edit-label">
              First Name<span className="care-demo-org__req">*</span>
            </span>
            <input
              className="care-demo-org-mem__edit-input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="care-demo-org-mem__edit-field">
            <span className="care-demo-org-mem__edit-label">
              Last Name<span className="care-demo-org__req">*</span>
            </span>
            <input
              className="care-demo-org-mem__edit-input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="care-demo-org-mem__edit-field">
            <span className="care-demo-org-mem__edit-label">Email Address</span>
            <input
              className="care-demo-org-mem__edit-input care-demo-org-mem__edit-input--disabled"
              type="email"
              value={row.email}
              readOnly
              disabled
              tabIndex={-1}
              aria-readonly="true"
            />
          </label>
          <label className="care-demo-org-mem__edit-field">
            <span className="care-demo-org-mem__edit-label">
              Role<span className="care-demo-org__req">*</span>
            </span>
            <select
              className="care-demo-org-mem__edit-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {CARE_DEMO_ORG_MEMBER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="care-demo-org-mem__edit-actions">
          <button type="button" className="care-demo-org-mem__edit-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="care-demo-org-mem__edit-update"
            onClick={() => {
              if (!firstName.trim() || !lastName.trim()) {
                onToast('Fill required fields')
                return
              }
              onToast('Confirmation: member updated.')
              onClose()
            }}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function formatUsd(amount) {
  const n = Number(amount)
  if (Number.isNaN(n)) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function CareDemoOrgReceiptModal({ row, onClose, onToast }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  if (!row) return null

  const lineItems =
    row.lineItems ??
    (row.lineItemLabel != null && row.lineAmount != null
      ? [{ label: row.lineItemLabel, amount: row.lineAmount }]
      : [])
  const subtotal = lineItems.reduce((sum, li) => sum + Number(li.amount), 0)
  const total = subtotal + (row.tax ?? 0)

  const modal = (
    <div
      className="care-demo-org-receipt__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="care-demo-org-receipt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-org-receipt-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="care-org-receipt-title" className="care-demo-org-receipt__title">
          Order Details
        </h2>

        <div className="care-demo-org-receipt__kv-block">
          <dl className="care-demo-org-receipt__kv">
            <div className="care-demo-org-receipt__kv-row">
              <dt>Status</dt>
              <dd>{row.status}</dd>
            </div>
            <div className="care-demo-org-receipt__kv-row">
              <dt>Confirmation number</dt>
              <dd>{row.confirmation}</dd>
            </div>
            <div className="care-demo-org-receipt__kv-row">
              <dt>Order placed</dt>
              <dd>{row.date}</dd>
            </div>
            <div className="care-demo-org-receipt__kv-row">
              <dt>Credit card</dt>
              <dd>{row.cardReceipt}</dd>
            </div>
          </dl>
        </div>

        <hr className="care-demo-org-receipt__rule" />

        <div className="care-demo-org-receipt__block">
          <h3 className="care-demo-org-receipt__subhead">Ordered by</h3>
          <p className="care-demo-org-receipt__line">
            <span className="care-demo-org-receipt__muted">Name</span> {row.orderedByName}
          </p>
          <p className="care-demo-org-receipt__line">
            <span className="care-demo-org-receipt__muted">Email</span> {row.orderedByEmail}
          </p>
        </div>

        <hr className="care-demo-org-receipt__rule" />

        <div className="care-demo-org-receipt__block">
          <h3 className="care-demo-org-receipt__subhead">Customer</h3>
          <p className="care-demo-org-receipt__line">
            <span className="care-demo-org-receipt__muted">Name</span> {row.customerName}
          </p>
          <p className="care-demo-org-receipt__line">
            <span className="care-demo-org-receipt__muted">Address</span> {row.customerAddress}
          </p>
        </div>

        <hr className="care-demo-org-receipt__rule" />

        <div className="care-demo-org-receipt__block">
          <h3 className="care-demo-org-receipt__subhead">{row.roomLabel}</h3>
          {lineItems.map((li) => (
            <div key={li.label} className="care-demo-org-receipt__money care-demo-org-receipt__money--stacked">
              <span className="care-demo-org-receipt__money-line">{li.label}</span>
              <span className="care-demo-org-receipt__money-line care-demo-org-receipt__money-line--amt">
                {formatUsd(li.amount)}
              </span>
            </div>
          ))}
          <div className="care-demo-org-receipt__money">
            <span>Tax</span>
            <span>{formatUsd(row.tax)}</span>
          </div>
          <div className="care-demo-org-receipt__money care-demo-org-receipt__money--total">
            <span>Total</span>
            <span>{formatUsd(total)}</span>
          </div>
        </div>

        <div className="care-demo-org-receipt__footer">
          <button type="button" className="care-demo-org-receipt__btn care-demo-org-receipt__btn--muted" onClick={onClose}>
            Close
          </button>
          <div className="care-demo-org-receipt__footer-right">
            <button
              type="button"
              className="care-demo-org-receipt__btn care-demo-org-receipt__btn--primary"
              onClick={() => window.print()}
            >
              Print Receipt
            </button>
            <button
              type="button"
              className="care-demo-org-receipt__btn care-demo-org-receipt__btn--primary"
              onClick={() => {
                onToast('Demo: receipt emailed')
                onClose()
              }}
            >
              Email Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

const CARE_DEMO_ORG_COMM_INITIAL = {
  businessName: CARE_DEMO_ORG_SAMPLE.businessName,
  contactName: 'Cloud Services Team',
  replyPhone: '+1 (555) 555-0199',
  replyEmail: `office@${DEMO_FAKE_EMAIL_DOMAIN}`,
}

const CARE_DEMO_ORG_PREVIEW_SLIDES = [
  {
    id: 'invite',
    header: 'An invitation email is sent to your customer offering the benefits of SkyportCare.',
  },
  {
    id: 'homeowner',
    header: 'A homeowner report is sent to your customer explaining the system configuration.',
  },
]

function CareDemoOrgPreviewModal({
  onClose,
  businessName,
  showLogo,
  replyPhone,
  replyEmail,
  website = CARE_DEMO_ORG_INITIAL.website,
}) {
  const [slide, setSlide] = useState(0)
  const slideCount = CARE_DEMO_ORG_PREVIEW_SLIDES.length
  const prevDisabled = slide <= 0
  const nextDisabled = slide >= slideCount - 1

  const goPrev = () => setSlide((i) => (i > 0 ? i - 1 : i))
  const goNext = () => setSlide((i) => (i < slideCount - 1 ? i + 1 : i))

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopImmediatePropagation()
        onClose()
        return
      }
      if (e.key === 'ArrowLeft') {
        if (slide <= 0) return
        e.preventDefault()
        e.stopPropagation()
        setSlide((i) => (i > 0 ? i - 1 : i))
        return
      }
      if (e.key === 'ArrowRight') {
        if (slide >= slideCount - 1) return
        e.preventDefault()
        e.stopPropagation()
        setSlide((i) => (i < slideCount - 1 ? i + 1 : i))
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose, slideCount, slide])

  const headerText = CARE_DEMO_ORG_PREVIEW_SLIDES[slide].header

  const modal = (
    <div
      className="care-demo-org-prev__backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="care-demo-org-prev"
        role="dialog"
        aria-modal="true"
        aria-labelledby="care-org-prev-title"
        aria-describedby="care-org-prev-panel"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="care-demo-org-prev__topbar">
          <button type="button" className="care-demo-org-prev__close" onClick={onClose} aria-label="Close preview">
            <X size={22} strokeWidth={2} aria-hidden />
          </button>
        </div>
        <div className="care-demo-org-prev__header-bar">
          <button
            type="button"
            className={`care-demo-org-prev__chev${prevDisabled ? ' care-demo-org-prev__chev--muted' : ' care-demo-org-prev__chev--active'}`}
            onClick={goPrev}
            disabled={prevDisabled}
            aria-label="Previous preview"
            aria-disabled={prevDisabled}
          >
            <ChevronLeft size={22} strokeWidth={2.2} aria-hidden />
          </button>
          <p id="care-org-prev-title" className="care-demo-org-prev__header-text">
            {headerText}
          </p>
          <button
            type="button"
            className={`care-demo-org-prev__chev${nextDisabled ? ' care-demo-org-prev__chev--muted' : ' care-demo-org-prev__chev--active'}`}
            onClick={goNext}
            disabled={nextDisabled}
            aria-label="Next preview"
            aria-disabled={nextDisabled}
          >
            <ChevronRight size={22} strokeWidth={2.2} aria-hidden />
          </button>
        </div>
        <div id="care-org-prev-panel" className="care-demo-org-prev__body">
          {slide === 0 ? (
            <div className="care-demo-org-prev__email">
              {showLogo ? (
                <div className="care-demo-org-prev__logo" aria-hidden="true">
                  <div className="care-demo-org-prev__logo-main">
                    <span className="care-demo-org-prev__logo-abc">ABC</span>
                    <span className="care-demo-org-prev__logo-heat">heating</span>
                  </div>
                  <span className="care-demo-org-prev__logo-cooling">&amp; cooling</span>
                </div>
              ) : null}
              <h3 className="care-demo-org-prev__headline">Connected Comfort with SkyportCare</h3>
              <p className="care-demo-org-prev__p">Hi {'{{customerName}}'},</p>
              <p className="care-demo-org-prev__p">
                You can unlock the benefits of a connected comfort with your new HVAC system(s), by connecting to SkyportCare.
                Enabling SkyportCare allows your new comfort system(s) to share:
              </p>
              <ul className="care-demo-org-prev__ul">
                <li>How the system is running – it&apos;s performance over time</li>
                <li>Maintenance needs – when filters need to be replaced, service is due, etc...</li>
                <li>
                  Report system alerts and/or errors if anything outside of expected ranges are reported with us,{' '}
                  <strong>{businessName}</strong>, which allows us to ensure you comfort not only when your system is first
                  installed, but well into the future.
                </li>
              </ul>
              <p className="care-demo-org-prev__p">
                If you are already using the SkyportHome mobile app to control your home&apos;s thermostat, open the app to
                accept this invitation and grant an access level (No Access, View Only, or View and Edit) to your system. You
                will be taken to the SkyportCare settings screen upon opening in the app.
              </p>
              <p className="care-demo-org-prev__p">
                If you do not already have the SkyportHome mobile app installed, download it from the Apple App Store or
                Google Play Store.
              </p>
              <p className="care-demo-org-prev__p">
                <a
                  href="https://daikinone.com/cloud-app"
                  className="care-demo-org-prev__inline-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  daikinone.com/cloud-app
                </a>
              </p>
              <p className="care-demo-org-prev__p">
                {replyPhone} ·{' '}
                <a href={`mailto:${replyEmail}`} className="care-demo-org-prev__inline-link">
                  {replyEmail}
                </a>
                {website?.trim() ? (
                  <>
                    {' '}
                    ·{' '}
                    <a
                      href={website.trim().startsWith('http') ? website.trim() : `https://${website.trim()}`}
                      className="care-demo-org-prev__inline-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {website.trim()}
                    </a>
                  </>
                ) : null}
              </p>
              <p className="care-demo-org-prev__p care-demo-org-prev__p--signoff">
                Best regards,
                <br />
                Cloud Services Team
                <br />
                {businessName}
              </p>
            </div>
          ) : (
            <div className="care-demo-org-prev__hrpt-img-wrap">
              <img
                src="/care-demo/preview-communications-homeowner-report.png"
                alt="Homeowner Report: customer summary, dealer information, system tests, thermostat and heat pump details"
                className="care-demo-org-prev__hrpt-fullshot"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </div>
        <p className="care-demo-org-prev__slide-hint" aria-live="polite">
          Preview {slide + 1} of {slideCount}
        </p>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function CareDemoOrgViewMemberProfile({ row }) {
  const phone = careDemoOrgMemberDemoPhone(row)
  return (
    <div className="care-demo-profile care-demo-org-view-member">
      <h1 className="care-demo__view-title care-demo-profile__page-title">Profile</h1>

      <section className="care-demo-profile__card" aria-labelledby="care-org-view-member-personal-h">
        <h2 id="care-org-view-member-personal-h" className="care-demo-profile__card-title">
          Personal Information
        </h2>
        <div className="care-demo-profile__grid">
          <div className="care-demo-profile__field">
            <div className="care-demo-profile__label">First Name</div>
            <div className="care-demo-profile__value">{row.firstName}</div>
          </div>
          <div className="care-demo-profile__field">
            <div className="care-demo-profile__label">Last Name</div>
            <div className="care-demo-profile__value">{row.lastName}</div>
          </div>
          <div className="care-demo-profile__field">
            <div className="care-demo-profile__label">Email Address</div>
            <div className="care-demo-profile__value care-demo-profile__value--email">{row.email}</div>
          </div>
          <div className="care-demo-profile__field">
            <div className="care-demo-profile__label">
              Phone Number<span className="care-demo-profile__req" aria-hidden="true">
                *
              </span>
            </div>
            <div className="care-demo-profile__value">{phone}</div>
          </div>
        </div>
      </section>

      <section className="care-demo-profile__card" aria-labelledby="care-org-view-member-assigned-h">
        <h2 id="care-org-view-member-assigned-h" className="care-demo-profile__card-title">
          Assigned Customers
        </h2>
        <div className="care-demo-org-view-member__table-wrap">
          <table className="care-demo-org-view-member__table">
            <thead>
              <tr>
                <th scope="col" className="care-demo-org-view-member__th">
                  Name
                </th>
                <th scope="col" className="care-demo-org-view-member__th">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {CARE_DEMO_ORG_VIEW_MEMBER_ASSIGNED.map((c) => (
                <tr key={c.id}>
                  <td className="care-demo-org-view-member__td">{c.name}</td>
                  <td className="care-demo-org-view-member__td">{c.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="care-demo-org-view-member__pager">
          <label className="care-demo-org-view-member__page-size">
            <span>Rows per page:</span>
            <select className="care-demo-org-view-member__page-select" aria-label="Rows per page" defaultValue="3" disabled>
              <option value="3">3</option>
            </select>
          </label>
          <span className="care-demo-org-view-member__page-meta" role="status">
            Total: {CARE_DEMO_ORG_VIEW_MEMBER_ASSIGNED.length} Page 1 of 1
          </span>
          <div className="care-demo-org-view-member__page-arrows">
            <button
              type="button"
              className="care-demo-org-view-member__page-btn care-demo-org-view-member__page-btn--disabled"
              disabled
              aria-label="Previous page"
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className="care-demo-org-view-member__page-btn care-demo-org-view-member__page-btn--disabled"
              disabled
              aria-label="Next page"
            >
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function CareDemoOrganizationView({ initialOrgTab = 'business', initialMemberListFilter = 'active' } = {}) {
  const [orgTab, setOrgTab] = useState(initialOrgTab)
  const [memberListFilter, setMemberListFilter] = useState(initialMemberListFilter)
  const [memberActivePage, setMemberActivePage] = useState(0)
  const [useBillingFromBusiness, setUseBillingFromBusiness] = useState(true)
  const [receiptTxnId, setReceiptTxnId] = useState(null)
  const [previewCommOpen, setPreviewCommOpen] = useState(false)
  const [commBusinessName, setCommBusinessName] = useState(CARE_DEMO_ORG_COMM_INITIAL.businessName)
  const [commContactName, setCommContactName] = useState(CARE_DEMO_ORG_COMM_INITIAL.contactName)
  const [commReplyPhone, setCommReplyPhone] = useState(CARE_DEMO_ORG_COMM_INITIAL.replyPhone)
  const [commReplyEmail, setCommReplyEmail] = useState(CARE_DEMO_ORG_COMM_INITIAL.replyEmail)
  const [commLogoOn, setCommLogoOn] = useState(true)
  const [commAutoInvite, setCommAutoInvite] = useState(true)
  const commBaselineRef = useRef({ ...CARE_DEMO_ORG_COMM_INITIAL, commLogoOn: true, commAutoInvite: true })
  const [businessName, setBusinessName] = useState(CARE_DEMO_ORG_INITIAL.businessName)
  const [businessEmail, setBusinessEmail] = useState(CARE_DEMO_ORG_INITIAL.businessEmail)
  const [businessPhone, setBusinessPhone] = useState(CARE_DEMO_ORG_INITIAL.businessPhone)
  const [website, setWebsite] = useState(CARE_DEMO_ORG_INITIAL.website)
  const [address1, setAddress1] = useState(CARE_DEMO_ORG_INITIAL.address1)
  const [address2, setAddress2] = useState(CARE_DEMO_ORG_INITIAL.address2)
  const [country, setCountry] = useState(CARE_DEMO_ORG_INITIAL.country)
  const [city, setCity] = useState(CARE_DEMO_ORG_INITIAL.city)
  const [state, setState] = useState(CARE_DEMO_ORG_INITIAL.state)
  const [postalCode, setPostalCode] = useState(CARE_DEMO_ORG_INITIAL.postalCode)
  const [orgToast, setOrgToast] = useState(null)
  const [memberMenu, setMemberMenu] = useState(null)
  const [editMemberRow, setEditMemberRow] = useState(null)
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false)
  const [memberRolesModalOpen, setMemberRolesModalOpen] = useState(false)
  const [viewMemberRow, setViewMemberRow] = useState(null)
  const baselineRef = useRef({ ...CARE_DEMO_ORG_INITIAL })

  useEffect(() => {
    if (!orgToast) return
    const t = setTimeout(() => setOrgToast(null), 2600)
    return () => clearTimeout(t)
  }, [orgToast])

  useEffect(() => {
    setMemberMenu(null)
    setEditMemberRow(null)
    setAddMemberModalOpen(false)
    setMemberRolesModalOpen(false)
    setViewMemberRow(null)
  }, [orgTab, memberListFilter, memberActivePage])

  useEffect(() => {
    if (!memberMenu) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMemberMenu(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [memberMenu])

  useEffect(() => {
    if (!viewMemberRow) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setViewMemberRow(null)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [viewMemberRow])

  useEffect(() => {
    if (!memberMenu) return undefined
    const onDown = (e) => {
      if (
        e.target.closest('.care-demo-org-mem__more') ||
        e.target.closest('.care-demo-org-mem__menu') ||
        e.target.closest('.care-demo-org-mem__edit') ||
        e.target.closest('.care-demo-org-mem__edit-backdrop') ||
        e.target.closest('.care-demo-org-mem__roles') ||
        e.target.closest('.care-demo-org-mem__roles-backdrop')
      ) {
        return
      }
      setMemberMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [memberMenu])

  const snapshot = () => ({
    businessName: businessName.trim(),
    businessEmail: businessEmail.trim(),
    businessPhone: businessPhone.trim(),
    website: website.trim(),
    address1: address1.trim(),
    address2: address2.trim(),
    country,
    city: city.trim(),
    state,
    postalCode: postalCode.trim(),
  })

  const handleBillingUpdate = () => {
    const next = snapshot()
    if (
      !next.businessName ||
      !next.businessEmail ||
      !next.businessPhone ||
      !next.address1 ||
      !next.country ||
      !next.city ||
      !next.state ||
      !next.postalCode
    ) {
      setOrgToast('Fill required fields')
      return
    }
    const b = baselineRef.current
    const changed =
      next.businessName !== b.businessName ||
      next.businessEmail !== b.businessEmail ||
      next.businessPhone !== b.businessPhone ||
      next.website !== b.website ||
      next.address1 !== b.address1 ||
      next.address2 !== b.address2 ||
      next.country !== b.country ||
      next.city !== b.city ||
      next.state !== b.state ||
      next.postalCode !== b.postalCode
    if (changed) {
      baselineRef.current = next
      setOrgToast('Confirmation: billing information was saved.')
    } else {
      setOrgToast('No changes to save.')
    }
  }

  const orgReadRow = (label, displayValue, { required = false, empty = false, email = false } = {}) => (
    <div className="care-demo-org__readonly-field">
      <div className="care-demo-org__readonly-label">
        {label}
        {required ? (
          <span className="care-demo-org__req" aria-hidden="true">
            *
          </span>
        ) : null}
      </div>
      <div
        className={`care-demo-org__readonly-value${empty ? ' care-demo-org__readonly-value--empty' : ''}${email ? ' care-demo-org__readonly-value--email' : ''}`}
      >
        {empty ? '—' : displayValue}
      </div>
    </div>
  )

  const handleCommUpdate = () => {
    const next = {
      businessName: commBusinessName.trim(),
      contactName: commContactName.trim(),
      replyPhone: commReplyPhone.trim(),
      replyEmail: commReplyEmail.trim(),
    }
    if (!next.businessName || !next.contactName || !next.replyPhone || !next.replyEmail) {
      setOrgToast('Fill required fields')
      return
    }
    const b = commBaselineRef.current
    const changed =
      next.businessName !== b.businessName ||
      next.contactName !== b.contactName ||
      next.replyPhone !== b.replyPhone ||
      next.replyEmail !== b.replyEmail ||
      commLogoOn !== b.commLogoOn ||
      commAutoInvite !== b.commAutoInvite
    if (changed) {
      commBaselineRef.current = { ...next, commLogoOn, commAutoInvite }
      setOrgToast('Updated')
    }
  }

  const orgCommStack = (id, label, value, onChange, required) => (
    <div className="care-demo-org-comm__stack">
      <label className="care-demo-org-comm__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="care-demo-org__req" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        className="care-demo-org-comm__input"
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )

  const orgFloatReq = (id, label, value, onChange) => (
    <div className="care-demo-org__outline">
      <input
        id={id}
        className="care-demo-org__outline-input"
        type="text"
        placeholder=" "
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label className="care-demo-org__outline-label" htmlFor={id}>
        {label}
        <span className="care-demo-org__req" aria-hidden="true">
          *
        </span>
      </label>
    </div>
  )

  const orgFloatOpt = (id, label, value, onChange) => (
    <div className="care-demo-org__outline">
      <input
        id={id}
        className="care-demo-org__outline-input"
        type="text"
        placeholder=" "
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label className="care-demo-org__outline-label care-demo-org__outline-label--optional" htmlFor={id}>
        {label}
      </label>
    </div>
  )

  const orgSelectCountry = (selectId) => (
    <div className="care-demo-org__outline care-demo-org__outline--static-label">
      <select
        id={selectId}
        className="care-demo-org__outline-input care-demo-org__outline-input--select"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        {CARE_DEMO_ORG_COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <label className="care-demo-org__outline-label care-demo-org__outline-label--float" htmlFor={selectId}>
        Country
        <span className="care-demo-org__req" aria-hidden="true">
          *
        </span>
      </label>
    </div>
  )

  const orgSelectState = (selectId) => (
    <div className="care-demo-org__outline care-demo-org__outline--static-label">
      <select
        id={selectId}
        className="care-demo-org__outline-input care-demo-org__outline-input--select"
        value={state}
        onChange={(e) => setState(e.target.value)}
      >
        {CARE_DEMO_ORG_US_STATES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <label className="care-demo-org__outline-label care-demo-org__outline-label--float" htmlFor={selectId}>
        State
        <span className="care-demo-org__req" aria-hidden="true">
          *
        </span>
      </label>
    </div>
  )

  const receiptRow = receiptTxnId ? CARE_DEMO_ORG_TXN_ROWS.find((r) => r.id === receiptTxnId) : null

  const handleDownloadTxnXlsx = () => {
    const rows = CARE_DEMO_ORG_TXN_ROWS.map((r) => ({
      Customer: r.customer,
      Date: r.date,
      Card: r.card,
      Total: r.totalLabel,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
    XLSX.writeFile(wb, 'transaction-history.xlsx')
  }

  const activeMemberTotal = CARE_DEMO_ORG_MEMBERS_ACTIVE.length
  const activeMemberPageCount = Math.max(1, Math.ceil(activeMemberTotal / ORG_MEMBERS_PAGE_SIZE))
  const activeMemberRows = useMemo(
    () =>
      CARE_DEMO_ORG_MEMBERS_ACTIVE.slice(
        memberActivePage * ORG_MEMBERS_PAGE_SIZE,
        memberActivePage * ORG_MEMBERS_PAGE_SIZE + ORG_MEMBERS_PAGE_SIZE,
      ),
    [memberActivePage],
  )
  const memberRows = memberListFilter === 'active' ? activeMemberRows : CARE_DEMO_ORG_MEMBERS_INVITED
  const memberPagerLabel =
    memberListFilter === 'active'
      ? `Total: ${activeMemberTotal} Page ${memberActivePage + 1} of ${activeMemberPageCount}`
      : `Total: ${CARE_DEMO_ORG_MEMBERS_INVITED.length} Page 1 of 1`
  const memberPrevDisabled = memberListFilter !== 'active' || memberActivePage <= 0
  const memberNextDisabled =
    memberListFilter !== 'active' || memberActivePage >= activeMemberPageCount - 1

  const memberMenuRow = useMemo(() => {
    if (!memberMenu) return null
    return memberListFilter === 'active'
      ? CARE_DEMO_ORG_MEMBERS_ACTIVE.find((r) => r.id === memberMenu.id)
      : CARE_DEMO_ORG_MEMBERS_INVITED.find((r) => r.id === memberMenu.id)
  }, [memberMenu, memberListFilter])

  const openMemberMenu = (e, rowId) => {
    e.preventDefault()
    if (memberMenu?.id === rowId) {
      setMemberMenu(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const menuW = 168
    const left = Math.min(window.innerWidth - menuW - 8, Math.max(8, rect.right - menuW))
    setMemberMenu({ id: rowId, top: rect.bottom + 4, left })
  }

  return (
    <div className={`care-demo-org${viewMemberRow ? ' care-demo-org--member-profile' : ''}`}>
      {orgToast ? (
        <div className="care-demo-org__toast" role="status" aria-live="polite">
          {orgToast}
        </div>
      ) : null}
      {!viewMemberRow ? (
        <>
          <h1 className="care-demo__view-title care-demo-org__page-title">Organization</h1>

          <div className="care-demo-org__tabs" role="tablist" aria-label="Organization sections">
            {CARE_DEMO_ORG_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className={`care-demo-org__tab${orgTab === t.id ? ' care-demo-org__tab--active' : ''}`}
                aria-selected={orgTab === t.id}
                id={`care-org-tab-${t.id}`}
                onClick={() => {
                  setOrgTab(t.id)
                  setReceiptTxnId(null)
                  setPreviewCommOpen(false)
                  if (t.id === 'members') setViewMemberRow(null)
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="care-demo-org__view-member-hint visually-hidden">
          Press Escape to return to Team Members.
        </p>
      )}

      {orgTab === 'business' ? (
      <section className="care-demo-org__panel" aria-labelledby="care-org-biz-h">
        <h2 id="care-org-biz-h" className="care-demo-org__section-title care-demo-org__section-title--readonly">
          Business Information
        </h2>
        <div className="care-demo-org__grid care-demo-org__grid--readonly">
          <div>{orgReadRow('Business Name', businessName, { required: true })}</div>
          <div>{orgReadRow('Business Phone Number', businessPhone, { required: true })}</div>
          <div>{orgReadRow('Business Email Address', businessEmail, { required: true, email: true })}</div>
          <div>{orgReadRow('Website', website, { email: true })}</div>
          <div>{orgReadRow('Address 1', address1, { required: true })}</div>
          <div>{orgReadRow('Country', country, { required: true })}</div>
          <div>{orgReadRow('Address 2', address2, { empty: !address2?.trim() })}</div>
          <div>{orgReadRow('City', city, { required: true })}</div>
          <div>{orgReadRow('State', state, { required: true })}</div>
          <div>{orgReadRow('Postal Code', postalCode, { required: true })}</div>
        </div>
      </section>
      ) : null}

      {orgTab === 'billing' ? (
      <section className="care-demo-org__panel" aria-labelledby="care-org-billing-h">
        <h2 id="care-org-billing-h" className="care-demo-org__section-title">
          Billing Information
        </h2>
        <p className="care-demo-org__intro">
          Information will be used as a default address for credit card purchases.
        </p>
        <label className="care-demo-org__check-row">
          <input
            type="checkbox"
            className="care-demo-org__checkbox"
            checked={useBillingFromBusiness}
            onChange={(e) => setUseBillingFromBusiness(e.target.checked)}
          />
          <span>Use business information</span>
        </label>
        <div className="care-demo-org__grid care-demo-org__grid--form">
          <div className="care-demo-org__span-2">{orgFloatReq('care-org-bill-bn', 'Business Name', businessName, setBusinessName)}</div>
          <div>{orgFloatReq('care-org-bill-a1', 'Address 1', address1, setAddress1)}</div>
          <div>{orgSelectCountry('care-org-bill-country')}</div>
          <div>{orgFloatOpt('care-org-bill-a2', 'Address 2', address2, setAddress2)}</div>
          <div>{orgFloatReq('care-org-bill-city', 'City', city, setCity)}</div>
          <div>{orgSelectState('care-org-bill-state')}</div>
          <div>{orgFloatReq('care-org-bill-zip', 'Postal Code', postalCode, setPostalCode)}</div>
        </div>
        <div className="care-demo-org__footer">
          <button type="button" className="care-demo-org__update" onClick={handleBillingUpdate}>
            Update
          </button>
        </div>
      </section>
      ) : null}

      {orgTab === 'communications' ? (
      <section
        className="care-demo-org__panel care-demo-org__panel--comm"
        aria-labelledby="care-org-comm-h"
      >
        <h2 id="care-org-comm-h" className="care-demo-org__section-title">
          Customer Communications
        </h2>
        <p className="care-demo-org__intro care-demo-org__intro--comm">
          All communications sent to your customers will be personalized, with the contact information listed below, and can
          include your company logo.
        </p>
        <div className="care-demo-org__grid care-demo-org__grid--comm">
          <div>{orgCommStack('care-org-comm-bn', 'Business Name', commBusinessName, setCommBusinessName, true)}</div>
          <div>{orgCommStack('care-org-comm-contact', 'Contact Name', commContactName, setCommContactName, true)}</div>
          <div>{orgCommStack('care-org-comm-phone', 'Reply Phone Number', commReplyPhone, setCommReplyPhone, true)}</div>
          <div>{orgCommStack('care-org-comm-email', 'Reply Email Address', commReplyEmail, setCommReplyEmail, true)}</div>
        </div>

        <p className="care-demo-org-comm__logo-intro">
          Upload a logo that will be included in all communications from SkyportCare (optional).
        </p>
        <div className="care-demo-org-comm__logo-row">
          <div className="care-demo-org-comm__logo-preview">
            {commLogoOn ? (
              <div className="care-demo-org-comm__logo-mark" aria-hidden="true">
                <div className="care-demo-org-comm__logo-main">
                  <span className="care-demo-org-comm__logo-abc">ABC</span>
                  <span className="care-demo-org-comm__logo-heat">heating</span>
                </div>
                <span className="care-demo-org-comm__logo-cooling">&amp; cooling</span>
              </div>
            ) : (
              <span className="care-demo-org-comm__logo-empty">No logo uploaded</span>
            )}
          </div>
          <ul className="care-demo-org-comm__logo-rules">
            <li>File type can be JPEG or PNG.</li>
            <li>Recommend a white or transparent background.</li>
            <li>Minimum 300×300 pixels.</li>
          </ul>
        </div>
        <button
          type="button"
          className="care-demo-org-comm__remove-logo"
          onClick={() => setCommLogoOn(false)}
          disabled={!commLogoOn}
        >
          <Minus size={16} strokeWidth={2.5} className="care-demo-org-comm__remove-icon" aria-hidden />
          Remove Logo
        </button>

        <div className="care-demo-org-comm__preview-row">
          <p className="care-demo-org-comm__preview-intro">
            Please click the button below if you would like to preview all communications.
          </p>
          <button type="button" className="care-demo-org-comm__preview-btn" onClick={() => setPreviewCommOpen(true)}>
            Preview Communications
          </button>
        </div>

        <label className="care-demo-org-comm__auto">
          <input
            type="checkbox"
            className="care-demo-org__checkbox"
            checked={commAutoInvite}
            onChange={(e) => setCommAutoInvite(e.target.checked)}
          />
          <span>
            Automatically invite all customers whose systems complete <em>Quality Install</em> process. Not familiar with{' '}
            <em>Quality Install</em>, click here to{' '}
            <a
              href="https://backend.daikincomfort.com/docs/default-source/default-document-library/press-releases/press-release---daikin-launches-powerful-quality-install.pdf"
              className="care-demo-org-comm__inline-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              learn more
            </a>
            .
          </span>
        </label>

        <div className="care-demo-org__footer">
          <button type="button" className="care-demo-org__update" onClick={handleCommUpdate}>
            Update
          </button>
        </div>
      </section>
      ) : null}

      {orgTab === 'transactions' ? (
      <section
        className="care-demo-org__panel care-demo-org__panel--txn"
        aria-labelledby="care-org-txn-h"
      >
        <h2 id="care-org-txn-h" className="care-demo-org__section-title">
          Transaction History
        </h2>
        <div className="care-demo-org-txn__table-wrap">
          <table className="care-demo-org-txn__table">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Date</th>
                <th scope="col">Card</th>
                <th scope="col" className="care-demo-org-txn__th-num">
                  Total
                </th>
                <th scope="col" className="care-demo-org-txn__th-action">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {CARE_DEMO_ORG_TXN_ROWS.map((r) => (
                <tr key={r.id}>
                  <td>{r.customer}</td>
                  <td>{r.date}</td>
                  <td>{r.card}</td>
                  <td className="care-demo-org-txn__td-num">{r.totalLabel}</td>
                  <td className="care-demo-org-txn__td-action">
                    <button
                      type="button"
                      className="care-demo-org-txn__receipt-link"
                      onClick={() => setReceiptTxnId(r.id)}
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="care-demo-org-txn__summary" role="status">
          Total: {CARE_DEMO_ORG_TXN_ROWS.length} · Page 1 of 1
        </p>
        <div className="care-demo-org-txn__xlsx-row">
          <button type="button" className="care-demo-org__update" onClick={handleDownloadTxnXlsx}>
            Download as XLSX
          </button>
        </div>
      </section>
      ) : null}

      {orgTab === 'members' ? (
      viewMemberRow ? (
        <CareDemoOrgViewMemberProfile row={viewMemberRow} />
      ) : (
      <section
        className="care-demo-org__panel care-demo-org__panel--mem"
        aria-labelledby="care-org-mem-h"
      >
        <div className="care-demo-org-mem__toolbar">
          <div className="care-demo-org-mem__toolbar-left">
            <h2 id="care-org-mem-h" className="care-demo-org-mem__title">
              Team Members
            </h2>
            <button
              type="button"
              className="care-demo-org-mem__add"
              aria-label="Add team member"
              onClick={() => setAddMemberModalOpen(true)}
            >
              <Plus size={14} strokeWidth={2} aria-hidden />
            </button>
          </div>
          <select
            className="care-demo-org-mem__filter"
            aria-label="Member list"
            value={memberListFilter}
            onChange={(e) => {
              setMemberListFilter(e.target.value)
              setMemberActivePage(0)
            }}
          >
            <option value="active">Active Members</option>
            <option value="invited">Invited Members</option>
          </select>
        </div>
        <p className="care-demo-org-mem__hint">Add members of your organization and assign their roles with appropriate permissions.</p>
        <div className="care-demo-org-mem__table-wrap">
          <table className="care-demo-org-mem__table">
            <thead>
              <tr>
                <th scope="col">First Name</th>
                <th scope="col">Last Name</th>
                <th scope="col">Email</th>
                <th scope="col" className="care-demo-org-mem__th-role">
                  Role
                </th>
                <th scope="col" className="care-demo-org-mem__th-actions">
                  <div className="care-demo-org-mem__actions-head">
                    <button
                      type="button"
                      className="care-demo-org-mem__info care-demo-org-mem__info--large"
                      aria-label="Member roles"
                      aria-expanded={memberRolesModalOpen}
                      aria-haspopup="dialog"
                      title="Open member roles matrix"
                      onClick={() => setMemberRolesModalOpen(true)}
                    >
                      <Info size={22} strokeWidth={2.15} aria-hidden />
                    </button>
                    <span className="visually-hidden">Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {memberRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.firstName}</td>
                  <td>{row.lastName}</td>
                  <td>{row.email}</td>
                  <td>{row.role}</td>
                  <td className="care-demo-org-mem__td-actions">
                    {row.showMenu === false ? null : (
                      <button
                        type="button"
                        className="care-demo-org-mem__more"
                        aria-label={`Actions for ${row.firstName} ${row.lastName}`}
                        aria-haspopup="menu"
                        aria-expanded={memberMenu?.id === row.id}
                        onClick={(e) => openMemberMenu(e, row.id)}
                      >
                        <MoreHorizontal size={20} strokeWidth={2} aria-hidden />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="care-demo-org-mem__pager">
          <label className="care-demo-org-mem__page-size">
            <span>Rows per page:</span>
            <select
              className="care-demo-org-mem__page-select"
              aria-label="Rows per page"
              defaultValue={String(ORG_MEMBERS_PAGE_SIZE)}
            >
              <option value="5">5</option>
            </select>
          </label>
          <span className="care-demo-org-mem__page-meta">{memberPagerLabel}</span>
          <div className="care-demo-org-mem__page-arrows">
            <button
              type="button"
              className={`care-demo-org-mem__page-btn${memberPrevDisabled ? ' care-demo-org-mem__page-btn--disabled' : ''}`}
              disabled={memberPrevDisabled}
              aria-label="Previous page"
              onClick={() => setMemberActivePage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft size={18} strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              className={`care-demo-org-mem__page-btn${memberNextDisabled ? ' care-demo-org-mem__page-btn--disabled' : ''}`}
              disabled={memberNextDisabled}
              aria-label="Next page"
              onClick={() => setMemberActivePage((p) => Math.min(activeMemberPageCount - 1, p + 1))}
            >
              <ChevronRight size={18} strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </section>
      )
      ) : null}

      {memberMenu && memberMenuRow
        ? createPortal(
            <div
              className="care-demo-org-mem__menu"
              role="menu"
              aria-label="Member actions"
              style={{ top: memberMenu.top, left: memberMenu.left }}
            >
              {memberListFilter === 'invited' ? (
                <button
                  type="button"
                  role="menuitem"
                  className="care-demo-org-mem__menu-item"
                  onClick={() => {
                    setOrgToast(`Invite resent to ${memberMenuRow.email} (demo).`)
                    setMemberMenu(null)
                  }}
                >
                  Resend Invite
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="care-demo-org-mem__menu-item"
                onClick={() => {
                  setMemberMenu(null)
                  setEditMemberRow(memberMenuRow)
                }}
              >
                Edit Member
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-org-mem__menu-item care-demo-org-mem__menu-item--danger"
                onClick={() => {
                  setOrgToast(
                    `${memberMenuRow.firstName} ${memberMenuRow.lastName} deleted. Demo only — not removed from the list.`,
                  )
                  setMemberMenu(null)
                }}
              >
                Delete Member
              </button>
              {memberListFilter === 'active' ? (
                <button
                  type="button"
                  role="menuitem"
                  className="care-demo-org-mem__menu-item"
                  onClick={() => {
                    setMemberMenu(null)
                    setViewMemberRow(memberMenuRow)
                  }}
                >
                  View Member
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
      {addMemberModalOpen ? (
        <CareDemoOrgAddMemberModal
          open={addMemberModalOpen}
          onClose={() => setAddMemberModalOpen(false)}
          onToast={setOrgToast}
        />
      ) : null}
      {editMemberRow ? (
        <CareDemoOrgEditMemberModal
          row={editMemberRow}
          isInvited={memberListFilter === 'invited'}
          onClose={() => setEditMemberRow(null)}
          onToast={setOrgToast}
        />
      ) : null}
      {memberRolesModalOpen ? (
        <CareDemoOrgMemberRolesModal onClose={() => setMemberRolesModalOpen(false)} />
      ) : null}
      {receiptRow ? (
        <CareDemoOrgReceiptModal row={receiptRow} onClose={() => setReceiptTxnId(null)} onToast={setOrgToast} />
      ) : null}
      {previewCommOpen ? (
        <CareDemoOrgPreviewModal
          onClose={() => setPreviewCommOpen(false)}
          businessName={commBusinessName.trim() || CARE_DEMO_ORG_COMM_INITIAL.businessName}
          showLogo={commLogoOn}
          replyPhone={commReplyPhone}
          replyEmail={commReplyEmail}
          website={website.trim() || CARE_DEMO_ORG_INITIAL.website}
        />
      ) : null}
    </div>
  )
}

function CareDemoProfileView() {
  const [firstName, setFirstName] = useState(CARE_DEMO_PROFILE_INITIAL.firstName)
  const [lastName, setLastName] = useState(CARE_DEMO_PROFILE_INITIAL.lastName)
  const [email, setEmail] = useState(CARE_DEMO_PROFILE_INITIAL.email)
  const [phone, setPhone] = useState(CARE_DEMO_PROFILE_INITIAL.phone)
  const [personalErrors, setPersonalErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
  })
  const [criticalAlertsEmail, setCriticalAlertsEmail] = useState(false)
  const [degreeUnits, setDegreeUnits] = useState('fahrenheit')
  const [profileToast, setProfileToast] = useState(null)
  const baselinePersonalRef = useRef({ ...CARE_DEMO_PROFILE_INITIAL })
  const baselinePrefsRef = useRef({ criticalAlertsEmail: false, degreeUnits: 'fahrenheit' })

  useEffect(() => {
    if (!profileToast) return
    const t = setTimeout(() => setProfileToast(null), 2800)
    return () => clearTimeout(t)
  }, [profileToast])

  const clearPersonalError = (key) => {
    setPersonalErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev))
  }

  const handlePersonalUpdate = () => {
    const next = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    }
    const err = {
      firstName: !next.firstName,
      lastName: !next.lastName,
      email: !next.email,
      phone: !next.phone,
    }
    setPersonalErrors(err)
    if (err.firstName || err.lastName || err.email || err.phone) {
      return
    }
    const b = baselinePersonalRef.current
    const changed =
      next.firstName !== b.firstName ||
      next.lastName !== b.lastName ||
      next.email !== b.email ||
      next.phone !== b.phone
    if (changed) {
      baselinePersonalRef.current = next
      setProfileToast('Updated')
    }
  }

  const handlePrefsUpdate = () => {
    const b = baselinePrefsRef.current
    if (criticalAlertsEmail !== b.criticalAlertsEmail || degreeUnits !== b.degreeUnits) {
      baselinePrefsRef.current = { criticalAlertsEmail, degreeUnits }
      setProfileToast('Updated')
    }
  }

  return (
    <div className="care-demo-profile">
      {profileToast ? (
        <div className="care-demo-profile__toast" role="status" aria-live="polite">
          {profileToast}
        </div>
      ) : null}
      <h1 className="care-demo__view-title care-demo-profile__page-title">Profile</h1>

      <section className="care-demo-profile__card" aria-labelledby="care-profile-personal-h">
        <h2 id="care-profile-personal-h" className="care-demo-profile__card-title">
          Personal Information
        </h2>
        <div className="care-demo-profile__grid">
          <div className="care-demo-profile__field">
            <label className="care-demo-profile__label" htmlFor="care-demo-profile-first">
              First Name<span className="care-demo-profile__req" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="care-demo-profile-first"
              type="text"
              className={`care-demo-profile__input${personalErrors.firstName ? ' care-demo-profile__input--invalid' : ''}`}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value)
                if (e.target.value.trim()) clearPersonalError('firstName')
              }}
              autoComplete="given-name"
              aria-required="true"
              aria-invalid={personalErrors.firstName}
            />
            {personalErrors.firstName ? (
              <p className="care-demo-profile__error" role="alert">
                Please fill in this field.
              </p>
            ) : null}
          </div>
          <div className="care-demo-profile__field">
            <label className="care-demo-profile__label" htmlFor="care-demo-profile-last">
              Last Name<span className="care-demo-profile__req" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="care-demo-profile-last"
              type="text"
              className={`care-demo-profile__input${personalErrors.lastName ? ' care-demo-profile__input--invalid' : ''}`}
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value)
                if (e.target.value.trim()) clearPersonalError('lastName')
              }}
              autoComplete="family-name"
              aria-required="true"
              aria-invalid={personalErrors.lastName}
            />
            {personalErrors.lastName ? (
              <p className="care-demo-profile__error" role="alert">
                Please fill in this field.
              </p>
            ) : null}
          </div>
          <div className="care-demo-profile__field">
            <label className="care-demo-profile__label" htmlFor="care-demo-profile-email">
              Email Address<span className="care-demo-profile__req" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="care-demo-profile-email"
              type="email"
              className={`care-demo-profile__input care-demo-profile__input--email${personalErrors.email ? ' care-demo-profile__input--invalid' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (e.target.value.trim()) clearPersonalError('email')
              }}
              autoComplete="email"
              aria-required="true"
              aria-invalid={personalErrors.email}
            />
            {personalErrors.email ? (
              <p className="care-demo-profile__error" role="alert">
                Please fill in this field.
              </p>
            ) : null}
          </div>
          <div className="care-demo-profile__field">
            <label className="care-demo-profile__label" htmlFor="care-demo-profile-phone">
              Phone Number<span className="care-demo-profile__req" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="care-demo-profile-phone"
              type="tel"
              className={`care-demo-profile__input${personalErrors.phone ? ' care-demo-profile__input--invalid' : ''}`}
              placeholder="(xxx) xxx-xxxx"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (e.target.value.trim()) clearPersonalError('phone')
              }}
              autoComplete="tel"
              aria-required="true"
              aria-invalid={personalErrors.phone}
            />
            {personalErrors.phone ? (
              <p className="care-demo-profile__error" role="alert">
                Please fill in this field.
              </p>
            ) : null}
          </div>
        </div>
        <div className="care-demo-profile__card-footer">
          <button type="button" className="care-demo-profile__update" onClick={handlePersonalUpdate}>
            Update
          </button>
        </div>
      </section>

      <section className="care-demo-profile__card" aria-labelledby="care-profile-prefs-h">
        <h2 id="care-profile-prefs-h" className="care-demo-profile__card-title">
          Preferences
        </h2>
        <label className="care-demo-profile__checkbox-row">
          <input
            type="checkbox"
            className="care-demo-profile__checkbox"
            checked={criticalAlertsEmail}
            onChange={(e) => setCriticalAlertsEmail(e.target.checked)}
          />
          <span className="care-demo-profile__checkbox-text">Send email notification for critical alerts</span>
        </label>
        <h3 className="care-demo-profile__subhead">Display</h3>
        <div className="care-demo-profile__select-field">
          <label className="care-demo-profile__select-label" htmlFor="care-demo-profile-degrees">
            Degree Units
          </label>
          <select
            id="care-demo-profile-degrees"
            className="care-demo-profile__select"
            value={degreeUnits}
            onChange={(e) => setDegreeUnits(e.target.value)}
          >
            <option value="fahrenheit">Fahrenheit</option>
            <option value="celsius">Celsius</option>
          </select>
        </div>
        <div className="care-demo-profile__card-footer">
          <button type="button" className="care-demo-profile__update" onClick={handlePrefsUpdate}>
            Update
          </button>
        </div>
      </section>

    </div>
  )
}

function CustomersHubView({
  hub,
  setHub,
  detailCustomerId,
  onOpenCustomerDetail,
  onCloseCustomerDetail,
  customerSearchQuery,
}) {
  const [openMenuId, setOpenMenuId] = useState(null)
  const [currentRowMenuId, setCurrentRowMenuId] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)
  const [xlsxModalOpen, setXlsxModalOpen] = useState(false)
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [licenseModalRow, setLicenseModalRow] = useState(null)
  const [currentCustomersPage, setCurrentCustomersPage] = useState(0)
  const [currentCustomersPageSize, setCurrentCustomersPageSize] = useState(10)
  const [expandedCurrentCustomerId, setExpandedCurrentCustomerId] = useState(null)
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [reminderMenuOpen, setReminderMenuOpen] = useState(false)
  const [licenseStatusMenuOpen, setLicenseStatusMenuOpen] = useState(false)
  const triggerRef = useRef(null)
  const currentMenuTriggerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [menuBox, setMenuBox] = useState(null)
  const filterWrapRef = useRef(null)
  const [ccTableFilterOpen, setCcTableFilterOpen] = useState(false)
  const [ccTableFilters, setCcTableFilters] = useState(() => ({ ...CURRENT_CUSTOMER_TABLE_FILTERS_INITIAL }))
  const ccTableFilterBtnRef = useRef(null)
  const ccTableFilterPanelRef = useRef(null)
  const [ccFilterBox, setCcFilterBox] = useState(null)
  const [currentCustomersNameSort, setCurrentCustomersNameSort] = useState('asc')

  const filteredReminderCustomers = useMemo(
    () =>
      MOCK_ACTIVE_REMINDER_CUSTOMERS.filter((c) => customerMatchesReminderFilter(c, hub.reminderFilter)).filter((c) =>
        customerNameSearchMatches(c.name, customerSearchQuery),
      ),
    [hub.reminderFilter, customerSearchQuery],
  )

  const licenseStatusBoxes = hub.licenseStatusCheckboxes ?? DEFAULT_LICENSE_STATUS_CHECKBOXES

  const filteredLicenseRows = useMemo(
    () =>
      MOCK_LICENSE_ROWS.filter((r) => licenseRowMatchesCheckboxes(r, licenseStatusBoxes)).filter((r) =>
        customerNameSearchMatches(r.name, customerSearchQuery),
      ),
    [licenseStatusBoxes, customerSearchQuery],
  )

  const filteredInvitedCustomers = useMemo(
    () => MOCK_INVITED_CUSTOMERS.filter((row) => invitedRowMatchesSearch(row, customerSearchQuery)),
    [customerSearchQuery],
  )

  useEffect(() => {
    setExpandedCurrentCustomerId(null)
    setCurrentRowMenuId(null)
    setCcTableFilterOpen(false)
  }, [currentCustomersPage, currentCustomersPageSize])

  useEffect(() => {
    setOpenMenuId(null)
    setCurrentRowMenuId(null)
    setEditCustomer(null)
    setCcTableFilterOpen(false)
    setCcTableFilters({ ...CURRENT_CUSTOMER_TABLE_FILTERS_INITIAL })
    setCurrentCustomersNameSort('asc')
  }, [hub.customerView])

  useEffect(() => {
    setLicenseModalRow(null)
  }, [hub.customerView])

  useEffect(() => {
    if (detailCustomerId) setLicenseModalRow(null)
  }, [detailCustomerId])

  useEffect(() => {
    setCurrentCustomersPage(0)
  }, [ccTableFilters])

  useEffect(() => {
    setCurrentCustomersPage(0)
  }, [currentCustomersNameSort])

  useEffect(() => {
    setCurrentCustomersPage(0)
  }, [customerSearchQuery])

  useLayoutEffect(() => {
    if (!ccTableFilterOpen) {
      setCcFilterBox(null)
      return
    }
    const el = ccTableFilterBtnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = 308
    let left = r.right - width
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8))
    const pad = 8
    const top = r.bottom + 4
    const vh = window.visualViewport?.height ?? window.innerHeight
    // Keep panel inside viewport so the last row (e.g. Home Sold) can scroll into view.
    const maxHeight = Math.max(120, Math.min(580, vh - top - pad))
    setCcFilterBox({ top, left, width, maxHeight })
  }, [ccTableFilterOpen])

  useEffect(() => {
    if (!ccTableFilterOpen) return
    const close = () => setCcTableFilterOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [ccTableFilterOpen])

  useEffect(() => {
    if (!ccTableFilterOpen) return
    const onDown = (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (ccTableFilterBtnRef.current?.contains(t)) return
      if (ccTableFilterPanelRef.current?.contains(t)) return
      setCcTableFilterOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ccTableFilterOpen])

  useLayoutEffect(() => {
    const el =
      hub.customerView === 'reminders' && openMenuId
        ? triggerRef.current
        : hub.customerView === 'current' && currentRowMenuId
          ? currentMenuTriggerRef.current
          : null
    if (!el) {
      setMenuBox(null)
      return
    }
    const r = el.getBoundingClientRect()
    const pad = 8
    const vw = window.visualViewport?.width ?? window.innerWidth
    const width = Math.max(168, Math.min(220, Math.floor(vw - 2 * pad)))
    // Right-align menu to ⋯ button; clamp so the full menu stays inside the viewport.
    let left = r.right - width
    const minLeft = pad
    const maxLeft = Math.max(minLeft, vw - width - pad)
    left = Math.min(Math.max(minLeft, left), maxLeft)
    setMenuBox({ top: r.bottom + 2, left, width })
  }, [hub.customerView, openMenuId, currentRowMenuId])

  useEffect(() => {
    if (!openMenuId && !currentRowMenuId) return
    const close = () => {
      setOpenMenuId(null)
      setCurrentRowMenuId(null)
    }
    const onScroll = () => close()
    const onResize = () => close()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [openMenuId, currentRowMenuId])

  useEffect(() => {
    if (!openMenuId && !currentRowMenuId) return
    const onDown = (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest('.care-demo-custrm__row-menu')) return
      if (dropdownRef.current?.contains(t)) return
      setOpenMenuId(null)
      setCurrentRowMenuId(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('mousedown', onDown)
    }
  }, [openMenuId, currentRowMenuId])

  useEffect(() => {
    if (!viewMenuOpen && !reminderMenuOpen && !licenseStatusMenuOpen) return
    const onDown = (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (filterWrapRef.current?.contains(t)) return
      setViewMenuOpen(false)
      setReminderMenuOpen(false)
      setLicenseStatusMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [viewMenuOpen, reminderMenuOpen, licenseStatusMenuOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (ccTableFilterOpen) {
        setCcTableFilterOpen(false)
        return
      }
      if (editCustomer) {
        setEditCustomer(null)
        return
      }
      if (detailCustomerId) {
        onCloseCustomerDetail()
        return
      }
      if (addCustomerOpen) {
        setAddCustomerOpen(false)
        return
      }
      if (licenseModalRow) {
        setLicenseModalRow(null)
        return
      }
      if (inviteOpen) {
        setInviteOpen(false)
        return
      }
      if (xlsxModalOpen) {
        setXlsxModalOpen(false)
        return
      }
      if (expandedCurrentCustomerId) {
        setExpandedCurrentCustomerId(null)
        return
      }
      if (openMenuId) setOpenMenuId(null)
      if (currentRowMenuId) setCurrentRowMenuId(null)
      setViewMenuOpen(false)
      setReminderMenuOpen(false)
      setLicenseStatusMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [
    detailCustomerId,
    onCloseCustomerDetail,
    addCustomerOpen,
    xlsxModalOpen,
    openMenuId,
    currentRowMenuId,
    editCustomer,
    ccTableFilterOpen,
    inviteOpen,
    licenseModalRow,
    expandedCurrentCustomerId,
  ])

  const nRem = filteredReminderCustomers.length
  const hasSearch = Boolean(String(customerSearchQuery ?? '').trim())

  const filteredCurrentCustomers = useMemo(
    () =>
      MOCK_CURRENT_CUSTOMERS.filter((row) => currentCustomerMatchesTableFilters(ccTableFilters, row)).filter((row) =>
        customerNameSearchMatches(row.name, customerSearchQuery),
      ),
    [ccTableFilters, customerSearchQuery],
  )

  const anyCcTableFilterActive = useMemo(() => Object.values(ccTableFilters).some(Boolean), [ccTableFilters])

  const toggleCcTableFilter = (key) => {
    setCcTableFilters((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const sortedCurrentCustomers = useMemo(() => {
    const rows = [...filteredCurrentCustomers]
    rows.sort((a, b) => {
      const an = String(a.name ?? '').toLocaleLowerCase()
      const bn = String(b.name ?? '').toLocaleLowerCase()
      const cmp = an.localeCompare(bn, undefined, { sensitivity: 'base' })
      return currentCustomersNameSort === 'asc' ? cmp : -cmp
    })
    return rows
  }, [filteredCurrentCustomers, currentCustomersNameSort])

  const currentCustomersTotal = sortedCurrentCustomers.length
  const currentPageCount = Math.max(1, Math.ceil(currentCustomersTotal / currentCustomersPageSize))

  const pagedCurrentCustomers = useMemo(() => {
    const start = currentCustomersPage * currentCustomersPageSize
    return sortedCurrentCustomers.slice(start, start + currentCustomersPageSize)
  }, [sortedCurrentCustomers, currentCustomersPage, currentCustomersPageSize])

  const currentRangeLabel = useMemo(() => {
    if (currentCustomersTotal === 0) return '0 of 0'
    const start = currentCustomersPage * currentCustomersPageSize
    const from = start + 1
    const to = Math.min(start + currentCustomersPageSize, currentCustomersTotal)
    return `${from}–${to} of ${currentCustomersTotal}`
  }, [currentCustomersPage, currentCustomersPageSize, currentCustomersTotal])

  const currentCanPrev = currentCustomersPage > 0
  const currentCanNext = currentCustomersPage < currentPageCount - 1

  const detailCustomer = detailCustomerId
    ? MOCK_CURRENT_CUSTOMERS.find((c) => c.id === detailCustomerId)
    : null

  if (detailCustomer) {
    return (
      <div className="care-demo-custrm care-demo-custrm--customer-detail">
        <CustomerDetailView
          customer={detailCustomer}
          onBack={onCloseCustomerDetail}
          onEditCustomer={() => setEditCustomer(currentRowToEditCustomerPayload(detailCustomer))}
        />
        <DownloadXlsxModal open={xlsxModalOpen} onClose={() => setXlsxModalOpen(false)} customers={MOCK_ACTIVE_REMINDER_CUSTOMERS} />
        <AddCustomerModal open={addCustomerOpen} onClose={() => setAddCustomerOpen(false)} />
        {licenseModalRow ? (
          <SkyportCareLicenseModal
            key={licenseModalRow.id}
            row={licenseModalRow}
            onClose={() => setLicenseModalRow(null)}
          />
        ) : null}
        <EditCustomerModal
          open={editCustomer != null}
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
        />
        <InviteCustomersModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      </div>
    )
  }

  return (
    <div className="care-demo-custrm">
      <div className="care-demo-custrm__title-row">
        <h1 className="care-demo__view-title care-demo-custrm__title">Customers</h1>
        <button
          type="button"
          className="care-demo-custrm__add-btn"
          aria-label="Add customer"
          onClick={() => setAddCustomerOpen(true)}
        >
          <Plus size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="care-demo-custrm__filters" ref={filterWrapRef}>
        <div className="care-demo-custrm__dropdown-wrap">
          <button
            type="button"
            className="care-demo-custrm__filter"
            aria-expanded={viewMenuOpen}
            aria-haspopup="listbox"
            onClick={() => {
              setReminderMenuOpen(false)
              setLicenseStatusMenuOpen(false)
              setViewMenuOpen((v) => !v)
            }}
          >
            View: {CUSTOMERS_VIEW_LABELS[hub.customerView]}
            <ChevronDown
              size={16}
              strokeWidth={2.25}
              className={`care-demo-custrm__filter-chevron${viewMenuOpen ? ' care-demo-custrm__filter-chevron--open' : ''}`}
              aria-hidden
            />
          </button>
          {viewMenuOpen ? (
            <ul className="care-demo-custrm__filter-menu" role="listbox">
              {CUSTOMERS_VIEW_KEYS.map((key) => (
                <li key={key} role="option" aria-selected={hub.customerView === key}>
                  <button
                    type="button"
                    className={`care-demo-custrm__filter-option${hub.customerView === key ? ' care-demo-custrm__filter-option--active' : ''}`}
                    onClick={() => {
                      setHub((h) => ({ ...h, customerView: key }))
                      setViewMenuOpen(false)
                    }}
                  >
                    {CUSTOMERS_VIEW_LABELS[key]}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {hub.customerView === 'reminders' ? (
          <div className="care-demo-custrm__dropdown-wrap">
            <button
              type="button"
              className="care-demo-custrm__filter"
              aria-expanded={reminderMenuOpen}
              aria-haspopup="listbox"
              onClick={() => {
                setViewMenuOpen(false)
                setLicenseStatusMenuOpen(false)
                setReminderMenuOpen((v) => !v)
              }}
            >
              Reminder: {REMINDER_FILTER_LABELS[hub.reminderFilter]}
              <ChevronDown
                size={16}
                strokeWidth={2.25}
                className={`care-demo-custrm__filter-chevron${reminderMenuOpen ? ' care-demo-custrm__filter-chevron--open' : ''}`}
                aria-hidden
              />
            </button>
            {reminderMenuOpen ? (
              <ul className="care-demo-custrm__filter-menu" role="listbox">
                {Object.entries(REMINDER_FILTER_LABELS).map(([key, label]) => (
                  <li key={key} role="option" aria-selected={hub.reminderFilter === key}>
                    <button
                      type="button"
                      className={`care-demo-custrm__filter-option${hub.reminderFilter === key ? ' care-demo-custrm__filter-option--active' : ''}`}
                      onClick={() => {
                        setHub((h) => ({ ...h, reminderFilter: key }))
                        setReminderMenuOpen(false)
                      }}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {hub.customerView === 'licenses' ? (
          <div className="care-demo-custrm__dropdown-wrap">
            <button
              type="button"
              className="care-demo-custrm__filter care-demo-custrm__filter--secondary"
              aria-expanded={licenseStatusMenuOpen}
              aria-haspopup="true"
              aria-controls="care-demo-license-status-menu"
              onClick={() => {
                setViewMenuOpen(false)
                setReminderMenuOpen(false)
                setLicenseStatusMenuOpen((v) => !v)
              }}
            >
              License Status
              <ChevronDown
                size={16}
                strokeWidth={2.25}
                className={`care-demo-custrm__filter-chevron${licenseStatusMenuOpen ? ' care-demo-custrm__filter-chevron--open' : ''}`}
                aria-hidden
              />
            </button>
            {licenseStatusMenuOpen ? (
              <ul
                id="care-demo-license-status-menu"
                className="care-demo-custrm__filter-menu care-demo-custrm__filter-menu--license-status"
                role="group"
                aria-label="License status filters"
              >
                {LICENSE_STATUS_MENU_KEYS.map((key) => {
                  const meta = LICENSE_STATUS_MENU[key]
                  const checked = Boolean(licenseStatusBoxes[key])
                  return (
                    <li key={key} role="none" className="care-demo-custrm__license-status-item">
                      <label className="care-demo-custrm__license-status-label">
                        <input
                          type="checkbox"
                          className="care-demo-custrm__license-status-check"
                          checked={checked}
                          onChange={() => {
                            setHub((h) => {
                              const cur = h.licenseStatusCheckboxes ?? { ...DEFAULT_LICENSE_STATUS_CHECKBOXES }
                              return {
                                ...h,
                                licenseStatusCheckboxes: { ...cur, [key]: !cur[key] },
                              }
                            })
                          }}
                        />
                        <span className="care-demo-custrm__license-status-icon-wrap" aria-hidden>
                          {meta.icon === 'active' ? (
                            <CheckCircle2 size={18} strokeWidth={2} className="care-demo-custrm__license-status-icon care-demo-custrm__license-status-icon--active" />
                          ) : null}
                          {meta.icon === 'soon' ? (
                            <span className="care-demo-custrm__license-status-icon-ring">
                              <Clock size={14} strokeWidth={2.25} className="care-demo-custrm__license-status-icon care-demo-custrm__license-status-icon--soon" />
                            </span>
                          ) : null}
                          {meta.icon === 'expired' ? (
                            <CircleAlert size={18} strokeWidth={2} className="care-demo-custrm__license-status-icon care-demo-custrm__license-status-icon--expired" />
                          ) : null}
                        </span>
                        <span className="care-demo-custrm__license-status-text">{meta.label}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      {hub.customerView === 'reminders' ? (
        <>
          <div className="care-demo-custrm__table-scroll">
            <table className="care-demo-custrm__table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Location</th>
                  <th scope="col" className="care-demo-custrm__th-sort">
                    <span className="care-demo-custrm__sort-inner">
                      Reminder
                      <span className="care-demo-custrm__sort-caret" aria-hidden>
                        ▲
                      </span>
                    </span>
                  </th>
                  <th scope="col">Indoor Unit</th>
                  <th scope="col">Outdoor Unit</th>
                  <th scope="col" className="care-demo-custrm__th-actions">
                    <span className="visually-hidden">Actions</span>
                    <MoreHorizontal size={18} strokeWidth={2} className="care-demo-custrm__th-dots" aria-hidden />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReminderCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="care-demo-custrm__empty">
                      {hasSearch
                        ? 'No customers match your search.'
                        : 'No customers match this reminder filter (demo).'}
                    </td>
                  </tr>
                ) : (
                  filteredReminderCustomers.map((cust) => {
                    const loc = splitStreetAndRest(cust.location)
                    return (
                      <tr key={cust.id}>
                        <td>
                          <button
                            type="button"
                            className="care-demo-custrm__name-link care-demo-custrm__name-btn"
                            onClick={() => {
                              setOpenMenuId(null)
                              onOpenCustomerDetail(cust.linkedCustomerId)
                            }}
                          >
                            {cust.name}
                          </button>
                        </td>
                        <td className="care-demo-custrm__loc">
                          <span className="care-demo-custrm__loc-line">{loc.line1}</span>
                          {loc.line2 ? (
                            <span className="care-demo-custrm__loc-line care-demo-custrm__loc-line--sub">{loc.line2}</span>
                          ) : null}
                        </td>
                        <td>
                          <div className="care-demo-custrm__reminders">
                            {cust.reminders.map((r) => (
                              <div key={`${r.kind}-${r.daysAgo}`} className="care-demo-custrm__rem-line">
                                <span className="care-demo-custrm__rem-icon" aria-hidden />
                                <div className="care-demo-custrm__rem-text">
                                  <span className="care-demo-custrm__rem-main">{r.kind}</span>
                                  <span className="care-demo-custrm__rem-sub">{r.daysAgo} days ago</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="care-demo-custrm__mono">{cust.indoor}</td>
                        <td className="care-demo-custrm__mono">{cust.outdoor}</td>
                        <td className="care-demo-custrm__actions">
                          <div className="care-demo-custrm__menu-wrap">
                            <button
                              type="button"
                              ref={openMenuId === cust.id ? triggerRef : undefined}
                              className={`care-demo-custrm__row-menu${openMenuId === cust.id ? ' care-demo-custrm__row-menu--open' : ''}`}
                              aria-label="Row actions"
                              aria-haspopup="menu"
                              aria-expanded={openMenuId === cust.id}
                              aria-controls={openMenuId === cust.id ? `custrm-menu-${cust.id}` : undefined}
                              onClick={(e) => {
                                e.stopPropagation()
                                setCcTableFilterOpen(false)
                                setCurrentRowMenuId(null)
                                setOpenMenuId((id) => (id === cust.id ? null : cust.id))
                              }}
                            >
                              <MoreHorizontal size={20} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="care-demo-custrm__footer">
            <button
              type="button"
              className="care-demo-custrm__download"
              onClick={() => {
                setOpenMenuId(null)
                setXlsxModalOpen(true)
              }}
            >
              <Download size={18} strokeWidth={2} aria-hidden />
              Download as XLSX
            </button>
            <div className="care-demo-custrm__pager">
              <label className="care-demo-custrm__page-size">
                <span>Rows per page:</span>
                <select className="care-demo-custrm__select" defaultValue="10" aria-label="Rows per page">
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
              </label>
              <span className="care-demo-custrm__range">{nRem === 0 ? '0 of 0' : `1–${nRem} of ${nRem}`}</span>
              <div className="care-demo-custrm__page-arrows">
                <button type="button" className="care-demo-custrm__page-btn" disabled aria-label="Previous page">
                  <ChevronLeft size={20} strokeWidth={2} />
                </button>
                <button type="button" className="care-demo-custrm__page-btn" disabled aria-label="Next page">
                  <ChevronRight size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {hub.customerView === 'current' ? (
        <>
          <div className="care-demo-custrm__table-scroll">
            <table className="care-demo-custrm__table care-demo-custrm__table--current">
              <thead>
                <tr>
                  <th scope="col" className="care-demo-custrm__th-narrow" aria-label="Expand" />
                  <th
                    scope="col"
                    className="care-demo-custrm__th-sort"
                    aria-sort={currentCustomersNameSort === 'asc' ? 'ascending' : 'descending'}
                  >
                    <button
                      type="button"
                      className="care-demo-custrm__sort-btn"
                      aria-label={
                        currentCustomersNameSort === 'asc'
                          ? 'Name sorted A to Z. Click to sort Z to A.'
                          : 'Name sorted Z to A. Click to sort A to Z.'
                      }
                      onClick={() => setCurrentCustomersNameSort((s) => (s === 'asc' ? 'desc' : 'asc'))}
                    >
                      <span className="care-demo-custrm__sort-inner">
                        Name
                        <span
                          className={`care-demo-custrm__sort-caret${currentCustomersNameSort === 'desc' ? ' care-demo-custrm__sort-caret--down' : ''}`}
                          aria-hidden
                        >
                          ▲
                        </span>
                      </span>
                    </button>
                  </th>
                  <th scope="col">Location</th>
                  <th scope="col">License</th>
                  <th scope="col">Status</th>
                  <th scope="col">Assigned to</th>
                  <th scope="col" className="care-demo-custrm__th-actions care-demo-custrm__th-filter-col">
                    <button
                      type="button"
                      ref={ccTableFilterBtnRef}
                      className={`care-demo-custrm__th-filter-btn${anyCcTableFilterActive ? ' care-demo-custrm__th-filter-btn--active' : ''}${ccTableFilterOpen ? ' care-demo-custrm__th-filter-btn--open' : ''}`}
                      aria-label="Filter customers"
                      aria-expanded={ccTableFilterOpen}
                      aria-haspopup="dialog"
                      onClick={() => {
                        setCcTableFilterOpen((o) => !o)
                        setOpenMenuId(null)
                        setCurrentRowMenuId(null)
                      }}
                    >
                      <Filter size={18} strokeWidth={2} className="care-demo-custrm__th-filter-btn__icon" aria-hidden />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedCurrentCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="care-demo-custrm__empty">
                      {hasSearch
                        ? 'No customers match your search or table filters (demo).'
                        : 'No customers match these filters (demo).'}
                    </td>
                  </tr>
                ) : null}
                {pagedCurrentCustomers.map((row) => {
                  const isExpanded = expandedCurrentCustomerId === row.id
                  const detail = row.expandDetail
                  return (
                    <Fragment key={row.id}>
                      <tr className="care-demo-custrm__row-main">
                        <td className="care-demo-custrm__chev-cell">
                          <button
                            type="button"
                            className="care-demo-custrm__expand-btn"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Collapse location and equipment details' : 'Expand location and equipment details'}
                            onClick={() =>
                              setExpandedCurrentCustomerId((id) => (id === row.id ? null : row.id))
                            }
                          >
                            <ChevronDown
                              size={16}
                              strokeWidth={2}
                              className={`care-demo-custrm__expand-chevron${isExpanded ? ' care-demo-custrm__expand-chevron--open' : ''}`}
                              aria-hidden
                            />
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="care-demo-custrm__name-link care-demo-custrm__name-btn"
                            onClick={() => {
                              setCcTableFilterOpen(false)
                              onOpenCustomerDetail(row.id)
                            }}
                          >
                            {row.name}
                          </button>
                        </td>
                        <td className="care-demo-custrm__loc">
                          <span className="care-demo-custrm__loc-line">{row.loc1}</span>
                          {row.loc2 ? (
                            <span className="care-demo-custrm__loc-line care-demo-custrm__loc-line--sub">{row.loc2}</span>
                          ) : null}
                        </td>
                        <td className="care-demo-custrm__lic">
                          {row.homeSold ? (
                            <span className="care-demo-custrm__home-sold">
                              <span className="care-demo-custrm__home-sold-plate" aria-hidden>
                                SOLD
                              </span>
                              <span className="care-demo-custrm__home-sold-text">Home Sold</span>
                            </span>
                          ) : (
                            <>
                              {row.licenseOk ? (
                                <CheckCircle2 size={18} strokeWidth={2} className="care-demo-custrm__lic-ok" aria-label="Valid" />
                              ) : null}
                              {row.licenseBad ? (
                                <CircleAlert size={18} strokeWidth={2} className="care-demo-custrm__lic-bad" aria-label="Issue" />
                              ) : null}
                            </>
                          )}
                        </td>
                        <td className="care-demo-custrm__status-cell">
                          {row.status === 'reminder' ? (
                            <span className="care-demo-custrm__status care-demo-custrm__status--reminder">
                              <CalendarIcon size={15} strokeWidth={2} aria-hidden />
                              Active Reminder
                            </span>
                          ) : null}
                          {row.status === 'offline' ? (
                            <span className="care-demo-custrm__status care-demo-custrm__status--offline">
                              <span className="care-demo-custrm__dot care-demo-custrm__dot--grey" aria-hidden />
                              Offline
                            </span>
                          ) : null}
                          {row.status === 'ok' ? (
                            <span className="care-demo-custrm__status care-demo-custrm__status--ok">
                              <span className="care-demo-custrm__dot care-demo-custrm__dot--green" aria-hidden />
                              OK
                            </span>
                          ) : null}
                        </td>
                        <td>{row.assigned}</td>
                        <td className="care-demo-custrm__actions">
                          <div className="care-demo-custrm__menu-wrap">
                            <button
                              type="button"
                              ref={currentRowMenuId === row.id ? currentMenuTriggerRef : undefined}
                              className={`care-demo-custrm__row-menu${currentRowMenuId === row.id ? ' care-demo-custrm__row-menu--open' : ''}`}
                              aria-label="Row actions"
                              aria-haspopup="menu"
                              aria-expanded={currentRowMenuId === row.id}
                              aria-controls={
                                currentRowMenuId === row.id ? `custrm-menu-current-${row.id}` : undefined
                              }
                              onClick={(e) => {
                                e.stopPropagation()
                                setCcTableFilterOpen(false)
                                setOpenMenuId(null)
                                setCurrentRowMenuId((id) => (id === row.id ? null : row.id))
                              }}
                            >
                              <MoreHorizontal size={20} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && detail ? <CurrentCustomerExpandRows detail={detail} rowId={row.id} /> : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="care-demo-custrm__footer care-demo-custrm__footer--pager-only">
            <span />
            <div className="care-demo-custrm__pager">
              <label className="care-demo-custrm__page-size">
                <span>Rows per page:</span>
                <select
                  className="care-demo-custrm__select"
                  aria-label="Rows per page"
                  value={String(currentCustomersPageSize)}
                  onChange={(e) => {
                    setCurrentCustomersPageSize(Number(e.target.value))
                    setCurrentCustomersPage(0)
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </label>
              <span className="care-demo-custrm__range">{currentRangeLabel}</span>
              <div className="care-demo-custrm__page-arrows">
                <button
                  type="button"
                  className="care-demo-custrm__page-btn"
                  aria-label="Previous page"
                  disabled={!currentCanPrev}
                  onClick={() => setCurrentCustomersPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft size={20} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="care-demo-custrm__page-btn"
                  aria-label="Next page"
                  disabled={!currentCanNext}
                  onClick={() => setCurrentCustomersPage((p) => Math.min(currentPageCount - 1, p + 1))}
                >
                  <ChevronRight size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {hub.customerView === 'licenses' ? (
        <>
          <div className="care-demo-custrm__table-scroll">
            <table className="care-demo-custrm__table care-demo-custrm__table--licenses">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Location</th>
                  <th scope="col" className="care-demo-custrm__th-sort">
                    <span className="care-demo-custrm__sort-inner">
                      License Status
                      <span className="care-demo-custrm__sort-caret" aria-hidden>
                        ▲
                      </span>
                    </span>
                  </th>
                  <th scope="col">System</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenseRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="care-demo-custrm__empty">
                      {hasSearch
                        ? 'No licenses match your search.'
                        : 'No licenses match this filter (demo).'}
                    </td>
                  </tr>
                ) : (
                  filteredLicenseRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <button
                          type="button"
                          className="care-demo-custrm__name-link care-demo-custrm__name-btn"
                          onClick={() => {
                            setCcTableFilterOpen(false)
                            onOpenCustomerDetail(row.linkedCustomerId)
                          }}
                        >
                          {row.name}
                        </button>
                      </td>
                      <td className="care-demo-custrm__loc">
                        <span className="care-demo-custrm__loc-line">{row.location}</span>
                      </td>
                      <td>
                        {row.licenseTier === 'expired' ? (
                          <div className="care-demo-custrm__lic-status">
                            <CircleAlert size={18} strokeWidth={2} className="care-demo-custrm__lic-status-icon" aria-hidden />
                            <div className="care-demo-custrm__lic-status-text">
                              <span className="care-demo-custrm__lic-status-label">Expired</span>
                              <span className="care-demo-custrm__lic-status-sub">{row.daysAgo} days ago</span>
                            </div>
                          </div>
                        ) : null}
                        {row.licenseTier === 'expiringSoon' ? (
                          <div className="care-demo-custrm__lic-status care-demo-custrm__lic-status--soon">
                            <span className="care-demo-custrm__lic-soon-ring" aria-hidden>
                              <Clock size={14} strokeWidth={2.25} className="care-demo-custrm__lic-soon-clock" />
                            </span>
                            <div className="care-demo-custrm__lic-status-text">
                              <span className="care-demo-custrm__lic-status-label">Expiring Soon</span>
                              <span className="care-demo-custrm__lic-status-sub">Expires in {row.expiresInDays ?? '—'} days</span>
                            </div>
                          </div>
                        ) : null}
                        {row.licenseTier === 'active' ? (
                          <div className="care-demo-custrm__lic-status care-demo-custrm__lic-status--active">
                            <CheckCircle2 size={18} strokeWidth={2} className="care-demo-custrm__lic-ok" aria-hidden />
                            <div className="care-demo-custrm__lic-status-text">
                              <span className="care-demo-custrm__lic-status-label">Active</span>
                            </div>
                          </div>
                        ) : null}
                      </td>
                      <td className="care-demo-custrm__lic-system">
                        <span className="care-demo-custrm__sys-label">{row.systemLabel}</span>
                        {row.systemIds.map((id) => (
                          <span key={id} className="care-demo-custrm__sys-id">
                            {id}
                          </span>
                        ))}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="care-demo-custrm__activate-link"
                          onClick={() => setLicenseModalRow(row)}
                        >
                          {row.licenseTier === 'expired'
                            ? 'Activate License'
                            : row.licenseTier === 'active'
                              ? 'Extend License'
                              : 'Renew License'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {hub.customerView === 'invited' ? (
        <>
          <div className="care-demo-custrm__table-scroll">
            <table className="care-demo-custrm__table care-demo-custrm__table--invited">
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col" className="care-demo-custrm__th-sort">
                    <span className="care-demo-custrm__sort-inner">
                      Status
                      <span className="care-demo-custrm__sort-caret" aria-hidden>
                        ▼
                      </span>
                    </span>
                  </th>
                  <th scope="col" className="care-demo-custrm__th-invite-actions"> </th>
                  <th scope="col" className="care-demo-custrm__th-remove"> </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvitedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="care-demo-custrm__empty">
                      {hasSearch ? 'No invitations match your search.' : 'No invited customers (demo).'}
                    </td>
                  </tr>
                ) : null}
                {filteredInvitedCustomers.map((row) => (
                  <tr key={row.id}>
                    <td className="care-demo-custrm__email">{row.email}</td>
                    <td className="care-demo-custrm__inv-status">{row.detail}</td>
                    <td className="care-demo-custrm__inv-actions">
                      {row.kind === 'sent' ? (
                        <button type="button" className="care-demo-custrm__resend">
                          Resend Invitation
                        </button>
                      ) : (
                        <strong className="care-demo-custrm__contact-customer">Contact Customer</strong>
                      )}
                    </td>
                    <td className="care-demo-custrm__remove-cell">
                      <button type="button" className="care-demo-custrm__remove-btn" aria-label="Remove">
                        <Minus size={14} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="care-demo-custrm__footer care-demo-custrm__footer--invited">
            <button type="button" className="care-demo-custrm__invite-bar-btn" onClick={() => setInviteOpen(true)}>
              Invite Customers
            </button>
            <div className="care-demo-custrm__pager">
              <label className="care-demo-custrm__page-size">
                <span>Rows per page:</span>
                <select className="care-demo-custrm__select" defaultValue="10" aria-label="Rows per page">
                  <option value="10">10</option>
                </select>
              </label>
              <span className="care-demo-custrm__range">1–5 of 24</span>
              <div className="care-demo-custrm__page-arrows">
                <button type="button" className="care-demo-custrm__page-btn" aria-label="Previous page">
                  <ChevronLeft size={20} strokeWidth={2} />
                </button>
                <button type="button" className="care-demo-custrm__page-btn" aria-label="Next page">
                  <ChevronRight size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {menuBox && hub.customerView === 'reminders' && openMenuId
        ? createPortal(
            <div
              id={`custrm-menu-${openMenuId}`}
              ref={dropdownRef}
              role="menu"
              className="care-demo-custrm__dropdown"
              style={{
                position: 'fixed',
                top: menuBox.top,
                left: menuBox.left,
                width: menuBox.width,
                zIndex: 5600,
              }}
            >
              <a
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                href={`mailto:${SKYPORT_CARE_DEMO_EMAIL}`}
                onClick={() => setOpenMenuId(null)}
              >
                Email Customer
              </a>
              <button
                type="button"
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                onClick={() => {
                  const cust = MOCK_ACTIVE_REMINDER_CUSTOMERS.find((c) => c.id === openMenuId)
                  setOpenMenuId(null)
                  if (cust) setEditCustomer(reminderCustomerToEditPayload(cust))
                }}
              >
                Edit Customer
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                onClick={() => setOpenMenuId(null)}
              >
                Delete Customer
              </button>
            </div>,
            document.body,
          )
        : null}

      {menuBox && hub.customerView === 'current' && currentRowMenuId
        ? createPortal(
            <div
              id={`custrm-menu-current-${currentRowMenuId}`}
              ref={dropdownRef}
              role="menu"
              className="care-demo-custrm__dropdown"
              style={{
                position: 'fixed',
                top: menuBox.top,
                left: menuBox.left,
                width: menuBox.width,
                zIndex: 5600,
              }}
            >
              <button
                type="button"
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                onClick={() => setCurrentRowMenuId(null)}
              >
                Call Customer
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                onClick={() => setCurrentRowMenuId(null)}
              >
                Text Customer
              </button>
              <a
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                href={`mailto:${SKYPORT_CARE_DEMO_EMAIL}`}
                onClick={() => setCurrentRowMenuId(null)}
              >
                Email Customer
              </a>
              <div className="care-demo-custrm__dropdown-sep" role="separator" aria-hidden="true" />
              <button
                type="button"
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                onClick={() => setCurrentRowMenuId(null)}
              >
                Assign Customer
              </button>
              <button
                type="button"
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                onClick={() => {
                  const row = MOCK_CURRENT_CUSTOMERS.find((r) => r.id === currentRowMenuId)
                  setCurrentRowMenuId(null)
                  if (row) setEditCustomer(currentRowToEditCustomerPayload(row))
                }}
              >
                Edit Customer
              </button>
              <div className="care-demo-custrm__dropdown-sep" role="separator" aria-hidden="true" />
              <button
                type="button"
                role="menuitem"
                className="care-demo-custrm__dropdown-item"
                onClick={() => setCurrentRowMenuId(null)}
              >
                Delete Customer
              </button>
            </div>,
            document.body,
          )
        : null}

      <CurrentCustomersFilterPanel
        open={hub.customerView === 'current' && ccTableFilterOpen}
        box={ccFilterBox}
        panelRef={ccTableFilterPanelRef}
        filters={ccTableFilters}
        onToggle={toggleCcTableFilter}
        onClose={() => setCcTableFilterOpen(false)}
      />
      <DownloadXlsxModal open={xlsxModalOpen} onClose={() => setXlsxModalOpen(false)} customers={MOCK_ACTIVE_REMINDER_CUSTOMERS} />
      <AddCustomerModal open={addCustomerOpen} onClose={() => setAddCustomerOpen(false)} />
      {licenseModalRow ? (
        <SkyportCareLicenseModal key={licenseModalRow.id} row={licenseModalRow} onClose={() => setLicenseModalRow(null)} />
      ) : null}
      <EditCustomerModal
        open={editCustomer != null}
        customer={editCustomer}
        onClose={() => setEditCustomer(null)}
      />
      <InviteCustomersModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  )
}

function SystemHealthDonut() {
  const totalErrors = 4
  return (
    <>
      <div className="care-demo-health__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={HEALTH_PIE_SEGMENTS}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={64}
              outerRadius={94}
              paddingAngle={0.4}
              stroke="#fff"
              strokeWidth={1.5}
              isAnimationActive={false}
            >
              {HEALTH_PIE_SEGMENTS.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || viewBox.cx == null) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy - 12} fontSize={42} fontWeight={700} fill="#333333">
                        {totalErrors}
                      </tspan>
                      <tspan x={viewBox.cx} y={viewBox.cy + 26} fontSize={21} fill="#666666" fontWeight={400}>
                        Errors
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="care-demo-health__legend">
        {HEALTH_LEGEND_ITEMS.map((d) => (
          <span key={d.name} className="care-demo-health__legend-row">
            <span className="care-demo-health__swatch" style={{ background: d.color }} aria-hidden />
            <span className="care-demo-health__legend-label">{d.name}</span>
          </span>
        ))}
      </div>
    </>
  )
}

export default function CareDemoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHelpPage = location.pathname === CARE_DEMO_HELP_PATH

  const leaveHelpIfOnHelp = () => {
    if (location.pathname === CARE_DEMO_HELP_PATH) navigate(CARE_DEMO_BASE_PATH)
  }

  const [careSubView, setCareSubView] = useState('dashboard')
  const [customersHub, setCustomersHub] = useState(() => ({ ...DEFAULT_CUSTOMERS_HUB }))
  const [dashboardInviteOpen, setDashboardInviteOpen] = useState(false)
  const [dashboardAddMemberOpen, setDashboardAddMemberOpen] = useState(false)
  const [sidebarNavOpen, setSidebarNavOpen] = useState(false)
  const [soldHomesModalOpen, setSoldHomesModalOpen] = useState(false)
  const [customerDetailId, setCustomerDetailId] = useState(null)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuWrapRef = useRef(null)
  /** Remount Organization view when opening from dashboard vs account menu (initial tab + Members filter). */
  const [organizationShell, setOrganizationShell] = useState({
    key: 0,
    tab: 'business',
    memberListFilter: 'active',
  })

  const goToCurrentCustomersHub = () => {
    setCustomersHub({ ...DEFAULT_CUSTOMERS_HUB, customerView: 'current' })
    setCareSubView('active-reminders')
    setSidebarNavOpen(false)
  }

  useEffect(() => {
    if (!accountMenuOpen) return
    const onDocDown = (e) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (accountMenuWrapRef.current?.contains(t)) return
      setAccountMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [accountMenuOpen])

  useEffect(() => {
    if (
      !dashboardInviteOpen &&
      !dashboardAddMemberOpen &&
      !sidebarNavOpen &&
      !soldHomesModalOpen &&
      !customerDetailId &&
      !isHelpPage &&
      !accountMenuOpen &&
      careSubView !== 'profile' &&
      careSubView !== 'organization'
    )
      return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (accountMenuOpen) {
        setAccountMenuOpen(false)
        return
      }
      if (sidebarNavOpen) {
        setSidebarNavOpen(false)
        return
      }
      if (isHelpPage) {
        navigate(CARE_DEMO_BASE_PATH)
        return
      }
      if (careSubView === 'profile' || careSubView === 'organization') {
        setCareSubView('dashboard')
        return
      }
      if (customerDetailId) {
        setCustomerDetailId(null)
        return
      }
      if (soldHomesModalOpen) {
        setSoldHomesModalOpen(false)
        return
      }
      setDashboardInviteOpen(false)
      setDashboardAddMemberOpen(false)
      setSidebarNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    dashboardInviteOpen,
    dashboardAddMemberOpen,
    sidebarNavOpen,
    soldHomesModalOpen,
    customerDetailId,
    isHelpPage,
    accountMenuOpen,
    careSubView,
    navigate,
  ])

  if (!isCareDemoAuthenticated()) {
    return <Navigate to={CARE_DEMO_LOGIN_PATH} replace />
  }

  return (
    <div id="care-demo-root" className="care-demo">
      <div className="care-demo__shell">
        <header className="care-demo__topbar">
          <div className="care-demo__topbar-left">
            <button
              type="button"
              className="care-demo__menu-btn"
              aria-label={sidebarNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={sidebarNavOpen}
              onClick={() => setSidebarNavOpen((o) => !o)}
            >
              <Menu size={22} strokeWidth={2} color="#ffffff" />
            </button>
            <div className="care-demo__brand care-demo__brand--topbar">
              <img
                className="care-demo__brand-logo"
                src={CARE_DEMO_BRAND_LOGO_SRC}
                alt="SkyportCare"
                width={190}
                height={46}
                decoding="async"
              />
            </div>
          </div>
          <div className="care-demo__topbar-spacer" aria-hidden="true" />
          <div className="care-demo__topbar-actions">
            <div className="care-demo__search-wrap">
              <Search size={16} strokeWidth={2} color="#666666" aria-hidden />
              <label className="visually-hidden" htmlFor="care-demo-search">
                Search customers by name
              </label>
              <input
                id="care-demo-search"
                className="care-demo__search"
                type="search"
                placeholder="Search by name"
                autoComplete="off"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
              />
            </div>
            <span className="care-demo__topbar-sep" aria-hidden="true" />
            <button
              type="button"
              className={`care-demo__icon-btn${isHelpPage ? ' care-demo__icon-btn--active' : ''}`}
              aria-label={isHelpPage ? 'Close help (return to app)' : 'Help'}
              aria-pressed={isHelpPage}
              onClick={() => {
                setAccountMenuOpen(false)
                navigate(isHelpPage ? CARE_DEMO_BASE_PATH : CARE_DEMO_HELP_PATH)
              }}
            >
              <HelpCircle size={22} strokeWidth={ICON_STROKE} />
            </button>
            <div className="care-demo__account-wrap" ref={accountMenuWrapRef}>
              <button
                type="button"
                className={`care-demo__icon-btn care-demo__icon-btn--account${accountMenuOpen ? ' care-demo__icon-btn--active' : ''}`}
                aria-label="Account menu"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-controls={accountMenuOpen ? 'care-demo-account-menu' : undefined}
                onClick={() => {
                  setAccountMenuOpen((o) => !o)
                }}
              >
                <span className="care-demo__account-badge" aria-hidden="true">
                  !
                </span>
                <User size={22} strokeWidth={ICON_STROKE} />
              </button>
              {accountMenuOpen ? (
                <div
                  id="care-demo-account-menu"
                  className="care-demo__account-menu"
                  role="menu"
                  aria-label="Account"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="care-demo__account-menu-item"
                    onClick={() => {
                      setAccountMenuOpen(false)
                      leaveHelpIfOnHelp()
                      setCustomerDetailId(null)
                      setCareSubView('profile')
                      setSidebarNavOpen(false)
                    }}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="care-demo__account-menu-item"
                    onClick={() => {
                      setAccountMenuOpen(false)
                      leaveHelpIfOnHelp()
                      setCustomerDetailId(null)
                      setOrganizationShell((s) => ({
                        key: s.key + 1,
                        tab: 'business',
                        memberListFilter: 'active',
                      }))
                      setCareSubView('organization')
                      setSidebarNavOpen(false)
                    }}
                  >
                    Organization
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="care-demo__account-menu-item"
                    onClick={() => {
                      setAccountMenuOpen(false)
                      setCareDemoAuthenticated(false)
                      navigate(CARE_DEMO_LOGIN_PATH)
                    }}
                  >
                    Log Out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="care-demo__body">
          <aside
            className={`care-demo__sidebar${sidebarNavOpen ? ' care-demo__sidebar--expanded' : ''}`}
            aria-label="Primary navigation"
          >
            <button
              type="button"
              className={`care-demo__nav-icon ${careSubView === 'dashboard' ? 'care-demo__nav-icon--active' : ''}`}
              aria-current={careSubView === 'dashboard' ? 'page' : undefined}
              aria-label="Dashboard"
              onClick={() => {
                leaveHelpIfOnHelp()
                setCareSubView('dashboard')
                setSidebarNavOpen(false)
              }}
            >
              <LayoutGrid size={22} strokeWidth={2} className="care-demo__nav-icon-svg" aria-hidden />
              <span className="care-demo__nav-label">Dashboard</span>
            </button>
            <button
              type="button"
              className={`care-demo__nav-icon ${careSubView === 'active-reminders' ? 'care-demo__nav-icon--active' : ''}`}
              aria-current={careSubView === 'active-reminders' ? 'page' : undefined}
              aria-label="Customers"
              onClick={() => {
                leaveHelpIfOnHelp()
                setCustomersHub({ ...DEFAULT_CUSTOMERS_HUB })
                setCareSubView('active-reminders')
                setSidebarNavOpen(false)
              }}
            >
              <IdCard size={22} strokeWidth={2} className="care-demo__nav-icon-svg" aria-hidden />
              <span className="care-demo__nav-label">Customers</span>
            </button>
            <button
              type="button"
              className={`care-demo__nav-icon ${careSubView === 'locations-map' ? 'care-demo__nav-icon--active' : ''}`}
              aria-current={careSubView === 'locations-map' ? 'page' : undefined}
              aria-label="Locations"
              onClick={() => {
                leaveHelpIfOnHelp()
                setCareSubView('locations-map')
                setSidebarNavOpen(false)
              }}
            >
              <MapPin size={22} strokeWidth={2} className="care-demo__nav-icon-svg" aria-hidden />
              <span className="care-demo__nav-label">Locations</span>
            </button>
          </aside>

          <main
            className={`care-demo__main${!isHelpPage && (careSubView === 'active-reminders' || careSubView === 'profile' || careSubView === 'organization') ? ' care-demo__main--subview' : ''}${!isHelpPage && (careSubView === 'profile' || careSubView === 'organization') ? ' care-demo__main--profile' : ''}${!isHelpPage && careSubView === 'locations-map' ? ' care-demo__main--map' : ''}`}
          >
            {isHelpPage ? (
              <CareDemoHelpContent variant="page" />
            ) : careSubView === 'locations-map' ? (
              <CareDemoLocationsMap />
            ) : careSubView === 'active-reminders' ? (
              <>
                <CustomersHubView
                  hub={customersHub}
                  setHub={setCustomersHub}
                  detailCustomerId={customerDetailId}
                  onOpenCustomerDetail={(id) => setCustomerDetailId(id)}
                  onCloseCustomerDetail={() => setCustomerDetailId(null)}
                  customerSearchQuery={customerSearchQuery}
                />
              </>
            ) : careSubView === 'organization' ? (
              <CareDemoOrganizationView
                key={organizationShell.key}
                initialOrgTab={organizationShell.tab}
                initialMemberListFilter={organizationShell.memberListFilter}
              />
            ) : careSubView === 'profile' ? (
              <CareDemoProfileView />
            ) : (
              <div className="care-demo__dashboard">
                <h1 className="care-demo__view-title">Dashboard</h1>
                <div className="care-demo__grid">
              <section className="care-demo__card care-demo__card--panel" aria-labelledby="care-widget-access">
                <h2 id="care-widget-access" className="care-demo__card-title care-demo__card-title--panel">
                  System Access
                </h2>
                <div className="care-demo__card-body care-demo__card-body--panel care-demo__card-body--system-access-inner">
                  <SystemAccessPanel />
                </div>
              </section>

              <section
                className="care-demo__card care-demo__card--panel care-demo__card--alerts"
                aria-labelledby="care-widget-alerts"
              >
                <h2 id="care-widget-alerts" className="care-demo__card-title care-demo__card-title--alerts">
                  Alerts
                </h2>
                <div className="care-demo__card-body care-demo__card-body--panel care-demo__card-body--alerts">
                  <AlertsPanel />
                </div>
              </section>

              <section
                className="care-demo__card care-demo__card--panel care-demo__card--reminders"
                aria-labelledby="care-widget-reminders"
              >
                <h2 id="care-widget-reminders" className="care-demo__card-title care-demo__card-title--reminders">
                  Reminders
                </h2>
                <div className="care-demo__card-body care-demo__card-body--panel care-demo__card-body--reminders">
                  <RemindersPanel
                    onRowNavigate={(range) => {
                      setCustomersHub((h) => ({ ...h, customerView: 'reminders', reminderFilter: range }))
                      setCareSubView('active-reminders')
                    }}
                  />
                </div>
              </section>

              <section
                className="care-demo__card care-demo__card--panel care-demo__card--health"
                aria-labelledby="care-widget-health"
              >
                <h2 id="care-widget-health" className="care-demo__card-title care-demo__card-title--system-health">
                  System Health
                </h2>
                <div className="care-demo__card-body care-demo__card-body--panel care-demo__card-body--health">
                  <SystemHealthDonut />
                </div>
              </section>

              <section
                className="care-demo__card care-demo__card--panel care-demo__card--customers"
                aria-labelledby="care-widget-customers"
              >
                <h2 id="care-widget-customers" className="care-demo__card-title care-demo__card-title--customers">
                  Customers
                </h2>
                <div className="care-demo__card-body care-demo__card-body--panel care-demo__card-body--customers">
                  <ul className="care-demo-customers__list">
                    {CUSTOMER_ROWS.map((row) => (
                      <li key={row.label}>
                        <button
                          type="button"
                          className="care-demo-customers__row care-demo-customers__row-btn"
                          aria-label={`Customers: ${row.num} ${row.label}`}
                          onClick={() => {
                            setCustomersHub({ ...DEFAULT_CUSTOMERS_HUB, customerView: row.customerView })
                            setCareSubView('active-reminders')
                            setSidebarNavOpen(false)
                          }}
                        >
                          <span className="care-demo-customers__num">{row.num}</span>
                          <span className="care-demo-customers__label">{row.label}</span>
                          <ArrowRight
                            className="care-demo-customers__arrow"
                            size={20}
                            strokeWidth={2.1}
                            color={CUSTOMERS_BLUE}
                            aria-hidden
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="care-demo-customers__sold-block" role="status">
                    <div className="care-demo-sold">
                      <div className="care-demo-sold__plate" aria-hidden>
                        SOLD
                      </div>
                      <div className="care-demo-sold__post" aria-hidden />
                    </div>
                    <p className="care-demo-customers__sold-text">
                      Some customers may have sold their home.{' '}
                      <button
                        type="button"
                        className="care-demo-customers__link care-demo-customers__link-btn"
                        onClick={() => setSoldHomesModalOpen(true)}
                      >
                        View details.
                      </button>
                    </p>
                  </div>
                </div>
                <div className="care-demo__card-action--panel care-demo__card-action--customers">
                  <button
                    type="button"
                    className="care-demo__card-action-customers-btn"
                    onClick={() => setDashboardInviteOpen(true)}
                  >
                    <AddCustomerIcon />
                    <span>Add Customer</span>
                  </button>
                </div>
              </section>

              <section
                className="care-demo__card care-demo__card--panel care-demo__card--team"
                aria-labelledby="care-widget-team"
              >
                <h2 id="care-widget-team" className="care-demo__card-title care-demo__card-title--team">
                  Team Members
                </h2>
                <div className="care-demo__card-body care-demo__card-body--panel care-demo__card-body--team">
                  <ul className="care-demo-team__list">
                    {TEAM_ROWS.map((row) => (
                      <li key={row.label} className="care-demo-team__item">
                        {row.orgNav ? (
                          <button
                            type="button"
                            className="care-demo-team__row-btn"
                            onClick={() => {
                              leaveHelpIfOnHelp()
                              setCustomerDetailId(null)
                              const memberListFilter = row.orgNav === 'members-invited' ? 'invited' : 'active'
                              setOrganizationShell((s) => ({
                                key: s.key + 1,
                                tab: 'members',
                                memberListFilter,
                              }))
                              setCareSubView('organization')
                              setSidebarNavOpen(false)
                            }}
                          >
                            <span className="care-demo-team__num">{row.num}</span>
                            <span className="care-demo-team__label">{row.label}</span>
                            <ArrowRight className="care-demo-team__arrow" size={20} strokeWidth={2.1} aria-hidden />
                          </button>
                        ) : (
                          <div className={`care-demo-team__row ${row.faded ? 'care-demo-team__row--faded' : ''}`}>
                            <span className="care-demo-team__num">{row.num}</span>
                            <span className="care-demo-team__label">{row.label}</span>
                            <ArrowRight className="care-demo-team__arrow" size={20} strokeWidth={2.1} aria-hidden />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="care-demo-team__hint">
                    Manage members of your team by selecting &quot;Organization&quot; from the menu in the upper right.
                  </p>
                </div>
                <div className="care-demo__card-action--panel care-demo__card-action--team">
                  <button
                    type="button"
                    className="care-demo__card-action-team-btn"
                    onClick={() => setDashboardAddMemberOpen(true)}
                  >
                    <User size={20} strokeWidth={2} color={TEAM_BLUE} aria-hidden />
                    <span>Add Member</span>
                  </button>
                </div>
              </section>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <footer className="care-demo__footer">
        <div className="care-demo__footer-brands care-demo__footer-brands--daikin-only" aria-label="Daikin">
          <img
            className="care-demo__footer-brands-img"
            src={CARE_DEMO_FOOTER_BRANDS_SVG}
            alt="Daikin"
            width={222}
            height={30}
            decoding="async"
            loading="lazy"
          />
        </div>
        <div className="care-demo__footer-legal">
          <p>© 2026 Daikin Comfort Technologies North America, Inc. All rights reserved.</p>
          <p>
            Amana® is a registered trademark of Maytag Corporation or its related companies and is used under license.
          </p>
        </div>
        <nav className="care-demo__footer-links" aria-label="Footer">
          <button
            type="button"
            className="care-demo__footer-link-btn"
            aria-current={isHelpPage ? 'page' : undefined}
            onClick={() => navigate(CARE_DEMO_HELP_PATH)}
          >
            Help
          </button>
          <span className="care-demo__footer-sep" aria-hidden>
            |
          </span>
          <a href="https://daikincomfort.com/privacy-notice" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          <span className="care-demo__footer-sep" aria-hidden>
            |
          </span>
          <a href="https://daikincomfort.com/terms-of-use" target="_blank" rel="noopener noreferrer">
            Terms of Use
          </a>
          <span className="care-demo__footer-sep" aria-hidden>
            |
          </span>
          <a
            href="https://www.daikincity.com/DaikinCityB2BTermsOfUse.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            B2B Account Terms
          </a>
        </nav>
      </footer>

      <InviteCustomersModal open={dashboardInviteOpen} onClose={() => setDashboardInviteOpen(false)} />
      <AddMemberModal open={dashboardAddMemberOpen} onClose={() => setDashboardAddMemberOpen(false)} />
      <SoldHomesModal
        open={soldHomesModalOpen}
        onClose={() => setSoldHomesModalOpen(false)}
        onViewInCustomerList={() => {
          setSoldHomesModalOpen(false)
          goToCurrentCustomersHub()
        }}
        onSelectCustomerName={(id) => {
          setSoldHomesModalOpen(false)
          goToCurrentCustomersHub()
          setCustomerDetailId(id)
        }}
      />
    </div>
  )
}
