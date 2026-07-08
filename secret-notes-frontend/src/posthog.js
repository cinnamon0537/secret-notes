import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
  })
  window.posthog = posthog
  console.log('PostHog initialized with key:', POSTHOG_KEY.substring(0, 8) + '...')
}

export function getFeatureFlag(key) {
  if (!POSTHOG_KEY) return 'control'
  const flag = posthog.getFeatureFlag(key)
  console.log('getFeatureFlag', key, flag)
  return flag || 'control'
}

export function reloadFlags(callback) {
  if (!POSTHOG_KEY) return
  posthog.onFeatureFlags(() => {
    console.log('onFeatureFlags fired')
    callback()
  })
  posthog.reloadFeatureFlags()
}

export function identifyUser(userId) {
  if (POSTHOG_KEY) {
    posthog.identify(userId)
  }
}

export function captureEvent(event, properties) {
  if (POSTHOG_KEY) {
    posthog.capture(event, properties)
  }
}

export default posthog
