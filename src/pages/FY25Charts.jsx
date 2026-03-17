import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts'

const CLOUD_BY_BRAND = [
  { name: 'Daikin One+', connections: 126180, fill: '#0097e0' },
  { name: 'Daikin Touch', connections: 100910, fill: '#0097e0' },
  { name: 'Daikin Lite', connections: 684, fill: '#0097e0' },
  { name: 'Amana', connections: 35066, fill: '#c0392b' },
  { name: 'Goodman', connections: 5279, fill: '#231f20' },
]

// Approximate cumulative quarterly data Q1 2020 – Q4 2024 (from slide description)
const CUMULATIVE_DATA = [
  { quarter: 'Q1 20', sellThru: 12000, connected: 6000, cloudServices: 800 },
  { quarter: 'Q2 20', sellThru: 26000, connected: 14000, cloudServices: 1600 },
  { quarter: 'Q3 20', sellThru: 42000, connected: 23000, cloudServices: 2500 },
  { quarter: 'Q4 20', sellThru: 58000, connected: 32000, cloudServices: 3400 },
  { quarter: 'Q1 21', sellThru: 75000, connected: 42000, cloudServices: 4400 },
  { quarter: 'Q2 21', sellThru: 95000, connected: 54000, cloudServices: 5600 },
  { quarter: 'Q3 21', sellThru: 115000, connected: 66000, cloudServices: 6800 },
  { quarter: 'Q4 21', sellThru: 138000, connected: 80000, cloudServices: 8200 },
  { quarter: 'Q1 22', sellThru: 162000, connected: 94000, cloudServices: 9600 },
  { quarter: 'Q2 22', sellThru: 186000, connected: 108000, cloudServices: 11000 },
  { quarter: 'Q3 22', sellThru: 210000, connected: 122000, cloudServices: 12400 },
  { quarter: 'Q4 22', sellThru: 232000, connected: 132000, cloudServices: 13500 },
  { quarter: 'Q1 23', sellThru: 252000, connected: 142000, cloudServices: 14600 },
  { quarter: 'Q2 23', sellThru: 268000, connected: 150000, cloudServices: 15500 },
  { quarter: 'Q3 23', sellThru: 282000, connected: 158000, cloudServices: 16400 },
  { quarter: 'Q4 23', sellThru: 292000, connected: 163000, cloudServices: 17200 },
  { quarter: 'Q1 24', sellThru: 298000, connected: 166000, cloudServices: 18200 },
  { quarter: 'Q2 24', sellThru: 302000, connected: 168000, cloudServices: 19000 },
  { quarter: 'Q3 24', sellThru: 304000, connected: 169000, cloudServices: 19500 },
  { quarter: 'Q4 24', sellThru: 305000, connected: 170000, cloudServices: 20000 },
]

export function CloudConnectionsChart() {
  return (
    <div className="fy25-chart-wrap">
      <h3 className="fy25-chart-title">Thermostats Connected to Daikin Cloud</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={CLOUD_BY_BRAND} margin={{ top: 16, right: 16, left: 16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <Tooltip formatter={(v) => v.toLocaleString()} />
          <Bar dataKey="connections" name="Connections" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CumulativeTrendChart() {
  return (
    <div className="fy25-chart-wrap">
      <h3 className="fy25-chart-title">Thermostat Sell Thru, Connectivity &amp; Cloud Services — Cumulative All-Time</h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={CUMULATIVE_DATA} margin={{ top: 16, right: 16, left: 16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <Tooltip formatter={(v) => v.toLocaleString()} />
          <Legend />
          <Line type="monotone" dataKey="sellThru" name="Thermostat Sell Thru" stroke="#0097e0" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="connected" name="Connected to Cloud & App" stroke="#e67e22" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="cloudServices" name="Active Cloud Services" stroke="#27ae60" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
