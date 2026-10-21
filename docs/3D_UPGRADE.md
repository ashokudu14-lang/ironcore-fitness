# IronCore OS: 3D public-site upgrade

The existing public site now combines an original 3D IronCore sculpture, a dimensional product presentation, and layered interface details. The charcoal/red identity and existing product routes remain. The gym dashboard, authentication services, database queries, and migrations were not replaced by this upgrade. No new dependencies were added; the scene uses the project's existing Three.js installation.

## What changed

- **Hero:** a machined, extruded IronCore I-beam, red orbital ring, metal trim, bolts, lighting, and pedestal, built procedurally from Three.js geometry. The surrounding member/payment cards describe capabilities without inventing customer metrics.
- **Product presentation:** the existing empty-workspace dashboard preview moved into its own section, with restrained CSS perspective, a floor treatment, and small pointer-driven tilt. Its content remains ordinary HTML; mobile and reduced-motion views remain flat and readable.
- **Feature icons:** original layered CSS icons for members, payments, renewals, and overview. No downloaded icon pack or external 3D model is required.
- **Navigation:** a floating public header with product-preview and workflow anchors, retaining the mobile menu and account links.
- **CTA and footer:** dimensional IronCore branding, an additional workspace action, a large footer wordmark, and the existing support/legal destinations.

## Motion, fallbacks, and resource use

The hero scene loads only when the sculpture is visible on an eligible desktop viewport (at least 900 pixels, fine pointer, and no reduced-motion preference). WebGL capability is checked before importing the heavy scene module. Mobile/coarse-pointer, reduced-motion, data-saver, reported device memory below 4 GB, and unavailable WebGL cases retain the static HTML/CSS sculpture. Losing the WebGL context also restores that fallback.

Rendering is capped at approximately **30 frames per second**, with device pixel ratio capped at **1.5**. Pointer response is restrained to a small rotation. Rendering pauses while the sculpture is offscreen or the document is hidden. A keyboard-accessible **Pause motion / Resume motion** control stops and restarts animation; a paused scene still redraws after resizing.

Unmount and eligibility changes cancel animation frames, remove listeners, disconnect observers, dispose geometries/materials/renderer resources, and release the WebGL context. Generation guards prevent late asynchronous initialization after a route or eligibility change. The Three.js scene remains optional and dynamically loaded; it is not introduced into the operational dashboard.

The sculpture and decorative icons are hidden from assistive technology. The heading, product description, CTAs, navigation, and dashboard preview remain accessible HTML. Decorative layers do not capture clicks or replace native scrolling. Reduced motion disables the scene and interactive product tilt.

## Files in this upgrade

| Added | Purpose |
| --- | --- |
| `src/components/three/CoreSculpture.jsx` | Eligibility, static fallback, scene lifecycle, and motion control |
| `src/components/three/createCoreScene.js` | Procedural geometry, lights, renderer, pointer response, and cleanup |
| `src/components/three/ProductStage.jsx` | Layered HTML product preview with limited desktop tilt |
| `src/components/three/DimensionalIcon.jsx` | Shared decorative CSS icon structure |
| `src/styles/dimensional.css` | Public-site 3D styling and responsive/reduced-motion adaptations |
| `tests/e2e/dimensional.spec.js` | WebGL, fallback, motion, navigation, and viewport checks |
| `docs/3D_UPGRADE.md` | This implementation and validation report |

Modified public presentation files: `src/pages/public/HomePage.jsx`, `src/components/marketing/MarketingHeader.jsx`, `src/components/marketing/MarketingFooter.jsx`, and `src/components/marketing/MarketingLayout.jsx`.

## References and asset provenance

The requested references were [Scrolltide](https://www.scrolltide.co/), [Navbar Gallery](https://www.navbar.gallery/), [Footer Design](https://www.footer.design/), [CTA Gallery](https://www.cta.gallery/), [Refero Styles](https://styles.refero.design/), [SupaHero](https://supahero.io/), and [3dicons](https://3dicons.co/). All seven returned proxy CONNECT HTTP 403 in this environment, so their designs could not be inspected. This report does not claim that any particular design from those sites was reproduced.

The sculpture and dimensional icons are original local implementations. No paid resource, remote model, texture, or icon asset was downloaded or embedded for this upgrade.

## Validation and review

- `npm run lint` and `npm run build` passed after implementation.
- The previous application baseline had 70 passing browser tests. The focused WebGL test passed in both browser projects using an explicitly configured desktop context with software WebGL.
- **Final full-suite result: 88 passed.** The expanded desktop/mobile browser suite completed successfully, including the new 3D checks.
- New browser coverage exercises scene creation, pause, paused resizing, reduced-motion changes, route cleanup/recreation, unavailable-WebGL fallback, product links, and layouts at 360, 390, 768, 1024, 1280, and 1440 pixels.

Reproduce browser validation in the current cloud machine:

```sh
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --workers=2
```

Review captures are outside the checkout at `/workspace/onboarding/3d-screenshots/home-1440.png`, `/workspace/onboarding/3d-screenshots/home-390.png`, and `/workspace/onboarding/3d-screenshots/hero-1440.png`. They are local review artifacts, not published pages.

The upgrade has not been pushed, published, or deployed. Existing live Supabase/network limitations remain separate from this public-site presentation work. A target-device performance review and live development-account check remain appropriate before a production release.
