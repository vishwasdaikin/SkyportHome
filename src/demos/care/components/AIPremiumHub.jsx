import React, { useState } from 'react'
import {
  Sparkles,
  Wrench,
  Video,
  Cpu,
  FileText,
  Users,
  Target,
} from 'lucide-react'

const features = [
  { id: 'automation', icon: Wrench, title: 'AI Maintenance Automation', description: 'Auto-calibration & preventative cycles', color: 'from-purple-500 to-blue-500', savings: '$4,200/mo' },
  { id: 'virtual-visits', icon: Video, title: 'Virtual Service Visits', description: 'AR-guided homeowner support', color: 'from-blue-500 to-cyan-500', savings: '$8,100/mo' },
  { id: 'diagnostics', icon: Cpu, title: 'Auto Diagnostics & Parts', description: 'Remote diagnostics + auto ordering', color: 'from-indigo-500 to-purple-500', savings: '$5,400/mo' },
  { id: 'reports', icon: FileText, title: 'Homeowner Reports', description: 'Dealer-branded efficiency insights', color: 'from-green-500 to-emerald-500', savings: '$12K/mo' },
  { id: 'referrals', icon: Users, title: 'Referral Program', description: 'AI-identified advocates', color: 'from-pink-500 to-purple-500', savings: '$47K/qtr' },
  { id: 'upselling', icon: Target, title: 'Predictive Upselling', description: 'EOL replacement plans', color: 'from-orange-500 to-red-500', savings: '$127K pipeline' },
]

function FeatureDetail({ featureId, onBack }) {
  const f = features.find((x) => x.id === featureId)
  if (!f) return null
  const Icon = f.icon
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
      >
        ← Back to AI Premium Hub
      </button>
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{f.title}</h1>
            <p className="text-sm opacity-90 mt-1">{f.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">Value Generated</p>
            <p className="text-3xl font-bold">{f.savings}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">Status</p>
            <p className="text-3xl font-bold">Active</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-gray-600">Detailed view for <strong>{f.title}</strong>. Full feature content can be expanded here.</p>
      </div>
    </div>
  )
}

export function AIPremiumHub() {
  const [activeFeature, setActiveFeature] = useState(null)

  if (activeFeature) {
    return <FeatureDetail featureId={activeFeature} onBack={() => setActiveFeature(null)} />
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Premium Features</h1>
            <p className="text-sm opacity-90 mt-1">Monetize & Drive Value Through AI</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">Monthly Savings</p>
            <p className="text-3xl font-bold">$29.7K</p>
            <p className="text-xs opacity-75">Truck rolls avoided</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">Revenue Generated</p>
            <p className="text-3xl font-bold">$59K</p>
            <p className="text-xs opacity-75">This month</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">Customer Satisfaction</p>
            <p className="text-3xl font-bold">4.9★</p>
            <p className="text-xs opacity-75">AI-powered service</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-sm opacity-90 mb-1">ROI</p>
            <p className="text-3xl font-bold">420%</p>
            <p className="text-xs opacity-75">On AI investment</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all text-left group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">Value Generated</span>
                <span className="text-lg font-bold text-green-600">{feature.savings}</span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Why AI Premium Features?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <h3 className="font-semibold text-gray-800 mb-3">For Dealers</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Reduce truck rolls by 45% through automated fixes and virtual visits</li>
              <li>• 96% first-visit fix rate with auto-diagnostics and parts ordering</li>
              <li>• Generate $59K+ monthly revenue through upsells and referrals</li>
            </ul>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h3 className="font-semibold text-gray-800 mb-3">For Homeowners</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Automatic system optimization extends equipment life 18+ months</li>
              <li>• Resolve 92% of issues remotely without waiting for technician</li>
              <li>• Personalized efficiency reports show real savings and recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
