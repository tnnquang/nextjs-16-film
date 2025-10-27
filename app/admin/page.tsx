import { Suspense } from 'react'
import { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminLayout } from '@/components/admin/admin-layout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata: Metadata = {
  title: 'Admin Dashboard | CineVerse',
  description: 'Admin dashboard for managing movies, users, and analytics',
}

export default function AdminPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingSpinner className="h-96" />}>
        <AdminDashboard />
      </Suspense>
    </AdminLayout>
  )
}