# AI 開發交接 — v0.5

日期：2026-10-28。

## 目前最新：v0.5 已完成，下一個功能版本是 v0.6

- 最新經完整驗收的遊戲程式：**9178f437dbf7f269bf69c54002e4d00662521703**。後續交接文件提交不改程式；遠端main最終HEAD與Pages version.json應一致。
- 版本0.5.0；**126模型＋48 Chromium情境全部通過**，production build／桌面與手機尺寸子路徑／獨立HTML／diff check通過。不是實機Safari/Android/Edge驗收。
- 基線v04 main398832c已核對並保存在v04/integration；新功能先在v05/quality實作、獨立唯讀QA重現問題／修正／再驗證，再安全fast-forward main。PR建立實際嘗試但GraphQL Forbidden；比較：https://github.com/mason193199/lingqian-journey/compare/398832c...v05/quality ，不要假稱有PR編號。
- 完成：偏好存檔與安全觸控尺寸／透明度／三位置、renderer品質／減少動態／震動／文字、音效與原創基礎旋律音量、H與1–4/F2快捷、完整狀態／繁中路線、像素/UI細化、真實動作引導／略過／重播、staff短蓄力／dash取消／落地。
- 修復：Boss事件小怪離屏、種子角色抽選順序、reducedMotion接線；新增modal reset Esc穿透、空中教學baseline、跨房幽靈蓄力回歸，獨立QA已複查。手機菜單保留gear而不把HP蓋到基地標題。
- 新入口：src/preferences.js／settings-ui.js／audio.js／tutorial.js／tuning.js。Game.presentation純畫面偏好，Game.combatV3僅正常冒險啟用；診斷直接開始保留舊節奏以回歸。後續地形要提供player.groundY給引導，不能再用空中腳底當跳躍基準。
- 首次v0.5部署gh-pages **dccf364cb126e090ec6cf95a605764d9cb814c4a**，source9178f43、6/6產物雜湊一致。最終交接HEAD仍應重新部署一次並核對；若下次version.json已對應main，就不要重做部署或功能。
- 公開網址：https://mason193199.github.io/lingqian-journey/ 。沿用gh-pages root無需設定；CDN直接回查仍被雲端代理CONNECT403阻擋，只確認Git來源／產物一致，未假稱外部HTTP成功。
- 下一步三項：實機Safari/Android操作與音訊驗收；Boss攻防／Build成形機率的人類體驗與種子樣本；小型可讀地形／可拒絕天劫。v0.6/v0.7未開始，完整逐幀角色美術與正式場景配樂也未宣稱完成。
- 續作先fetch main/history/本文件/GAME_ROADMAP/未合併分支；若v0.5發布相符，從v0.6最優先項目繼續，不重做已完工。每階段test→fix→retest→commit→push→handoff；不force、不覆蓋原工作區草稿。


## v0.4 歷史完成基線

- 最新經完整驗證的遊戲程式 commit：**8e1db1c575fd09b9f9431d50704a496a1a758f75**；後續交接文件提交不改變遊戲程式。遠端 main 的最終 HEAD 與 Pages version.json 應一致。
- 版本0.4.0；最終 **108/108 邏輯測試、41/41 Chromium 瀏覽器測試、production build／子路徑／獨立HTML測試** 全通過。詳見 docs/V04_VALIDATION.md。
- A觸控／雙版面、B戰鬥與10協同、C六事件／九節點節奏、D六分頁靈籤觀／命格／存檔歷史、E整體驗收均完成並已保存。另完成死亡目標重複命中漏洞修正。
- 最新程式修正：範圍攻擊同幀再次碰到屍體時，不再累積暴擊／五行／靈力；保留真正致死第三擊的落雷。先以新回歸測試重現，再修正，完整重跑108+41及production測試。
- 公開網址：https://mason193199.github.io/lingqian-journey/ 。沿用既有gh-pages root，無需重新設定。前次產物已核對6/6雜湊；最終交接HEAD也要重新發布並核對sourceCommit。雲端代理阻擋公開CDN回查（CONNECT403），不代表遊戲404。
- 下一階段v0.5：實體Safari／Android觸控與工具列驗收、人類玩家Boss長度與Run節奏回饋，再考慮事件後果與引導。不要重做已完成v0.4，不新增第二章／角色／武器等大系統。
- 斷點續作：先fetch最新main與gh-pages、讀commit history／本段及文末；若version.json已對應最新main則部署也完成，直接從v0.5實測開始。若不同只補部署，不重做功能。禁止force-push、禁止覆蓋其他工作區草稿。


