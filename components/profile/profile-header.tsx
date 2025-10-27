'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, Edit, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

// Mock user data - replace with actual user data from Supabase
const mockUser = {
  id: '1',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  avatar_url: null,
  bio: 'Movie enthusiast and casual viewer. Love action, sci-fi, and thriller movies.',
  member_since: '2023-01-15',
  subscription: 'Premium',
  location: 'New York, USA'
}

export function ProfileHeader() {
  const [isEditing, setIsEditing] = useState(false)

  const memberSince = new Date(mockUser.member_since).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={mockUser.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {getInitials(mockUser.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{mockUser.full_name}</h1>
                <p className="text-muted-foreground">{mockUser.email}</p>
                {mockUser.location && (
                  <p className="text-sm text-muted-foreground">{mockUser.location}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                
                <Button variant="outline" size="sm">
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Bio */}
            {mockUser.bio && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {mockUser.bio}
              </p>
            )}

            {/* Badges and Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                {mockUser.subscription} Member
              </Badge>
              
              <span className="text-muted-foreground">
                Member since {memberSince}
              </span>

              <div className="flex items-center space-x-4 text-muted-foreground">
                <span>127 Movies Watched</span>
                <span>23 Favorites</span>
                <span>8 Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-xs text-muted-foreground">Movies Watched</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">23</div>
              <div className="text-xs text-muted-foreground">Favorites</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">234h</div>
              <div className="text-xs text-muted-foreground">Watch Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">8</div>
              <div className="text-xs text-muted-foreground">Watch Later</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}