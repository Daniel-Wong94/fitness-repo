import Image from 'next/image'

export function ConnectButton() {
  return (
    <a href="/api/auth/strava" className="inline-block hover:opacity-90 transition-opacity">
      <Image
        src="/btn_strava_connect_orange.svg"
        alt="Connect with Strava"
        width={193}
        height={48}
        priority
      />
    </a>
  )
}
