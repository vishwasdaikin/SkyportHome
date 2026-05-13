import React from 'react'
import {
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Users,
  ArrowRight,
  Sparkles,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { useTheme } from '../AppCare'

const systemHealthData = [
  { status: 'OK', count: 1089, percentage: 87, color: '#22C55E' },
  { status: 'Minor Error', count: 98, percentage: 8, color: '#EAB308' },
  { status: 'Critical Error', count: 12, percentage: 1, color: '#EF4444' },
  { status: 'Reminder', count: 48, percentage: 4, color: '#F97316' },
]

export function DealerDashboard({ onNavigate }) {
  const { theme } = useTheme()

  if (theme === 'modern') {
    return (
      <div className="p-8 bg-gray-50">
        <h1 className="text-3xl font-normal text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-base font-medium text-gray-900 mb-4">System Access</h2>
            <div className="space-y-3">
              {[
                { label: '69 adjust settings', width: 69 },
                { label: '72 view only', width: 72 },
                { label: '13 no access', width: 13 },
                { label: '25 offline', width: 25 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <div className="flex-1 mx-3 bg-gray-100 rounded-full h-2">
                    <div className="bg-[#2563EB] h-2 rounded-full transition-all" style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-gray-900">Alerts</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>1 of 2</span>
                <button className="text-[#2563EB] hover:text-blue-700 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border-l-4 border-red-500 bg-red-50 rounded-r hover:bg-red-100 transition-colors cursor-pointer">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">76 - Communication error</p>
                  <p className="text-xs text-gray-600">3 days ago</p>
                </div>
                <button className="text-[#2563EB] hover:text-blue-700 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-start gap-3 p-3 border-l-4 border-red-500 bg-red-50 rounded-r hover:bg-red-100 transition-colors cursor-pointer">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">C1 - System error</p>
                  <p className="text-xs text-gray-600">3 days ago</p>
                </div>
                <button className="text-[#2563EB] hover:text-blue-700 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-base font-medium text-gray-900 mb-4">Reminders</h2>
            <div className="space-y-3">
              {['6 active reminders', '42 within 30 days', '42 within 60 days', '43 within 90 days'].map((text, i) => (
                <button key={i} className="w-full flex items-center justify-between text-sm hover:bg-gray-50 p-2 rounded transition-colors">
                  <span className="text-gray-700">{text}</span>
                  <ArrowRight className="w-4 h-4 text-[#2563EB]" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-base font-medium text-gray-900 mb-6">System Health</h2>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="#f3f4f6" strokeWidth="32" fill="none" />
                  {(() => {
                    let offset = 0
                    const circumference = 2 * Math.PI * 80
                    return systemHealthData.map((segment, index) => {
                      const segmentLength = (segment.percentage / 100) * circumference
                      const currentOffset = offset
                      offset += segmentLength
                      return (
                        <circle
                          key={index}
                          cx="96"
                          cy="96"
                          r="80"
                          stroke={segment.color}
                          strokeWidth="32"
                          fill="none"
                          strokeDasharray={`${segmentLength} ${circumference}`}
                          strokeDashoffset={-currentOffset}
                          className="transition-all"
                        />
                      )
                    })
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-light text-gray-900">6</p>
                  <p className="text-sm text-gray-600">Errors</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {systemHealthData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-base font-medium text-gray-900 mb-4">Energy Runtime</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Today&apos;s Runtime</span>
                  <span className="text-xl font-medium text-gray-900">18.4h</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-[#2563EB] h-2 rounded-full transition-all" style={{ width: '76%' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Cooling</p>
                  <p className="text-lg font-medium text-gray-900">12.2h</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Heating</p>
                  <p className="text-lg font-medium text-gray-900">6.2h</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h2 className="text-base font-medium text-gray-900 mb-4">Equipment Data</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Indoor Temp</span>
                </div>
                <span className="text-lg font-medium text-gray-900">72°F</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Humidity</span>
                </div>
                <span className="text-lg font-medium text-gray-900">45%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Fan Speed</span>
                </div>
                <span className="text-lg font-medium text-gray-900">65%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-normal text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => onNavigate('fleet')} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Fleet Monitoring</h3>
              <p className="text-sm text-gray-600 mb-1">1,247 Daikin systems</p>
              <p className="text-xs text-gray-500">Enterprise features, validations, quality install</p>
            </button>
            <button onClick={() => onNavigate('equipment')} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Equipment Data</h3>
              <p className="text-sm text-gray-600 mb-1">Live system metrics</p>
              <p className="text-xs text-gray-500">Refrigerant diagrams, temp/humidity graphs</p>
            </button>
            <button onClick={() => onNavigate('ai-features')} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">AI Premium</h3>
              <p className="text-sm text-gray-600 mb-1">6 AI-powered tools</p>
              <p className="text-xs text-gray-500">Auto-maintenance, diagnostics, reports</p>
            </button>
            <button onClick={() => onNavigate('opportunities')} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-blue-300 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Sales Pipeline</h3>
              <p className="text-sm text-gray-600 mb-1">$127K opportunities</p>
              <p className="text-xs text-gray-500">EOL systems, upsells, referrals</p>
            </button>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-normal text-gray-900 mb-4">AI-Powered Features</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-base font-medium text-gray-900 mb-4">Proactive Maintenance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">Auto-fixes this week</span>
                  <span className="text-lg font-medium text-gray-900">47</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">Truck rolls saved</span>
                  <span className="text-lg font-medium text-gray-900">23</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-gray-700">Virtual visits</span>
                  <span className="text-lg font-medium text-gray-900">89</span>
                </div>
                <button onClick={() => onNavigate('ai-features')} className="w-full mt-2 py-2 px-4 bg-[#2563EB] text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-base font-medium text-gray-900 mb-4">Homeowner Engagement</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">Reports sent</span>
                  <span className="text-lg font-medium text-gray-900">1,247</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">Open rate</span>
                  <span className="text-lg font-medium text-gray-900">78%</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-gray-700">Referrals generated</span>
                  <span className="text-lg font-medium text-gray-900">47</span>
                </div>
                <button onClick={() => onNavigate('ai-features')} className="w-full mt-2 py-2 px-4 bg-[#2563EB] text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-base font-medium text-gray-900 mb-4">Performance Insights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">First-visit fix rate</span>
                  <span className="text-lg font-medium text-gray-900">96%</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">Avg response time</span>
                  <span className="text-lg font-medium text-gray-900">2.3h</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-gray-700">Customer retention</span>
                  <span className="text-lg font-medium text-gray-900">94%</span>
                </div>
                <button onClick={() => onNavigate('ai-features')} className="w-full mt-2 py-2 px-4 bg-[#2563EB] text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-light text-gray-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-light text-gray-800 mb-4">System Access</h2>
          <div className="space-y-3">
            {[69, 72, 13, 25].map((w, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{['69 adjust settings', '72 view only', '13 no access', '25 offline'][i]}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-light text-gray-800">Alerts</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>1 of 2</span>
              <button className="text-[#2563EB] hover:underline">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border-l-4 border-red-500 bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">76 - Communication error</p>
                <p className="text-xs text-gray-600">3 days ago</p>
              </div>
              <button className="text-[#2563EB]"><ArrowRight className="w-4 h-4" /></button>
            </div>
            <div className="flex items-start gap-3 p-3 border-l-4 border-red-500 bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">C1 - System error</p>
                <p className="text-xs text-gray-600">3 days ago</p>
              </div>
              <button className="text-[#2563EB]"><ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-light text-gray-800 mb-4">Reminders</h2>
          <div className="space-y-3">
            {['6 active reminders', '42 within 30 days', '42 within 60 days', '43 within 90 days'].map((text, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{text}</span>
                <button className="text-[#2563EB]"><ArrowRight className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-light text-gray-800 mb-6">System Health</h2>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="#f3f4f6" strokeWidth="32" fill="none" />
                {(() => {
                  let offset = 0
                  const circumference = 2 * Math.PI * 80
                  return systemHealthData.map((segment, index) => {
                    const segmentLength = (segment.percentage / 100) * circumference
                    const currentOffset = offset
                    offset += segmentLength
                    return (
                      <circle
                        key={index}
                        cx="96"
                        cy="96"
                        r="80"
                        stroke={segment.color}
                        strokeWidth="32"
                        fill="none"
                        strokeDasharray={`${segmentLength} ${circumference}`}
                        strokeDashoffset={-currentOffset}
                      />
                    )
                  })
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-5xl font-light text-gray-800">6</p>
                <p className="text-sm text-gray-600">Errors</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {systemHealthData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-700">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-light text-gray-800 mb-4">Energy Runtime</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Today&apos;s Runtime</span>
                <span className="text-xl font-light text-gray-800">18.4h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: '76%' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 mb-1">Cooling</p>
                <p className="text-lg font-light text-gray-800">12.2h</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 mb-1">Heating</p>
                <p className="text-lg font-light text-gray-800">6.2h</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-light text-gray-800 mb-4">Equipment Data</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Indoor Temp</span>
              </div>
              <span className="text-lg font-light text-gray-800">72°F</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Humidity</span>
              </div>
              <span className="text-lg font-light text-gray-800">45%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Fan Speed</span>
              </div>
              <span className="text-lg font-light text-gray-800">65%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-light text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => onNavigate('fleet')} className="bg-white rounded shadow p-6 text-left hover:shadow-lg transition-shadow">
            <Users className="w-8 h-8 text-[#2563EB] mb-3" />
            <h3 className="text-lg font-light text-gray-800 mb-2">Fleet Monitoring</h3>
            <p className="text-sm text-gray-600 mb-3">1,247 Daikin systems</p>
            <p className="text-xs text-gray-500">Enterprise features, validations, quality install</p>
          </button>
          <button onClick={() => onNavigate('equipment')} className="bg-white rounded shadow p-6 text-left hover:shadow-lg transition-shadow">
            <Activity className="w-8 h-8 text-[#2563EB] mb-3" />
            <h3 className="text-lg font-light text-gray-800 mb-2">Equipment Data</h3>
            <p className="text-sm text-gray-600 mb-3">Live system metrics</p>
            <p className="text-xs text-gray-500">Refrigerant diagrams, temp/humidity graphs</p>
          </button>
          <button onClick={() => onNavigate('ai-features')} className="bg-white rounded shadow p-6 text-left hover:shadow-lg transition-shadow">
            <Sparkles className="w-8 h-8 text-[#2563EB] mb-3" />
            <h3 className="text-lg font-light text-gray-800 mb-2">AI Premium</h3>
            <p className="text-sm text-gray-600 mb-3">6 AI-powered tools</p>
            <p className="text-xs text-gray-500">Auto-maintenance, diagnostics, reports</p>
          </button>
          <button onClick={() => onNavigate('opportunities')} className="bg-white rounded shadow p-6 text-left hover:shadow-lg transition-shadow">
            <TrendingUp className="w-8 h-8 text-[#2563EB] mb-3" />
            <h3 className="text-lg font-light text-gray-800 mb-2">Sales Pipeline</h3>
            <p className="text-sm text-gray-600 mb-1">$127K opportunities</p>
            <p className="text-xs text-gray-500">EOL systems, upsells, referrals</p>
          </button>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-light text-gray-800 mb-4">AI-Powered Features</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { title: 'Proactive Maintenance', stats: ['Auto-fixes this week: 47', 'Truck rolls saved: 23', 'Virtual visits: 89'] },
            { title: 'Homeowner Engagement', stats: ['Reports sent: 1,247', 'Open rate: 78%', 'Referrals generated: 47'] },
            { title: 'Performance Insights', stats: ['First-visit fix rate: 96%', 'Avg response time: 2.3h', 'Customer retention: 94%'] },
          ].map((block, i) => (
            <div key={i} className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-light text-gray-800 mb-4">{block.title}</h3>
              <div className="space-y-3">
                {block.stats.map((s, j) => (
                  <div key={j} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{s.split(':')[0]}</span>
                    <span className="text-lg font-light text-gray-800">{s.split(':')[1]?.trim()}</span>
                  </div>
                ))}
                <button onClick={() => onNavigate('ai-features')} className="w-full mt-2 py-2 px-4 bg-[#2563EB] text-white rounded text-sm hover:bg-blue-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
