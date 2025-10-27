import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export const metadata: Metadata = {
  title: 'Sign In | CineVerse',
  description: 'Sign in to your CineVerse account to access your favorite movies and shows',
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue watching"
      showAuthLinks={true}
      authLinkText="Don't have an account?"
      authLinkHref="/register"
      authLinkLabel="Sign up"
    >
      <LoginForm />
    </AuthLayout>
  )
}