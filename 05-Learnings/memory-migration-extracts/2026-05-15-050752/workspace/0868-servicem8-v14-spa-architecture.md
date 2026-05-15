### ServiceM8 v14 SPA Architecture
- ServiceM8 is a Sencha ExtJS SPA — URL never changes from `/dashboard` or `/job_dispatch`
- Navigation via JS click on links, not URL changes
- Job detail opens in right panel via internal state/navigation, not URL change
- `s_auth` token must be on every URL for authenticated requests (found in URL after login)
- Session expires: page redirects to marketing site — must re-authenticate
- Session token visible in dispatch board URL: `https://go.servicem8.com/job_dispatch?s_auth=<token>`

