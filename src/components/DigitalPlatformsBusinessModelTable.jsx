import { DP_BUSINESS_MODEL_COLUMN_LABELS as COLS } from '../content/digitalPlatformsForecastFunnel'

function cell(v) {
  if (v === '' || v === null || v === undefined) return '—'
  return v
}

function SectionHeadRow({ title }) {
  return (
    <tr className="fy26-bm-section-head">
      <th colSpan={COLS.length + 1} scope="colgroup">
        {title}
      </th>
    </tr>
  )
}

function SubHeadRow({ title, pillar }) {
  return (
    <tr
      className={['fy26-bm-subhead', pillar ? `fy26-bm-subhead--${pillar}` : '']
        .filter(Boolean)
        .join(' ')}
    >
      <th colSpan={COLS.length + 1} scope="colgroup">
        {title}
      </th>
    </tr>
  )
}

function DataRow({ label, values, labelClass = '', getCellClassName }) {
  return (
    <tr>
      <th scope="row" className={labelClass}>
        {label}
      </th>
      {values.map((v, i) => {
        const extra = getCellClassName?.(i) ?? ''
        return (
          <td key={COLS[i]} className={['fy26-bm-num', extra].filter(Boolean).join(' ')}>
            {cell(v)}
          </td>
        )
      })}
    </tr>
  )
}

/**
 * Digital Platform horizon model: user/subscription growth and revenue (FY26–FY30).
 */
