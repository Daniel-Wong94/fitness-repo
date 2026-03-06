'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface TourStep {
  id: string
  name: string
  description: string
  placement: 'bottom' | 'top' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'settings-btn',
    name: 'Settings',
    description: 'Customize your theme, units, and color scheme.',
    placement: 'bottom',
  },
  {
    id: 'avatar-btn',
    name: 'Sign Out',
    description: 'Click your avatar to open the menu and sign out.',
    placement: 'bottom',
  },
  {
    id: 'lifetime-stats',
    name: 'Lifetime Stats',
    description: 'Your all-time training totals. Click on a stat to see your milestones.',
    placement: 'bottom',
  },
  {
    id: 'heatmap',
    name: 'Activity Heatmap',
    description: 'A GitHub-style view of your activity time across the year.',
    placement: 'bottom',
  },
  {
    id: 'pinned-sports',
    name: 'Pinned Sports',
    description: 'Your most active sports. Click any card to dive into that sport.',
    placement: 'bottom',
  },
  {
    id: 'trophy-case',
    name: 'Trophy Case',
    description: 'Milestones and achievements earned from your training.',
    placement: 'bottom',
  },
  {
    id: 'recent-activities',
    name: 'Recent Activities',
    description: 'Browse every activity with pagination and a jump-to-page input.',
    placement: 'left',
  },
]

const PADDING = 6
const TOOLTIP_WIDTH = 288

function getTooltipStyle(
  rect: DOMRect,
  placement: TourStep['placement'],
  tooltipH: number
): React.CSSProperties {
  let top: number
  let left: number

  const centerX = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2

  if (placement === 'bottom') {
    top = rect.bottom + 12
    left = centerX
  } else if (placement === 'top') {
    top = rect.top - tooltipH - 12
    left = centerX
  } else if (placement === 'left') {
    top = rect.top + rect.height / 2 - tooltipH / 2
    left = rect.left - TOOLTIP_WIDTH - 12
  } else {
    top = rect.top + rect.height / 2 - tooltipH / 2
    left = rect.right + 12
  }

  // Clamp horizontally
  left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 8))

  return { top, left }
}

export function TutorialOverlay() {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const [visible, setVisible] = useState(false)
  const [tooltipH, setTooltipH] = useState(160)
  const [tourKey, setTourKey] = useState(0)

  const measureTarget = useCallback((stepIndex: number) => {
    const el = document.querySelector(`[data-tour="${TOUR_STEPS[stepIndex].id}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Slight delay to allow scroll to settle before measuring
    setTimeout(() => {
      setRect(el.getBoundingClientRect())
    }, 300)
  }, [])

  // On mount: check localStorage
  useEffect(() => {
    const seen = localStorage.getItem('strava_tutorial_seen')
    if (seen !== 'true') setVisible(true)

    function handleStartTutorial() {
      setStep(0)
      setRect(null)
      setVisible(true)
      setTourKey((k) => k + 1)
    }
    window.addEventListener('start-tutorial', handleStartTutorial)
    return () => window.removeEventListener('start-tutorial', handleStartTutorial)
  }, [])

  // Re-measure on step change or tour restart
  useEffect(() => {
    if (!visible) return
    measureTarget(step)
  }, [step, visible, measureTarget, tourKey])

  // Re-measure on resize/scroll
  useEffect(() => {
    if (!visible) return

    function remeasure() {
      const el = document.querySelector(`[data-tour="${TOUR_STEPS[step].id}"]`)
      if (el) setRect(el.getBoundingClientRect())
    }

    window.addEventListener('resize', remeasure)
    window.addEventListener('scroll', remeasure, true)
    return () => {
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('scroll', remeasure, true)
    }
  }, [step, visible])

  const finish = useCallback(() => {
    localStorage.setItem('strava_tutorial_seen', 'true')
    setVisible(false)
  }, [])

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      finish()
    }
  }, [step, finish])

  if (!visible || !rect) return null

  const currentStep = TOUR_STEPS[step]
  const tooltipStyle = getTooltipStyle(rect, currentStep.placement, tooltipH)

  return createPortal(
    <>
      {/* Clickable backdrop to skip */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9990 }}
        onClick={finish}
        aria-hidden="true"
      />

      {/* Spotlight highlight */}
      <div
        style={{
          position: 'fixed',
          top: rect.top - PADDING,
          left: rect.left - PADDING,
          width: rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
          borderRadius: 8,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          zIndex: 9998,
          pointerEvents: 'none',
          transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
        }}
      />

      {/* Tooltip card */}
      <div
        ref={(el) => {
          if (el) setTooltipH(el.offsetHeight)
        }}
        style={{
          position: 'fixed',
          zIndex: 9999,
          width: TOOLTIP_WIDTH,
          ...tooltipStyle,
        }}
        className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-xl shadow-2xl p-4"
      >
        <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide mb-1">
          Step {step + 1} of {TOUR_STEPS.length}
        </p>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {currentStep.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {currentStep.description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={finish}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={next}
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            {step === TOUR_STEPS.length - 1 ? 'Done' : 'Next →'}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
