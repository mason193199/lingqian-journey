# AI 開發交接 — v0.3

日期：2026-10-27。

## 最新穩定版本

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
