# Regain — Android app blueprint

## Product vision

Regain helps users protect study time by combining awareness (screen-time insights), planning (schedules) and action (temporary app blocking). It is a self-management tool, not a promise to eliminate every possible distraction.

## Platform and interaction decisions

- Platform: Android phone only.
- Preferred implementation: native Android with Kotlin; keep libraries and dependencies minimal until the first build is verified.
- Blocking intensity: normal, user-configurable blocking. Users can enable/disable rules from inside Regain.
- Visual direction: near-black background, rounded charcoal cards, green focus accents, clear typography and accessible contrast, inspired by the user's supplied reference screenshots.
- Data approach for first version: on-device storage by default; no account or cloud sync needed for the MVP.

## Main navigation

### 1. Focus

- Focus timer with common presets and a custom duration.
- Daily focus goal and progress indicator.
- Today screen-time summary split into Distracting, Productive and Others.
- App-by-app usage details and daily/weekly/monthly trends.
- App classification controls: Distracting, Productive, Mixed (user-defined share), Others.
- Be transparent about what is measured: Android usage APIs can show app foreground usage, but cannot reliably infer whether YouTube or a browser was used for studying without a separate user action or content-aware integration.
- First MVP can classify a focus session as a productive time block, but must not mislabel every minute of an app as productive just because it was open during a study session.

### 2. Schedule

- Create, edit and delete a schedule or one-off event.
- Start/end times, selected days, title, optional note and reminder.
- Permission-aware notifications and sensible behavior after device restart.
- Later integration: start a focus timer or enable selected block rules during a schedule.

### 3. Blocks

- Select installed apps to temporarily restrict during a focus session or schedule.
- Daily per-app usage limits, once usage tracking and blocking are implemented and tested together.
- Easy-to-understand enable/disable controls and a clear explanation of required permissions.
- Website/domain blocking is a separate milestone. Evaluate Android VPN-based filtering and user-disconnect behavior before promising website-level enforcement.
- Always include appropriate exceptions for phone, emergency and essential system functions where applicable.

## Technical realities and boundaries

- Usage reporting requires the user to grant Usage Access in Android Settings.
- An ordinary app cannot guarantee tamper-proof blocking. Users may disable permissions, force-stop/uninstall the app, use another device, or bypass filtering. Do not advertise 100% enforcement.
- App blocking may use an Android-specific mechanism such as an AccessibilityService only after policy and user-consent review. Keep the service purpose narrow; do not collect window content or text when package-level detection is sufficient.
- Android version and OEM background restrictions can affect reliability; test on real devices and recover state safely after process death/reboot.
- Notifications and exact alarms depend on Android version and permission behavior.
- Store only data needed for features. Make usage data local by default and provide a clear reset/export decision before launch.
- Do not claim a build passed unless CI or a local Gradle build actually verifies it.

## MVP order

1. Build baseline and navigation shell.
2. Focus timer and local persistence.
3. Usage Access onboarding and usage data with honest empty/error states.
4. App categories and charts (daily and weekly first).
5. Schedule CRUD and reminders.
6. App blocking during an active focus session, with opt-in permission setup and an explanation screen.
7. Daily limits and scheduled blocking.
8. Website blocking investigation and implementation only after the app-blocking flow is stable.

## Acceptance criteria for the first milestone

- Repository contains a reproducible, documented Android build configuration.
- Debug APK can be produced by the build workflow.
- First-run experience does not fail when Usage Access or Accessibility access is denied.
- The user can navigate between Focus, Schedule and Blocks.
- Focus timer can start/end and its state is restored after reopening the app.
- No feature screen displays fabricated usage data.
- Android permission use is explained before linking into Settings.
- Changes are developed on a feature branch and reviewed before merging to main.

## Immediate next work

Inspect the older prototype and build workflow from repository history. Recover useful parts carefully into this branch, modernize the structure in small steps, and establish a repeatable APK build before extending functionality.