## v0.3 歷史基線（已由下列 v0.4 取代）

- 最新經驗證的程式碼提交：`8578df7`。本文件後續提交僅更新交接；遠端實際最新提交用 `git log -1 origin/main` 查詢。
- package版本：0.3.0。
- 七個階段均已完成並各自測試、commit、push，沒有只留在臨時工作區。

| 階段 | 已保存提交 | 結果 |
|---|---|---|
| 1武器進化 | bf906c6 | 雷劍第三擊／撞牆雷爆、火符分裂／滿層燃爆、地面冰陣／凍結碎冰 |
| 2成形提示 | 45ab77c | 真正暫停、機制說明、一次確認、精簡Build HUD |
| 3八法器 | 030a97c | 八個條件型機制、三品質、真實三選一取得 |
| 4小型路線 | de2b402 | 七個有限節點、三選一、普通／精英／法器／恢復／靈商／祭壇與最終Boss |
| 5靈錢交易 | 6cb5357 | 本局貨幣、有限庫存、合法扣款、付費重抽、回血與武器升級 |
| 6平衡 | f9b980f | 四Build合法通關、Boss控制抗性、有限被動回血 |
| 7效能及整體驗收 | 8578df7 | 投射物／特效／文字預算、離屏裁減、背景快取、完整新冒險UI通關 |

完整階段細節、數據與限制在 `docs/V03_VALIDATION.md`；v0.2與QA歷史保留於對應文件。

## 實作與維護要點

- `src/evolution.js`：五行／八卦／配方資料與三種機制；次級proc不回觸發主攻擊，火爆與牆爆有冷卻／一次性保護。
- `src/relics.js`：八法器、普通／稀有／珍奇、共用召喚上限、成功冰凍回呼與單跳雷擊。陰陽玉在統一的damageEnemy出口只放大一次；雷公令同時接一般與進化雷擊。
- `src/rooms.js`：有限七房間、種子路線排序、穩定且一次消耗的出口id、一次服務與Boss三種入場準備。不宣稱完整程序生成地圖。
- `src/shop.js`：靈錢與靈玉分離；商品與扣款必須一起成功，重抽後舊id失效。武器鍛鍊最多三級。
- `src/budgets.js`：友方32、敵方24、效果48、傷害文字24；不能以友方裁減刪除敵方攻擊。手機繪製近期24效果／10文字。背景640×360快取與量化更新僅影響美術。
- 玩家有3種開局武器及6角色；v0.2的QA技能／冰凍／輸入修正均保留。白璃護主分支被動治療每局上限20，避免拖延無限回滿。
- 正式網址走新冒險；`?test`的開始捷徑保留舊線性章節供回歸，其後透過真正的行前準備開始仍使用新冒險。不要把測試捷徑當成正式流程。
- 原localStorage key未變；只保存局外進度，不保存局內靈錢、法器或進行中的Run。清除網站資料／換裝置不共享存檔。

## 最終驗證

- `npm test`：83項邏輯測試通過。
- `PLAYWRIGHT_PORT=5191 npm run test:e2e`：30項瀏覽器情境通過。預設不重用其他工程師伺服器；只有明確需要才設 PLAYWRIGHT_REUSE_SERVER=1。
- `npm run build`、`npm run test:production`、`git diff --check`通過。
- 四個Build皆以正常能力、合法路線／購買通關。單一286HP Boss簡單控制器時間約雷劍3.52s、火符2.85s、冰杖4.38s、非進化木巽符6.07s。最大／最小2.13倍是初始門檻，不代表完整人類玩家平衡；原Boss偏短，應繼續試玩。
- 四倍CPU降速、手機尺寸合成測量：繪製P95約12.3–19.5ms；最新模擬＋繪製P95約17.9ms。不是實機FPS、合成器／GPU或60FPS保證。100ms測試門檻只防止嚴重退化。
- 實際新冒險UI通過精英→商店→法器→祭壇→戰鬥→Boss與勝利畫面；手機844×390畫面已檢視。640×320四選籤可捲動操作。
- 實體iPhone Safari／Android／Edge binary、低階手機GPU與溫控仍待實測。先前使用者只回報v0.2橫向無裁切，未提供型號／瀏覽器，不能延伸成v0.3全裝置驗證。

