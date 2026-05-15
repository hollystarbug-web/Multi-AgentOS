## QB Login Protocol (from Justin's feedback — April 20 2026)

**For ANY QuickBooks login issue:**
1. ALWAYS take a screenshot FIRST
2. INSPECT the image with the `image` tool before doing anything else
3. Look at what's actually on screen before deciding what to click/type
4. If a clickable element is visible → click it; don't guess or try programmatic workarounds

**What went wrong today:**
- I was screenshotting but NOT looking at the images before acting
- I kept trying programmatic workarounds (JS DOM manipulation, React events) without visually confirming the page state
- The email card click worked — it was my failure to check the screenshot that made me miss it
- Spent 30+ minutes on approaches that would have been obvious failures if I'd just looked at the screen

**Key lesson:** The page was already at the password step. All I had to do was click the email card. One click. Instead I tried 6 different programmatic typing approaches that all failed against React's hidden controlled input.

