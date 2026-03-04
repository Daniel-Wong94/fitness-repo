import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithRefresh } from '@/lib/auth'
import { fetchClubActivities } from '@/lib/strava'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionWithRefresh()
  if (!session?.access_token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const perPage = 10

  const activities = await fetchClubActivities(session.access_token, params.id, page, perPage)
  return NextResponse.json(activities)
}
