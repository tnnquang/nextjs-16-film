'use client'

import { useState } from 'react'
import { Monitor, Moon, Sun, Volume2, VolumeX, Bell, BellOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

export function UserPreferences() {
  const { toast } = useToast()
  
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    autoplay: true,
    quality: 'auto',
    subtitles: true,
    volume: 75,
    notifications: {
      email: true,
      push: false,
      newMovies: true,
      recommendations: false
    },
    layout: 'grid-3x3',
    maturityRating: 'pg13'
  })

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const updateNotification = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
  }

  const savePreferences = () => {
    toast({
      title: 'Preferences saved',
      description: 'Your preferences have been updated successfully.'
    })
  }

  return (
    <div className="space-y-6">
      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Display & Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={preferences.theme} 
                onValueChange={(value: string) => updatePreference('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={preferences.language} 
                onValueChange={(value: string) => updatePreference('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Movie Grid Layout</Label>
            <Select 
              value={preferences.layout} 
              onValueChange={(value: string) => updatePreference('layout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid-2x2">2x2 Grid</SelectItem>
                <SelectItem value="grid-3x3">3x3 Grid</SelectItem>
                <SelectItem value="grid-4x4">4x4 Grid</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Playback Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Playback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autoplay</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start playing videos when page loads
              </p>
            </div>
            <Switch
              checked={preferences.autoplay}
              onCheckedChange={(checked: boolean) => updatePreference('autoplay', checked === true)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Subtitles</Label>
              <p className="text-sm text-muted-foreground">
                Show subtitles by default
              </p>
            </div>
            <Switch
              checked={preferences.subtitles}
              onCheckedChange={(checked: boolean) => updatePreference('subtitles', checked === true)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Default Quality</Label>
              <Select 
                value={preferences.quality} 
                onValueChange={(value: string) => updatePreference('quality', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="4k">4K</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maturity Rating</Label>
              <Select 
                value={preferences.maturityRating} 
                onValueChange={(value: string) => updatePreference('maturityRating', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">G - General Audiences</SelectItem>
                  <SelectItem value="pg">PG - Parental Guidance</SelectItem>
                  <SelectItem value="pg13">PG-13 - Parents Strongly Cautioned</SelectItem>
                  <SelectItem value="r">R - Restricted</SelectItem>
                  <SelectItem value="nc17">NC-17 - Adults Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Default Volume</Label>
              <span className="text-sm text-muted-foreground">{preferences.volume}%</span>
            </div>
            <div className="flex items-center space-x-4">
              <VolumeX className="h-4 w-4" />
              <Slider
                value={[preferences.volume]}
                onValueChange={(value: number[]) => updatePreference('volume', value[0])}
                max={100}
                step={5}
                className="flex-1"
              />
              <Volume2 className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.notifications.email}
              onCheckedChange={(checked: boolean) => updateNotification('email', checked === true)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
            <Switch
              checked={preferences.notifications.push}
              onCheckedChange={(checked: boolean) => updateNotification('push', checked === true)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-base">Notification Types</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-normal">New Movies</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new movies are added
                </p>
              </div>
              <Switch
                checked={preferences.notifications.newMovies}
                onCheckedChange={(checked: boolean) => updateNotification('newMovies', checked === true)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="font-normal">Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  Receive personalized movie recommendations
                </p>
              </div>
              <Switch
                checked={preferences.notifications.recommendations}
                onCheckedChange={(checked: boolean) => updateNotification('recommendations', checked === true)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} size="lg">
          Save Preferences
        </Button>
      </div>
    </div>
  )
}