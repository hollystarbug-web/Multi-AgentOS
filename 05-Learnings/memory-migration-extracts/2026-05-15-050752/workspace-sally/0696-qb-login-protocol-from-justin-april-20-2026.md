## QB Login Protocol (from Justin — April 20 2026)

**For ANY QuickBooks login issue:**
1. Take a screenshot FIRST
2. INSPECT the image with the `image` tool before doing anything else
3. Look at what's actually on screen before deciding what to click/type
4. If a clickable element is visible → click it; don't guess or try programmatic workarounds

**What went wrong today:**
- Screenshotting but NOT looking at images before acting
- Kept trying programmatic workarounds without visually confirming page state
- Email card click worked — failure to check screenshot made me miss it
- Spent 30+ mins on approaches that were obvious failures if I'd just looked

**Key lesson:** Page was at password step. One click on the email card was all that was needed. Instead tried 6 different programmatic typing approaches that all failed against React's hidden controlled input.