## 部署及工作區

- 網址：https://mason193199.github.io/lingqian-journey/
- 建置後以 `node scripts/deploy-pages.mjs` 上傳；gh-pages/version.json標記sourceCommit。需Git讀回版本與產物hash確認上傳來源，不等同公開CDN回應。
- 本環境對github.io仍可能CONNECT403，不能宣稱已透過HTTP驗證公開網站或實機。
- 本輪乾淨續作checkout：`/workspace/lingqian-journey-qa`，分支 `v03/builds`，穩定提交都已推送main。
- 原 `/workspace/lingqian-journey` 的舊未提交進化草稿維持原樣。只審查重用了資料表說明，實際v0.3機制重新依需求實作；不可把舊game/main/render/style差異覆蓋回新的QA穩定版。

## v0.4建議與中斷續作

先做實機效能、玩家手感和平衡回饋，延長Boss有意義的攻防學習與房間遭遇差異，再考慮更多進化／事件。不要立即增加角色、武器、第二章、完整天劫、大型天賦樹、大量NPC或多人模式。

每次開工：讀本文件→git status→fetch最新main→讀commit history與diff→確認未完成處。保留他人未整合工作，不reset、不盲目覆蓋、不重做上述七階段。

每一穩定階段：功能→測試→修正→再測試→commit→push→更新交接→下一功能。推送前再次fetch；main前進就整合重測，不force push。額度／時間中斷後從交接斷點續作，未測、未推送、未部署、未實機驗證分開回報。

## v0.4 checkpoint A — input and responsive interface
- Started from main cb9dd6e; branch v04/integration protects the original draft workspace.
- Added scoped gesture suppression, physical-key alias tracking, independent multi-pointer releases, slide-out/cancel/lost-capture cleanup; hit-stop edge buffering retained. Page-level zoom remains enabled.
- Desktop uses bounded 1280px canvas, external player/top panels and Fight/Build/Relic/Journey tabs; phone uses safe-area HUD and paused detail inspector. Existing viewport logic retained.
- Validation: 83 model tests + existing 30 browser tests + 3 new interface tests passed; production build/path validation passed. No physical iPhone/Android available; browser emulation is not physical Safari proof.
- Next: combat feedback/posture and 8–12 bounded mechanical synergies, then events/pacing, paged temple, persistent summaries/history. Do not call v0.4 complete at this checkpoint.

## v0.4 checkpoint B — combat and synergies
- Ten functional synergies in src/synergies.js: thunder fork, fire bloom, ice lances, wall armorbreak wave, pet volley, shield-loss wave, delayed extra starfall, status paper echo, poison spread, wall ice field.
- Discovery toast and Build descriptions; cooldowns, proc suppression and shared caps prevent recursive/unbounded projectiles or fields. Crit text/flash/audio/stop/shake differentiated; Boss heavy-hit posture break has a 3s recovery window; light attacks cannot accumulate posture.
- Validation: 91 model tests; 14 targeted browser regressions + synergy UI test passed; production build and subpath/standalone smoke passed. Existing four-Build Boss guardrails unchanged. Mobile 4x CPU synthetic render median9.5/P9515.5ms (not physical-device FPS).
- Next incomplete: events/pacing, paged temple, real fates, persistent summaries/history and final full acceptance/deployment.

