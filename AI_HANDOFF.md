# v0.3 當前續作階段（優先）

階段1武器進化已完成並通過62項邏輯、25項瀏覽器與正式版測試。階段2亦已完成，63項邏輯、8項針對性瀏覽器與正式版測試通過。階段3八個法器已完成（69項邏輯、受影響瀏覽器與正式版通過）。階段4有限七房間三選一路線亦完成（71項邏輯、3項針對性瀏覽器與正式版通過）。階段5靈錢與實際靈商交易已完成（75項邏輯、4項針對性瀏覽器與正式版通過）。下一步：階段6四種Build平衡驗收，再做效能。詳見 docs/V03_VALIDATION.md。後續依序8法器、三選一路線、靈商、平衡、效能。每階段測試→修正→再測試→commit→push，讀最新main再續作，不重做已完成階段。

# AI 開發交接 — v0.2

日期：2026-10-27。

## 穩定版本與已完成階段

- 最新已驗證的穩定程式碼：`bdaaa26`（完整 SHA 可用 `git rev-parse bdaaa26` 取得）。本文件後續提交僅更新交接；遠端最新提交以 `git log -1 origin/main` 為準。
- `8492367`：重新部署 QA 穩定版 f8aa5b3，Git讀回 version.json 與 HTML hash 相符；記錄裝置驗證限制。
- `8d6b928`：三武器命中特效差異與靈杖短暫留場星陣，最多3個，會暫停、到期、死亡／勝利／重開清除。
- `6920378`：六角色與18種角色×武器正常能力通關驗收，修正受擊火花讀取 stun 欄位。
- `bdaaa26`：角色選擇加入六張不同像素立繪、名稱、定位、被動、主動／冷卻、推薦武器與玩法說明。選擇保存並正確套用；推薦不限制裝備，選單保留捲動位置。package版本0.2.0。
- 之前整合的 QA 修正仍保留：青嶽首次斬煞崩潰／重複傷害、冰凍技能限制、hit-stop 短按緩衝與暫停清除。

## 最終測試

- `npm test`：57項邏輯測試通過，包含全部18種角色×武器通關。
- Playwright：24項情境通過；使用獨立5191伺服器且不重用其他工程師的server，避免誤測。
- `npm run build` 與 `npm run test:production` 通過，含桌面、手機橫向模擬、GitHub Pages子路徑及單檔HTML。
- `git diff --check` 通過。像素立繪手機畫面已檢視。
- 來源、各階段範圍與測試細節：`docs/V02_VALIDATION.md`；QA歷史：`docs/QA-REVIEW.md`。

## 部署與裝置結果

- 網址：https://mason193199.github.io/lingqian-journey/
- 使用 `npm run deploy:pages` 或先建置後 `node scripts/deploy-pages.mjs`。部署分支為gh-pages，version.json標記來源commit。發佈後應用Git fetch讀回版本及產物hash確認上傳正確。
- 雲端代理阻擋 github.io（CONNECT403），不能宣稱已驗證公開CDN的HTTP回應。Git讀回驗證僅證明已上傳的部署分支。
- 使用者已實機回報：「橫向正常，沒有裁切」。未提供型號或瀏覽器，不得延伸為全部iPhone Safari、Android、Edge皆實機通過。
- 自動測試涵蓋多手機尺寸、直向提示、安全區、不對稱瀏海、visualViewport位移與工具列縮放、全螢幕fallback及超寬桌面。實體Safari／Android、獨立Edge binary、低階手機效能仍待驗證。
- 本地存檔仍使用原localStorage key，沒有重置局外進度，亦沒有雲端同步。

## 下一階段 v0.3（本輪未開始）

先審查與完成武器×五行×八卦的質變進化，再考慮小規模房間分岔與法器，之後才是靈商、天劫等。不要一次塞入多個半成品。

main尚未整合真正的進化、獨立遊玩法器、靈商、天劫、大型房間分岔、第二章。既有法器欄僅是舊版有限開局配置，不可冒稱完整Relic系統。

原目錄 `/workspace/lingqian-journey` 的未提交進化工作仍保留，涉及 game/main/render/style，以及新 evolution.js 和對應瀏覽器測試；本輪未碰觸或帶入。整合前必須比對與最新main的QA輸入／技能修正，不能盲目覆蓋。

本輪可用乾淨續作checkout為 `/workspace/lingqian-journey-qa` 的 `v02/core-combat` 分支；穩定階段都已推送main。

## 中斷續作與協作規則

1. 每次先讀本文件、`git status --short`、fetch main與最新commit／diff；不以舊對話或本機HEAD冒充最新。
2. 保留其他工程師未整合工作，確認檔案所有權與基底再修改；不要reset、覆蓋或重做已完成系統。
3. 每個穩定階段：**功能 → 測試 → 修正 → 再測試 → commit → push → 下一功能**，同時更新交接。
4. 推送前再次fetch；若main有新提交，整合並重測，不force push main。
5. 額度／時間中斷後先讀最新repository及交接，從未完成處續作；未測、未push、未部署或未實機驗證各自分開回報。
