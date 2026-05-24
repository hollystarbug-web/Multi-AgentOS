# Adminiserv Vercel DNS Setup — 2026-05-06

## Rule: Add Domain to Vercel Project Before Adding DNS Records

**What:** When adding a custom domain to Vercel via API, you must first run `vercel domains add <domain> <project>` to create the DNS zone before adding A/CNAME records via API. **Why:** Without the zone created first, the API record additions fail silently or are ignored. The domain shows in Vercel dashboard but DNS doesn't resolve. **When:** Every time a new domain is added to the Vercel infrastructure. **Context:** This was discovered when setting up adminiservhk.com and getitsorted.tech on the hollystarbug-8791 Vercel account. Token: `vcp_3TcjvwvedifnQ5OslaesxPIKzWn2OSd3zWwjdc3Hx0szGpH6jR1rJ5gR`. Full documentation: `projects/adminiserv/DNS-SETUP.md`.
