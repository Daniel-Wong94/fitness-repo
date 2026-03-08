import { track } from '@vercel/analytics'

export function trackEvent(name: string, params?: Record<string, string | number>) {
  track(name, params)
}
