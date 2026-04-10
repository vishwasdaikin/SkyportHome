import React, { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  Plus,
  MoreVertical,
} from 'lucide-react'

const zones = [
  { id: 'upstairs', name: 'upstairs', temp: 69, status: 'ok' },
  { id: 'downstairs', name: 'downstairs', temp: 71, status: 'ok' },
]
const equipment = [
  { type: 'Air Handler', model: 'DFVE48DP1300AA', serial: '241027819', status: 'ok' },
  { type: 'Heat Pump', model: 'DH6VSA4210', serial: '2410182956', status: 'ok' },
]
const reports = [
  { type: 'Homeowner', name: 'QA', date: 'December 15, 2022, 5:15 AM' },
]

export function CustomerDetailView({ onBack }) {
  const [selectedZone, setSelectedZone] = useState('upstairs')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">tj</h1>
              <p className="text-sm text-gray-600">Customer ID: #12345</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Lifetime license activated.</p>
              <p className="text-xs text-gray-600">System is fully operational</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="border-4 border-red-500 rounded-xl p-4 mb-4">
                <p className="text-red-600 font-semibold text-center">Hidden Customer Info</p>
              </div>
              <div className="space-y-2">
                {zones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${selectedZone === zone.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Thermometer className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Assigned Techs</h3>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">Bhavesh gharat</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">System Overview</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Alerts</h3>
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mb-3" />
                    <p className="text-sm text-gray-600">No Active Alerts</p>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 mt-4">View History</button>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Active Reminders</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Change media filter</p>
                        <p className="text-xs text-gray-600">178 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thermostats</h3>
                <div className="bg-black rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-5 h-5" />
                      <span className="text-sm">{selectedZone}</span>
                    </div>
                    <button className="text-sm text-gray-400 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-center mb-8">
                    <p className="text-8xl font-light mb-2">69°</p>
                    <p className="text-sm text-gray-400">Current Temperature</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">Heat</button>
                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">Cool</button>
                    <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors">Auto</button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Thermometer className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-400">Set Point</p>
                      <p className="text-lg font-semibold">72°</p>
                    </div>
                    <div>
                      <Droplets className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-400">Humidity</p>
                      <p className="text-lg font-semibold">45%</p>
                    </div>
                    <div>
                      <Wind className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-400">Fan</p>
                      <p className="text-lg font-semibold">Auto</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-gray-800">Other Equipment</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Add Equipment
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Model</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Serial</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">{item.type}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.model}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.serial}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm text-gray-800">OK</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Generate Report
                  </button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700" />
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">{report.type}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{report.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{report.date}</td>
                        <td className="py-3 px-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
