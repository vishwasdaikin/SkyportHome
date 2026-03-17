import './VPPOnboardingFlow.css'

/**
 * Phase #1 On-boarding flow diagram: Identify → Initiate Authorization → Resolve Conflicts
 * Yellow = customer actions, Blue = system/Daikin actions, Green diamond = decision
 */
export function VPPOnboardingFlow() {
  return (
    <div className="vpp-onboarding-flow" role="img" aria-label="Phase 1 On-boarding flow: Identify customers and systems, initiate authorization, resolve conflicts">
      <h3 className="vpp-onboarding-flow-title">Phase #1: On-boarding — Flow diagram</h3>

      <div className="vpp-onboarding-flow-grid">
        {/* Group 1: Identify Customers / Sites / Systems */}
        <div className="vpp-flow-group vpp-flow-group-identify">
          <div className="vpp-flow-group-title">Identify Customers / Sites / Systems</div>
          <div className="vpp-flow-group-inner">
            <div className="vpp-flow-node vpp-flow-node-customer" title="Customer action">Create SkyportEnergy Account</div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-system">Create Site (physical address)</div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-system">Discover FIT Systems</div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-customer">Select FIT Systems to participate in VPP program</div>
            <span className="vpp-flow-arrow-h vpp-flow-arrow-to-auth" aria-hidden>→</span>
          </div>
        </div>

        {/* Group 2: Initiate Authorization Process */}
        <div className="vpp-flow-group vpp-flow-group-auth">
          <div className="vpp-flow-group-title">Initiate Authorization Process</div>
          <div className="vpp-flow-group-inner">
            <div className="vpp-flow-node vpp-flow-node-system">Check if FIT system is eligible to participate</div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-customer">Authorize participation in VPP</div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-decision">
              <span className="vpp-flow-diamond-label">Authorization</span>
              <div className="vpp-flow-decision-branches">
                <span className="vpp-flow-branch vpp-flow-branch-yes">Yes</span>
                <span className="vpp-flow-branch vpp-flow-branch-no">No</span>
              </div>
            </div>
          </div>
        </div>

        {/* Group 3: Resolve Authorization Conflicts */}
        <div className="vpp-flow-group vpp-flow-group-resolve">
          <div className="vpp-flow-group-title">Resolve Authorization Conflicts</div>
          <div className="vpp-flow-group-inner">
            <div className="vpp-flow-node vpp-flow-node-system">Diagnose root cause</div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-system">Recommend corrective action to Customer</div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-customer">Customer re-authorizes</div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-decision">
              <span className="vpp-flow-diamond-label">Authorization</span>
              <div className="vpp-flow-decision-branches">
                <span className="vpp-flow-branch vpp-flow-branch-yes">Yes</span>
                <span className="vpp-flow-branch vpp-flow-branch-no">No</span>
              </div>
            </div>
            <span className="vpp-flow-arrow-h" aria-hidden>→</span>
            <div className="vpp-flow-node vpp-flow-node-system vpp-flow-node-escalation">Escalated to customer support</div>
          </div>
        </div>
      </div>

      <div className="vpp-flow-legend">
        <span className="vpp-flow-legend-item"><span className="vpp-flow-legend-swatch vpp-flow-legend-customer" /> Customer</span>
        <span className="vpp-flow-legend-item"><span className="vpp-flow-legend-swatch vpp-flow-legend-system" /> System / Daikin</span>
        <span className="vpp-flow-legend-item"><span className="vpp-flow-legend-swatch vpp-flow-legend-decision" /> Decision</span>
        <span className="vpp-flow-legend-item"><span className="vpp-flow-legend-swatch vpp-flow-legend-yes" /> Yes</span>
        <span className="vpp-flow-legend-item"><span className="vpp-flow-legend-swatch vpp-flow-legend-no" /> No</span>
      </div>
    </div>
  )
}