## v0.4 checkpoint C — events and run pacing
- Normal adventures now have nine nodes: battle/reward-or-event/battle/elite/shop-or-relic/event/Build reinforcement/battle/Boss. Explicit legacy model runs keep their seven-node path.
- Six real once-only events in src/events.js: Taoist HP trade, statue money blessing, three-way mist choice, stronger-enemy bargain, two-combat fortune, optional elite grave challenge.
- Temporary combat penalties expire by battles (not service rooms), future enemy tempo/damage changes are capped, challenges return to event/relic reward before selecting the next route.
- Validation: 98 model tests passed; updated full normal adventure and route/shop browser tests + all-six-event UI acceptance passed. Production build/subpath/standalone smoke passed.
- Next incomplete: temple pages, rule fates, bounded discovery/history migration, full run summary, final regression/performance/deployment.

## v0.4 checkpoint D — temple, rule fates and persistent run loop
- Temple is split into six regions: character/talent, weapon/recipe, capped training, rule fate/loadout, discovery codex, recent-ten-run observatory. Only the selected region enters the DOM; phone region navigation and sticky start action tested at 667x320.
- Three actual rule fates: Greedy adds an elite and better relic rooms, Oracle gives any character a finite reroll/four initial choices, Seven reduces starting HP20% and increases Boss damage20%. Existing starting shield/unstoppable options retained independently.
- End Build card includes character/start weapon/evolution/elements/bagua/relic/synergy/time/kills/Boss/highest damage/damage taken/jade/discoveries. Statistics use actual HP lost, excluding shields and overkill. History capped at ten.
- Local schema upgraded to v3 while retaining the existing v2 storage key and backup; v1/v2 saves migrate and preserve all prior progression/settings. Untrusted discovery/history IDs are bounded and validated before rendering. Settlement deduplication retained.
- Validation: 105 model tests + 35 browser regression tests + 3 new temple/history browser tests passed. Production build/subpath/standalone smoke passed.
- Next: full combined synergy stress, final 38+ browser regression, visual inspection, release version/docs, safe integration into current main, push and Pages deployment. Physical mobile Safari/Android remains unavailable in this environment.

## v0.4 checkpoint E — final acceptance and release preparation
- Version0.4.0. Added all-relic evolved/mixed Boss and repeated synergy stress; capped recycling confirmed. Extreme320x240 landscape safe-area and native keyboard pause tests added; temple header condensed for short phones. Existing six characters and three weapons preserved.
- Final validation: 107/107 model tests, 41/41 Chromium browser scenarios, production build, desktop+phone project-subpath smoke and standalone HTML passed. `git diff --check` passed. See docs/V04_VALIDATION.md for detailed scope and limits.
- Final all-relic Boss guardrails: thunder sword3.17s, fire paper1.98s, ice staff4.03s, mixed5.00s. All won; human difficulty balance remains a playtest task.
- Final4x CPU/12-enemy/all-relic synergy stress update+render median/P95: sword6.2/12.0ms; paper8.1/12.8ms; staff7.8/12.7ms. Earlier mixed stress12.0/21.6ms. Not physical iPhone FPS or a universal60FPS claim.
- Pending release step: verify origin/main has no concurrent changes, push this stable application to main without force, record its exact commit below, deploy clean production dist to existing gh-pages root, verify version.json+artifact hashes. Public CDN requests may remain blocked by the environment proxy.
- v0.5 recommendation: physical Safari/Android input+toolbar acceptance, human pacing/Boss telegraph and encounter-length review, then richer event consequences/codex guidance and balance from run-history evidence. No second chapter or large new system is needed yet.

