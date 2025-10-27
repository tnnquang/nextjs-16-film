'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// Mock analytics data
const mockAnalytics = {
  userGrowth: [
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1850 },
    { month: 'Mar', users: 2400 },
    { month: 'Apr', users: 3100 },
    { month: 'May', users: 3800 },
    { month: 'Jun', users: 4500 }
  ],
  demographics: {
    ageGroups: [
      { range: '18-24', percentage: 25 },
      { range: '25-34', percentage: 35 },
      { range: '35-44', percentage: 20 },
      { range: '45-54', percentage: 15 },
      { range: '55+', percentage: 5 }
    ],
    countries: [
      { name: 'United States', percentage: 40 },
      { name: 'United Kingdom', percentage: 15 },
      { name: 'Canada', percentage: 12 },
      { name: 'Germany', percentage: 10 },
      { name: 'Others', percentage: 23 }
    ]
  },
  engagement: {
    avgSessionDuration: '24 minutes',
    avgPagesPerSession: 3.2,
    bounceRate: 32,
    returnUserRate: 68
  }
}

export function UserAnalytics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Age Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Age Demographics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAnalytics.demographics.ageGroups.map((group) => (
            <div key={group.range} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{group.range}</span>
                <span>{group.percentage}%</span>
              </div>
              <Progress value={group.percentage} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Countries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockAnalytics.demographics.countries.map((country) => (
            <div key={country.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{country.name}</span>
                <span>{country.percentage}%</span>
              </div>
              <Progress value={country.percentage} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg. Session</span>
              <span className="text-sm font-medium">{mockAnalytics.engagement.avgSessionDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pages/Session</span>
              <span className="text-sm font-medium">{mockAnalytics.engagement.avgPagesPerSession}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bounce Rate</span>
              <span className="text-sm font-medium">{mockAnalytics.engagement.bounceRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Return Users</span>
              <span className="text-sm font-medium">{mockAnalytics.engagement.returnUserRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}