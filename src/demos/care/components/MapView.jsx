import React, { useState } from 'react'
import { MapPin, Filter, X } from 'lucide-react'

const statusColors = {
  critical: '#EF4444',
  warning: '#F97316',
  minor: '#EAB308',
  reminder: '#3B82F6',
  ok: '#22C55E',
  offline: '#6B7280',
  'no-access': '#9CA3AF',
}

const markers = [
  { id: '1', lat: 45.5, lng: -122.6, status: 'critical', customer: 'Portland Systems', address: '123 Oak St', city: 'Portland', state: 'OR' },
  { id: '2', lat: 40.7, lng: -111.9, status: 'warning', customer: 'Salt Lake HVAC', address: '456 Main Ave', city: 'Salt Lake City', state: 'UT' },
  { id: '3', lat: 37.7, lng: -122.4, status: 'ok', customer: 'SF Climate Control', address: '789 Market St', city: 'San Francisco', state: 'CA' },
  { id: '4', lat: 34.0, lng: -118.2, status: 'ok', customer: 'LA Comfort Systems', address: '321 Sunset Blvd', city: 'Los Angeles', state: 'CA' },
  { id: '5', lat: 41.8, lng: -87.6, status: 'ok', customer: 'Chicago HVAC', address: '654 Michigan Ave', city: 'Chicago', state: 'IL' },
  { id: '6', lat: 29.7, lng: -95.3, status: 'ok', customer: 'Houston Climate', address: '987 Texas St', city: 'Houston', state: 'TX' },
  { id: '7', lat: 33.4, lng: -112.0, status: 'minor', customer: 'Phoenix Air', address: '147 Desert Rd', city: 'Phoenix', state: 'AZ' },
  { id: '8', lat: 39.7, lng: -104.9, status: 'ok', customer: 'Denver Systems', address: '258 Mountain Way', city: 'Denver', state: 'CO' },
  { id: '9', lat: 25.7, lng: -80.1, status: 'ok', customer: 'Miami HVAC', address: '369 Beach Dr', city: 'Miami', state: 'FL' },
  { id: '10', lat: 40.7, lng: -74.0, status: 'reminder', customer: 'NYC Climate', address: '741 Broadway', city: 'New York', state: 'NY' },
]

export function MapView() {
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState({
    criticalError: true,
    needsAttention: true,
    minorError: true,
    reminder: true,
    ok: true,
    offline: true,
    noAccess: true,
    onlyMyCustomers: false,
    activated: true,
    expiringSoon: true,
    expired: true,
    homeSold: true,
  })

  return (
    <div className="h-screen flex">
      <div className="flex-1 relative bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
        <div className="absolute inset-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              d="M 50 200 L 100 180 L 150 190 L 200 170 L 250 160 L 300 150 L 350 140 L 400 150 L 450 140 L 500 130 L 550 140 L 600 130 L 650 140 L 700 150 L 750 160 L 800 170 L 850 180 L 900 200 L 920 250 L 900 300 L 880 350 L 850 400 L 800 420 L 750 430 L 700 440 L 650 450 L 600 460 L 550 450 L 500 460 L 450 470 L 400 460 L 350 470 L 300 480 L 250 470 L 200 480 L 150 470 L 100 450 L 70 400 L 50 350 L 40 300 L 50 250 Z"
              fill="#E0F2FE"
              stroke="#94A3B8"
              strokeWidth="2"
              opacity="0.5"
            />
            <g stroke="#CBD5E1" strokeWidth="1" fill="none" opacity="0.3">
              <line x1="200" y1="150" x2="200" y2="480" />
              <line x1="300" y1="140" x2="300" y2="480" />
              <line x1="400" y1="130" x2="400" y2="470" />
              <line x1="500" y1="120" x2="500" y2="470" />
              <line x1="600" y1="130" x2="600" y2="460" />
              <line x1="700" y1="140" x2="700" y2="450" />
              <line x1="800" y1="160" x2="800" y2="430" />
              <line x1="50" y1="250" x2="920" y2="250" />
              <line x1="50" y1="350" x2="900" y2="350" />
            </g>
          </svg>
          {markers.map((marker) => {
            const x = ((marker.lng + 125) / 60) * 900 + 50
            const y = ((50 - marker.lat) / 25) * 400 + 150
            return (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                style={{ left: `${x}px`, top: `${y}px` }}
              >
                <div className="relative">
                  <MapPin
                    className="w-7 h-7 drop-shadow-lg transition-transform group-hover:scale-150 group-hover:z-50"
                    style={{ color: statusColors[marker.status], fill: statusColors[marker.status] }}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-3 whitespace-nowrap border border-gray-200">
                      <p className="font-semibold text-gray-800 text-sm">{marker.customer}</p>
                      <p className="text-xs text-gray-600">{marker.address}</p>
                      <p className="text-xs text-gray-600">{marker.city}, {marker.state}</p>
                      <p className="text-xs font-medium mt-1 uppercase" style={{ color: statusColors[marker.status] }}>
                        {marker.status.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Status Legend</h3>
          <div className="space-y-2 text-xs">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color, fill: color }} />
                <span className="text-gray-700 capitalize">{status.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-gray-600">
          United States View • {markers.length} locations
        </div>
      </div>
      {showFilters && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Location Status</h2>
              <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {['Critical Error', 'Needs Attention', 'Minor Error', 'Reminder', 'OK', 'Offline', 'No Access'].map((label, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-red-600 rounded" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Visible Systems</h3>
              <p className="text-3xl font-bold text-blue-600">{markers.length}</p>
              <p className="text-xs text-gray-600 mt-1">Across United States</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
