import Link from 'next/link'
import Image from 'next/image'
import { Film } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  showAuthLinks?: boolean
  authLinkText?: string
  authLinkHref?: string
  authLinkLabel?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showAuthLinks = false,
  authLinkText,
  authLinkHref,
  authLinkLabel
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Film className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">CineVerse</span>
            </Link>
          </div>

          {/* Auth Card */}
          <Card>
            <CardHeader className="space-y-1 text-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>

          {/* Auth Links */}
          {showAuthLinks && authLinkText && authLinkHref && authLinkLabel && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">{authLinkText} </span>
              <Link 
                href={authLinkHref} 
                className="font-medium text-primary hover:underline"
              >
                {authLinkLabel}
              </Link>
            </div>
          )}

          {/* Footer Links */}
          <div className="text-center text-xs text-muted-foreground space-x-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/help" className="hover:underline">Help</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Optional: Add a hero image */}
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-6">
            <h2 className="text-4xl font-bold">
              Welcome to CineVerse
            </h2>
            <p className="text-xl text-gray-200">
              Your ultimate destination for streaming the latest movies and TV shows
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-gray-300">Movies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5K+</div>
                <div className="text-sm text-gray-300">TV Shows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-sm text-gray-300">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}