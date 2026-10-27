# v0.2 staged validation

## Stage 1 — deployment and viewport baseline

Deployed tested main source `f8aa5b3135fb5fb48d637fbeea507eee91b6604a` to gh-pages. Native Git read-back verified version.json sourceCommit and the exact index.html object hash against the production build. This proves the uploaded artifact, not the public CDN response.

54 logic tests,23 Chromium browser scenarios, production build and desktop/mobile project-subpath/standalone smoke checks passed. Coverage includes mobile844×390/740×360/915×412/1024×600, portrait390×844, desktop1440×810 and2560×1080, asymmetric safe-area insets and visualViewport offsets/toolbars, fullscreen/orientation fallback and multi-touch.

Public github.io requests are blocked by the cloud egress proxy (CONNECT403). Real iPhone Safari, Android hardware, Microsoft Edge binary, low-end frame-rate and public CDN source remain unverified. Chromium emulation does not establish physical Safari/Edge results. User was invited to provide a phone/browser clipping report; this does not block independent development.

Next: retain existing three-weapon/six-character systems, improve weapon feedback and complete pixel portrait selection. No relics, merchants, tribulations, large room branching or chapter2 in v0.2.

## Stage 2 — differentiated weapon feedback

Retained sword melee/strong recoil/armorbreak, paper projectiles with status builds and slower staff tracking/splash. Added staff-only,short-lived impact circles that actually pulse damage and slow nearby enemies; maximum3 fields,1.2s lifetime,simulation paused with menus,cleared on death/victory/reset. Character-generated spell projectiles do not create circles,avoiding proc chains. Distinct pixel sword sparks,paper rune bursts and staff impact rings preserve readable hit feedback.

56 model tests and23 browser scenarios passed; production build and project-subpath tests passed. The new tests verify actual staff impacts,other weapon separation,field damage/pause/expiry/caps. All three normal-ability chapter completion tests still pass.

## Stage 3 — six-character combat acceptance

Existing six distinct passives/skills retained,not recreated. Added normal-ability full-chapter validation for all18 character×weapon loadouts; all win with six kills and surviving HP. Existing character/talent tests verify finite rerolls/luck,fifth-hit recoil,abnormal-status scaling,tracking stars/delayed starfall,bounded autonomous summons and rage/shield recoil resistance. Corrected hit-stun spark rendering to read the actual player.stun field instead of nonexistent hitstun.

57 model tests passed; six targeted character/talent/QA/safe-viewport browser cases passed,then the renderer correction passed the four affected character/QA browser cases. Production build and subpath checks passed.

User physical-device report: “橫向正常，沒有裁切”. Model and browser were not specified; this is a real user observation,not a universal iPhone/Android compatibility claim.

## Stage 4 — pixel traveller selection and v0.2 release

Six cached portraits reuse actual in-game sprites,palettes,ornaments and recommended held weapons. Preparation shows full name,role,passive,active skill,cooldown,recommended weapon and play guide. Recommendations never restrict weapon choice. Preparation preserves scroll position when changing loadout/upgrades. Selection persists and the next Run uses that character.

Final acceptance:57 model tests,24 browser scenarios,production build and all three production smoke targets passed. All18 traveller×weapon loadouts complete the chapter using normal abilities. Portrait test verifies six distinct rendered canvases plus guide content,persistence and actual run assignment. Phone screenshot was visually inspected; portrait cards and pinned start action remain inside safe bounds with scrolling for further content.

Scope remains v0.2 combat and selection only. No evolution,relic gameplay,merchant,tribulation,large room branching or chapter2 integration was performed. Original uncommitted evolution work remains in the primary checkout untouched. The existing limited starting-stat relic configuration remains as previously shipped.
