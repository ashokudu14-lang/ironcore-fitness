# IronCore OS motion upgrade

The public website now has a coordinated launch sequence, restrained cursor interaction, and additional scroll motion. The existing 3D sculpture, product routes, Supabase services, and operational dashboard remain in place. No new animation dependency was added.

## Launch and page entry

A short branded launch panel plays on the first eligible homepage visit in a session, followed by the headline, product copy, actions, sculpture, and floating cards. The panel is decorative, hidden from assistive technology, and does not intercept clicks or trap focus. Pointer or keyboard input dismisses it and completes the hero entry immediately. A timer and CSS fallback prevent the panel from remaining visible if the animation is interrupted.

Direct hash navigation and reduced motion skip the launch panel. Session storage records that it has played; an in-memory fallback handles unavailable storage. GSAP cleanup reverts entry styles during unmount and React StrictMode reinitialization.

## Cursor and hover interaction

Fine-pointer visitors retain the native cursor and receive a small decorative follower. It expands over actual links and buttons, while noninteractive cards remain ordinary content. Primary buttons and the footer action move by a few pixels toward the pointer; feature cards receive limited perspective tilt. A subtle light follows the pointer in the hero.

Inputs, textareas, selects, editable regions, dialogs, listboxes, and disabled controls are excluded. Cursor animation stops after settling and hides on keyboard input, blur, visibility loss, excluded targets, and unmount. Listeners and animation frames are removed during cleanup. Pointer effects do not rewrite text nodes.

## Scroll motion

GSAP adds a staged product-preview entrance, a staggered capability strip, and a dimensional CTA reveal alongside the existing section reveals. Lenis continues to provide page scrolling and ScrollTrigger synchronization. Pointer translation uses separate CSS variables so button hover feedback and scroll/entry transforms do not compete for the same transform property.

Interactive and essential text entrances use translation rather than opacity fades to preserve readable contrast while entering. Decorative elements may fade.

## Accessibility and touch

Reduced motion bypasses the launch sequence and disables the cursor, magnetic movement, card tilt, and authored motion. Touch and coarse-pointer devices retain native interaction without the follower. The heading, calls to action, navigation, forms, and product preview remain semantic HTML; decorative layers use `aria-hidden` and do not intercept pointer input.

## Files

Added:

- `src/components/motion/LaunchIntro.jsx`
- `src/components/motion/PublicInteractions.jsx`
- `src/lib/launchSession.js`
- `src/styles/public-motion.css`
- `docs/MOTION_UPGRADE.md`

Integration changes are in `src/pages/public/HomePage.jsx` and `src/components/marketing/MarketingLayout.jsx`. Browser coverage supplements the existing application and 3D checks.

## Verification

Lint and the production build passed during implementation. The expanded browser coverage includes launch completion and dismissal, session behavior, pointer feedback, working navigation, media-preference changes, mobile behavior, and route cleanup, alongside the existing application tests.

The complete desktop/mobile suite passed all 104 checks. After the stationary-pointer scroll-exclusion adjustment, all 16 focused motion checks passed again, and lint and the production build remained clean. The build retains the existing size advisory for the optional Three.js chunk.

```sh
npm run lint
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --workers=2
```

Implementation and validation do not themselves publish the website. Deployment status must be confirmed separately against the new release.