## v0.4 release completed — resume here
- All phases A–E are complete, committed and pushed. Stable application commit: **342b8722446542ec913b5814122d94820157ec1c**. Later handoff-only commits retain identical game code.
- main was fast-forwarded from cb9dd6e to342b872 without force; no concurrent remote changes were present. The original separate workspace draft was not touched.
- Initial release deployment: gh-pages **e7b7eb90e0103256b7b776b0b1780ae18f89594b**, version.json.sourceCommit342b872; all **6/6** dist artifacts matched remote Git blob hashes. Production build/subpath/standalone tests passed immediately before deployment.
- Public URL: https://mason193199.github.io/lingqian-journey/ . GitHub Pages still uses the existing gh-pages root; no settings action is required. Direct public HTTPS verification was blocked by the environment proxy (CONNECT403), not a demonstrated game404.
- This handoff-only checkpoint should also be deployed so version.json points to the final main HEAD. On resume first fetch main and gh-pages (this clone tracks only main by default; use an explicit gh-pages refspec or FETCH_HEAD), read version.json, and compare its sourceCommit/artifact hashes. Retry only publication if needed; do not rebuild completed systems A–E.
- **Next development stage: v0.5**, after physical Safari/Android touch/toolbar testing and human Boss/Run pacing review. No unfinished v0.4 feature stage remains. Recent-ten-run observatory currently records history; full challenges, cloud saves, second chapter, new characters/weapons remain outside this release.
- Continue the checkpoint rule: implement → test → fix → retest → commit → push → handoff. Read latest main/history/this log before changing work; preserve other workspaces and never force-push main.

## 2026-10-28 v0.5 啟動盤點
- 最新main/公開部署均398832c；基線重跑108模型+41瀏覽器通過。新工作分支v05/quality；v0.4公開版在v0.5驗收前保留。
- 已讀README/code/tests/history及遠端heads；qa分支已合併，v04與main同點。GitHub PR GraphQL被拒，不能宣稱已審查PR討論；Git未廣告PR head refs。
- 新建GAME_ROADMAP、GAME_DESIGN、BALANCE_NOTES，分清已完工／品質不足／未完成／失效項目。v0.5先品質操作，v0.6與v0.7仍未開始。
- QA已重現Boss離屏追加敵人、減少動態未套用及角色種子初始化順序問題。下一步先修，再設定／HUD／美術／引導；每階段獨立測試推送。

## v0.5 品質階段完成驗收（2026-10-28，尚待此checkpoint推送／發布）
- 126/126模型、48/48瀏覽器、production build／子路徑／獨立HTML及diff check通過。版本0.5.0，正式新冒險combatV3=true；?test直接開始保留歷史節奏，正常準備→開始仍是新節奏。
- 實際生效的設定／安全觸控尺寸／完整狀態與HUD快捷鍵、原創UI／像素場景細化、真實可略過重播引導、短蓄力／取消／落地、可選原創合成旋律已接入並驗收。
- 修Boss離屏事件敵人、種子初始化、reducedMotion未接線；獨立QA再重現modal穿透／空中教學／跨房幽靈蓄力，均加測修正並複查。手機菜單只保留齒輪，不讓戰鬥血條遮基地。
- 具體來源／品質限制／測量見GAME_ROADMAP、GAME_DESIGN、BALANCE_NOTES、ASSET_LICENSES、docs/ART_DIRECTION及docs/V05_VALIDATION。不是六套商業逐幀動畫，也沒有實機或人類平衡證據。
- 下一步只需checkpoint push、嘗試PR、確認main沒有併行新變更後整合並部署／核對雜湊；v0.6與v0.7未開始。若PR API仍Forbidden保留比較分支並記錄，勿假稱已建立PR。

## v0.5.1 urgent mobile zoom fix — 2026-10-28
- User reports unintended zoom remains. Confirmed hit target is game-shell because world/canvas are pointer-transparent; canvas touch-action alone did not cover gameplay.
- Added src/gestures.js: element-scoped non-passive multi-touch and Safari gesture prevention, gameplay double-touchend fallback, immediate state getter. Gameplay shell none, menus pan-y; native single taps/form controls and outside page zoom preserved. Game selects/inputs16px to prevent iOS focus autozoom. No global maximum-scale/user-scalable prohibition.
- Validation:126 model +51 Chromium scenarios, production build/subpath/standalone and diff check passed. New tests include actual CDP repeated multi-touch/pinch, native gesture default prevention, rapid touchend and one-finger menu/form fallback. Not proof of physical Safari acceptance.
- Publish this urgent checkpoint first; then resume v06/combat-build for Boss attack/counter windows and less automatic Build formation, without implementing all v0.6/v0.7 systems at once.
