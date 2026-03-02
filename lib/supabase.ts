import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase client (for Client Components)
// Note: Database generic omitted due to @supabase/ssr 0.5.x / supabase-js 2.98.x type incompatibility
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
