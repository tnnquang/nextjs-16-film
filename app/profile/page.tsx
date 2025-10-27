import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProfileContent } from '@/components/profile/profile-content'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata: Metadata = {
  title: 'My Profile | CineVerse',
  description: 'Manage your profile, preferences, and viewing history',
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner className="h-96" />}>
            <ProfileContent />
          </Suspense>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}