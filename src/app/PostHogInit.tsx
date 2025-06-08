'use client'

import { useEffect } from 'react'
import { initPostHog, trackPageView } from '../pages/api/analytics'

export function PostHogInit() {
  useEffect(() => {
    initPostHog()
    trackPageView(window.location.href)
  }, [])

  return null
}
