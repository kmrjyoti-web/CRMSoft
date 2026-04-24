# Customer Demo Walkthrough Script — Apr 26, 2026

**Duration:** 25–30 minutes
**Audience:** Customer + Customer's technical contact
**Format:** Screen share — VS Code + terminal + browser
**Tone:** Confident, numbers-driven, solution-first

---

## Pre-Demo Setup (5 min before call)

```bash
# 1. Open VS Code with project root
code ~/GitProject/CRM/CrmProject

# 2. Open integrated terminal in VS Code

# 3. Pre-run brand demo so it's cached
./scripts/brand-demo.sh

# 4. Open browser tabs:
#    - https://github.com/kmrjyoti-web/CRMSoft
#    - https://github.com/kmrjyoti-web/CRMSoft/pulls
#    - https://github.com/kmrjyoti-web/CRMSoft/pull/30
```

---

## Opening (2 min)

> "Namaste [Customer Name],
>
> Aapne pichhle call mein kaha tha — proper structure chahiye, developer time waste ho raha hai, code scattered hai.
>
> Hum ne 72 hours mein complete V6 architecture deliver ki hai.
> Aaj exactly dikhata hoon kya deliver kiya."

---

## Section 1: The Problem We Solved (3 min)

**Show in VS Code sidebar — OLD state (describe verbally or screenshot):**

> "Pehle tha — customer/, vendor/, shared/, whitelabel/ — sab root mein scattered.
> Koi structure nahi tha. Developer ko pata nahi tha kahan kya hai."

**Now show current project root in VS Code:**

> "Ab sirf 5 clean categories:
> - `core/` — Platform ka dil (Kumar ka protected zone)
> - `verticals/` — Industry-wise organization
> - `partner-customizations/` — Har partner ka alag space
> - `brands/` — White label theming
> - `apps/` — Executable applications
>
> Root mein 21 folders the — ab 13. Clean, professional, enterprise-grade."

---

## Section 2: Real Code, Not a Skeleton (5 min)

**Open `verticals/general/modules/` in VS Code explorer:**

> "Yeh dekho — yeh empty skeleton nahi hai. REAL production code hai."

**Expand `crm/src/modules/` — show folders:**

> "`leads/`, `contacts/`, `organizations/`, `activities/`, `tasks/`, `follow-ups/` —
> yeh wahi code hai jo 2 months mein banaya tha. Ab proper vertical mein organized hai."

**Open `leads/leads.module.ts` — show the NestJS code:**

> "Real NestJS module. Commands, queries, controllers, repositories — sab kuch.
> V6 path par move ho gaya hai."

**Run in terminal:**

```bash
find verticals/general/modules -name "*.ts" | wc -l
```

> "1,725 TypeScript files. Sab V6 path par."

```bash
find verticals/general/modules -name "*.ts" -exec wc -l {} + | tail -1
```

> "108,000+ lines of real business logic — properly organized."

**Show `accounting/src/modules/` folder:**

> "Accounting — 12 modules: accounts, payment, quotations, sales, procurement, approvals..."

**Show `inventory/src/modules/`:**

> "Inventory — 7 modules: products, pricing, tax, units, price-lists, manufacturers."

---

## Section 3: Workspace Packages (3 min)

**Open `verticals/general/modules/crm/package.json`:**

> "Har module group ab proper npm package hai:
> - `@crmsoft/gv-crm`
> - `@crmsoft/gv-accounting`
> - `@crmsoft/gv-inventory`
> - `@crmsoft/gv-communication`
> - `@crmsoft/gv-platform`
>
> Aur sab ek `@crmsoft/vertical-general` package mein wire hue hain."

**Open `verticals/general/package.json`:**

> "Root package. Future mein:
> - New partner → alag folder, alag package
> - New vertical → same pattern, sirf copy karo template
> - Deploy per module → independent versioning
> - Update karo sirf jo chahiye — baaki safe"

---

## Section 4: Live Brand Demo (5 min)

**Run in terminal:**

```bash
./scripts/brand-demo.sh
```

> "Watch karo — SAME codebase se teen alag brands:"

**When output shows:**

> "CRMSoft brand — aapka default.
> Travel Partner brand — sky blue theme, travel fonts, travel logo placeholder.
> Electronic Partner brand — crimson theme, tech fonts, different spacing.
>
> Yeh multi-tenant white label hai — one git push, multiple deployments.
> Har partner ka alag URL, alag look, same platform."

**Show `brands/partner-travel-1-brand/theme/variables.css` and `brands/partner-electronic-1-brand/theme/variables.css`:**

