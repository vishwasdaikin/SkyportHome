import { createContext, useContext } from 'react'
import {
  getDigitalPlatformsForecastYearlyChartData,
  getDigitalPlatformsForecastCumulativeChartData,
  getDigitalPlatformsForecastFunnelColumnsForTable,
} from '../content/digitalPlatformsForecastFunnel'
import { buildDigitalPlatformsForecastFromGrid } from '../content/businessModelToForecastBridge'

/** Matches bundled / lifetime / one-year strokes used in FY26 SkyportCare charts. */
const LICENSE_COMPONENT_CUMULATIVE_LINE = {
  bundled: '#0284c7',
  lifetime: '#7c3aed',
  oneYear: '#c25621',
}

function createForecastMetrics(yearEndSnapshots, funnelForecastColumns) {
  const yearlyChartData = getDigitalPlatformsForecastYearlyChartData(yearEndSnapshots, funnelForecastColumns)
  const cumulativeChartData = getDigitalPlatformsForecastCumulativeChartData(yearEndSnapshots)
  const cumulativeChartLastIndex = Math.max(0, cumulativeChartData.length - 1)
  const funnelTableCols = getDigitalPlatformsForecastFunnelColumnsForTable(
    yearEndSnapshots,
    funnelForecastColumns,
  )
  const yearlyByPeriod = Object.fromEntries(yearlyChartData.map((r) => [r.period, r]))
  const usersCumulativeByPeriod = Object.fromEntries(
    cumulativeChartData.map((r) => [r.period, r.usersCumulative]),
  )
  const connectedCumulativeByPeriod = Object.fromEntries(
    cumulativeChartData.map((r) => [r.period, r.connectedCumulative]),
  )
  const thermostatsSoldCumulativeByPeriod = Object.fromEntries(
    cumulativeChartData.map((r) => [r.period, r.cumulative]),
  )
  function cumulativeConnectedPenetrationPct(periodId) {
    const sold = thermostatsSoldCumulativeByPeriod[periodId] ?? 0
    const conn = connectedCumulativeByPeriod[periodId] ?? 0
    if (!Number.isFinite(sold) || sold <= 0) return 0
    return (conn / sold) * 100
  }
  return {
    yearlyChartData,
    cumulativeChartData,
    cumulativeChartLastIndex,
    funnelTableCols,
    yearlyByPeriod,
    usersCumulativeByPeriod,
    connectedCumulativeByPeriod,
    thermostatsSoldCumulativeByPeriod,
    cumulativeConnectedPenetrationPct,
    licenseComponentCumulativeLine: LICENSE_COMPONENT_CUMULATIVE_LINE,
  }
}

export const FY26_STATIC_FORECAST_METRICS = createForecastMetrics()

export function tryCreateForecastMetricsFromBusinessModelGrid(grid) {
  const parsed = buildDigitalPlatformsForecastFromGrid(grid)
  if (!parsed) return null
  return createForecastMetrics(parsed.yearEndSnapshots, parsed.funnelForecastColumns)
}

export const Fy26ForecastMetricsContext = createContext(FY26_STATIC_FORECAST_METRICS)

export function useFy26ForecastMetrics() {
  return useContext(Fy26ForecastMetricsContext)
}
