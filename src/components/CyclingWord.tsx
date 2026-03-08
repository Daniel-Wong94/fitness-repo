'use client'

import { useState, useEffect } from 'react'

const WORDS = ['visualized', 'tracked', 'committed', 'pushed', 'approved', 'contributed']

export function CyclingWord() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length)
        setVisible(true)
      }, 300)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className="text-[#FC4C02] inline-block transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      {WORDS[index]}.
    </span>
  )
}
