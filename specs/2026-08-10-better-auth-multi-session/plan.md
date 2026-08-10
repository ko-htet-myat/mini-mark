# Better Auth Multi-Session Control Plan

## Files to Modify

- `src/lib/auth.ts`
  - Register `multiSession({ maximumSessions: 5 })` before `nextCookies()`.
- `src/lib/auth-client.ts`
  - Export an `authClient` instance configured with `multiSessionClient()`.
  - Preserve existing named auth exports.
- `src/features/settings/components/settings-form.tsx`
  - Replace the security placeholder with the multi-session security tab.
- `src/features/settings/components/security-settings-tab.tsx`
  - Create a client component that lists device sessions, switches active session, and revokes inactive sessions.
- `messages/en.json`
  - Add security tab copy and feedback translations.
- `messages/mm.json`
  - Add matching Myanmar translations.
- `docs/progress-tracker.md`
  - Record the completed feature after implementation.

## Files to Create

- `src/features/settings/components/security-settings-tab.tsx`
- `specs/2026-08-10-better-auth-multi-session/tasks.md`

## Database Schema Changes

No project Prisma schema change is planned. Better Auth's multi-session plugin stores browser/device session state through its own session/cookie behavior and existing auth endpoints.

## Component Breakdown

- `SecuritySettingsTab`
  - Fetches `authClient.multiSession.listDeviceSessions()` on mount.
  - Displays loading, empty, and error states.
  - Renders each session with user identity, active status, and session metadata when available.
  - Calls `authClient.multiSession.setActive({ sessionToken })` for inactive sessions, then redirects to `/dashboard-redirect`.
  - Calls `authClient.multiSession.revoke({ sessionToken })` for inactive sessions, then refreshes the list.

## Data Flow

1. Better Auth server registers the plugin and exposes multi-session endpoints under `/api/auth`.
2. Better Auth client registers the matching client plugin and exposes `authClient.multiSession`.
3. Security tab loads current browser/device sessions from Better Auth.
4. Switching updates Better Auth's active session cookie, then redirects through dashboard routing.
5. Revoking removes a selected inactive session and reloads the tab state.
