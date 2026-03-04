import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const redirectUri = `${baseUrl}/api/auth/callback`

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,profile:read_all,activity:read_all',
  })

  return NextResponse.redirect(
    `https://www.strava.com/oauth/authorize?${params.toString()}`
  )
}
