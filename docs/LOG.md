# 變更紀錄

## 2026-11-16（第六次）

- **K1 定案：C，獨立 repo。** 塔羅站不寫進主站 repo，改在本 repo 根目錄建立獨立 Astro 專案；`docs/`、`handoff/` 留在原處。網址變為 `qracon.entangletech.tw/<repo-name>/`（repo 在 `QRACON-tw` 組織下時），否則是 github.io；K6 改為「repo 擁有者與名稱 → 正式網址」。
- **P1 骨架完成**（尚未 commit）：
  - 工具鏈與主站一致：`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`tsconfig.json`、`astro.config.mjs`（`ASTRO_SITE`、`ASTRO_BASE_PATH`，預設 `/tarot`）、`.gitignore`、`.gitattributes`、`.github/workflows/deploy-pages.yml`。
  - 樣式與共用：`src/styles/tokens.css`、`global.css`（暗場）、`src/utils/paths.ts`、`src/components/Button.astro`（新增 `on-ink`）、`Icon.astro`、`public/` 三個圖示。
  - 新增：`src/data/site.ts`、`src/data/tarot.ts`（七張牌）、`src/utils/tarot.ts`（`validateCards()`）、`src/components/SeoHead.astro`、`src/components/tarot/Card.astro`、`src/layouts/TarotLayout.astro`。
  - 路由：`/`、`/deck/`、`/deck/[slug]/`×7、404、sitemap、robots。完整清單與來源見 `docs/SITEMAP.md`。
- 驗證（本機實際執行）：`pnpm check` 0 錯誤 0 警告 0 提示；`pnpm build` 產出 10 個 HTML；`ASTRO_BASE_PATH=/` 與預設 `/tarot` 都能建置，連結正確；`TAROT_INDEXABLE = false` 時全頁 `noindex, follow`、sitemap 沒有 `<loc>`；把某張牌的相剋改成自己，建置失敗並印出 `validateCards` 訊息，還原後通過。瀏覽器檢視尚未做。
- 主站 `257b790` 的 `astro check` 本來就有 1 個錯誤（`astro.config.mjs` 的 `// @ts-check` 找不到 `node:process` 型別）；本專案移除該行，不新增依賴。
- `docs/02-plan.md` 局部更新：K1＝C、路由改為 `/`、`/deck/`、`/deck/[slug]/`、`tarotPath()` 改為 `sitePath()`、R7（元件分叉）成真、R9／R12 不再適用。`docs/03-open-questions.md`：K1 移入已定案，K6 改寫。README 加入 Astro 站的指令與環境變數。

## 2026-11-16（第五次）

- 新增 Google Doc〈QRACON 2026 量子塔羅：插畫與牌背素材需求〉（Drive 資料夾〈QRACON 2026 量子塔羅 素材需求〉）：`04` §1、§2、§6 的設計組版本，只看這份就能動筆。
  - 內嵌主視覺、躍貓、字標三張參考圖（主站 repo 公開 raw 網址）。
  - 文字描述畫風：純黑剪影加白色內線、三階明度、速度線；黑貓半實心半透明見骨。
  - 安全區改用像素標示；七張牌各有畫面重點（建議）與不要畫（物理誤會）。
  - 附交件方式、交件前檢查、不需要做的東西、參考檔案連結。
  - 主辦（B）與工程（D）項目不放進這份。
- 新增 `docs/assets/tarot-card-template.png`：1440 × 2520 安全區參考底圖，同步上傳到 Drive 資料夾。
- `04`：開頭加 Google Doc 與底圖連結並註明本檔是規格來源；§2.1 補像素安全區；§2.2 補牌背檔名 `tarot-back-pattern.svg`。
- README 文件表加 Google Doc 一列。

## 2026-11-16（第四次）

- 新增 `handoff/non-website-items.md`（repo 根目錄，不在 `docs/`）：把不歸網站管的事項打包交接，含獎勵與會場任務、印刷品 QR 建議規格、活動當天現場建議、IG 分享按鈕不可行的說明。
- `docs/` 移除所有非網站內容，只留網站本身：
  - `01`：刪「獎勵：不在網站範圍」小節；規則 6 只留禁用字樣。
  - `02`：刪 §1 範圍說明、§9.4 與活動當天的範圍旁註；D3 改為「CTA 目標」；R3 改為「新牌名未經行銷組認可」。
  - `03`：刪範圍與獎勵兩列，改為「CTA」一列。
  - `04`：刪範圍說明與 §6「不在網站範圍」小節。
