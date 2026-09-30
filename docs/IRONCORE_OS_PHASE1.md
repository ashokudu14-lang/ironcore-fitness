# IronCore OS Phase 1 Architecture

Status: COMPLETE

## 1. Product definition

IronCore OS is gym management software for independent and small to medium gym operators.

Core promise:

> Manage members, payments, and renewals in one place.

The MVP focuses on the daily operational work that directly affects revenue collection and member retention.

## 2. Current repository audit

Repository: `ashokudu14-lang/ironcore-fitness`

Current stack:
- React 19
- Vite 8
- Motion for React
- Custom CSS
- Vercel serverless API route for enquiry email
- Resend integration

Current strengths:
- Existing fitness brand and visual direction
- Responsive marketing site foundation
- Working favicon
- Existing reduced motion CSS
- Existing serverless API pattern
- Existing deployment workflow

Current structural issues:
- Most UI lives in one large `src/App.jsx` file
- Global CSS is large and mixes many unrelated sections
- The current app is a portfolio marketing site, not a multi-tenant application
- No auth, database, protected routes, or gym scoped data model

Current design conflicts with the IronCore OS rules:
- Current CSS uses three typefaces. IronCore OS will use at most two.
- Current code contains cursor driven image movement. This must be removed.
- Current headline motion uses blur. Motion must use only transform and opacity.
- Current motion presets use spring and scale effects that are more expressive than the requested restrained motion system.
- Current content includes testimonials and numerical social proof that must not be reused unless verified as real.
- A separate transformation showcase includes values such as +42%, 90 DAYS, and 500+. It must not be used as product proof.
- Privacy Policy and Terms pages are missing.
- The current marketing copy describes a fitness website concept, not gym software.
- Existing remote stock photography will not be treated as customer supplied photography.

## 3. Framework decision

For the fastest MVP, keep React + Vite.

Do not migrate to Next.js during the MVP.

Reason:
- The current frontend already works.
- Vite is sufficient for a protected SaaS dashboard.
- Supabase provides auth and database services.
- React Router provides public and protected application routing.
- Avoiding a framework migration reduces risk and speeds up product delivery.

Revisit Next.js only if later requirements make server rendering, advanced SEO, or server heavy application logic important.

## 4. Target architecture

```
src/
  app/
    AppRouter.jsx
    ProtectedRoute.jsx

  pages/
    public/
      HomePage.jsx
      PricingPage.jsx
      PrivacyPage.jsx
      TermsPage.jsx

    auth/
      LoginPage.jsx
      SignupPage.jsx
      OnboardingPage.jsx

    dashboard/
      DashboardPage.jsx
      MembersPage.jsx
      MemberDetailPage.jsx
      PaymentsPage.jsx
      RenewalsPage.jsx
      SettingsPage.jsx

  components/
    ui/
      Button.jsx
      Card.jsx
      Input.jsx
      Select.jsx
      Modal.jsx
      Table.jsx
      EmptyState.jsx
      StatCard.jsx

    marketing/
      MarketingHeader.jsx
      Hero.jsx
      FeatureBento.jsx
      HowItWorks.jsx
      PricingPreview.jsx
      MarketingFooter.jsx

    app/
      AppShell.jsx
      Sidebar.jsx
      Topbar.jsx
      MemberForm.jsx
      PaymentForm.jsx
      RenewalList.jsx

  lib/
    supabase.js
    auth.js
    dates.js
    money.js
    validation.js

  services/
    members.js
    plans.js
    subscriptions.js
    payments.js
    reminders.js

  styles/
    tokens.css
    globals.css
    motion.css

  motion/
    presets.js
```

## 5. Required pages

Public:
- Home
- Pricing
- Privacy Policy
- Terms and Conditions

Auth:
- Log in
- Sign up
- Gym onboarding

Protected app:
- Dashboard
- Members
- Member detail
- Payments
- Renewals
- Settings

Later:
- Trainers
- Reports
- Messaging
- Multi-branch management
- AI assistant

## 6. Database model

Supabase PostgreSQL will be the source of truth.

### gyms

- id uuid primary key
- name text
- slug text unique
- timezone text
- currency text
- created_at timestamptz

### gym_users

Maps authenticated users to gyms.

- id uuid primary key
- gym_id uuid references gyms
- user_id uuid references auth.users
- role text
- created_at timestamptz

Roles for MVP:
- owner
- staff

### members

- id uuid primary key
- gym_id uuid references gyms
- full_name text
- phone text
- email text nullable
- status text
- joined_at date
- notes text nullable
- created_at timestamptz
- updated_at timestamptz

### membership_plans

- id uuid primary key
- gym_id uuid references gyms
- name text
- duration_days integer
- price numeric
- active boolean
- created_at timestamptz

### subscriptions

Represents one member membership period.

- id uuid primary key
- gym_id uuid references gyms
- member_id uuid references members
- plan_id uuid references membership_plans
- start_date date
- end_date date
- status text
- price_snapshot numeric
- created_at timestamptz

### payments

- id uuid primary key
- gym_id uuid references gyms
- member_id uuid references members
- subscription_id uuid references subscriptions nullable
- amount numeric
- method text
- paid_at timestamptz
- reference text nullable
- notes text nullable
- created_at timestamptz

### reminders

- id uuid primary key
- gym_id uuid references gyms
- member_id uuid references members
- subscription_id uuid references subscriptions
- channel text
- scheduled_for timestamptz
- sent_at timestamptz nullable
- status text
- created_at timestamptz

## 7. Multi-tenant security

Every business record contains `gym_id`.

Supabase Row Level Security must be enabled on all tenant data tables.

A logged in user may only read or mutate rows where their `user_id` has a matching row in `gym_users`.

