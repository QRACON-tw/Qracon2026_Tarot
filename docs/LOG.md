# 變更紀錄

## 2026-11-16（第八次）

- **抽牌特效完成**（尚未 commit；範圍與設計見 `docs/05-fx-plan.md`）：洗牌與 CSS 牌背、發牌 stagger、CSS 3D 翻牌、六張散去、塌縮轉場（CSS 版與手寫 WebGL2 版）、結果頁進場（`sessionStorage` 交棒＋`view-transition-name` morph）、tier 3 的 WebGL2 散去粒子。不做環境干涉場。零新依賴。
  - 新增：`src/scripts/store.ts`、`draw.ts`、`reveal.ts`、`fx/tier.ts`、`fx/gl.ts`、`fx/collapse.ts`、`fx/particles.ts`、`src/components/fx/FxCanvas.astro`。
  - 修改：`Card.astro`（`flip` prop、牌背）、`index.astro`、`deck/[slug].astro`、`TarotLayout.astro`（`head` slot）、`tokens.css`（`--color-on-ink-sheen`、`--dur-flip`、`--z-fx`）、`global.css`（`tarot-card` 的 VT 時長、reduced motion 下 root VT 歸零）。
- **WebGL2 是手寫、延遲載入的漸進增強層**：GL 三個 chunk 只在 tier ≥ 2 於 idle 或第一次 `pointerdown`／`focusin` 時動態 `import()`，結果頁不載入；點擊當下還沒載好就播 CSS 版，不等待。護欄：分級（reduced motion／save-data／cores／deviceMemory）、DPR ≤ 1.5、看門狗（每 20 幀或累計 400ms 取平均，> 24ms 就降解析度並把 tier 降一級寫入 `sessionStorage('fx-tier')`，再超過一次跳到最後一幀）、`visibilitychange` 暫停、`webglcontextlost` 隱藏 canvas 並立即導頁、1600ms 保底導頁、bfcache（`pageshow` persisted 重置首頁）。`?fx=0..3` 只在 DEV 有效，正式建置已移除。
- **塌縮 shader**：原創，兩個同相位波源（點擊點與其對螢幕中心的鏡射點）產生的同心干涉環，硬邊、純黑白，前緣之後的線依距離與時間變細，最後一幀為純 `--color-ink`；顏色由 CSS token 讀入。
- **與計畫的差異**：
  - 洗牌是重排七個 `<a>` 在七個格子裡的位置，不是搬動 `<li>`（搬動 `<li>` 會讓發牌動畫重播）；效果相同，DOM 順序仍等於 Tab 順序與 `aria-label` 編號。
  - 交棒改用 `sessionStorage('tarot-draw')`，導頁網址不帶 `?draw=1`（`02` §6.8 已加註）；結果頁用行內腳本先加 `html.is-drawn` 避免首幀閃爍，`reveal.ts` 再核對牌 id 與 15 秒時效。
  - reduced motion 的散去淡出用 `--dur-fast`（160ms），不是 120ms；整段約 200ms 後導頁。
  - 選中牌在支援 `pageswap` 的瀏覽器上浮在特效層之上（才能 morph 到結果頁的牌），不支援時被塌縮一起吞掉。
  - deviceMemory 未提供（Safari、Firefox）時，tier 3 判斷視為 4，否則 iPhone 永遠沒有粒子。
  - 看門狗的窗口不是單純 20 幀：整段特效只有約 1 秒、實際有畫面的幀不到 60 幀，照「連續 20 幀、第二次超過才寫入」的字面做，第二次永遠到不了，降級也就不會寫入（用 40ms 的假忙碌幀實測確認過）。改成每 20 幀或累計 400ms（至少 4 幀）先到先算，且每次超過都降一級寫入；閾值 24ms、解析度 ×0.66 不變。
  - 版面仍不是牌扇。首頁牌陣改為 flex-wrap：48rem 以下每張寬 `clamp(5.5rem, 26vw, 8.25rem)`（`02` §5 的行動版尺寸），375px 排成 3-3-1，頁高 2721px 降為 1111px；48rem 以上 10.5rem、4-3 排列。原本 `repeat(auto-fit, minmax(min(100%, 9rem), 10.5rem))` 在 375px 只排得下一欄。
