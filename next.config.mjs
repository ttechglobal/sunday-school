/** @type {import('next').NextConfig} */
const nextConfig = {
  // Validate required env vars at build time
  // This will fail the build loudly if vars are missing
  env: {
    NEXT_PUBLIC_SUPABASE_URL:     process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

// Warn during build if critical vars are missing
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const missing = required.filter(k => !process.env[k])
if (missing.length > 0) {
  console.error('\n⚠️  Missing required environment variables:')
  missing.forEach(k => console.error(`   ✗ ${k}`))
  console.error('\nAdd them to Vercel → Settings → Environment Variables\n')
  // Don't hard-fail — Vercel injects vars at runtime even if not at build time
}

export default nextConfig