No tenant data query should depend only on frontend filtering.

## 8. MVP workflows

### Owner onboarding

```
Sign up
  -> Create gym
  -> Choose currency and timezone
  -> Create first membership plan
  -> Enter dashboard
```

### Add member

```
Members
  -> Add member
  -> Select plan
  -> Set start date
  -> Calculate end date
  -> Save member and subscription
```

### Record payment

```
Member detail
  -> Record payment
  -> Enter amount and method
  -> Save
  -> Dashboard totals update
```

### Renewal

```
Renewals
  -> Show expiring memberships
  -> Open member
  -> Renew plan
  -> Create new subscription period
  -> Record payment if collected
```

## 9. Dashboard MVP

Dashboard should show real data only:

- Active members
- Expiring in 7 days
- Expired memberships
- Revenue this month
- Recent payments
- Upcoming renewals

No fabricated growth percentages, counters, ratings, reviews, or customer logos.

## 10. Design system

### Palette

Light:
- Background: `#F4F0E8`
- Surface: `#ECE7DC`
- Primary text: `#171713`
- Muted text: `#67665F`
- Dominant brand: `#1D2B23`
- Accent: `#C7FF42`
- Border: `#D7D1C5`

Dark:
- Background: `#10130F`
- Surface: `#171B16`
- Primary text: `#F1EEE6`
- Muted text: `#A7A49C`
- Dominant brand: `#DDE8DF`
- Accent: `#C7FF42`
- Border: `#2B3029`

No pure white background.
No purple gradients.

### Typography

Maximum two typefaces:
- Fraunces Variable for large expressive marketing headings
- Inter Variable for UI, body, forms, tables, and labels

Dashboard typography should prioritize clarity over decoration.

### Shape

Buttons:
- Rectangle with modest radius
- Target radius: 8px
- Never pill shaped

Cards:
- 12px to 18px radius depending on scale

Inputs:
- 8px radius

### Layout

Marketing pages:
- Generous whitespace
- Bento grids where content benefits from grouped cards
- Strong hierarchy
- Clear product UI previews
- Avoid decorative clutter

App pages:
- Dense enough for operations
- Clear tables and filters
- Responsive card fallbacks on narrow screens

## 11. Motion system

Use Motion for React only where useful.

Allowed animation properties:
- opacity
- transform

Hero:
- Soft fade and rise
- Stagger by line
- Total intro under 800ms

Section reveal:
- opacity 0 to 1
- translateY approximately 16px to 24px
- play once

Hover:
- 150ms to 300ms
- ease-out
- small transform only

Page transition:
- 150ms to 300ms
- opacity plus small translate

Remove:
- cursor driven effects
- blur animation
- scroll progress decoration
- parallax
- magnetic cursor effects
- looping motion
- flashy spring effects

Respect `prefers-reduced-motion`.

## 12. Product copy rules

Hero must say what the product does and who it is for.

Approved direction:

> Manage your gym members, payments, and renewals in one place.

Supporting direction:

> IronCore OS gives independent gym owners a clear view of who is active, who is due to renew, and what has been paid.

Avoid:
- elevate
- unlock
- seamless
- future of fitness
- transform your business
- vague claims
- invented proof

## 13. Photo and visual policy

Do not use generated lifestyle photography.

For the MVP marketing site:
- Prefer clean product UI screenshots and interface mockups.
- If photography is needed, use real photos supplied by the product owner.
- Until then, use clearly labeled placeholders where appropriate.

## 14. Launch gate

Do not call IronCore OS launch-ready until every item below is verified.

- [ ] Custom domain connected
- [x] Favicon exists in current repository, but final IronCore OS favicon still needs design review
- [x] No "Made with AI" tag found in current source
- [ ] Privacy Policy page implemented
- [ ] Terms and Conditions page implemented
- [ ] Privacy and Terms linked in footer
- [ ] Production auth configured
- [ ] Production Supabase project configured
- [ ] Row Level Security verified
- [ ] Responsive checks complete
- [ ] Accessible contrast verified
- [ ] Keyboard navigation verified
- [ ] Reduced motion verified
- [ ] No console errors
- [ ] Production build passes
- [ ] Performance check passes
- [ ] Empty, loading, error, and success states implemented
- [ ] Real data only in proof and metric areas

## 15. Reuse versus rebuild

Reuse:
- Brand name IronCore
- General fitness positioning
- Existing favicon as temporary asset
- Vite setup
- React foundation
- Motion dependency
- Existing Vercel serverless pattern if needed
- Some responsive CSS concepts

Rebuild:
- Navigation
- Hero
- Marketing copy
- Feature sections
- Buttons
- Motion presets
- App shell
- Routing
- Forms
- Data tables
- Authentication
- Dashboard
- Member system
- Payment system
- Renewal system
- Footer

Do not reuse:
- Fictional testimonials
- Fictional metrics
- Cursor movement
- blur based animations
- portfolio enquiry workflow as the core product flow
- current stock-photo heavy hero treatment

## 16. Phase 2 build order

1. Refactor app shell and routing
2. Add design tokens and new global styling
3. Replace motion presets
4. Create public Home, Pricing, Privacy, and Terms routes
5. Add Supabase client
6. Create database schema and Row Level Security
7. Add sign up, log in, and onboarding
8. Build dashboard shell
9. Build members CRUD
10. Build membership plans and subscriptions
11. Build payments
12. Build renewals
13. Add responsive and accessibility pass
14. Run production QA

## Phase 1 conclusion

The existing project is useful as a brand and frontend starting point, but should not be expanded by adding SaaS features directly into the current `App.jsx`.

The fastest safe path is to keep React + Vite, restructure the app, add React Router and Supabase, then build a small multi-tenant MVP around members, payments, and renewals.
