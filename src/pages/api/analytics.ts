// lib/analytics.ts
import posthog from 'posthog-js'
import { PostHogConfig } from 'posthog-js'

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

let posthogInitialized = false

export const initPostHog = (config?: Partial<PostHogConfig>) => {
  if (!posthogInitialized && POSTHOG_API_KEY) {
    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      loaded: () => console.log('✅ PostHog initialized'),
      ...config,
    })
    posthogInitialized = true
  }
}

export const trackEvent = (
  event: string,
  properties?: Record<string, any>
): void => {
  if (!posthogInitialized) return
  posthog.capture(event, {
    ...properties,
    $timestamp: new Date().toISOString(),
  })
}

export const identifyUser = (
  userId: string,
  userProperties?: Record<string, any>
) => {
  if (!posthogInitialized) return
  posthog.identify(userId, userProperties)
}

export const trackPageView = (url: string) => {
  if (!posthogInitialized) return
  posthog.capture('$pageview', { $current_url: url })
}
