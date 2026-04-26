# Platform Console — Test Credentials

## URL
http://localhost:3012

## Primary Admin (SUPER_ADMIN)
Email: kmrjyoti12345@gmail.com
Password: Travvellis@2026
Role: SUPER_ADMIN

## Secondary Admin (ADMIN)
Email: kmrjyoti@gmail.com
Password: Travvellis@2026
Role: ADMIN

## What you can access
- /governance — Overview dashboard
- /governance/partners — Partner list (AIJunction)
- /governance/brands — Brands (Travvellis, CRMSoft Default)
- /governance/crm-editions — CRM Editions (TRAVEL, SOFTWARE, RETAIL)
- /governance/verticals — Industry verticals
- /governance/sub-types — Sub-type hierarchy
- /governance/page-registry — Page registry (466 pages)
- /governance/combined-codes — Saved combined codes
- /governance/combined-codes/builder — Combined Code Builder (hero screen)

## Auth Behavior
- Without login: redirects to /login?returnUrl=<original-path>
- After login: token saved in localStorage (pc_token) + cookie (pc_token)
- Token expiry: 7 days
- Logout: LogOut icon in top-right header clears both storage locations

## Notes
- Token key is `pc_token` (not `accessToken`) to avoid collision with crm-admin on :3005
- Both localStorage AND cookie are required — localStorage for api.ts, cookie for middleware
