import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function POST() {
  const session = await getSession()
  const accessToken = session.access_token

  if (accessToken) {
    const res = await fetch('https://www.strava.com/oauth/deauthorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: accessToken,
      }).toString(),
    })

    if (!res.ok) {
      console.error('Failed to deauthorize Strava access token')
    }
  }

  await session.destroy()

  return NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000')
  )
}