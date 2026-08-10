# Better Auth Multi-Session Control

## What

Add Better Auth multi-session support and expose it in the shop dashboard settings security tab.

Shop owners should be able to see the active account sessions stored for the current browser/device, switch to another session, and revoke an inactive session without leaving the security settings area.

## Why

Some shop owners may manage multiple shops or accounts from the same browser. Better Auth's multi-session plugin supports keeping multiple account sessions available locally so users can switch accounts without fully signing out and signing in again.

## Acceptance Criteria

- Better Auth server config registers the multi-session plugin.
- Better Auth browser client registers the multi-session client plugin.
- The shop settings security tab shows device sessions for the current browser/account context.
- The current active session is clearly distinguished from inactive sessions.
- Users can switch to an inactive session from the security tab.
- Users can revoke an inactive device session from the security tab.
- Action feedback is shown for loading, success, and failure states.
- User-facing text is translated in both English and Myanmar message files.
- The implementation does not allow shop owners to manage sessions outside their own authenticated browser context.

## Out of Scope

- Admin-level session management for other users.
- Global "all devices" session management beyond what Better Auth's multi-session plugin provides for device sessions.
- New authentication providers or changes to signup/sign-in UX beyond enabling multi-session behavior.
- Database schema changes unless Better Auth CLI generation reveals they are required.

## Open Questions

- Should the maximum number of stored browser sessions stay at Better Auth's default of 5, or should this project set a custom maximum?
- After switching active sessions, should the UI redirect to `/dashboard-redirect` so the app lands on the switched user's shop, or simply refresh the current route?
