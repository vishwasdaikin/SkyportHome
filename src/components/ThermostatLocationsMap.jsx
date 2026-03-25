import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useId,
  createContext,
  useContext,
} from 'react'
import { createPortal } from 'react-dom'
import { geoCentroid } from 'd3-geo'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  useMapContext,
} from 'react-simple-maps'
import { aggregateThermostatLocations, geoUsNameToAbbrev } from '../utils/thermostatLocationAggregate'
import { getCanadaProvinceCount, canadaGeoNameToAbbrev } from '../utils/canadaMapUtils'

const US_STATES_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

/** Match alternate labels from topojson to our aggregated keys */
const GEO_NAME_ALIASES = {
  'u.s. virgin islands': 'United States Virgin Islands',
  'us virgin islands': 'United States Virgin Islands',
}

function buildGeoCountLookup(usCountByStateName) {
  return (geoName) => {
    if (!geoName) return 0
    const direct = usCountByStateName[geoName]
    if (direct != null) return direct
    const aliasTarget = GEO_NAME_ALIASES[geoName.toLowerCase()]
    if (aliasTarget != null && usCountByStateName[aliasTarget] != null) {
      return usCountByStateName[aliasTarget]
    }
    const lower = geoName.toLowerCase()
    for (const [k, v] of Object.entries(usCountByStateName)) {
      if (k.toLowerCase() === lower) return v
    }
    return 0
  }
}

/** Choropleth: light blue → deep blue (main map) */
const MAP_BLUE_EMPTY = '#e8eef5'
const MAP_BLUE_LOW = 'hsl(210, 58%, 88%)'
const MAP_BLUE_HIGH = 'hsl(220, 56%, 26%)'

function choroplethFill(count, minPos, maxPos) {
  if (count <= 0) return MAP_BLUE_EMPTY
  if (maxPos <= 0 || minPos > maxPos) return MAP_BLUE_LOW
  if (minPos === maxPos) return MAP_BLUE_HIGH
  const t = (count - minPos) / (maxPos - minPos)
  const h = 204 + t * 20
  const s = 52 + t * 28
  const l = 88 - t * 58
  return `hsl(${h}, ${s}%, ${l}%)`
}

function dataBaseUrl() {
  const base = import.meta.env.BASE_URL || '/'
  return base.endsWith('/') ? base : `${base}/`
}

function csvUrl() {
  return `${dataBaseUrl()}data/locations-per-state.csv`
}

/** Effective zoom for on-map labels when zoom/pan is disabled (static maps). */
const MAP_LABEL_ZOOM_STATIC = 2.35

/** In-map labels (Google Maps–style): sized using zoom factor */
const LABEL_ZOOM_MIN = 1.12
const LABEL_FULL_NAME_ZOOM = 2.35

/**
 * @param {number} zoomK - d3 zoom scale k from ZoomableGroup
 * @param {boolean} useFullName
 */
function mapLabelFontSize(zoomK, useFullName) {
  const base = useFullName ? 5.5 : 5
  const cap = useFullName ? 15 : 10.5
  return Math.max(useFullName ? 7 : 6, Math.min(cap, base + zoomK * 1.05))
}

function mapLabelOpacity(zoomK) {
  if (zoomK < LABEL_ZOOM_MIN) return 0
  return Math.min(1, (zoomK - LABEL_ZOOM_MIN) / 0.75)
}

/**
 * On-map place name at geographic centroid; scales and switches abbrev → full name with zoom.
 */
function ZoomPlaceLabel({ feature, zoomK, abbrev, fullName }) {
  if (zoomK < LABEL_ZOOM_MIN || !fullName) return null
  let coords
  try {
    coords = geoCentroid(feature)
  } catch {
    return null
  }
  const [lng, lat] = coords
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  const useFull = zoomK >= LABEL_FULL_NAME_ZOOM
  const text = useFull ? fullName : abbrev || fullName
  const opacity = mapLabelOpacity(zoomK)
  if (opacity <= 0) return null

  const fontSize = mapLabelFontSize(zoomK, useFull)

  return (
    <SafeMapMarker coordinates={[lng, lat]}>
      <text
        textAnchor="middle"
        dominantBaseline="central"
        style={{ pointerEvents: 'none' }}
        fill="#0f172a"
        stroke="rgba(255,255,255,0.88)"
        strokeWidth={0.45}
        paintOrder="stroke"
        fontSize={fontSize}
        fontWeight={700}
        opacity={opacity}
      >
        {text}
      </text>
    </SafeMapMarker>
  )
}

