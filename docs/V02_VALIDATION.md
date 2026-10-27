# v0.2 staged validation

## Stage 1 — deployment and viewport baseline

Deployed tested main source `f8aa5b3135fb5fb48d637fbeea507eee91b6604a` to gh-pages. Native Git read-back verified version.json sourceCommit and the exact index.html object hash against the production build. This proves the uploaded artifact, not the public CDN response.

54 logic tests,23 Chromium browser scenarios, production build and desktop/mobile project-subpath/standalone smoke checks passed. Coverage includes mobile844×390/740×360/915×412/1024×600, portrait390×844, desktop1440×810 and2560×1080, asymmetric safe-area insets and visualViewport offsets/toolbars, fullscreen/orientation fallback and multi-touch.

Public github.io requests are blocked by the cloud egress proxy (CONNECT403). Real iPhone Safari, Android hardware, Microsoft Edge binary, low-end frame-rate and public CDN source remain unverified. Chromium emulation does not establish physical Safari/Edge results. User was invited to provide a phone/browser clipping report; this does not block independent development.

Next: retain existing three-weapon/six-character systems, improve weapon feedback and complete pixel portrait selection. No relics, merchants, tribulations, large room branching or chapter2 in v0.2.

## Stage 2 — differentiated weapon feedback

Retained sword melee/strong recoil/armorbreak, paper projectiles with status builds and slower staff tracking/splash. Added staff-only,short-lived impact circles that actually pulse damage and slow nearby enemies; maximum3 fields,1.2s lifetime,simulation paused with menus,cleared on death/victory/reset. Character-generated spell projectiles do not create circles,avoiding proc chains. Distinct pixel sword sparks,paper rune bursts and staff impact rings preserve readable hit feedback.

56 model tests and23 browser scenarios passed; production build and project-subpath tests passed. The new tests verify actual staff impacts,other weapon separation,field damage/pause/expiry/caps. All three normal-ability chapter completion tests still pass.
