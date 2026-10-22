# Android implementation notes

## Recommended initial stack
- Kotlin + Android SDK.
- Compose or XML views: choose one consistently after recovering the prior prototype and deciding the desired UI fidelity.
- Room for sessions, schedules and user-defined classifications.
- DataStore for simple preferences.
- UsageStatsManager for foreground usage, with explicit Usage Access onboarding.
- WorkManager for reliable deferrable reminders; exact alarm APIs only when needed and allowed.

## Data model (initial proposal)
- `FocusSession(id, startedAt, plannedDurationMs, endedAt, completed, interruptionCount)`
- `ScheduleItem(id, title, startMinute, endMinute, weekdays, date?, enabled, reminderMinutes)`
- `AppClassification(packageName, category, productiveShare, updatedAt)`
- `AppLimit(packageName, dailyLimitMs, enabled, resetZoneId)`
- `BlockRule(id, packageName, trigger, enabled)`
- `UsageBucket(packageName, windowStart, windowEnd, foregroundMs)`

## Analytics integrity
- Raw Android usage data and user annotations should be separate.
- A study session is not proof that all foreground time in a package was educational.
- Use labels such as “tracked foreground time” and “user-marked study session”.
- Mixed classifications should be explicitly configured and identified as estimates unless content-level tracking exists.
- Handle midnight boundaries, timezone changes, missing permission, unavailable history and zero-data days.

## Blocking behavior for MVP
- User selects which apps are distracting.
- User starts a focus session; only selected packages are restricted until session ends.
- Stopping the session disables that temporary rule.
- Permission revoked, service stopped, reboot and force-stop must show a clear status when the app next opens.
- Do not block Phone, emergency, system UI, launcher, Settings or Regain itself by default.
- Avoid strict-mode/device-owner requirements in the initial release.

## Release checklist
- Build from a clean checkout.
- Test on at least one real Android phone and an emulator.
- Test denied/revoked permissions and app process restart.
- Check battery/background behavior on target OEMs.
- Review Accessibility API and package-visibility policies before Play Store distribution.
- Provide clear local-data and permission explanations.
