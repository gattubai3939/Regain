# Recovery notes

## Historical prototype

Before the latest cleanup, the repository contained a GitHub Actions workflow that generated a simple native Kotlin Android prototype under `project/` and built a debug APK. The workflow run for commit `b0234b124a5bba0fbf92a23a09e0bec76893592b` completed successfully on 2026-10-22, including the `assembleDebug` and artifact-upload steps.

The generated prototype had:
- A single scrolling screen with a basic focus timer.
- Usage Access settings shortcut and foreground usage summaries.
- An AccessibilityService that returned Home when a selected package opened during an active focus session.
- Package selection and local preferences.

It did **not** implement the full agreed product: three-section navigation, schedules, full historical analytics, robust daily limits, or website blocking. It should be treated as a feasibility prototype, not a production-ready blocker.

## Known limitations to address before reusing its code

- Focus state stored only in preferences; lifecycle, reboot and time-boundary behavior need tests.
- Usage aggregation and productive/distraction split are simplistic and should not be represented as content-level truth.
- Package discovery permission and Google Play policy implications need review.
- Returning Home via accessibility is a basic interruption mechanism, not a tamper-proof operating-system block.
- Website filtering is not implemented.
- The workflow generated project files at build time instead of keeping a normal Android project in source control; the next build baseline should commit the actual Gradle project structure.

## Historical build evidence

Workflow run: https://github.com/gattubai3939/Regain/actions/runs/39768232342

This confirms a debug APK was produced by CI for that historical commit. It does not confirm the current branch builds, and it does not validate runtime behavior on a real phone.
