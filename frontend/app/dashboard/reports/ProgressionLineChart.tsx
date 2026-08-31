/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface TimeSummary {
  period: string;
  total_incomes: number;
  total_expenses: number;
}

export function ProgressionLineChart({ 
  dailyData, 
  weeklyData, 
  monthlyData 
}: { 
  dailyData: TimeSummary[], 
  weeklyData: TimeSummary[], 
  monthlyData: TimeSummary[] 
}) {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

  const currentData = viewMode === 'daily' ? dailyData : viewMode === 'weekly' ? weeklyData : monthlyData

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        Nenhum dado registrado para análise de tempo.
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-bold text-gray-900">Progressão no Tempo</h3>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Diária
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'weekly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Mensal
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData as any} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip 
              formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
              cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" name="Receitas" dataKey="total_incomes" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            <Line type="monotone" name="Despesas" dataKey="total_expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