export function DigitalPlatformsBusinessModelTable() {
  return (
    <div className="fy26-business-model-scroll" tabIndex={0}>
      <table className="fy26-business-model-table">
        <caption className="fy26-bm-caption">
          User &amp; subscription growth and revenue projection (key assumptions as in model).
        </caption>
        <thead>
          <tr>
            <th scope="col" className="fy26-bm-corner">
              Row labels
            </th>
            {COLS.map((c) => (
              <th key={c} scope="col" className="fy26-bm-col-head">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SectionHeadRow title="User &amp; subscription growth" />
          <DataRow
            label="Total FIT volume"
            values={['', '240,000', '350,000', '500,000', '600,000', '700,000']}
          />
          <DataRow label="RA volume" values={['', '', '', '', '', '']} />
          <DataRow label="Altherma volume" values={['', '', '', '', '', '']} />
          <DataRow
            label="FY thermostats (all brands)"
            values={['', '240,000', '350,000', '500,000', '600,000', '700,000']}
          />
          <DataRow
            label="Total thermostats (all brands)"
            values={['610,064', '850,064', '1,200,064', '1,700,064', '2,300,064', '3,000,064']}
          />
          <DataRow
            label="FY connected thermostats"
            values={['', '144,000', '227,500', '350,000', '450,000', '560,000']}
          />
          <DataRow
            label="% of FY connected thermostats"
            values={['56%', '60%', '65%', '70%', '75%', '80%']}
          />
          <DataRow
            label="Total connected thermostats"
            values={['341,000', '485,000', '712,500', '1,062,500', '1,512,500', '2,072,500']}
          />

          <SubHeadRow title="SkyportHome" pillar="skyport-home" />
          <DataRow
            label="Users (%) – FIT"
            values={['', '60%', '65%', '70%', '75%', '80%']}
          />
          <DataRow label="Users (%) – RA" values={['', '5%', '10%', '20%', '30%', '40%']} />
          <DataRow
            label="Users (%) – Altherma"
            values={['', '5%', '10%', '20%', '30%', '40%']}
          />
          <DataRow
            label="Users only for the FY"
            values={['', '133,920', '211,575', '325,500', '418,500', '520,800']}
          />
          <DataRow
            label="Total users"
            values={['317,130', '451,050', '662,625', '988,125', '1,406,625', '1,927,425']}
          />

          <SubHeadRow title="SkyportCare" pillar="skyport-care" />
          <DataRow
            label="Bundled active licenses"
            values={['9,545', '27,063', '53,010', '108,694', '196,928', '346,937']}
            getCellClassName={() => 'fy26-skyport-license-cell--bundled'}
          />
          <DataRow
            label="1-year active licenses"
            values={['318', '2,706', '9,939', '24,703', '49,232', '96,371']}
            getCellClassName={() => 'fy26-skyport-license-cell--one-year'}
          />
          <DataRow
            label="Lifetime active licenses"
            values={['3,320', '6,315', '16,566', '34,584', '63,298', '134,920']}
            getCellClassName={() => 'fy26-skyport-license-cell--lifetime'}
          />
          <DataRow
            label="Active licenses"
            values={['13,183', '36,084', '79,515', '167,981', '309,458', '578,228']}
            labelClass="fy26-bm-emphasis"
          />
          <DataRow
            label="Active license penetration"
            values={['3.9%', '6%', '8%', '11%', '14%', '18%']}
          />
          <DataRow
            label="Paid annual license penetration"
            values={['0.1%', '0.6%', '1.5%', '2.5%', '3.5%', '5.0%']}
          />
          <DataRow
            label="Paid lifetime license penetration"
            values={['1.0%', '1.4%', '2.5%', '3.5%', '4.5%', '7.0%']}
          />

          <SectionHeadRow title="Revenue" />
          <SubHeadRow title="#1 SkyportCare license revenue" pillar="skyport-care" />
          <DataRow
            label="Annual license fee"
            values={['', '$60', '$60', '$60', '$60', '$60']}
          />
          <DataRow
            label="Lifetime license fee"
            values={['', '$400', '$400', '$400', '$400', '$400']}
          />
          <DataRow
            label="Bundled licenses ($)"
            values={['', '$14.4M', '$21.0M', '$30.0M', '$36.0M', '$42.0M']}
          />
          <DataRow
            label="1-year active licenses ($)"
            values={[
              '',
              '$162,378',
              '$596,363',
              '$1,482,188',
              '$2,953,913',
              '$5,782,275',
            ]}
          />
          <DataRow
            label="Lifetime active licenses ($)"
            values={[
              '',
              '$2,525,880',
              '$6,626,250',
              '$13,833,750',
              '$25,319,250',
              '$53,967,900',
            ]}
          />
          <DataRow
            label="Total ($)"
            values={[
              '',
              '$17,088,258',
              '$28,222,613',
              '$45,315,938',
              '$64,273,163',
              '$101,750,175',
            ]}
            labelClass="fy26-bm-emphasis"
          />

          <SubHeadRow title="#2 SkyportCare enterprise license revenue" pillar="skyport-care" />
          <DataRow
            label="Per-unit annual license fee"
            values={['', '$30', '$30', '$30', '$30', '$30']}
          />
          <DataRow
            label="No. of units per enterprise customer"
            values={['', '50', '50', '50', '50', '50']}
          />
          <DataRow
            label="No. of enterprise customers"
            values={['', '20', '80', '320', '1,280', '5,120']}
          />
          <DataRow
            label="Total ($)"
            values={['', '$30,000', '$120,000', '$480,000', '$1,920,000', '$7,680,000']}
          />

          <SubHeadRow title="#3 SkyportEnergy revenue" />
          <DataRow
            label="Homeowner enrollment %"
            values={['', '', '', '1.0%', '5.0%', '10.0%']}
          />
          <DataRow
            label="Homeowners enrolled"
            values={['', '', '', '9,881', '70,331', '192,743']}
          />
          <DataRow
            label="TOU revenue ($)"
            values={['', '', '', '$666,984', '$4,747,359', '$13,010,119']}
          />
          <DataRow
            label="VPP revenue ($)"
            values={['', '', '', '', '$4,219,875', '$11,564,550']}
          />
          <DataRow
            label="Complete ($)"
            values={['', '', '', '', '', '$130,293,930']}
          />
          <DataRow
            label="Total ($)"
            values={['', '$0', '$0', '$666,984', '$8,967,234', '$154,868,599']}
          />

          <tr className="fy26-bm-total-row">
            <th scope="row">Total revenue ($)</th>
            <td className="fy26-bm-num">—</td>
            <td className="fy26-bm-num">$17,118,258</td>
            <td className="fy26-bm-num">$28,342,613</td>
            <td className="fy26-bm-num">$46,462,922</td>
            <td className="fy26-bm-num">$75,160,397</td>
            <td className="fy26-bm-num">$264,298,774</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