> "62 CSS variables — colors, fonts, spacing, border-radius.
> Partner ka designer sirf yeh file change karta hai. Core code UNTOUCHED."

---

## Section 5: Access Control (3 min)

**Open `.github/CODEOWNERS` in VS Code:**

> "CI/CD automatically enforce karta hai access control:
> - `core/` → Sirf Kumar approve kar sakta hai
> - `verticals/travel/` → Travel team
> - `partner-customizations/partner-x/` → Sirf us partner ka dev
> - `brands/` → Design team
>
> Partner A accidentally partner B ka code touch nahi kar sakta.
> CI block kar dega. No human supervision needed."

---

## Section 6: 13 PRs in 72 Hours (3 min)

**Open browser → GitHub PR list:**

> "13 PRs in 72 hours — 5 developers parallel execute kar rahe the.
>
> - PR #18: Backend core package
> - PR #19, #20, #23, #24: 7 frontends migrated
> - PR #22: CI/CD + 65 integration tests
> - PR #27: Brand demo system
> - PR #29: Visual cleanup
> - PR #30: **108,000 lines of real code migrated** ← yeh dekho"

**Click PR #30:**

> "Sirf ek PR mein — 1,725 files changed, 108,703 lines added.
> Real production code. Properly organized."

---

## Section 7: Customer X Is Safe (2 min)

> "Aur yeh sab 72 hours mein kiya — Customer X Apr 28 launch ko ZERO touch karke.
>
> `apps-backend/` — unchanged, functional
> `release/customer-x-2026-04-28` — untouched
> Production — stable throughout
>
> Architecture migration aur live customer delivery — parallel mein."

---

## Section 8: Timeline Forward (3 min)

> "**Apr 28:** Customer X launches safely from current backend
>
> **Week 1 May:** V6 full compilation wire-up + Travel/Electronic integration
>
> **Week 2–3 May:** Full testing, CI/CD deployment pipeline
>
> **End of May:** Production on V6 — scale ready for 10+ partners
>
> Jab bhi aap ready ho — hum deploy kar dete hain."

---

## Closing (1 min)

> "Summary:
>
> - Proper structure — DELIVERED
> - Real code migration — 108,000 lines
> - Developer efficiency — 13 PRs in 4 days, 5 devs parallel
> - Partner isolation — ENFORCED by CI
> - Brand white label — LIVE demo just ran
> - Customer X — ZERO risk
>
> Aapne bola tha — hum ne deliver kiya."

---

## Q&A Preparation

### Q: "72 hours mein yeh sab kaise possible tha?"

> "Clear architecture vision + 5 developers parallel + automation.
> Hum ne pehle plan kiya, phir execute kiya. No wasted time."

### Q: "Travel aur Electronic kab integrate hoga?"

> "Week 1 of May. Code + scripts ready hain. Bas aap repo URLs share karo — 2-3 din mein done."

### Q: "Production deployment kab?"

> "End of May. Apr 28 Customer X current backend se safely launches. V6 fully activate May mein."

### Q: "Agar kuch tuta to?"

> "Rollback anytime. Backup tags har major step pe create kiye. Customer X branch completely isolated. Hamare paas zero-risk rollback hai."

### Q: "Doosre partners kaise onboard karenge?"

> "`partner-customizations/` mein naya folder, `brands/` mein naya theme — template ready hai. 1 day setup."

### Q: "AI integration kab?"

> "Foundation ready hai `core/ai-engine/` mein. May–June mein actively build karenge. OpenAI/Anthropic/Gemini — swappable architecture."

### Q: "Yeh architecture sustainable hai?"

> "Yeh Shopify, Salesforce AppExchange, Microsoft Dynamics — inhi ka pattern hai. Enterprise-proven. Scale ke liye built."

### Q: "Cost of future development?"

> "Significantly lower. Partner A ka code partner B ko affect nahi karta. Parallel development possible. Testing isolated. No stepping on each other's toes."

---

## Demo Day Checklist

**1 hour before:**
- [ ] `pnpm install` run (just in case)
- [ ] `./scripts/brand-demo.sh` tested
- [ ] VS Code opened with project
- [ ] Browser tabs pre-loaded
- [ ] CUSTOMER_DEMO_ONEPAGER.md ready to share via chat/email

**During demo:**
- [ ] Screen share tested (share entire screen, not just window)
- [ ] Notifications turned off
- [ ] Microphone tested

**Statistics to remember:**
- 72 hours
- 13 PRs
- 1,725 files
- 108,000 lines
- 5 developers
- 11 workspace packages
- 65 tests
- 0 production breaks
