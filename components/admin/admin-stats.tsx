'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Mock stats data
const mockStats = [
  {
    label: 'Active Users (24h)',
    value: '2,543',
    change: '+12%',
    trend: 'up' as const
  },
  {
    label: 'New Registrations',
    value: '156',
    change: '+8%',
    trend: 'up' as const
  },
  {
    label: 'Content Views',
    value: '45.2K',
    change: '+15%',
    trend: 'up' as const
  },
  {
    label: 'Server Uptime',
    value: '99.9%',
    change: '0%',
    trend: 'stable' as const
  },
  {
    label: 'API Requests',
    value: '123.5K',
    change: '-2%',
    trend: 'down' as const
  },
  {
    label: 'Error Rate',
    value: '0.1%',
    change: '-50%',
    trend: 'up' as const
  }
]

export function AdminStats() {
  return (
    <div className="space-y-4">
      {mockStats.map((stat, index) => (
        <div key={index} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
          
          <div className={`flex items-center space-x-1 text-sm ${
            stat.trend === 'up' ? 'text-green-500' : 
            stat.trend === 'down' ? 'text-red-500' : 
            'text-muted-foreground'
          }`}>
            {stat.trend === 'up' && <TrendingUp className="h-4 w-4" />}
            {stat.trend === 'down' && <TrendingDown className="h-4 w-4" />}
            {stat.trend === 'stable' && <Minus className="h-4 w-4" />}
            <span>{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}