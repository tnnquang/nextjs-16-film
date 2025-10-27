import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_CONFIG } from '@/lib/constants'

export function createClient() {
  return createBrowserClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
  )
}

// For backward compatibility - you can use this directly in client components
export const supabase = createClient()