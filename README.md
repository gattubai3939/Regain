# Regain Android — Product Blueprint and Build Baseline

This branch begins the recovery and modernization of Regain as an Android-only focus app.

## Current state

The repository's current `main` branch contains no project files. Earlier prototype-generation and APK workflow files existed in commit `b0234b124a5bba0fbf92a23a09e0bec76893592b`, but were subsequently removed. This branch preserves that history and starts with documentation.

## Vision

Regain helps people protect study time through three connected areas:

1. **Focus** — timer, goal, screen-time summary and app-level usage insights.
2. **Schedule** — recurring study sessions and one-off events with reminders.
3. **Blocks** — temporary app restrictions, usage limits and (later) website/domain filtering.

## Decisions

- Android phone only.
- Native Kotlin Android app is the recommended implementation.
- Normal, user-configurable blocking; avoid device-owner/MDM requirements in the first version.
- Dark UI, charcoal cards and green focus accents inspired by the supplied reference screenshots.
- Keep usage and schedule data local by default; no sign-in/cloud requirement for MVP.
- Do not claim distraction can be made literally zero or blocking is impossible to bypass.

## Key technical constraints

- Usage Stats data requires user-granted Usage Access.
- App foreground time does not by itself reveal whether YouTube content was educational or distracting. Use transparent user-selected categories and explicit focus-session context; label estimated split data as estimates.
- App blocking must explain its permissions and behave safely when a permission is denied or revoked.
- AccessibilityService, if chosen for package-level detection, must be narrowly scoped, consent-based and reviewed against Google Play policy before distribution.
- Website/domain blocking is a separate engineering step. VPN-based filtering can be disconnected by the user and conflicts with other VPN usage, so it cannot be guaranteed as tamper-proof.
- Verify compilation and tests through an actual build; never label code as tested without a build result.

## Suggested architecture

- **UI layer:** single activity with three clear navigation destinations, dark design tokens and responsive layouts.
- **Domain layer:** FocusSession, ScheduleItem, AppClassification, AppLimit, BlockRule and UsageSummary models.
- **Storage:** Room for durable structured records (sessions, schedules and classifications); DataStore for simple preferences.
- **Usage reporting:** UsageStatsManager with permission state, time-window normalization and empty/error states.
- **Blocking:** isolated interface for a chosen Android enforcement mechanism so it can be tested independently from UI.
- **Scheduling:** WorkManager for deferrable work; exact alarms only where product behavior genuinely requires exact timing and permissions permit them.
- **Testing:** unit tests for session timing, midnight/day boundaries, weekly schedule recurrence and classification math; device testing for permissions, app transitions, reboot and OEM battery restrictions.

## MVP sequence

1. Establish a real Gradle project and reproducible debug APK build.
2. Create Focus/Schedule/Blocks navigation and matching visual foundation.
3. Implement focus timer with persisted end time and safe restore after process death.
4. Add Usage Access onboarding and real usage totals; no fabricated chart data.
5. Add app classification and daily/weekly analytics.
6. Add schedule creation/editing and reminders.
7. Implement normal app blocking during a focus session and test permission loss/recovery.
8. Add daily app limits; investigate website filtering separately.

## First-milestone acceptance criteria

- A documented Gradle build produces a debug APK.
- No crash or dead-end when optional permissions are declined.
- The three main sections are reachable and understandable.
- Focus timer can start/end and restore state after reopening.
- All analytics originate from usage data or clearly labeled estimates.
- Permission rationale appears before taking the user into Android Settings.
- Changes stay on a feature branch until inspected and then submitted as a PR.

## Next engineering action

Recover the prior prototype only selectively. Prefer real project files over a Python-generated source tree, add the smallest complete native Kotlin project, and establish CI before layering in Usage Stats and blocking.
