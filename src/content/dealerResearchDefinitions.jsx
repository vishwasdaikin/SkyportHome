/**
 * Dealer Analysis definitions — fact-based, aligned with Excel model (SkyportCare · Dealer Research).
 */
export function DealerResearchDefinitionsBody() {
  return (
    <div className="dealer-research-definitions-prose">
      <section className="dealer-research-definitions-section">
        <h3 className="dealer-research-definitions-h3">Program Participation</h3>
        <p className="dealer-research-definitions-lead">
          Indicates whether a dealer is enrolled in a specific manufacturer or certification program. Programs are not
          mutually exclusive; a dealer may participate in multiple programs. Percentages represent the share of the total
          dealer base participating in each program.
        </p>
        <ul className="dealer-research-definitions-list">
          <li>
            <strong>APlus</strong> — Indicates participation in the APlus certification program.
          </li>
          <li>
            <strong>Daikin Comfort Pro</strong> — Indicates participation in the Daikin Comfort Pro dealer program.
          </li>
          <li>
            <strong>Amana Advantage</strong> — Indicates participation in the Amana Advantage program.
          </li>
          <li>
            <strong>Private Label Plus</strong> — Indicates participation in a private-label aligned dealer program.
          </li>
          <li>
            <strong>Daikin Ductless Design Pro</strong> — Indicates certification or enrollment related to ductless /
            mini-split system design and installation.
          </li>
          <li>
            <strong>Daikin VRV Design Pro</strong> — Indicates certification related to VRV / commercial HVAC system
            design. Adoption is currently limited.
          </li>
        </ul>
      </section>

      <section className="dealer-research-definitions-section">
        <h3 className="dealer-research-definitions-h3">Service &amp; Revenue Model Indicators</h3>
        <p className="dealer-research-definitions-lead">
          Describes how dealers market and sell ongoing HVAC service—tune-ups, maintenance plans, and formal service
          agreements—and includes derived measures of how mature that service model appears from the data.
        </p>
        <ul className="dealer-research-definitions-list">
          <li>
            <strong>Tune-Ups Offered</strong> — Indicates whether the dealer explicitly markets or offers HVAC tune-ups
            or seasonal maintenance visits.
          </li>
          <li>
            <strong>Maintenance Plan Offered</strong> — Indicates whether the dealer offers a recurring maintenance plan
            (typically multi-visit per year), often bundled with inspections, priority service, or discounts.
          </li>
          <li>
            <strong>Service Agreement / ESA</strong> — Indicates whether the dealer offers a formal Service Agreement or
            Equipment Service Agreement (ESA), typically contract-based and recurring.
          </li>
          <li>
            <strong>Service Maturity Tier (Derived)</strong> — A qualitative indicator of the dealer’s service
            sophistication, <strong>inferred</strong> from maintenance plans, service agreements, billing cadence, and
            program structure. Typical tiers include Basic, Intermediate, and Advanced.
          </li>
        </ul>
      </section>

      <section className="dealer-research-definitions-section">
        <h3 className="dealer-research-definitions-h3">Membership &amp; Billing Structure</h3>
        <p className="dealer-research-definitions-lead">
          Covers customer membership or loyalty-style programs and the recurring billing pattern used for maintenance or
          membership; blank or missing values usually mean no visible recurring billing model.
        </p>
        <ul className="dealer-research-definitions-list">
          <li>
            <strong>Membership Offered</strong> — Indicates whether the dealer offers a customer membership or loyalty
            program beyond one-off service calls.
          </li>
          <li>
            <strong>Billing Cadence</strong> — The recurring billing frequency used for maintenance or membership
            programs (e.g., Monthly, Annual). Blank values indicate no visible recurring billing model.
          </li>
          <li>
            <strong>Membership Maturity (Derived)</strong> — A qualitative indicator reflecting how structured and
            monetized the dealer’s membership offering is, <strong>inferred</strong> from billing cadence and program
            complexity.
          </li>
        </ul>
      </section>

      <section className="dealer-research-definitions-section">
        <h3 className="dealer-research-definitions-h3">HVAC &amp; Adjacent Service Capabilities</h3>
        <p className="dealer-research-definitions-lead">
          Indicates which trades and specialties the dealer supports beyond—or alongside—core HVAC. Capabilities are not
          mutually exclusive; a dealer may report multiple areas.
        </p>
        <ul className="dealer-research-definitions-list">
          <li>
            <strong>HVAC (Includes Heat Pumps)</strong> — Indicates core HVAC service capability, inclusive of heat pump
            systems.
          </li>
          <li>
            <strong>Hot Water (Includes HPWH)</strong> — Indicates whether the dealer services hot water systems,
            including Heat Pump Water Heaters (HPWH).
          </li>
          <li>
            <strong>Ductless / Advanced HVAC</strong> — Indicates capability in ductless, mini-split, or advanced HVAC
            installations.
          </li>
          <li>
            <strong>Plumbing</strong> — Indicates whether the dealer provides plumbing services.
          </li>
          <li>
            <strong>IAQ (Indoor Air Quality)</strong> — Indicates focus on indoor air quality products or services, such
            as filtration, purification, or humidification.
          </li>
          <li>
            <strong>Electrical (Panel / Service)</strong> — Indicates electrical service capability, including panel
            upgrades or electrical infrastructure work.
          </li>
        </ul>
      </section>

      <section className="dealer-research-definitions-section">
        <h3 className="dealer-research-definitions-h3">Electrification &amp; Energy Transition</h3>
        <p className="dealer-research-definitions-lead">
          Captures stated involvement in electrification-related products and services (EV charging, solar, storage,
          efficiency) and includes derived indicators of how “ready” the dealer appears for broader home electrification
          work.
        </p>
        <ul className="dealer-research-definitions-list">
          <li>
            <strong>EV Charging</strong> — Indicates whether the dealer installs or services EV charging equipment.
          </li>
          <li>
            <strong>Energy Efficiency</strong> — Indicates emphasis on energy-efficient systems, upgrades, or advisory
            services.
          </li>
          <li>
            <strong>Solar</strong> — Indicates whether the dealer offers solar-related services.
          </li>
          <li>
            <strong>Battery</strong> — Indicates involvement in residential energy storage solutions.
          </li>
          <li>
            <strong>Electrification Ready (Derived)</strong> — A <strong>derived</strong> indicator identifying dealers
            with multiple enabling capabilities (e.g., HVAC plus electrical), suggesting readiness to participate in
            residential electrification projects.
          </li>
        </ul>
      </section>
    </div>
  )
}