- README 改為一行指向交接檔。

## 2026-11-16（第三次）

- 重新讀取原始 Google Doc：revision 與四個分頁內容都沒變。
- **範圍收斂為只管網站**：實體／數位獎勵（NFC、QXP、SSS、冒險者系統）、會場任務、印刷品與上面的 QR、短網址、會場網路測試，交給其他負責人。
  - `01`：獎勵區塊改為「不在網站範圍」；結果頁加「給朋友掃」QR（Should，原文結果頁底部的 QR）。
  - `02`：§1 非目標加範圍說明；§9.4 改為結果頁 QR；拿掉 `/tarot/s/` 現場入口、12/01 印刷交檔、場地測試、印短網址牌卡；D3、R3、R15 改寫。
  - `03`：K6 改為「正式網址」；Q1 獎勵、Q3 插畫排程結案移入已定案。
  - `04`：刪除印刷 QR 版面（原 A3），墨底確認改編為 A3；B4 只留正式網址，刪除 B5 獎勵；D3 改為結果頁 QR；§6 新增「不在網站範圍」清單；標題編號改為 04。

## 2026-11-16（第二次）

- 新增 `04-asset-requirements.md`（素材需求）：設計組交付（七張插畫、牌背紋樣、印刷 QR 版面、墨底方向確認）、主辦提供、工程自製、沿用主站與不需要的素材，含規格、期限與驗收。
- 插畫規則調整：圖內不放牌名、羅馬數字、角色名；安全區改為上下 14%、左右 8%（同步 `02` §7.1、`03` Q4）。
- 整理 docs，只留目前需要的文件：刪除 `00-source-audit.md`、`04-gemini-review.md`、`05-review-and-build-plan.md`、`source/doc-raw.txt`（內容已併入 01–03，原檔在 git 歷史 `36bed96`）。剩餘文件中指向它們的引用一併移除。
- README 改為只列 01–04 與 LOG。

## 2026-11-16

- 新增 `05-review-and-build-plan.md`：三路子代理掃描（文件一致性、主站沿用查證、物理文案）＋顧問複審。
- 拉下主站 `origin/main@257b790`（本機未推的 `51f0c97` 依指示捨棄）。發現主站已改部署到 GitHub Pages（`qracon.entangletech.tw/2026/`、`base` 可由 `ASTRO_BASE_PATH` 覆寫、已有 `sitePath()`），repo 移到 `QRACON-tw/2026`。
- 重新讀取原始 Google Doc：標題改為〈QUACON量子塔羅〉，內文與 11-10 存檔無實質變更。
- `01-copy-deck.md` → v2.2：修 3 處物理錯誤與 10 處誤導、數值（愚者相干 70、太陽糾纏 20）、首頁不再宣稱牌是疊加態、塌縮用詞統一；補導覽、頁尾、title/description、aria 文字、牌組頁、分享（只分享網址）、CTA 依報名狀態切換；眉標改票頭；連結改經 `sitePath()`。
- `02-plan.md` → v2.2：部署改 A1（主站 repo 內）、依 GitHub Pages 實況重寫 §2／§11、11/27 軟上線與 12/02 上線時程、Must／Should／Later、S1–S12 規格、暗場覆寫、新增 token `--color-on-ink-sheen`、R12–R15。
- `03-open-questions.md` → v2.2：改為 K1–K6 擋上線；Q9、Q10 結案；Q1、Q3 改為不擋上線。
- `04-gemini-review.md`：更正件數（P0 8 全接受 1 部分接受；P1 3／1／1）、「看图」改「看圖」、加補註指向 v2.2。
- `00-source-audit.md`：更正改名張數、B 類組成、感嘆號與體積統計、契合表改動數；加 11-16 複查紀錄。
- README 重寫為 v2.2 狀態。

## 2026-11-10

- 建立 00–04 規劃文件，Gemini 4 兩輪審核後 02 升為 v2.1。
