# IronCore OS design upgrade

The existing React/Vite application now uses a charcoal and red visual system across the public site, authentication, onboarding, and gym workspace. Existing member, payment, renewal, gym, and membership-plan service calls remain in place. All Supabase service and client modules are unchanged. This work prepares a reviewable application change; it does not deploy the site or establish production readiness.

**Audit and implementation plan**

The audit covered the route tree, public and protected pages, Supabase client and service layer, auth/session guards, forms, record lists, styles, motion helpers, package manifests, lockfile, and CI/browser checks. The main presentation problems were inconsistent lime accents, oversized low-density panels, cursor effects that rewrote text nodes, limited mobile navigation, and weak loading/error feedback.

Implementation proceeded through shared tokens and UI primitives, navigation and shell, dashboard, record/form pages, motion integration, responsive/accessibility checks, bundle splitting, and browser review. API shapes and database migrations were not replaced. The router uses React Router's data-router API to support unsaved-change blocking while retaining the existing URLs and route guards.

**What changed**

- Charcoal page/sidebar/card/elevated surfaces, controlled red actions, readable state colors, restrained borders, consistent radii, and locally bundled Manrope/Space Grotesk fonts.
- Fixed desktop sidebar with collapse control, icon navigation, active indicators, account/logout placement, and a native modal drawer on mobile. The top bar provides route context and a member shortcut.
- Compact KPI cards, clear renewal/payment priorities, workspace shortcuts, and a collection-method breakdown derived from the most recent recorded payments.
- Shared member/payment tables with search, filters, sorting, pagination, sticky column headers, keyboard-scrollable table regions, status badges, and empty/no-result states. Payment filtering is explicitly scoped to the most recent 50 loaded records.
- Updated forms with labels, focus styles, busy/disabled states, success/error messages, skeletons, renewal/deactivation confirmations, and unsaved-change protection. Offline status is shown in the workspace.
- Split desktop authentication layout, focused mobile form layout, subtle atmospheric visual, clearer onboarding, and a revised product-focused landing page with a labeled empty-workspace preview.

The dashboard does not invent customer metrics, growth comparisons, attendance, revenue history, or trainer activity. Its overview uses the existing active-member count, current-month payment total, upcoming renewals, and recent payment records. The collection chart is labeled as a breakdown of recent payments. The public preview contains no customer data.

**Motion and selected references**

| Tool | Integration | Restraints and cleanup |
| --- | --- | --- |
| Lenis | [`useLenis.js`](../src/hooks/useLenis.js), mounted by MarketingLayout and AppShell; smooth page scrolling includes long workspace/settings pages. | Touch remains native. Reduced motion disables Lenis and changes are observed. Tables, dialogs, sidebar, selects, textareas, listboxes, and explicitly protected regions retain nested scrolling. Instances and GSAP ticker callbacks are destroyed on cleanup. |
| GSAP + @gsap/react | Landing hero timeline; PageTransition route/card entry; Reveal with ScrollTrigger; MetricCard first-value count-up. | Short opacity/translation sequences, scoped contexts and media queries, teardown on unmount, and no delayed navigation. Lenis scroll events update ScrollTrigger through the same GSAP ticker. Simple hover feedback uses CSS. |
| Vanta NET + Three.js | [`AuthAtmosphere.jsx`](../src/components/motion/AuthAtmosphere.jsx) inside the authentication story panel only. | Both heavy modules load dynamically. Mobile/coarse-pointer, reduced-motion, hidden/offscreen, data-saver, low-memory and unsupported WebGL cases use the static CSS fallback. Mouse/touch/gyro responses are disabled. Instances are destroyed on unmount and eligibility changes; generation guards reject stale asynchronous initialization. |
| React Bits SpotlightCard | [`SpotlightCard.jsx`](../src/components/ui/SpotlightCard.jsx), used on landing feature cards. | Upstream code/dependencies were inspected. The adaptation keeps local pointer-position feedback and removes global listeners, continuous frame loops, noise, flare, and extra dependencies. Reduced motion disables the effect; essential information remains ordinary text. |

