'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface ActivityItem {
  id: string
  user: {
    name: string
    avatar?: string
  }
  action: string
  resource: string
  timestamp: string
  type: 'create' | 'update' | 'delete' | 'login' | 'error'
}

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    user: { name: 'John Admin', avatar: undefined },
    action: 'Added new movie',
    resource: 'The Dark Knight Returns',
    timestamp: '2024-01-15T10:30:00Z',
    type: 'create'
  },
  {
    id: '2',
    user: { name: 'Sarah Manager', avatar: undefined },
    action: 'Updated user permissions',
    resource: 'jane@example.com',
    timestamp: '2024-01-15T10:15:00Z',
    type: 'update'
  },
  {
    id: '3',
    user: { name: 'Mike Editor', avatar: undefined },
    action: 'Published blog post',
    resource: '2024 Movie Predictions',
    timestamp: '2024-01-15T09:45:00Z',
    type: 'create'
  },
  {
    id: '4',
    user: { name: 'System', avatar: undefined },
    action: 'Database backup completed',
    resource: 'daily_backup_20240115',
    timestamp: '2024-01-15T09:00:00Z',
    type: 'create'
  },
  {
    id: '5',
    user: { name: 'Lisa Admin', avatar: undefined },
    action: 'Deleted spam review',
    resource: 'Review #12843',
    timestamp: '2024-01-15T08:30:00Z',
    type: 'delete'
  }
]

interface RecentActivityProps {
  showAll?: boolean
}

export function RecentActivity({ showAll = false }: RecentActivityProps) {
  const activities = showAll ? mockActivity : mockActivity.slice(0, 5)

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create':
        return 'bg-green-500'
      case 'update':
        return 'bg-blue-500'
      case 'delete':
        return 'bg-red-500'
      case 'login':
        return 'bg-purple-500'
      case 'error':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create':
        return <Badge variant="default" className="bg-green-500">New</Badge>
      case 'update':
        return <Badge variant="default" className="bg-blue-500">Update</Badge>
      case 'delete':
        return <Badge variant="destructive">Delete</Badge>
      case 'login':
        return <Badge variant="secondary">Login</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback className="text-xs">
                {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div 
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getActivityColor(activity.type)}`}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {activity.user.name}
              </p>
              {getActivityBadge(activity.type)}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {activity.action}: <span className="font-medium">{activity.resource}</span>
            </p>
            
            <p className="text-xs text-muted-foreground">
              {formatDate(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
      
      {!showAll && mockActivity.length > 5 && (
        <div className="text-center">
          <button className="text-sm text-primary hover:underline">
            View all activity
          </button>
        </div>
      )}
    </div>
  )
}