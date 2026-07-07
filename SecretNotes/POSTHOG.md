# PostHog

## Usage in the App

- Frontend reads the `ui-theme` feature flag.
- Control variant shows the blue theme.
- Test variant shows the green theme.

## Purpose

- Demonstrate A/B testing and UI toggling without redeploying the app.

## Current Status

- PostHog client integration exists in the frontend.
- The `ui-theme` flag is read on the client to switch between blue and green variants.
- No redeploy is needed to change the active theme once the flag value changes in PostHog.
- Real PostHog project setup is still pending.
