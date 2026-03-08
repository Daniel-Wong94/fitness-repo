'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function LandingPageTracker() {
  useEffect(() => {
    trackEvent('landing_page_view')
  }, [])

  return null
}
