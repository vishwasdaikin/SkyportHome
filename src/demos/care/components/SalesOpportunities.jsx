import React from 'react'
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Package,
  CheckCircle,
} from 'lucide-react'

const eolSystems = [
  { customer: 'Smith Home', address: '456 Maple Ave', model: 'Trane XL18i', age: '12 years', healthScore: 45, estimatedValue: '$8,500', priority: 'high', reason: 'System efficiency declining, frequent repairs' },
  { customer: 'Anderson Property', address: '987 Birch Ave', model: 'Lennox SL28XCV', age: '11 years', healthScore: 38, estimatedValue: '$9,200', priority: 'critical', reason: 'Compressor failure imminent, R-22 refrigerant' },
  { customer: 'Martinez Residence', address: '234 Willow Dr', model: 'Carrier 24ABC6', age: '13 years', healthScore: 42, estimatedValue: '$7,800', priority: 'high', reason: 'Outdated technology, high energy costs' },
]
const upsellOpportunities = [
  { customer: 'Williams Property', type: 'Smart Thermostat Upgrade', currentSetup: 'Basic programmable', value: '$450', savings: '$180/year', icon: Package },
  { customer: 'Davis Home', type: 'Air Quality System', currentSetup: 'Standard filtration', value: '$1,200', savings: 'Health benefits', icon: Package },
  { customer: 'Johnson Residence', type: 'Maintenance Plan', currentSetup: 'Pay-per-service', value: '$299/year', savings: '$150/year', icon: CheckCircle },
]
const servicePlanLeads = [
  { customer: 'Brown Residence', systemAge: '5 years', lastService: '8 months ago', potential: '$299/year', status: 'warm' },
  { customer: 'Taylor Home', systemAge: '3 years', lastService: '6 months ago', potential: '$299/year', status: 'hot' },
]

export function SalesOpportunities() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Total Pipeline</span>
          </div>
          <p className="text-4xl font-bold mb-1">$127K</p>
          <p className="text-sm opacity-90">47 opportunities</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">EOL Systems</span>
          </div>
          <p className="text-4xl font-bold mb-1">48</p>
          <p className="text-sm opacity-90">Ready for replacement</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm font-medium opacity-90">Conversion Rate</span>
          </div>
          <p className="text-4xl font-bold mb-1">68%</p>
          <p className="text-sm opacity-90">Above industry avg</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">End-of-Life Replacements</h2>
            <p className="text-sm text-gray-600 mt-1">High-priority system replacements</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">Export List</button>
        </div>
        <div className="space-y-4">
          {eolSystems.map((system, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">{system.customer}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${system.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                      {system.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{system.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{system.estimatedValue}</p>
                  <p className="text-xs text-gray-500">Est. Value</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current System</p>
                  <p className="text-sm font-medium text-gray-800">{system.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Age</p>
                  <p className="text-sm font-medium text-gray-800">{system.age}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Health Score</p>
                  <p className="text-sm font-bold text-red-600">{system.healthScore}/100</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-medium text-red-600">EOL</p>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg mb-4">
                <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {system.reason}</p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium transition-all">Create Quote</button>
                <button className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Contact Customer</button>
                <button className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors">Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Upsell Opportunities</h2>
          <div className="space-y-3">
            {upsellOpportunities.map((opp, index) => {
              const Icon = opp.icon
              return (
                <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{opp.customer}</p>
                      <p className="text-sm text-gray-600">{opp.type}</p>
                    </div>
                    <p className="font-bold text-green-600">{opp.value}</p>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">Current: {opp.currentSetup}</div>
                  <div className="text-xs text-green-700 font-medium mb-3">💰 Customer saves: {opp.savings}</div>
                  <button className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">Send Proposal</button>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Service Plan Conversions</h2>
          <div className="space-y-3">
            {servicePlanLeads.map((lead, index) => (
              <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{lead.customer}</p>
                    <p className="text-sm text-gray-600">System: {lead.systemAge}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${lead.status === 'hot' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {lead.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mb-3">Last service: {lead.lastService}</div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700">Annual Value:</span>
                  <span className="font-bold text-blue-600">{lead.potential}</span>
                </div>
                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Offer Plan</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