/**
 * Marker calls projection(coords) and destructures [x,y]. d3 returns null for points outside the clip.
 * Skip those to avoid "Invalid attempt to destructure non-iterable instance".
 */
function SafeMapMarker({ coordinates, children, ...rest }) {
  const { projection } = useMapContext()
  const lng = coordinates?.[0]
  const lat = coordinates?.[1]
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
  let projected
  try {
    projected = projection([lng, lat])
  } catch {
    return null
  }
  if (
    projected == null ||
    !Array.isArray(projected) ||
    projected.length < 2 ||
    !Number.isFinite(projected[0]) ||
    !Number.isFinite(projected[1])
  ) {
    return null
  }
  return (
    <Marker coordinates={[lng, lat]} {...rest} style={{ pointerEvents: 'none' }}>
      {children}
    </Marker>
  )
}

/**
 * Portals to document.body so `position: fixed` uses the viewport.
 * Any ancestor with CSS `transform` (layouts, animations) otherwise makes fixed
 * tooltips align to the wrong box — they look “far from” the cursor.
 */
function MapHoverTooltip({ x, y, className, children }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      className={`fy25-thermostat-locations-map__tooltip${className ? ` ${className}` : ''}`}
      style={{ left: x + 12, top: y + 12 }}
      role="tooltip"
    >
      {children}
    </div>,
    document.body,
  )
}

function ThermostatLocationsMapModalShell({ titleId, onClose, children }) {
  return (
    <div
      className="fy25-thermostat-locations-map-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="fy25-thermostat-locations-map-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fy25-thermostat-locations-map-modal__header">
          <h2 id={titleId} className="fy25-thermostat-locations-map-modal__title">
            Thermostat locations map
          </h2>
          <button
            type="button"
            className="fy25-thermostat-locations-map-modal__close"
            onClick={onClose}
            aria-label="Close map"
          >
            ✕
          </button>
        </div>
        <div className="fy25-thermostat-locations-map-modal__body">{children}</div>
      </div>
    </div>
  )
}

/**
 * Interactive choropleth (blue scale). Used inside the modal; `hidePlaceLabels` keeps the view colors-only.
 * @param {{ aggregate: object, hidePlaceLabels?: boolean }} props
 */
