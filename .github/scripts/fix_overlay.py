from pathlib import Path
import sys

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("project")
source = root / "app/src/main/java/com/example/focusfeasibility/AppWatchAccessibilityService.kt"
text = source.read_text(encoding="utf-8")

old = """        if (pkg == packageName || MainActivity.isCriticalPackage(pkg)) {
            removeOverlay()
            return
        }"""
new = """        // Ignore this app's own overlay window events. Removing the overlay
        // on its own event can cause a repeated show/remove flicker loop.
        if (pkg == packageName) return

        if (MainActivity.isCriticalPackage(pkg)) {
            removeOverlay()
            return
        }"""

if old not in text:
    raise SystemExit("Expected original event-handling block was not found; refusing to patch an unexpected source version.")

source.write_text(text.replace(old, new, 1), encoding="utf-8")
print("Patched overlay self-trigger handling.")
