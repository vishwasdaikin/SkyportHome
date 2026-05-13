import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const BAR_COLORS = [
  '#0097e0', '#0077b8', '#228b22', '#e67e22', '#6c5ce7',
  '#00b894', '#fd79a8', '#fdcb6e', '#636e72', '#b2bec3',
]

/**
 * @param {{ rows: { endUserCategory?: string }[] }} props
 */
export function FeaturesCategoryChart({ rows }) {
  const data = useMemo(() => {
    const byCategory = new Map()
    rows.forEach((row) => {
      const cat = row.endUserCategory || '—'
      byCategory.set(cat, (byCategory.get(cat) || 0) + 1)
    })
    const total = rows.length
    if (total === 0) return []
    return Array.from(byCategory.entries())
      .map(([category, count]) => ({
        name: category,
        category,
        count,
        pct: Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.pct - a.pct)
  }, [rows])

  if (data.length === 0) return null

  return (
    <div className="features-chart-wrap">
      <h3 className="features-chart-title">Features and Functions by End user category</h3>
      <p className="features-chart-subtitle">% of features</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 16, right: 24, left: 24, bottom: 16 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
          <XAxis type="number" domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 14 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={220}
            tick={{ fontSize: 14 }}
            axisLine={false}
            tickMargin={12}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, '% of features']}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="features-chart-tooltip">
                  <div className="features-chart-tooltip-label">{d.name}</div>
                  <div className="features-chart-tooltip-value">
                    {d.pct}% ({d.count} feature{d.count !== 1 ? 's' : ''})
                  </div>
                </div>
              )
            }}
          />
          <Bar dataKey="pct" name="% of features" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