React Bits reference: [SpotlightCard](https://reactbits.dev/components/spotlight-card), [source repository](https://github.com/DavidHDev/react-bits). Its notice is retained in [`docs/licenses/react-bits.txt`](licenses/react-bits.txt). The adaptation is used as part of this application, not sold as a component package.

**Performance and accessibility**

Routes, auth/guard/workspace modules, Supabase, and the optional WebGL modules are split into separate bundles. The main entry is approximately **426.81 kB** minified (**143.52 kB gzip**) versus the original approximately **633 kB** entry. These are entry-file figures, not total page transfer or a Lighthouse score. Three.js remains a **606.62 kB** lazy chunk and triggers Vite's size warning; it is not loaded by ordinary dashboard pages. Fonts are served locally, removing Google Fonts network dependence. The old cursor mutation layer, interactions stylesheet, and unused motion presets were removed.

Accessibility work includes reduced-motion handling, semantic tables, sorting state, input labels, visible keyboard focus, skip links, route titles/focus handling, readable button contrast, named icon controls, screen-reader KPI values, status/error announcements, native modal keyboard/focus behavior, and drawer navigation. The sidebar's collapsed controls retain accessible names. Unsaved changes use router navigation blocking plus browser unload and logout guards.

Workspace responsive checks cover 360, 390, 768, 1024, 1280, and 1440 pixels. The additional six-width audit of all six public routes completed without reported browser errors. Screenshots at 390 and 1440 pixels cover home, login, dashboard, members, payments, renewals, settings, and onboarding; home, dashboard, members, auth, settings, and onboarding were visually inspected. These checks do not establish compatibility with every device or assistive technology.

**Validation**

Use the repository's normal workflow:

```sh
npm ci --no-audit --no-fund
npm run build
npm run lint
npm run test:e2e
```

Playwright normally uses its installed Chromium browser (`npx playwright install --with-deps chromium` when needed). In the current cloud machine, use the supplied system browser:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --workers=2
```

The browser config builds on the existing production-preview workflow at port 4173. The application is developed with `npm run dev`.

- `npm ci`, `npm install`, and production build pass. The optional Three.js chunk-size warning remains.
- Lint passes cleanly with zero warnings.
- Dependencies and lockfile were synchronized with npm; browser test packages are declared as development dependencies rather than installed as unpinned CI extras.
- The final desktop/mobile browser run completed: **70 passed in 1.8 minutes**. The unsaved-change case covers links, browser history, and logout in both browser projects.
- Browser coverage includes public pages, console errors, accessibility, overflow, product/legal links, protected-route redirect, reduced motion, record search/filter/sort/pagination, member/payment submissions, renewal confirmation, settings saves, empty/error states, responsive navigation, and unsaved form protection.
- Dashboard tests use isolated network/session fixtures in [`tests/e2e/fixtures/workspace.js`](../tests/e2e/fixtures/workspace.js). These fixtures are never installed into production application logic and do not write records to the live project.
- Vanta was checked in a WebGL-enabled Chromium session: one authentication canvas, no reported page/console errors, zero canvases after enabling reduced motion, and no canvas on the landing page.

Reusable cloud `install_script` and `start_skill` drafts were updated for `npm ci` and the 70-test baseline. Saving those drafts does not execute them or publish the environment; activating the saved environment changes requires review/save/publication in environment settings. The current instance was validated separately.

A live Supabase health request is still blocked by the cloud proxy with HTTP 403. Fixture-based checks do **not** verify live sign-in, email confirmation, database permissions, row-level security, or production network access. No deployment or publication is claimed.

**Files added**

- [`docs/DESIGN_UPGRADE.md`](../docs/DESIGN_UPGRADE.md)
- [`docs/licenses/react-bits.txt`](../docs/licenses/react-bits.txt)
- [`src/app/RouteBehavior.jsx`](../src/app/RouteBehavior.jsx)
- [`src/components/motion/AuthAtmosphere.jsx`](../src/components/motion/AuthAtmosphere.jsx)
- [`src/components/ui/DataTable.jsx`](../src/components/ui/DataTable.jsx)
- [`src/components/ui/Icon.jsx`](../src/components/ui/Icon.jsx)
- [`src/components/ui/MetricCard.jsx`](../src/components/ui/MetricCard.jsx)
- [`src/components/ui/Primitives.jsx`](../src/components/ui/Primitives.jsx)
- [`src/components/ui/SpotlightCard.jsx`](../src/components/ui/SpotlightCard.jsx)
- [`src/hooks/useLenis.js`](../src/hooks/useLenis.js)
- [`src/hooks/useUnsavedChanges.js`](../src/hooks/useUnsavedChanges.js)
- [`tests/e2e/fixtures/workspace.js`](../tests/e2e/fixtures/workspace.js)
- [`tests/e2e/workspace.spec.js`](../tests/e2e/workspace.spec.js)

**Files modified**

- [`.github/workflows/phase2-checks.yml`](../.github/workflows/phase2-checks.yml)
- [`.gitignore`](../.gitignore)
- [`index.html`](../index.html)
- [`package-lock.json`](../package-lock.json)
- [`package.json`](../package.json)
- [`playwright.config.js`](../playwright.config.js)
- [`public/favicon.svg`](../public/favicon.svg)
- [`src/App.jsx`](../src/App.jsx)
- [`src/components/app/AppShell.jsx`](../src/components/app/AppShell.jsx)
- [`src/components/marketing/DashboardPreview.jsx`](../src/components/marketing/DashboardPreview.jsx)
- [`src/components/marketing/MarketingFooter.jsx`](../src/components/marketing/MarketingFooter.jsx)
- [`src/components/marketing/MarketingHeader.jsx`](../src/components/marketing/MarketingHeader.jsx)
- [`src/components/marketing/MarketingLayout.jsx`](../src/components/marketing/MarketingLayout.jsx)
- [`src/components/motion/PageTransition.jsx`](../src/components/motion/PageTransition.jsx)
- [`src/components/motion/Reveal.jsx`](../src/components/motion/Reveal.jsx)
- [`src/main.jsx`](../src/main.jsx)
- [`src/pages/auth/AuthPage.jsx`](../src/pages/auth/AuthPage.jsx)
- [`src/pages/auth/OnboardingPage.jsx`](../src/pages/auth/OnboardingPage.jsx)
- [`src/pages/dashboard/DashboardPage.jsx`](../src/pages/dashboard/DashboardPage.jsx)
- [`src/pages/dashboard/MembersPage.jsx`](../src/pages/dashboard/MembersPage.jsx)
- [`src/pages/dashboard/PaymentsPage.jsx`](../src/pages/dashboard/PaymentsPage.jsx)
- [`src/pages/dashboard/RenewalsPage.jsx`](../src/pages/dashboard/RenewalsPage.jsx)
- [`src/pages/dashboard/SettingsPage.jsx`](../src/pages/dashboard/SettingsPage.jsx)
- [`src/pages/public/HomePage.jsx`](../src/pages/public/HomePage.jsx)
- [`src/styles/globals.css`](../src/styles/globals.css)
- [`src/styles/tokens.css`](../src/styles/tokens.css)
- [`tests/e2e/public.spec.js`](../tests/e2e/public.spec.js)

**Files deleted**

- `src/components/motion/CursorInteractionLayer.jsx`
- `src/motion/presets.js`
- `src/styles/interactions.css`

**Remaining work and recommended next steps**

1. Enable the designated Supabase project's network access and validate sign-in, onboarding, member/payment/renewal flows, owner/staff permissions, and RLS with a designated development account and project. Do not use production customer records for that validation.
2. Test representative real data volumes and complete a device/assistive-technology review before release. The browser fixtures demonstrate UI behavior, not backend guarantees.
3. Measure route-level performance on target mobile hardware. Consider replacing the optional Vanta atmosphere with the existing static fallback if download/GPU cost outweighs its value.
4. Add attendance or trainer modules only when their actual data model and workflows are implemented. Historical revenue analytics and comparisons need sufficient real dated records and explicit aggregation scope.
