import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export const metadata: Metadata = {
  title: 'Sign Up | CineVerse',
  description: 'Create your CineVerse account and start watching amazing movies and shows',
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join CineVerse and discover amazing movies and shows"
      showAuthLinks={true}
      authLinkText="Already have an account?"
      authLinkHref="/login"
      authLinkLabel="Sign in"
    >
      <RegisterForm />
    </AuthLayout>
  )
}