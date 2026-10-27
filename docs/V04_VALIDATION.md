# v0.4 integration acceptance (2026-10-27)

The release continues the stable v0.3 application (main cb9dd6e). Work was isolated on `v04/integration`; the original workspace's uncommitted evolution draft was preserved. Each completed phase was tested and pushed before proceeding.

## Delivered

1. **Input:** scoped double-tap/selection/callout/drag/overscroll protection; no global maximum-scale or user-scalable prohibition. Independent physical key and pointer tracking; slide-out, cancel, lost capture, blur cleanup; existing hit-stop input buffering retained. Native keyboard activation of action buttons supported.
2. **Responsive UI:** shared data with distinct phone/desktop arrangements. Desktop canvas bounded to1280px, external player/room/Boss information, Fight/Build/Relic/Journey tabs; laptop panels reflow, large displays retain margins. Phone keeps safe-area HUD/touch controls and paused information tabs. Portrait gate/fullscreen/orientation fallback retained. Added compact layouts for very narrow landscape and short temple screens.
3. **Combat:** larger gold critical numbers, distinct critical audio/flash, short stop/shake. Existing injury recoil/invulnerability retained. Heavy hits build Boss posture; break lasts0.28s with3s recovery, ordinary hits do not build posture. Existing freeze resistance/immunity retained.
4. **Builds:** three v0.3 evolutions retain their distinct attacks; ten functional, discoverable synergies extend lightning, charged fire splits, frozen-death missiles, wall control, pet volleys, shield-loss waves, delayed starfall, status paper echo, poison spread and water wall ice fields. Descriptions shown in Build details. Discovered synergies enter run summaries; active synergies update if the Build changes.
5. **Run pacing:** normal runs have nine nodes with service/event/reward breaks, combat and elite encounters before the Boss. Existing explicit legacy model fixtures retain seven nodes. Seeded three-exit choices and compass information remain.
6. **Events:** Taoist HP-for-relic, statue money-for-unknown-blessing, three-way mist, stronger-future-enemy bargain, two-combat fortune, optional grave elite challenge. Real costs/rewards; refusal has no penalty. Once-only decisions, finite temporary penalties and safe nested evolution/relic returns tested.
7. **Temple:** six separate regions for characters/talents, weapons/recipes, capped training, rule fates/starting loadouts, discoveries, recent-ten-run observatory. No new characters, weapons or chapter; future challenge system explicitly remains future work.
8. **Progression:** bounded training retained. Greedy adds an elite and better relic-room quality; Oracle adds a finite generic reroll/four choices; Seven trades20% starting HP for20% Boss output. Starting shield/unstoppable remains separate.
9. **Summary/save:** character, starting weapon, final evolution, five-element/bagua, relics, discovered synergies, time/kills/Boss, highest actual HP damage, HP damage received, jade and new discoveries. History capped at ten, validated static IDs; v1/v2 migrate into schema v3 without changing the storage key, with backup recovery and storage-denial fallback. Existing six characters/three weapons stay available; new codex entries represent discoveries, not additional playable unlocks. No cloud save or mid-run save.

## Automated acceptance

- `npm test`: **107/107** model tests.
- `PLAYWRIGHT_PORT=5191 npm run test:e2e`: **41/41** Chromium browser scenarios.
- `npm run build`: Vite production build + independent offline HTML.
- `npm run test:production`: production project-subpath desktop/phone input, title, blessing, asset requests, standalone smoke.
- `git diff --check`: whitespace/error check.
- Existing real keyboard chapter completion, six characters/eighteen loadouts, three evolution recipes, eight relics, status resistance, shop funds/repeated purchases, three-exit paths, QA crash/freeze/hit-stop regressions retained.
- New tests cover all ten synergy mechanisms, all six real event screens, full nine-node normal adventure, temple region isolation, history after reload, rule effects, save migration/backup/untrusted IDs, rapid multi-pointer release and keyboard aliases, extreme compact safe-area view, 1080/1920/2560/3840/3440 desktop widths.

## Balance and performance evidence

All-relic Boss controller trials: sword/metal3.17s, talisman/fire1.98s, staff/water4.03s, mixed wood5.00s, all survive. These are accelerated deterministic guardrails, not proof of equal human difficulty. First-chapter Boss remains short under highly completed Builds; a longer fair encounter and real-user pacing review are appropriate for v0.5.

Four-times CPU-throttled Chromium, 844x390 mobile emulation,12 enemies,3 summons and all relics,120 simulation/render samples per evolved weapon:

| Build | Median update+render | P95 | Active synergies |
| --- | ---: | ---: | ---: |
| thunder sword / Xinglian | 6.2ms | 12.0ms | 3 |
| fire talisman / Hongling | 8.1ms | 12.8ms | 2 |
| ice staff / Baili | 7.8ms | 12.7ms | 4 |

The earlier mixed render/effect stress measured median12.0ms/P9521.6ms for simulation+render. Figures are one recorded run; timings vary with host load. Tests enforce finite budgets and a broad regression threshold, not universal60FPS. Friendly projectiles≤32, hostile≤24, visual events≤48, damage texts≤24 (mobile draws latest10), ice fields≤3, summons≤3, skill zones≤3. Proc-generated attacks do not recursively create evolution/synergy projectiles; cooldowns and shared caps remain. Reset clears transient state and new run statistics. Desktop detail DOM is rewritten only when its visible text changes.

## Limits and deployment verification

- No physical iPhone Safari/Android Chrome or branded Edge was available. Chromium touch/device/visualViewport/cutout/fullscreen-denial emulation is used. The user's earlier v0.2 landscape confirmation is not v0.4 physical acceptance. Real iOS callout/toolbar and older Android devices still warrant a short playtest.
- Local data belongs to one browser/origin; clearing site storage removes it. Storage denial is reported in the temple.
- Public GitHub Pages HTTP requests may be denied by this environment's proxy. Deployment verification uses `gh-pages` version.json source commit and artifact hashes; it does not imply a verified external CDN HTTP response when access is blocked.
- Details of stable commits, current release and resume instructions are in `AI_HANDOFF.md`. No forced history rewrite or settings change is required; Pages remains on the existing `gh-pages` root.
