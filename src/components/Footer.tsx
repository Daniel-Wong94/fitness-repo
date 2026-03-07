import Image from 'next/image'
import { Github, Linkedin } from 'lucide-react'

const LINKS = {
  linkedin:      'https://www.linkedin.com/in/daniel-kachun-wong/',
  github:        'https://github.com/Daniel-Wong94',
  projectGithub: 'https://github.com/Daniel-Wong94/fitness-repo',
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href={LINKS.linkedin} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-colors">
            <Linkedin size={14} />
            <span>LinkedIn</span>
          </a>
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-colors">
            <Github size={14} />
            <span>GitHub</span>
          </a>
          <a href={LINKS.projectGithub} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[var(--accent)] dark:hover:text-[var(--accent)] transition-colors">
            <Github size={14} />
            <span>Source</span>
          </a>
        </div>

        <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer"
          className="opacity-80 hover:opacity-100 transition-opacity">
          <Image
            src="/powered-by-strava-orange.png"
            alt="Powered by Strava"
            width={120}
            height={24}
            className="dark:hidden"
            unoptimized
          />
          <Image
            src="/powered-by-strava-white.png"
            alt="Powered by Strava"
            width={120}
            height={24}
            className="hidden dark:block"
            unoptimized
          />
        </a>
      </div>
    </footer>
  )
}
