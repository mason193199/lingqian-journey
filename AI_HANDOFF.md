# AI 開發交接

## 最新穩定階段

- 日期：2026-10-27。
- 最新已驗證的穩定程式碼提交：`2b45863e06b5d826fac4db08a055224285f71a9e`。
- 本文件後續提交僅記錄交接，沒有更動上述已測試程式碼。遠端實際最新提交以 `git log -1 origin/main` 為準。
- 已審查整合 QA 分支 `qa/mobile-combat-stability`，來源 `1eef1ee6fbad06407911ab967fb238ea5c3d2f08`。整合前 main 為 `561eda896e5003fb754c957068a4567b2ca8bffe`，無衝突；保留兩個 parent 的合併歷史。

## 本輪修正與審查結論

1. 青嶽斬煞會設定攻擊動畫，但首次施放尚未建立普攻命中集合，可能在下一幀崩潰。技能自行結算過的既有目標不再被同一段動畫當作普攻重複命中。
2. 六角色技能在冰凍期間拒絕施放，不消耗冷卻，解凍後可正常使用。保留青嶽既有的硬直取消能力，沒有擴大為全面改寫控制規則。
3. hit-stop 暫停模擬時保留一次性的輸入邊緣，直到模擬執行後才清除。離開遊玩／暫停時仍清除輸入，避免恢復後誤操作。
4. 審查後未發現需要改寫 QA 修正的問題。額外增加瀏覽器測試，涵蓋 hit-stop 下的跳躍、攻擊、技能，以及暫停清除待處理輸入。

沒有更動傷害平衡、存檔格式、依賴或關卡架構。原 QA 詳細紀錄在 `docs/QA-REVIEW.md`。

## 驗證結果

- `npm test`：54 項邏輯測試全部通過。
- Playwright：23 項瀏覽器情境全部通過，包括完整鍵盤通關、手機多指、六角色、天賦、存檔、狀態控制、Boss、viewport offset／非對稱安全區、工具列尺寸變化。
- `npm run build`：production build 成功。
- `npm run test:production`：桌面、手機橫向模擬、專案子路徑與單檔 HTML 測試通過。
- `git diff --check`：通過。
- 整合測試使用本 checkout 的獨立 Vite 5191，`reuseExistingServer:false`，避免誤測其他工程師的伺服器。臨時設定不依賴進版；之後測試務必確認伺服器來源。
- 真實 iPhone Safari、Android 及低階手機效能仍未實機驗證，不能以 Chromium 模擬代替。

## 下一個開發階段與未完成工作

本輪只處理 QA 整合，尚未開始新的大型功能。下一階段先完成並審查「武器 × 五行 × 八卦進化」，再依既定順序進入法器、房間分岔、靈商、天劫、靈籤觀。

目前 main 已有六角色、兩分支天賦、三武器、共用狀態、輕度局外成長與本地存檔。真正的進化、獨立遊玩法器、分岔房間、靈商、天劫與完整基地未整合，不能回報為已完成。

原工作目錄 `/workspace/lingqian-journey` 存在尚未提交的進化工作：`src/game.js`、`src/main.js`、`src/render.js`、`style.css`、新檔 `src/evolution.js` 與 `tests/browser/evolution.spec.js`。本輪保留原樣，未帶入 main，也未刪除。請先比對原工作基底與本輪 main 中的輸入／技能修正，再逐檔整合；不要直接 reset、覆蓋或盲目套用。

本輪整合 checkout 為 `/workspace/lingqian-journey-qa`。沒有部署或修改 gh-pages；main 的整合成功不等於公開網站已更新。

## 斷點續作規則（每次開工必讀）

1. 先讀 `AI_HANDOFF.md`，檢查 `git status --short`、fetch 遠端 main、讀最新 commit 與差異；不得假設本機 HEAD 或舊對話是最新狀態。
2. 保留其他工程師的未提交／未整合工作，先確認檔案所有權與目前基底，再修改。
3. 從這份交接的「未完成工作」繼續，不重做已完成的六角色、天賦或 QA 修正。
4. 每完成一個穩定階段：**測試 → 修正 → 再測試 → commit → push**，並更新交接，記錄 commit、測試、限制與下一步。
5. 推送前再次 fetch，若 main 有新提交，先整合與重測；不 force push main。
6. 若額度或時間中斷，下次先重新讀取 repository 最新 commit 與交接紀錄，從未完成處續作，不把未測試／未推送工作當作完成。
