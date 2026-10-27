# v0.3 staged validation

## Stage1 — evolution combat

Reviewed the old uncommitted evolution draft; reused only element/bagua catalogue descriptions and rewrote mechanics to match v0.3 requirements. The old workspace remains untouched. Opt-in Build hooks preserve legacy chapter tests.

Three matching recipes now change combat: third primary sword hit lightning + one wall explosion per recoil; split fire paper with three-hit burn stack detonation + ignition; bounded ground ice fields with exposure freeze + frozen death splash. Five elements and eight bagua remain data-driven; no passive infinite healing. Secondary proc flags prevent recursive weapon/character chains.

62 model tests,25 browser scenarios,production build and project-subpath/standalone checks pass. Includes actual field-only exposure freezing and eventual thaw,split/stack/ignition,wall one-shot and naturally offered recipes. No claims of physical Safari or low-end hardware testing.

## Stage2 — awakening feedback

Evolution conditions pause the actual simulation in evolving state. The modal names the evolution and explains mechanics; acknowledgement consumes the notice once and restores the previous flow. Weapon/effect colouring changes immediately. Compact HUD shows element,bagua,evolution and the primary relic placeholder. Reduced-motion respects accessibility settings.

63 model tests,eight affected browser scenarios and production checks pass. Tests prove elapsed time/enemy simulation stop during the prompt and all three natural recipes resume on acknowledgement.

## Stage3 — eight relics

Added conditional yin-yang output/shield,room-clear element ranks,wall seal burst,capped kill summons,compass room intel provider,freeze shards,charged-fire blast modifier and single-hop lightning. Three qualities improve bounded cooldown/area/chance/duration strength; duplicate same/lower-quality acquisition is rejected. First Build blessing leads to a real three-choice relic reward; pause shows held relic descriptions.

69 model tests,two affected browser scenarios and production checks pass. Tests verify shield cooldown,one room award,quality caps,summon cap,freeze/wall trigger guards and nonrecursive lightning. Room intel will be connected to route menus in stage4; no room system is claimed completed at this checkpoint.

## Stage4 — bounded three-way routes

Normal adventures now run seven finite rooms,with three unique consumed-once exits per choice and three differently prepared final Boss gates. Combat,elite,relic,heal,merchant-stop and altar types are reachable; elite encounters add a different projectile pattern. Seeded route ordering is reproducible. Services pause combat,healing/attunement are one-use,and relic rewards resume the correct route. Compass reveals actual route type/enemy information,with more detail at higher quality. Legacy unconfigured chapter remains available to regression tests.

71 model tests,three affected browser scenarios and production checks pass. Multiple complete route policies reach and defeat the Boss. Merchant navigation is present here; money and actual trade transactions are explicitly the next stage,not claimed complete yet.

## Stage5 — run money and merchant

Kills award auto-collected pixel coin feedback once (normal8,elite12,Boss20); money resets with the Run and is independent from permanent jade. Merchant stock has three finite offers from relics,blessings,40HP heal and capped weapon training. Paid rerolls cost6/10/14 with maximum3. Affordability,full-health rejection,duplicate relic/blessing rejection,stale offer ids and one-purchase stock are guarded atomically. Initial merchant budgets cannot buy all stock; later savings are a deliberate choice.

75 model tests,four affected browser scenarios and production checks pass. The compact phone HUD now shares an energy/money row instead of adding wide buttons. No negative balances or duplicated purchases were observed.

## Stage6 — Build guardrails

Four normal-ability builds finish finite adventures with legal choices/purchases:thunder sword,fire paper,ice staff and non-evolved wood/xun paper. Isolated live286HP Boss measurements under the same simple controller:3.52s/2.85s/4.38s/6.07s;all survive,max/min2.13. This is an initial automated guardrail,not a claim of final human-player balance. The short original Boss remains an important future playtest target.

Fixed a real stall-healing loophole by capping Baili guardian-branch passive healing at20HP per Run. Element/bagua descriptions now match actual behavior;rare coins avoid already-capped elements. Third-hit lightning remains visible even on a lethal slash. Added visible short-room boundary posts for wall-burst readability. Boss freeze duty-cycle test stays below20%,and boss recoil is2% of requested force.

80 model tests pass. Full27-browser regression passed before the final lethal-hit visual correction;the four affected route/shop/awakening/safe-viewport cases plus production checks passed after it. Next:performance budgets,offscreen reduction and final full regression.
