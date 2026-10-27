# QA stability review

Reviewed remote main: `561eda896e5003fb754c957068a4567b2ca8bffe`.
Branch: `qa/mobile-combat-stability`.

The review uses a separate checkout at `/workspace/lingqian-journey-qa`. Existing uncommitted evolution work in the development checkout was left intact and excluded. No changes to main, deployment, dependencies, save format, balance values, or core architecture are included.

## Confirmed issues and fixes

| Severity | Reproduction | Correction |
|---|---|---|
| High | Start Qingyue, put a surviving enemy near x330, use the first slash before any normal attack, then update. The slash sets attackTime but attackIds is undefined; collision calls `.add()` and crashes. | Mark the skill's existing targets as already resolved by its animation. This prevents the crash and prevents an additional ordinary hit from being applied after the skill's own 42 damage. |
| Medium | Apply freeze to a character, then use the active skill. Hongling still emits six papers; other characters can likewise act. | All six active skills refuse activation while freeze is active, without spending cooldown. Skills work after thawing. Existing Qingyue stun-cancel behavior is preserved. |
| Medium | Set hitStop to .035 seconds and press/release dash before the next simulation frame. main clears the queued edge even when Game.update was skipped. | Retain discrete input edges while playing during hit-stop and clear them once simulation consumes them, or when leaving active gameplay. |

The input issue was checked against the actual remote-main module in Chromium: identical quick key events produced dash cooldown0 before the fix and approximately0.80 after the fix. Regression tests cover skill crash, single damage resolution, all six frozen skills recovering after thaw, and the browser input buffer.

## Validation

- Baseline:52 model tests and20 browser scenarios passed; build succeeded.
- Fixed:54 model tests and22 browser scenarios passed.
- Production build passed, including static project-subpath checks for desktop, emulated iPhone landscape, movement, blessing selection, and standalone HTML.
- Browser tests ran on an isolated Vite port5191 with reuse disabled, ensuring the primary developer's running server was not tested accidentally.
- Phone sizes:844×390,740×360,915×412,1024×600; portrait390×844; desktop1440×810 and2560×1080.
- Visual viewport offset, asymmetric safe areas and collapsing browser chrome are simulated by the existing safe-viewport scenario. Checked controls remain within the safe rectangle. No new clipping was reproduced in these scenarios.
- Covered keyboard/touch movement, jump, attacks, dash, damage, recoil, invulnerability, all three weapons, all six skills, talent branches, boss tells/victory/restart, capped statuses, control immunity, progression reload and nonduplicated jade settlement.
- No physical iPhone, Android, WebKit/Safari or low-end device performance verification was available. Chromium mobile emulation is not a substitute for that coverage.

## Unverified and next review

- Weapon×element×bagua evolution is not integrated into the reviewed main. The separate unfinished implementation was not imported or modified.
- Independent gameplay relics, room branching, merchant, tribulation and the full hub are not implemented in this main; the existing relic slot supplies limited starting-stat configuration. These systems were not claimed as passing.
- Local progression is tested; there is no cloud sync or cross-device guarantee.
- Before merging, rebase/cherry-pick onto the primary developer's current main and rerun tests, especially if character skill resolution or main's simulation/input loop changes.
- Add the same collision-boundary regression for future animated skills, and keep skill action-lock checks consistent with status rules.
