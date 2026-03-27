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
          <DataRow
            label="RA volume"
            values={['', '325,000', '400,000', '500,000', '700,000', '750,000']}
          />
          <DataRow
            label="Altherma volume"
            values={['', '700', '4,000', '11,500', '20,000', '25,000']}
          />
          <DataRow
            label="FY thermostats (all brands)"
            values={['', '240,000', '350,000', '500,000', '600,000', '700,000']}
          />
          <DataRow
            label="Total thermostats (all brands)"
            values={['610,064', '850,064', '1,200,064', '1,700,064', '2,300,064', '3,000,064']}
          />
          <DataRow
            label="FY Wi-Fi Connected Thermostats"
            values={['', '144,000', '227,500', '350,000', '450,000', '560,000']}
          />
          <DataRow
            label="% of FY Wi-Fi Connected Thermostats"
            values={['56%', '60%', '65%', '70%', '75%', '80%']}
          />
          <DataRow
            label="Total Wi-Fi Connected Thermostats"
            values={['341,000', '485,000', '712,500', '1,062,500', '1,512,500', '2,072,500']}
          />

          <SubHeadRow title="SkyportHome" pillar="skyport-home" />
          <DataRow
            label="Users (%) – FIT"
            values={['', '93%', '93%', '93%', '93%', '93%']}
          />
          <DataRow
            label="Users (%) – DENEB Wi‑Fi to SkyportHome Direct"
            values={['', '5%', '10%', '20%', '30%', '40%']}
          />
          <DataRow
            label="Users (%) – Altherma"
            values={['', '5%', '10%', '20%', '30%', '40%']}
          />
          <DataRow
            label="FIT users only for the FY"
            values={['', '133,920', '211,575', '325,500', '418,500', '520,800']}
          />
          <DataRow
            label="RA users"
            values={['', '16,250', '40,000', '100,000', '210,000', '300,000']}
          />
          <DataRow
            label="Altherma users"
            values={['', '35', '400', '2,300', '6,000', '10,000']}
          />
          <DataRow
            label="Total users"
            values={['317,130', '467,335', '719,310', '1,147,110', '1,781,610', '2,612,410']}
          />

          <SubHeadRow title="SkyportCare" pillar="skyport-care" />
          <DataRow
            label="Total dealers"
            values={['18,123', '', '', '', '', '']}
          />
          <DataRow
            label="Dealer participation"
            values={['1,978', '2,718', '3,625', '4,531', '5,437', '6,343']}
          />
          <DataRow
            label="Dealer participation (%)"
            values={['11%', '15%', '20%', '25%', '30%', '35%']}
          />
          <DataRow
            label="Bundled active licenses"
            values={['9,545', '28,040', '57,544', '126,182', '249,426', '470,233']}
            getCellClassName={() => 'fy26-skyport-license-cell--bundled'}
          />
          <DataRow
            label="1-year active licenses"
            values={['318', '2,804', '10,790', '28,678', '62,356', '130,621']}
            getCellClassName={() => 'fy26-skyport-license-cell--one-year'}
          />
          <DataRow
            label="Lifetime active licenses"
            values={['3,320', '6,543', '17,983', '40,149', '80,172', '182,869']}
            getCellClassName={() => 'fy26-skyport-license-cell--lifetime'}
          />
          <DataRow
            label="Active licenses"
            values={['13,183', '37,387', '86,317', '195,009', '391,954', '783,723']}
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
              '$168,241',
              '$647,379',
              '$1,720,665',
              '$3,741,381',
              '$7,837,230',
            ]}
          />
          <DataRow
            label="Lifetime active licenses ($)"
            values={[
              '',
              '$2,617,076',
              '$7,193,100',
              '$16,059,540',
              '$32,068,980',
              '$73,147,480',
            ]}
          />
          <DataRow
            label="Total ($)"
            values={[
              '',
              '$17,185,317',
              '$28,840,479',
              '$47,780,205',
              '$71,810,361',
              '$122,984,710',
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

          <tr className="fy26-bm-total-row">
            <th scope="row">Total revenue ($)</th>
            <td className="fy26-bm-num">—</td>
            <td className="fy26-bm-num">$17,215,317</td>
            <td className="fy26-bm-num">$28,960,479</td>
            <td className="fy26-bm-num">$48,260,205</td>
            <td className="fy26-bm-num">$73,730,361</td>
            <td className="fy26-bm-num">$130,664,710</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
