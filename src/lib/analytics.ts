declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}

type EventMap = {
  landing_page_view: undefined
  connect_strava: undefined
  view_demo: undefined
  open_info_modal: undefined
  view_activity_detail: { sport_type: string }
}

type EventName = keyof EventMap

export function trackEvent<T extends EventName>(
  name: T,
  ...args: EventMap[T] extends undefined ? [] : [params: EventMap[T]]
): void {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, args[0])
}
