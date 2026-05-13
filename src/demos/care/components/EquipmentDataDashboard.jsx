import React, { useState } from 'react'
import {
  Thermometer,
  Wind,
  Droplets,
  Activity,
  Calendar,
  Gauge,
  Power,
  TrendingUp,
} from 'lucide-react'

const equipmentData = {
  indoor: { mode: 'Cool', roomTemp: 72, coolSetpoint: 72, heatSetpoint: 68, evOpeningPercent: 45, gasPipeTemp: 55, liquidPipeTemp: 42, unitStatus: 'on', subcool: 8, superheat: 12 },
  outdoor: { outsideAirTemp: 85, condensingTemp: 115, targetCondensingTemp: 110, evaporationTemp: 45, targetEvaporationTemp: 42, oilReturn: 'off', defrost: 'off', compressorTemp: 180, dischargePressure: 285, suctionPressure: 68 },
}

export function EquipmentDataDashboard() {
  const [selectedDate, setSelectedDate] = useState('2024-03-15')
  const [selectedParams, setSelectedParams] = useState(['roomTemp', 'coolSetpoint', 'superheat'])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-2xl shadow-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Equipment Data</h1>
              <p className="text-sm opacity-90 mt-1">Real-Time System Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5" />
              <span className="text-sm opacity-90">Mode</span>
            </div>
            <p className="text-2xl font-bold">{equipmentData.indoor.mode}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5" />
              <span className="text-sm opacity-90">Outside Temp</span>
            </div>
            <p className="text-2xl font-bold">{equipmentData.outdoor.outsideAirTemp}°F</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="text-sm opacity-90">Room Temp</span>
            </div>
            <p className="text-2xl font-bold">{equipmentData.indoor.roomTemp}°F</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Power className="w-5 h-5" />
              <span className="text-sm opacity-90">Status</span>
            </div>
            <p className="text-2xl font-bold capitalize">{equipmentData.indoor.unitStatus}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Indoor Unit</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Room Temp</span>
                <span className="text-xl font-bold text-blue-600">{equipmentData.indoor.roomTemp}°F</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Setpoint</span>
                <span>{equipmentData.indoor.coolSetpoint}°F</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Subcool</p>
                <p className="text-lg font-bold text-green-600">{equipmentData.indoor.subcool}°F</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-1">Superheat</p>
                <p className="text-lg font-bold text-yellow-600">{equipmentData.indoor.superheat}°F</p>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">EV Opening</span>
                <span className="text-lg font-bold text-purple-600">{equipmentData.indoor.evOpeningPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${equipmentData.indoor.evOpeningPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Outdoor Unit</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Condensing Temp</span>
                <span className="text-xl font-bold text-red-600">{equipmentData.outdoor.condensingTemp}°F</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Target</span>
                <span className="text-gray-700 font-medium">{equipmentData.outdoor.targetCondensingTemp}°F</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Evaporation Temp</span>
                <span className="text-xl font-bold text-blue-600">{equipmentData.outdoor.evaporationTemp}°F</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Target</span>
                <span className="text-gray-700 font-medium">{equipmentData.outdoor.targetEvaporationTemp}°F</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600">Discharge</p>
                <p className="text-sm font-bold text-purple-600">{equipmentData.outdoor.dischargePressure} PSI</p>
              </div>
              <div className="p-2 bg-cyan-50 rounded-lg">
                <p className="text-xs text-gray-600">Suction</p>
                <p className="text-sm font-bold text-cyan-600">{equipmentData.outdoor.suctionPressure} PSI</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Refrigerant Flow</h3>
          </div>
          <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                <Gauge className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-center mt-1 font-medium">Compressor</p>
              <p className="text-xs text-center text-red-600 font-bold">180°F</p>
            </div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <div className="w-12 h-20 bg-gradient-to-b from-orange-400 to-blue-400 rounded-lg shadow-lg flex items-center justify-center">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-center mt-1 font-medium">Condenser</p>
            </div>
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <div className="w-12 h-20 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-lg shadow-lg flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-center mt-1 font-medium">Evaporator</p>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-center mt-1 font-medium">EV</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-600">High Temp/Press Gas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span className="text-gray-600">High Temp/Press Liquid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-gray-600">Low Temp/Press Liquid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded" />
              <span className="text-gray-600">Low Temp/Press Gas</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-800">Select Parameters</h3>
        </div>
        <p className="text-sm text-gray-600">Selected: {selectedParams.join(', ')}</p>
        <div className="mt-4 h-48 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 flex items-center justify-center">
          <p className="text-gray-500">Performance trends chart area</p>
        </div>
      </div>
    </div>
  )
}
