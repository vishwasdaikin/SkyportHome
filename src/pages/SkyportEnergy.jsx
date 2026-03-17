import { VPPOnboardingFlow } from '../components/VPPOnboardingFlow'
import './SkyportEnergy.css'

const DEFINITION = `SkyportEnergy is the Daikin‑owned customer application used to onboard customers and enable participation in energy programs.`

const LEGEND = [
  { label: 'Customer', key: 'customer' },
  { label: 'Daikin', key: 'daikin' },
  { label: 'Leap', key: 'leap' },
  { label: 'Program', key: 'program' },
]

const PHASES = [
  {
    id: 1,
    name: 'On-boarding',
    goal: 'Establish a trusted system of record by identifying eligible systems, associating them to a Site, and granting customer access required for authorization, configuration, dispatch, and performance tracking.',
    steps: [
      'Create SkyportEnergy account',
      'Create Site (physical address)',
      'Discover FIT systems',
      'Select FIT systems to participate in VPP program',
      'Check if FIT system is eligible to participate',
      'Identify customers / sites / systems',
      'Authorize participation in VPP',
      'Initiate authorization process',
      'Resolve authorization conflicts (if any)',
      'Configure meters & nominations',
      'Submit program participation',
    ],
  },
  {
    id: 2,
    name: 'Configuration',
    goal: 'Enable SkyportEnergy to confirm that authorized FIT systems are correctly configured for participation in energy programs by resolving enrollment conflicts and validating program nominations and meter configurations prior to dispatch.',
    steps: [
      'Program enrollment confirmed',
      'Nominated program confirmed',
      'Utility meter config confirmed',
      'Resolve conflicts (if any)',
      'Dispatch ready status',
    ],
  },
  {
    id: 3,
    name: 'Dispatch',
    goal: 'Execute authorized demand response events by receiving dispatch instructions, signaling participating customers, and controlling enrolled FIT systems in accordance with approved program parameters including allocation of fleet‑level dispatch targets to individual FIT systems.',
    steps: [
      'Disaggregate dispatch target to FIT systems',
      'Customer dispatch notification',
      'Load curtailment of participating FIT systems',
      'Send fleet‑level dispatch',
      'Dispatch completion & restore pre‑dispatch state',
    ],
  },
  {
    id: 4,
    name: 'Analyze',
    goal: 'Evaluate dispatch execution and system performance to determine participation outcomes, verify compliance with program requirements, and support downstream settlement and reporting including evaluation of aggregated fleet‑level performance.',
    steps: [
      'Evaluate each FIT system dispatch response',
      'Met participation requirements? → Record validation results or record underperformance outcomes',
      'Attribute performance to systems & programs',
      'Flag for configuration or operational follow‑up (if needed)',
      'Aggregate fleet performance',
      'Receive performance results',
    ],
  },
  {
    id: 5,
    name: 'Get Paid',
    goal: 'Support settlement and payment processes by providing validated dispatch participation data to authorized program partners.',
    steps: [
      'Indicate settlement eligibility for each event',
      'Prepare settlement records per FIT system & event',
      'Receive acknowledgement & track settlement status',
      'Receive settlement data',
      'Communicate payment outcome to customers',
      'View payment information',
      'Perform settlement upstream',
    ],
  },
]

export default function SkyportEnergy() {
  return (
    <article className="skyport-energy-page">
      <header className="skyport-energy-header">
        <h1>SkyportEnergy</h1>
        <p className="skyport-energy-tagline">
          Home energy management and grid participation — HEMS, demand response, and VPP.
        </p>
      </header>

      <section className="skyport-energy-section skyport-energy-definition">
        <h2 className="skyport-energy-section-title">Definition</h2>
        <p className="skyport-energy-definition-text">{DEFINITION}</p>
      </section>

      <section className="skyport-energy-section skyport-energy-legend">
        <h2 className="skyport-energy-section-title">Legend</h2>
        <ul className="skyport-energy-legend-list" aria-label="Process stakeholders">
          {LEGEND.map(({ label, key }) => (
            <li key={key} className="skyport-energy-legend-item">
              {label}
            </li>
          ))}
        </ul>
      </section>

      <section className="skyport-energy-section skyport-energy-process">
        <h2 className="skyport-energy-section-title">VPP Process</h2>
        <p className="skyport-energy-section-desc">
          Five phases from onboarding through settlement.
        </p>
        <div className="skyport-energy-flow-diagram" role="img" aria-label="VPP process flow: On-boarding, Configuration, Dispatch, Analyze, Get Paid">
          {PHASES.map((phase, index) => (
            <span key={phase.id} className="skyport-energy-flow-wrap">
              <a href={`#phase-${phase.id}`} className="skyport-energy-flow-node">
                <span className="skyport-energy-flow-num">{phase.id}</span>
                <span className="skyport-energy-flow-name">{phase.name}</span>
              </a>
              {index < PHASES.length - 1 && (
                <span className="skyport-energy-flow-arrow" aria-hidden>→</span>
              )}
            </span>
          ))}
        </div>
        <VPPOnboardingFlow />
        <div className="skyport-energy-phases">
          {PHASES.map((phase) => (
            <div
              key={phase.id}
              className="skyport-energy-phase"
              id={`phase-${phase.id}`}
            >
              <h3 className="skyport-energy-phase-title">
                Phase #{phase.id}: {phase.name}
              </h3>
              <p className="skyport-energy-phase-goal">{phase.goal}</p>
              <ol className="skyport-energy-phase-steps">
                {phase.steps.map((step, i) => (
                  <li key={i} className="skyport-energy-step">{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