- 文件：`02-plan.md` 更新非目標、§6.1 時間軸、§6.3 散去與粒子、§6.5 reduced motion 表、§6.8 交棒說明、§10 技術句、§11 Must／Later；`README.md` 技術句、時程句、文件表、狀態表；`SITEMAP.md` 登記所有新增與變更檔案；`05-fx-plan.md` 列入文件表。
- 驗證（本機實際執行）：
  - `pnpm check` 0 錯誤 0 警告 0 提示；`pnpm build` 10 個 HTML；預設 base 與 `ASTRO_BASE_PATH=/` 都能建置、連結與腳本路徑正確。另以 `tsc --noEmit` 確認 `src/scripts/**` 型別通過。
  - gzip：首頁初始 JS 約 3.2 KB（含行內 59 B），GL chunk 合計約 3.2 KB（`gl` 1.4、`collapse` 0.9、`particles` 1.0），結果頁 JS 約 0.9 KB；預算為 35 KB 與 20 KB。七張結果頁 HTML 沒有任何 GL chunk 的參照；首頁 HTML 仍有七個正面 `<a href>`（無 JS 備援）。
  - 以無頭 Chrome（CDP，`file://` 副本、實體 GPU、375×812 與 1440×900）實際跑過：tier 3（粒子＋GL 塌縮）、tier 1（CSS 塌縮）、tier 0（reduced motion，約 204ms 導頁）、鍵盤 Tab＋Enter、無 JS 版面、模擬 `pageshow` persisted 重置、用 `WEBGL_lose_context` 在塌縮中途觸發 context lost（立即導頁）、結果頁進場與 `role="status"` 宣告；沒有 console 錯誤，無水平捲軸。過程中發現並修正：正式建置的 CSS 會把 `240ms` 壓成 `.24s`，`draw.ts` 的 token 讀取要處理 `s` 與 `ms`。
  - 另用 `fx-tier` 預設值測過 tier 2（無粒子、約 1.49 秒導頁）；用每幀 40ms 的假忙碌測過看門狗：解析度降為 0.66 倍、`fx-tier` 寫入 1、下一次載入 `data-fx` 為 1；每幀 12ms 時不觸發。
  - dev server（內建瀏覽器，375×812 與 1440×900）：`?fx=1`、`?fx=2`、`?fx=3` 首頁到結果頁都走得通，無水平捲軸。console 只在 dev 冷編譯某條路由的第一次造訪出現 `InvalidStateError: Transition was aborted … Page already revealed`，同一路由再走就沒有，判斷是編譯太慢讓 Chrome 中止跨文件 VT，正式建置未確認。
  - **未驗證**：正式建置於 http(s) 上的跨文件 VT morph、真機 iOS Safari、IG、LINE、Android、真正的 `prefers-reduced-motion` 媒體查詢（需在 DevTools Rendering 面板模擬）。

## 2026-11-16（第七次）

- **K6 定案**：repo 已移到 `QRACON-tw/Qracon_Tarot`，正式網址 `https://qracon.entangletech.tw/Qracon_Tarot/`。本機 `origin` 改指新位置；`astro.config.mjs` 預設 base 由 `/tarot` 改為 `/Qracon_Tarot`；`README.md`、`docs/SITEMAP.md`、`02` §5、`03`、`handoff` 的 QR 網址同步更新。
- **暫不部署**：`.github/workflows/deploy-pages.yml` 拿掉 `push` 觸發，只留 `workflow_dispatch`；推 `main` 不會部署。軟上線前再加回。

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
