/**
 * Real-time Analytics Dashboard Component
 */

'use client'

import { useRealtimeDashboard } from '@/hooks/use-realtime-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Eye, Activity, TrendingUp, Clock, Zap } from 'lucide-react'

export function RealtimeAnalyticsDashboard() {
  const { metrics, loading, error } = useRealtimeDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || 'Không thể tải dữ liệu'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người xem hiện tại</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.currentViewers}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="animate-pulse">
                LIVE
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng mới</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userEngagement.newUsers}</div>
            <p className="text-xs text-muted-foreground">24 giờ qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userEngagement.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.userEngagement.returningUsers} quay lại
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lỗi</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.systemHealth.errorRate.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Buffer TB: {metrics.systemHealth.avgBufferTime.toFixed(1)}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Movies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Phim đang xem nhiều nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.activeMovies.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              Không có người xem nào hiện tại
            </p>
          ) : (
            <div className="space-y-4">
              {metrics.activeMovies.map((movie, index) => (
                <div
                  key={movie.movie_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {movie.movie_name || `Movie ${movie.movie_id}`}
                      </p>
                      <p className="text-sm text-muted-foreground">ID: {movie.movie_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{movie.viewers}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Hoạt động gần đây (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Không có hoạt động nào</p>
          ) : (
            <div className="space-y-3">
              {metrics.recentActivities.map((activity) => (
                <div
                  key={activity.type}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="font-medium capitalize">{activity.type}</span>
                  <Badge variant="secondary">{activity.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hiệu suất hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Thời gian buffer trung bình</span>
                <span className="text-sm font-bold">
                  {metrics.systemHealth.avgBufferTime.toFixed(2)}s
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (metrics.systemHealth.avgBufferTime / 10) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tỷ lệ lỗi</span>
                <span className="text-sm font-bold">
                  {metrics.systemHealth.errorRate.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metrics.systemHealth.errorRate < 1
                      ? 'bg-green-500'
                      : metrics.systemHealth.errorRate < 5
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.systemHealth.errorRate * 10)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm font-medium">Chất lượng trung bình</span>
              <Badge variant="outline">{metrics.systemHealth.averageQuality}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
