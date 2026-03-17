import { Link } from 'react-router-dom'
import { CloudConnectionsChart, CumulativeTrendChart } from './FY25Charts'
import './DigitalStrategy.css'
import './FY25.css'

const PDF_URL = '/downloads/FY25-Strategic-Marketing-Playbook.pdf'

export default function FY25() {
  return (
    <article className="fy25-page">
      <header className="ds-header">
        <h1>FY25 Playbook</h1>
        <p className="ds-tagline">Strategic Marketing FY25 Playbook (V5).</p>
        <a
          href={PDF_URL}
          download="FY25-Strategic-Marketing-Playbook.pdf"
          className="fy25-download"
        >
          Download PDF
        </a>
        <p className="fy25-back">
          <Link to="/strategy/operating/overview">← Operating Playbook</Link>
        </p>
      </header>
      <div className="ds-sections">
        <section className="ds-section ds-section-single">
          <h2 className="ds-section-title ds-section-title-single">Slide 1</h2>
          <div className="ds-content">
            <p className="ds-content-first">
              <strong>Strategic Marketing FY25 Playbook</strong>
            </p>
            <p>Overview and introduction from the first slide of the playbook. Replace this placeholder with the actual title and content from slide 1 of your PDF.</p>
          </div>
        </section>
        <section className="ds-section ds-section-single">
          <h2 className="ds-section-title ds-section-title-single">Strategic Marketing | Residential Controls — FY24 Results, FY25 Plan</h2>
          <div className="ds-content">
            <p className="ds-content-first"><strong>Summary</strong></p>
            <ul className="fy25-bullets">
              <li>Controls revenue contributed over $45M USD in FY24 with sales growth in all thermostats, despite headwinds that impacted FIT sales and associated controls [1]</li>
              <li>The majority of thermostats connected to the Daikin Cloud are Daikin brand, but Amana brand had significant growth in FY24, while Goodman brand has been impacted by thermostat form factor, and perceived value [2]</li>
              <li>Of the 320K thermostats sold to consumers approximately 56% of are connected to Wi‑Fi, and are paired to the homeowner app, but only 8% of homeowners using our app have active Cloud Services licenses [3]</li>
            </ul>
            <p><strong>FY24 Financial Results / FY25 Budget</strong></p>
            <div className="fy25-table-wrap">
              <table className="fy25-table">
                <thead>
                  <tr>
                    <th>Part Number</th>
                    <th>Description</th>
                    <th>ASP</th>
                    <th>FY24 Vol</th>
                    <th>FY24 Revenue</th>
                    <th>FY25 Vol</th>
                    <th>FY25 Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>DTST-CWBSA-NI-A</td><td>One+</td><td>$329</td><td>18,126</td><td>$6,106,321</td><td>27,821</td><td>$9,147,422</td></tr>
                  <tr><td>DTST-TOU-A</td><td>Touch</td><td>$310</td><td>60,677</td><td>$19,616,183</td><td>111,279</td><td>$34,486,443</td></tr>
                  <tr><td>DTST-LTE-LA-A</td><td>One Lite</td><td>$201</td><td>9,390</td><td>$1,829,259</td><td>8,959</td><td>$1,800,120</td></tr>
                  <tr><td>DSEN-TH-BWS-A</td><td>RHT Sensor</td><td>$71</td><td>0</td><td>$0</td><td>1,339</td><td>$95,069</td></tr>
                  <tr><td>DAPT-ONE-VMS</td><td>Adaptor</td><td>$86</td><td>0</td><td>$0</td><td>18,421</td><td>$1,584,206</td></tr>
                  <tr><td>ATST-CWE-BL-A</td><td>Amana Stat</td><td>$262</td><td>36,045</td><td>$11,648,056</td><td>65,400</td><td>$17,110,744</td></tr>
                  <tr><td>GTST-CW-WH-A</td><td>Goodman</td><td>$95</td><td>12,402</td><td>$1,424,174</td><td>45,500</td><td>$4,310,376</td></tr>
                  <tr><td>DTST-ONE-ADA-A</td><td>One+ Bundle</td><td>$417</td><td>4,279</td><td>$1,784,090</td><td>0</td><td>$0</td></tr>
                  <tr><td>DTST-TOU-ADA-A</td><td>Touch Bundle</td><td>$378</td><td>5,587</td><td>$2,112,377</td><td>0</td><td>$0</td></tr>
                  <tr className="fy25-total"><td colSpan="3">Grand Total</td><td>146,506</td><td>$44,520,460</td><td>278,719</td><td>$68,534,380</td></tr>
                </tbody>
              </table>
            </div>
            <p className="fy25-note">Simplified Product Offering reduces two duplicative SKUs in FY25: DTST-ONE-ADA-A, DTST-TOU-ADA-A.</p>
          </div>
          <CloudConnectionsChart />
          <CumulativeTrendChart />
        </section>
        <section className="ds-section ds-section-single">
          <h2 className="ds-section-title ds-section-title-single">Strategic Marketing | Residential Controls — Hardware Initiatives</h2>
          <figure className="fy25-slide-image">
            <img src="/images/fy25-hardware-initiatives-slide.png" alt="Hardware Initiatives slide: summary, SKU simplification, dial, 24V thermostat, RHT, zoning, BACnet." />
          </figure>
          <div className="ds-content">
            <p className="ds-content-first"><strong>Summary</strong></p>
            <ul className="fy25-bullets">
              <li>Simplify product selection and streamline internal processes by reducing SKUs and the complexity of inventory management [1]</li>
              <li>Support FIT sales goals by addressing customer VOC on the Daikin ONE+ (analog wheel not responsive enough) with a new, more responsive wheel design that provides tactile and audio feedback [2]</li>
              <li>Launch new 24V cloud‑connected thermostat to support Altherma launch and help dealers convert legacy systems to FIT by leveraging performance data on existing 24V vs. FIT [3]</li>
              <li>Support FIT sales goals with the launch of new E‑Premium accessories including Wireless RHT Sensors [4] and a best‑in‑class ducted wireless zoning solution [5], to expand applications where FIT can be applied.</li>
              <li>Support FIT sales expansion in commercial applications by introducing BACnet integration, addressing a key Rep pain point since 2019 that has prevented full project activity with FIT. [6]</li>
            </ul>

            <div className="fy25-initiative">
              <h3 className="fy25-initiative-title">[1] SKU reduction / simplification (FY24 Carryover)</h3>
              <ul className="fy25-bullets">
                <li>Eliminate bundled stat + communication protocol adapter SKUs to reduce the overall number of Daikin One and Touch thermostats needed on hand.</li>
                <li>Implementation delayed due to inventory positions and requirement to rework SKUs.</li>
              </ul>
              <p><strong>Target Turnover Date:</strong> June ’25</p>
              <p className="fy25-pic">PIC: Cahill</p>
            </div>

            <div className="fy25-initiative">
              <h3 className="fy25-initiative-title">[2] Updated rotary encoder (Dial) for Daikin ONE+</h3>
              <ul className="fy25-bullets">
                <li>The responsiveness of the Daikin ONE+ dial has been a long‑standing pain point for dealers and homeowners.</li>
                <li>Introducing a new dial (rotary encoder) with mechanical rather than magnetic movements to address VOC that the dial is not responsive enough; provides tactile and audio feedback.</li>
              </ul>
              <figure className="fy25-initiative-fig">
                <img src="/images/fy25-dial-encoder.png" alt="Daikin ONE+ thermostat with updated rotary encoder (dial) showing temperature 72 and new tactile dial design." />
              </figure>
              <p><strong>Target Date:</strong> June ’25</p>
              <p className="fy25-pic">PIC: Cahill</p>
            </div>

            <div className="fy25-initiative">
              <h3 className="fy25-initiative-title">[3] Cloud Connected 24V Thermostat</h3>
              <ul className="fy25-bullets">
                <li>Launch Daikin‑branded 24V control for Altherma (zone controller).</li>
                <li>Enable unified homeowner and dealer experiences on digital platforms when accessing cloud‑connected equipment.</li>
                <li>Support FIT expansion with a low‑cost 24V control for installation on any (including competitors’) 24V legacy systems.</li>
                <li>Connection to Daikin cloud allows cloud algorithms to identify systems approaching EOL and/or inefficient operation; leads passed to Daikin dealers for FIT replacement sales.</li>
                <li>FY24 launch delayed due to resource constraints from accelerated R32 launch schedule.</li>
              </ul>
              <p><strong>Launch Date:</strong> September ’25</p>
              <p className="fy25-pic">PIC: Baer</p>
            </div>

            <div className="fy25-initiative">
              <h3 className="fy25-initiative-title">[4] RHT launch (FY24 Carryover)</h3>
              <ul className="fy25-bullets">
                <li>Support FIT by expanding applications and comfort delivered in non‑zoned homes.</li>
                <li>Daikin One+ and up to four RHT sensors can be paired together.</li>
                <li>Required for zoning launch; supports sales of flagship Daikin One+ thermostat.</li>
                <li>FY24 launch delayed due to issues discovered in field testing and Venstar priorities.</li>
              </ul>
              <figure className="fy25-initiative-fig">
                <img src="/images/fy25-rht-remote-sensors.png" alt="Remote sensors UI: wall-mounted sensor and app screen showing paired sensors (Master, Office) with temperature and humidity." />
              </figure>
              <p><strong>Launch Date:</strong> June ’25</p>
              <p className="fy25-pic">PIC: Cahill</p>
            </div>

            <div className="fy25-initiative">
              <h3 className="fy25-initiative-title">[5] Zoning (FY24 Carryover)</h3>
              <ul className="fy25-bullets">
                <li>Support FIT by expanding applications with best‑in‑class wireless zoning solution.</li>
                <li>Expand E‑Premium line‑up with fully communicating zoning solution for precise comfort throughout ducted homes.</li>
              </ul>
              <p><strong>Launch Date:</strong> December ’25</p>
              <div className="fy25-table-wrap">
                <table className="fy25-table">
                  <thead>
                    <tr><th>Revenue Goal</th><th>FY25</th><th>FY26</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>D1+ revenue</td><td>$3,398,535</td><td>$5,252,924</td></tr>
                    <tr><td>Zone Panel Revenue</td><td>$4,097,912</td><td>$6,333,912</td></tr>
                    <tr><td>Damper Revenue</td><td>$2,367,682</td><td>$3,659,594</td></tr>
                    <tr><td>Simple Zone Controller</td><td>$648,850</td><td>$4,011,470</td></tr>
                    <tr><td>RHT Sensor</td><td>$68,295</td><td>$422,280</td></tr>
                    <tr className="fy25-total"><td>Total Revenue</td><td>$10,581,273</td><td>$19,680,180</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="fy25-pic">PIC: Cahill</p>
            </div>

            <div className="fy25-initiative">
              <h3 className="fy25-initiative-title">[6] BACnet interoperability to FIT portfolio</h3>
              <ul className="fy25-bullets">
                <li>Support FIT sales expansion in applied channel into larger Multi‑Family / Multi‑Tenant applications that require BACnet integration.</li>
                <li>Support FIT sales expansion beyond MF/MT into assisted living, healthcare, retail, office space, etc., where centralized BMS control is required.</li>
                <li>Enable BMS systems to access and control FIT systems via MS/TP protocol.</li>
                <li>Hardware accessory added to installed system.</li>
              </ul>
              <p><strong>Launch Date:</strong> FY26</p>
              <p className="fy25-pic">PIC: Baer</p>
            </div>
          </div>
        </section>
      </div>
    </article>
  )
}
