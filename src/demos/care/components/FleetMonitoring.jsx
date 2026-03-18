import React, { useState } from 'react'
import {
  Search,
  Filter,
  MapPin,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  Workflow,
  Droplets,
  ClipboardCheck,
  FileCheck,
  Settings,
  Award,
  FileText,
  Home,
  Bell,
  Sliders,
  Wrench,
} from 'lucide-react'

const systems = [
  { id: 'SYS-1001', customer: 'Johnson Residence', address: '123 Oak Street', model: 'Daikin Fit', installed: '2016-03-15', healthScore: 92, status: 'healthy', lastService: '2024-01-15', nextService: '2024-07-15' },
  { id: 'SYS-1002', customer: 'Smith Home', address: '456 Maple Ave', model: 'Daikin One+', installed: '2012-06-20', healthScore: 45, status: 'eol', lastService: '2023-12-10', nextService: 'Overdue' },
  { id: 'SYS-1003', customer: 'Williams Property', address: '789 Pine Road', model: 'Daikin Aurora', installed: '2019-09-10', healthScore: 78, status: 'warning', lastService: '2024-02-20', nextService: '2024-08-20' },
  { id: 'SYS-1004', customer: 'Brown Residence', address: '321 Elm Street', model: 'Daikin Fit', installed: '2021-04-05', healthScore: 95, status: 'healthy', lastService: '2024-03-01', nextService: '2024-09-01' },
  { id: 'SYS-1005', customer: 'Davis Home', address: '654 Cedar Lane', model: 'Daikin One+', installed: '2018-11-12', healthScore: 65, status: 'warning', lastService: '2024-01-08', nextService: '2024-07-08' },
  { id: 'SYS-1006', customer: 'Anderson Property', address: '987 Birch Ave', model: 'Daikin Aurora', installed: '2013-02-28', healthScore: 38, status: 'critical', lastService: '2023-11-15', nextService: 'Immediate' },
]

function getStatusColor(status) {
  switch (status) {
    case 'healthy': return 'bg-green-50 border-green-200 text-green-800'
    case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'critical': return 'bg-red-50 border-red-200 text-red-800'
    case 'eol': return 'bg-purple-50 border-purple-200 text-purple-800'
    default: return 'bg-gray-50 border-gray-200 text-gray-800'
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'healthy': return <CheckCircle className="w-5 h-5 text-green-600" />
    case 'warning': return <XCircle className="w-5 h-5 text-yellow-600" />
    case 'critical': return <XCircle className="w-5 h-5 text-red-600" />
    case 'eol': return <XCircle className="w-5 h-5 text-purple-600" />
    default: return null
  }
}

export function FleetMonitoring() {
  const [filterStatus, setFilterStatus] = useState('all')
  const filteredSystems = filterStatus === 'all' ? systems : systems.filter((s) => s.status === filterStatus)
  const filters = [
    { id: 'all', label: 'All Systems', count: 1247 },
    { id: 'healthy', label: 'Healthy', count: 1089 },
    { id: 'warning', label: 'Warning', count: 98 },
    { id: 'critical', label: 'Critical', count: 12 },
    { id: 'eol', label: 'End of Life', count: 48 },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Fleet Monitoring</h2>
            <p className="text-sm text-gray-600 mt-1">1,247 Daikin systems installed</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filterStatus === f.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Enterprise Application</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">RNC Multi-Fly</p>
                <p className="text-xs text-gray-600">Multi-tenant</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Active Tenants</span>
              <span className="text-lg font-bold text-blue-600">47</span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">User Profiles</p>
                <p className="text-xs text-gray-600">Role management</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Defined Roles</span>
              <span className="text-lg font-bold text-purple-600">12</span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Workflows</p>
                <p className="text-xs text-gray-600">Automation</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Active Flows</span>
              <span className="text-lg font-bold text-green-600">23</span>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Refrigerant</p>
                <p className="text-xs text-gray-600">Diagram & Flow</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Systems Mapped</span>
              <span className="text-lg font-bold text-orange-600">1,247</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">State & Utility Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: ClipboardCheck, title: 'Installation', sub: 'Validation', done: 1189, pending: 58, pct: 95, cardClass: 'from-blue-50 to-cyan-50 border-blue-200', iconBg: 'bg-blue-500', barClass: 'bg-blue-500' },
            { icon: FileCheck, title: 'Commissioning', sub: 'Validation', done: 1156, pending: 91, pct: 93, cardClass: 'from-green-50 to-emerald-50 border-green-200', iconBg: 'bg-green-500', barClass: 'bg-green-500' },
            { icon: Settings, title: 'Operation', sub: 'Validation', done: 1198, pending: 49, pct: 96, cardClass: 'from-purple-50 to-pink-50 border-purple-200', iconBg: 'bg-purple-500', barClass: 'bg-purple-500' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className={`p-5 bg-gradient-to-br ${item.cardClass} border-2 rounded-xl`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.sub}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-xs text-gray-600">Completed</span>
                    <span className="text-sm font-bold text-green-600">{item.done}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-xs text-gray-600">Pending</span>
                    <span className="text-sm font-bold text-yellow-600">{item.pending}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div className={`${item.barClass} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <p className="text-xs text-center text-gray-600">{item.pct}% Validated</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSystems.map((system) => (
          <div key={system.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">{system.id}</p>
                <h3 className="font-semibold text-gray-800 text-lg">{system.customer}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{system.address}</span>
                </div>
              </div>
              {getStatusIcon(system.status)}
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Health Score</span>
                <span className={`text-2xl font-bold ${system.healthScore >= 80 ? 'text-green-600' : system.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {system.healthScore}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${system.healthScore >= 80 ? 'bg-green-500' : system.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${system.healthScore}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium text-gray-800">{system.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Installed:</span>
                <span className="font-medium text-gray-800">{new Date(system.installed).getFullYear()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Service:</span>
                <span className="font-medium text-gray-800">{system.lastService}</span>
              </div>
            </div>
            <div className={`px-3 py-2 rounded-lg border-2 text-center mb-4 ${getStatusColor(system.status)}`}>
              <span className="text-sm font-semibold uppercase">{system.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">View Details</button>
              <button className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors">Schedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
