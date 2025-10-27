'use client'

import Link from 'next/link'
import { Play, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Episode, EpisodeData } from '@/types'
import { cn } from '@/lib/utils'

interface EpisodeListProps {
  episodes: Episode[]
  movieSlug: string
  selectedEpisode?: EpisodeData
}

export function EpisodeList({ episodes, movieSlug, selectedEpisode }: EpisodeListProps) {
  if (!episodes || episodes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Episodes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={episodes[0]?.server_name || 'server-0'} className="w-full">
          {/* Server Tabs */}
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((server, index) => (
              <TabsTrigger key={index} value={server.server_name || `server-${index}`}>
                {server.server_name || `Server ${index + 1}`}
                <Badge variant="secondary" className="ml-2">
                  {server.server_data.length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Episode Lists */}
          {episodes.map((server, serverIndex) => (
            <TabsContent 
              key={serverIndex} 
              value={server.server_name || `server-${serverIndex}`}
              className="mt-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {server.server_data.map((episode, episodeIndex) => {
                  const isSelected = selectedEpisode?.slug === episode.slug
                  
                  return (
                    <Button
                      key={episodeIndex}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-auto p-3 flex flex-col items-center space-y-2",
                        isSelected && "ring-2 ring-primary"
                      )}
                      asChild
                    >
                      <Link href={`/watch/${movieSlug}?ep=${episode.slug}`}>
                        <div className="flex items-center space-x-1">
                          {isSelected ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          <span className="text-xs font-medium">
                            {episode.name}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">
                            Now Playing
                          </Badge>
                        )}
                      </Link>
                    </Button>
                  )
                })}
              </div>

              {/* Server Info */}
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {server.server_name || `Server ${serverIndex + 1}`}
                  </span>
                  <span className="text-muted-foreground">
                    {server.server_data.length} episodes available
                  </span>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}