function ThermostatLocationsMapInner({ aggregate, hidePlaceLabels = false }) {
  const tabBaseId = useId()
  const usTabId = `${tabBaseId}-us-tab`
  const caTabId = `${tabBaseId}-ca-tab`
  const usPanelId = `${tabBaseId}-us-panel`
  const caPanelId = `${tabBaseId}-ca-panel`

  /** @type {'US' | 'CA'} */
  const [regionTab, setRegionTab] = useState('US')

  const getCount = useMemo(
    () => (aggregate ? buildGeoCountLookup(aggregate.usCountByStateName) : () => 0),
    [aggregate],
  )

  const { chromaMin, chromaMax } = useMemo(() => {
    if (!aggregate) return { chromaMin: 0, chromaMax: 0 }
    const vals = Object.values(aggregate.usCountByStateName).filter((n) => n > 0)
    if (!vals.length) return { chromaMin: 0, chromaMax: 0 }
    return { chromaMin: Math.min(...vals), chromaMax: Math.max(...vals) }
  }, [aggregate])

  const hasCanadaData = useMemo(() => {
    if (!aggregate) return false
    return Object.values(aggregate.caCountByAbb).some((c) => c > 0)
  }, [aggregate])

  const { caChromaMin, caChromaMax } = useMemo(() => {
    if (!aggregate) return { caChromaMin: 0, caChromaMax: 0 }
    const vals = Object.values(aggregate.caCountByAbb).filter((n) => n > 0)
    if (!vals.length) return { caChromaMin: 0, caChromaMax: 0 }
    return { caChromaMin: Math.min(...vals), caChromaMax: Math.max(...vals) }
  }, [aggregate])

  const [hover, setHover] = useState(null)
  const [caHover, setCaHover] = useState(null)

  useEffect(() => {
    if (!hasCanadaData && regionTab === 'CA') setRegionTab('US')
  }, [hasCanadaData, regionTab])

  useEffect(() => {
    setHover(null)
    setCaHover(null)
  }, [regionTab])

  const onTabListKeyDown = useCallback(
    (e) => {
      if (!hasCanadaData) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setRegionTab((t) => (t === 'US' ? 'CA' : 'US'))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setRegionTab((t) => (t === 'CA' ? 'US' : 'CA'))
      }
    },
    [hasCanadaData],
  )
  const onLeaveMap = useCallback(() => {
    setHover(null)
  }, [])

  return (
    <div className="fy25-thermostat-locations-map fy25-thermostat-locations-map--modal-inner">
      <div className="fy25-thermostat-locations-map__tabs">
        {hasCanadaData && (
          <div
            className="fy25-thermostat-locations-map__tablist"
            role="tablist"
            aria-label="Thermostat locations by region"
            onKeyDown={onTabListKeyDown}
          >
            <button
              type="button"
              id={usTabId}
              role="tab"
              aria-selected={regionTab === 'US'}
              aria-controls={usPanelId}
              tabIndex={regionTab === 'US' ? 0 : -1}
              className={`fy25-thermostat-locations-map__tab${regionTab === 'US' ? ' fy25-thermostat-locations-map__tab--active' : ''}`}
              onClick={() => setRegionTab('US')}
            >
              United States
            </button>
            <button
              type="button"
              id={caTabId}
              role="tab"
              aria-selected={regionTab === 'CA'}
              aria-controls={caPanelId}
              tabIndex={regionTab === 'CA' ? 0 : -1}
              className={`fy25-thermostat-locations-map__tab${regionTab === 'CA' ? ' fy25-thermostat-locations-map__tab--active' : ''}`}
              onClick={() => setRegionTab('CA')}
            >
              Canada
            </button>
          </div>
        )}

        <div
          id={usPanelId}
          role="tabpanel"
          aria-label={hasCanadaData ? undefined : 'United States thermostat map'}
          aria-labelledby={hasCanadaData ? usTabId : undefined}
          hidden={hasCanadaData ? regionTab !== 'US' : false}
          className="fy25-thermostat-locations-map__panel"
        >
          <div className="fy25-thermostat-locations-map__us" onMouseLeave={onLeaveMap}>
            <div className="fy25-thermostat-locations-map__svg-wrap">
              <ComposableMap
                projection="geoAlbersUsa"
                projectionConfig={{ scale: 1000 }}
                width={800}
                height={480}
                className="fy25-thermostat-locations-map__svg"
              >
                <Geographies geography={US_STATES_TOPO_URL}>
                  {({ geographies }) => (
                    <>
                      {geographies.map((geo) => {
                        const name = geo.properties?.name ?? ''
                        const count = getCount(name)
                        const fill = choroplethFill(count, chromaMin, chromaMax)
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            tabIndex={-1}
                            style={{
                              default: {
                                fill,
                                stroke: '#fff',
                                strokeWidth: 0.5,
                                outline: 'none',
                                cursor: 'default',
                              },
                              hover: {
                                fill: count > 0 ? 'hsl(214, 72%, 42%)' : '#cbd5e1',
                                stroke: '#1e3a5f',
                                strokeWidth: 0.75,
                                outline: 'none',
                                cursor: 'default',
                              },
                              pressed: { fill, outline: 'none', cursor: 'default' },
                            }}
                            onMouseEnter={(e) => {
                              setHover({
                                x: e.clientX,
                                y: e.clientY,
                                name,
                                count,
                              })
                            }}
                            onMouseMove={(e) => {
                              setHover((h) =>
                                h
                                  ? { ...h, x: e.clientX, y: e.clientY, count }
                                  : { x: e.clientX, y: e.clientY, name, count },
                              )
                            }}
                          />
                        )
                      })}
                      {!hidePlaceLabels &&
                        geographies.map((geo) => {
                          const name = geo.properties?.name ?? ''
                          const abb = geoUsNameToAbbrev(name)
                          return (
                            <ZoomPlaceLabel
                              key={`us-lbl-${geo.rsmKey}`}
                              feature={geo}
                              zoomK={MAP_LABEL_ZOOM_STATIC}
                              abbrev={abb}
                              fullName={name}
                            />
                          )
                        })}
                    </>
                  )}
                </Geographies>
              </ComposableMap>
            </div>

            {regionTab === 'US' && hover && (
              <MapHoverTooltip x={hover.x} y={hover.y} className="fy25-thermostat-locations-map__tooltip--state">
                <strong>{hover.name || 'Unknown'}</strong>
                <div className="fy25-thermostat-locations-map__tooltip-count">
                  {Number(hover.count ?? 0).toLocaleString()} locations
                </div>
              </MapHoverTooltip>
            )}

            <div
              className="fy25-thermostat-locations-map__legend"
              role="group"
              aria-label={
                chromaMax > 0
                  ? `Thermostat count color scale from ${chromaMin.toLocaleString()} to ${chromaMax.toLocaleString()} locations`
                  : 'Thermostat count map legend'
              }
            >
              <div className="fy25-thermostat-locations-map__legend-title">Thermostat locations (color scale)</div>
              <div className="fy25-thermostat-locations-map__legend-scale">
                <span className="fy25-thermostat-locations-map__legend-bound">
                  {chromaMax > 0 ? chromaMin.toLocaleString() : '—'}
                </span>
                <div
                  className="fy25-thermostat-locations-map__legend-gradient"
                  style={{
                    background: `linear-gradient(90deg, ${MAP_BLUE_LOW}, ${MAP_BLUE_HIGH})`,
                  }}
                />
                <span className="fy25-thermostat-locations-map__legend-bound">
                  {chromaMax > 0 ? chromaMax.toLocaleString() : '—'}
                </span>
              </div>
              <div className="fy25-thermostat-locations-map__legend-caption">
                <span className="fy25-thermostat-locations-map__legend-caption-part">
                  <span className="fy25-thermostat-locations-map__legend-swatch fy25-thermostat-locations-map__legend-swatch--low" />
                  Lower count
                </span>
                <span className="fy25-thermostat-locations-map__legend-arrow" aria-hidden="true">
                  →
                </span>
                <span className="fy25-thermostat-locations-map__legend-caption-part">
                  <span className="fy25-thermostat-locations-map__legend-swatch fy25-thermostat-locations-map__legend-swatch--high" />
                  Higher count
                </span>
              </div>
            </div>
          </div>
        </div>

        {hasCanadaData && (
          <div
            id={caPanelId}
            role="tabpanel"
            aria-labelledby={caTabId}
            hidden={regionTab !== 'CA'}
            className="fy25-thermostat-locations-map__panel fy25-thermostat-locations-map__panel--canada"
          >
            <div className="fy25-thermostat-locations-map__canada">
              <h6 className="fy25-thermostat-locations-map__canada-title">Canada</h6>
              <p className="fy25-thermostat-locations-map__canada-subtitle fy25-thermostat-locations-map__canada-subtitle--tab">
                Provinces and territories (same blue scale as the U.S. map — darker = more locations).
              </p>
              <div
                className="fy25-thermostat-locations-map__canada-map"
                onMouseLeave={() => {
                  setCaHover(null)
                }}
              >
                <div className="fy25-thermostat-locations-map__canada-svg-wrap fy25-thermostat-locations-map__svg-wrap">
                  <ComposableMap
                    projection="geoAlbers"
                    projectionConfig={{
                      rotate: [96, 0, 0],
                      parallels: [50, 70],
                      scale: 680,
                      center: [0, 58],
                    }}
                    width={760}
                    height={520}
                    className="fy25-thermostat-locations-map__canada-svg"
                  >
                    <Geographies geography={`${dataBaseUrl()}data/canada-provinces.geojson`}>
                      {({ geographies }) => (
                        <>
                          {geographies.map((geo) => {
                            const geoName = geo.properties?.name ?? ''
                            const count = getCanadaProvinceCount(geoName, aggregate.caCountByAbb)
                            const fill = choroplethFill(count, caChromaMin, caChromaMax)
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                tabIndex={-1}
                                style={{
                                  default: {
                                    fill,
                                    stroke: '#fff',
                                    strokeWidth: 0.6,
                                    outline: 'none',
                                    cursor: 'default',
                                  },
                                  hover: {
                                    fill: count > 0 ? 'hsl(154, 78%, 32%)' : '#cbd5e1',
                                    stroke: '#14532d',
                                    strokeWidth: 0.85,
                                    outline: 'none',
                                    cursor: 'default',
                                  },
                                  pressed: { fill, outline: 'none', cursor: 'default' },
                                }}
                                onMouseEnter={(e) => {
                                  setCaHover({
                                    x: e.clientX,
                                    y: e.clientY,
                                    name: geoName,
                                    count,
                                  })
                                }}
                                onMouseMove={(e) => {
                                  setCaHover((h) =>
                                    h
                                      ? { ...h, x: e.clientX, y: e.clientY, count }
                                      : { x: e.clientX, y: e.clientY, name: geoName, count },
                                  )
                                }}
                              />
                            )
                          })}
                          {!hidePlaceLabels &&
                            geographies.map((geo) => {
                              const geoName = geo.properties?.name ?? ''
                              const abb = canadaGeoNameToAbbrev(geoName)
                              return (
                                <ZoomPlaceLabel
                                  key={`ca-lbl-${geo.rsmKey}`}
                                  feature={geo}
                                  zoomK={MAP_LABEL_ZOOM_STATIC}
                                  abbrev={abb}
                                  fullName={geoName}
                                />
                              )
                            })}
                        </>
                      )}
                    </Geographies>
                  </ComposableMap>
                </div>

                {regionTab === 'CA' && caHover && (
                  <MapHoverTooltip x={caHover.x} y={caHover.y} className="fy25-thermostat-locations-map__tooltip--state">
                    <strong>{caHover.name || 'Unknown'}</strong>
                    <div className="fy25-thermostat-locations-map__tooltip-count">
                      {Number(caHover.count ?? 0).toLocaleString()} locations
                    </div>
                  </MapHoverTooltip>
                )}

                <div
                  className="fy25-thermostat-locations-map__legend"
                  role="group"
                  aria-label={
                    caChromaMax > 0
                      ? `Canada thermostat count from ${caChromaMin.toLocaleString()} to ${caChromaMax.toLocaleString()}`
                      : 'Canada map legend'
                  }
                >
                  <div className="fy25-thermostat-locations-map__legend-title">Canada (color scale)</div>
                  <div className="fy25-thermostat-locations-map__legend-scale">
                    <span className="fy25-thermostat-locations-map__legend-bound">
                      {caChromaMax > 0 ? caChromaMin.toLocaleString() : '—'}
                    </span>
                    <div
                      className="fy25-thermostat-locations-map__legend-gradient"
                      style={{
                        background: `linear-gradient(90deg, ${MAP_BLUE_LOW}, ${MAP_BLUE_HIGH})`,
                      }}
                    />
                    <span className="fy25-thermostat-locations-map__legend-bound">
                      {caChromaMax > 0 ? caChromaMax.toLocaleString() : '—'}
                    </span>
                  </div>
                  <div className="fy25-thermostat-locations-map__legend-caption">
                    <span className="fy25-thermostat-locations-map__legend-caption-part">
                      <span className="fy25-thermostat-locations-map__legend-swatch fy25-thermostat-locations-map__legend-swatch--low" />
                      Lower count
                    </span>
                    <span className="fy25-thermostat-locations-map__legend-arrow" aria-hidden="true">
                      →
                    </span>
                    <span className="fy25-thermostat-locations-map__legend-caption-part">
                      <span className="fy25-thermostat-locations-map__legend-swatch fy25-thermostat-locations-map__legend-swatch--high" />
                      Higher count
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ThermostatLocationsMapContext = createContext(null)

/**
 * Single CSV fetch + choropleth modal. Wrap sections that use {@link ThermostatLocationsMapInlineLink}
 * or {@link useThermostatLocationsMap}.
 */
export function ThermostatLocationsMapProvider({ children }) {
  const [aggregate, setAggregate] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const modalTitleId = useId()

  useEffect(() => {
    let cancelled = false
    fetch(csvUrl())
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load location data (${r.status})`)
        return r.text()
      })
      .then((text) => {
        if (cancelled) return
        setAggregate(aggregateThermostatLocations(text))
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load data')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [modalOpen])

  const openModal = useCallback(() => {
    if (aggregate) setModalOpen(true)
  }, [aggregate])

  const closeModal = useCallback(() => setModalOpen(false), [])

  const value = useMemo(
    () => ({
      aggregate,
      loadError,
      modalOpen,
      openModal,
      closeModal,
      status: loadError ? 'error' : aggregate ? 'ready' : 'loading',
    }),
    [aggregate, closeModal, loadError, modalOpen, openModal],
  )

  return (
    <ThermostatLocationsMapContext.Provider value={value}>
      {children}
      {modalOpen &&
        aggregate &&
        typeof document !== 'undefined' &&
        createPortal(
          <ThermostatLocationsMapModalShell titleId={modalTitleId} onClose={closeModal}>
            <ThermostatLocationsMapInner aggregate={aggregate} hidePlaceLabels />
          </ThermostatLocationsMapModalShell>,
          document.body,
        )}
    </ThermostatLocationsMapContext.Provider>
  )
}

export function useThermostatLocationsMap() {
  const ctx = useContext(ThermostatLocationsMapContext)
  if (!ctx) {
    throw new Error(
      'useThermostatLocationsMap must be used within ThermostatLocationsMapProvider',
    )
  }
  return ctx
}

/** Opens the shared modal; only enabled when data has loaded. */
export function ThermostatLocationsMapInlineLink({ children, className = '' }) {
  const { openModal, modalOpen, status } = useThermostatLocationsMap()
  const cls = [
    'fy25-thermostat-locations-map__see-locations',
    'fy25-thermostat-locations-map__see-locations--inline',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (status !== 'ready') {
    return <span className={cls}>{children}</span>
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={openModal}
      aria-haspopup="dialog"
      aria-expanded={modalOpen}
    >
      {children}
    </button>
  )
}
