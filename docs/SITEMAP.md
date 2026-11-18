# 站台地圖與檔案清單

P1 骨架與抽牌特效（2026-11-16）。主站來源一律指 `QRACON-tw/2026` 的 `257b790`。特效設計見 `05-fx-plan.md`。

## 路由

預設 base 為 `/Qracon2026_Tarot`；部署時由 `ASTRO_BASE_PATH`、`ASTRO_SITE` 覆寫（見 `README.md`）。

| URL（預設 base） | 檔案 | 狀態 |
| --- | --- | --- |
| `/Qracon2026_Tarot/` | `src/pages/index.astro` | 無 JS：七張牌正面的連結清單。有 JS：洗牌、牌背、發牌、翻牌、散去、塌縮轉場（`05-fx-plan.md`）。版面仍是格狀，牌扇未做 |
| `/Qracon2026_Tarot/deck/` | `src/pages/deck/index.astro` | P1：七張牌清單；「關於這副牌」未做 |
| `/Qracon2026_Tarot/deck/fool/`、`lovers/`、`hermit/`、`wheel/`、`death/`、`tower/`、`sun/` | `src/pages/deck/[slug].astro` | 純文字結果頁，屬性為數字（屬性條、票券、狀態章在 P3）；從首頁抽到時有進場動畫，並以 `role="status"` 宣告「你抽到〔角色名〕。」 |
| `/Qracon2026_Tarot/404.html` | `src/pages/404.astro` | `noindex`、無 canonical |
| `/Qracon2026_Tarot/sitemap.xml` | `src/pages/sitemap.xml.ts` | `TAROT_INDEXABLE = false` 時沒有任何 `<loc>` |
| `/Qracon2026_Tarot/robots.txt` | `src/pages/robots.txt.ts` | 全部允許，附 sitemap 網址 |

建置產出 10 個 HTML：首頁、deck、七張牌、404。

## 檔案

「來源」欄：**複製**＝與主站 `257b790` 內容相同（行尾統一為 LF）；**改寫**＝複製後調整；**新增**＝本專案自己寫的。

### 根目錄

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `package.json` | 套件與指令；名稱 `qracon-tarot-2026`，依賴與主站相同 | 改寫 |
| `pnpm-lock.yaml` | 鎖檔，解析結果與主站一致 | 複製 |
| `pnpm-workspace.yaml` | pnpm 12 的 `allowBuilds`（esbuild） | 複製 |
| `tsconfig.json` | `astro/tsconfigs/strict` | 複製 |
| `astro.config.mjs` | `site` 讀 `ASTRO_SITE`、`base` 讀 `ASTRO_BASE_PATH`（預設 `/Qracon2026_Tarot`，空字串視為 `/`）；`fonts` 與主站相同；移除 `// @ts-check`（見下方備註） | 改寫 |
| `.gitignore` | 忽略 `dist/`、`.astro/`、`node_modules/`、`.env*` 等；不忽略 `docs/` | 新增 |
| `.gitattributes` | `* text=auto`；`yml`／`yaml`／`mjs`／`sh` 固定 LF；圖檔標為 binary | 新增 |
| `.github/workflows/deploy-pages.yml` | GitHub Pages 部署；`configure-pages` 移到建置前，並把 `origin`、`base_path` 以 `ASTRO_SITE`、`ASTRO_BASE_PATH` 傳給建置；觸發只留 `workflow_dispatch`（暫不部署） | 改寫 |

### `public/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `favicon.ico`、`favicon-96x96.png`、`apple-touch-icon.png` | 網站圖示 | 複製 |

### `src/styles/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `tokens.css` | 設計值唯一來源；新增 `--color-on-ink-sheen`（牌背銀墨高光）、`--dur-flip`（600ms）、`--z-fx`（60，高於頁首與選單，低於 skip link），其餘與主站相同 | 改寫 |
| `global.css` | 全域樣式；改為暗場（`color-scheme: dark`、墨底白字、白色焦點框、墨底捲軸）；移除主站專用的 `route-dot`／`route-label`／`vt-session` 轉場規則；新增 `::view-transition-group(tarot-card)` 的時長與緩動，`prefers-reduced-motion` 下 root 的 View Transition 也歸零 | 改寫 |

### `src/utils/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `paths.ts` | `sitePath()`：站內路徑補 base，外部網址原樣保留 | 複製 |
| `tarot.ts` | `TAROT_INDEXABLE`、`cardPath()`、`cardById()`、`getIndexablePaths()`、`validateCards()` | 新增 |

### `src/data/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `site.ts` | `MAIN_SITE`／`mainSite()`、`RegistrationStatus`、塔羅站名稱與描述、活動日期、報名狀態與網址（取自主站 `src/data/site.ts`） | 新增 |
| `tarot.ts` | `CARD_IDS`、`TarotCard` 型別（`02` §8）、七張牌文案（逐字取自 `01` §5、§6）；不含驗證邏輯 | 新增 |

### `src/components/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `Button.astro` | 按鈕；新增 `variant="on-ink"`（透明底白框白字，hover／焦點反白） | 改寫 |
| `Icon.astro` | 只留 Button、頁尾與 404 用到的三個箭頭 | 改寫 |
| `SeoHead.astro` | `<head>` 內的 meta、canonical、icon、OG／Twitter、字型；沒有 `image` 時不輸出 OG 圖標籤 | 新增（結構取自主站 `BaseLayout.astro`） |
| `tarot/Card.astro` | 字體牌（正面）：白面、雙框、羅馬數字（`--font-sign`）、直排角色名；4:7，字級用容器查詢單位。`flip` prop 為真時加上 CSS 占位牌背（墨底、白細框、菱格紋、中央菱形、一次性銀墨掃光）與 `rotateY` 翻面；沒有 `flip` 時外觀與 P1 相同，結果頁與牌組頁不受影響。`data-fx="0"`（reduced motion）下翻面改交叉淡化 | 新增 |
| `fx/FxCanvas.astro` | 只放首頁：`<canvas data-fx-canvas aria-hidden>`（`position: fixed; height: 100lvh; pointer-events: none`，z-index `--z-fx`）與 CSS 塌縮用的墨色 `<div data-fx-veil>`（`clip-path: circle()` 從點擊點擴張） | 新增 |

### `src/layouts/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `TarotLayout.astro` | 暗場版型：跳到主要內容、兩個文字連結的頁首、`<main id="main">`、免責頁尾；呼叫 `validateCards()`，`noindex` 由 `TAROT_INDEXABLE` 控制；`<head>` 內有 `name="head"` slot（結果頁用來放進場判斷的行內腳本） | 新增 |

### `src/pages/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `index.astro` | 抽牌頁：每張牌 `<a data-card>`、`flip` 牌、發牌 stagger（`:nth-child` 給 `--i`）、散去與選中牌的狀態樣式（`html.is-resolving` 時 `body` 加 `overflow-x: clip`，散牌不造成水平溢出，避免手機 Chrome 撐大 layout viewport）、`<FxCanvas />`；`<script>` 載入 `scripts/draw.ts` | 新增 |
| `deck/index.astro` | 牌組頁 | 新增 |
| `deck/[slug].astro` | 單張牌結果頁，`getStaticPaths` 由牌組資料產生；`head` slot 內的行內腳本在 `sessionStorage('tarot-draw')` 存在時先加 `html.is-drawn`（避免首幀閃爍）；`role="status"` 宣告區；`.is-drawn` 下的進場動畫與 `view-transition-name: tarot-card`；`<script>` 載入 `scripts/reveal.ts`（建置後內嵌為 `<script type="module">`，頁面沒有外部 JS）；不載入任何 WebGL | 新增 |
| `404.astro` | 找不到頁面 | 改寫 |
| `sitemap.xml.ts` | 依 `getIndexablePaths()` 產生 sitemap | 改寫 |
| `robots.txt.ts` | robots | 複製 |

### `src/scripts/`

全部是手寫 vanilla TypeScript（strict），零新依賴。`fx/gl.ts`、`fx/collapse.ts`、`fx/particles.ts` 只由 `draw.ts` 動態 `import()`，各自是獨立 chunk，結果頁不會載入。

`reveal.ts` 不可 import 任何模組（包括 `store.ts`）：只要和首頁共用模組，Rollup 就會拆出共用 chunk，結果是（1）Astro 不內嵌結果頁的 script（`astro/dist/core/build/plugins/plugin-scripts.js` 只內嵌沒有 import、小於 4 KB 的 script），新頁首次繪製時外部 script 還在下載，Chrome 157 就放棄跨頁 View Transition；（2）首頁入口多一跳，慢速網路下被字型擠到很晚才執行。

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `store.ts` | `sessionStorage` 的 `try/catch` 包裝，只給首頁用：`fx-tier`（看門狗降級結果）的讀寫、`tarot-draw`（首頁到結果頁的交棒）的寫入與清除；建置時併入首頁入口檔 | 新增 |
| `draw.ts` | 首頁狀態機（`idle → resolving → navigating`）：`crypto.getRandomValues` Fisher–Yates 洗牌（重排七個 `<a>` 在格子裡的位置，並寫 `aria-label="第 N 張牌"`）、鎖輸入（`inert`、`aria-busy`）、prefetch、時間軸、1600ms 保底導頁、bfcache（`pageshow` persisted 時重置）、GL 預載（idle 或第一次 `pointerdown`／`focusin`）、tier 0 的 200ms 交叉淡化導頁 | 新增 |
| `reveal.ts` | 結果頁：讀取並清除交棒（自帶 `tarot-draw` 鍵名與 15 秒時效，不 import `store.ts`）、核對牌 id、確認 `.is-drawn`、0.5 秒後在 `role="status"` 寫入宣告 | 新增 |
| `fx/tier.ts` | 分級：reduced motion → 0；save-data、cores ≤ 2 或 deviceMemory ≤ 2 → 1；cores ≥ 6 且 deviceMemory ≥ 4（未提供時當 4）→ 3；其餘 2；取 `sessionStorage` 降級值的較小者；只在 DEV 支援 `?fx=0..3`（正式版會被移除） | 新增 |
| `fx/gl.ts` | WebGL2 舞台：context（`failIfMajorPerformanceCaveat`）、shader 編譯與連結、全螢幕三角形頂點 shader、DPR ≤ 1.5 的 resize、單一 rAF 迴圈與 `play(duration, draw)`、看門狗（建立舞台時先量 8 幀閒置 rAF 間隔取中位數當基準；播放時每 20 幀或累計 400ms 取平均，> max(24ms, 基準 × 1.4) → 解析度 ×0.66 並降一級寫入 `fx-tier`，再超過一次 → 跳到最後一幀）、`visibilitychange` 暫停、`webglcontextlost` 隱藏 canvas 並讓進行中的播放回傳 `false`、`token()` 把 CSS token 轉成 shader 顏色 | 新增 |
| `fx/collapse.ts` | 塌縮 shader：從點擊點擴張的兩源同心干涉環，硬邊、單色；前緣之後的環隨時間與距離變細，最後一幀為純 `--color-ink`（與結果頁底色相同） | 新增 |
| `fx/particles.ts` | 散去粒子：`gl.POINTS` 600 點（每張 100 點）、菱形、單色；位置與壽命由頂點 shader 依 `gl_VertexID` 雜湊產生，沒有緩衝區 | 新增 |

### `docs/`

| 路徑 | 用途 |
| --- | --- |
| `01-copy-deck.md`、`02-plan.md`、`03-open-questions.md`、`04-asset-requirements.md` | 文案、網站計劃、待決事項、素材需求（見 `README.md`） |
| `05-fx-plan.md` | 視覺特效計畫：WebGL2 漸進增強、分級、渲染規則、時間軸、特效清單、檔案架構、驗證項目 |
| `LOG.md`、`SITEMAP.md` | 變更紀錄與本檔 |

## 刻意沒有複製的主站檔案

`seo.ts`、`data/site.ts` 的完整版、`SiteHeader`、`SiteFooter`、`hero/*`、`interference.ts`、`public/_headers`、`og-image.png`、`Stamp`、`Ticket`、`Words`、`FlapText`。後面的階段需要時再複製，並在本表登記來源。

## 備註

- 特效層體積（gzip，2026-11-18 實測）：首頁初始 JS 約 3.0 KB（單一入口檔，`draw.ts` ＋ `tier.ts` ＋ `store.ts`，沒有靜態 import，含行內 59 B）；GL 三個 chunk 合計約 3.4 KB（`gl` 1.5、`collapse` 0.9、`particles` 0.9），tier ≥ 2 才在 idle 載入；結果頁 JS 約 0.55 KB，全部內嵌（`reveal.ts` 0.36 KB、`<head>` 判斷 0.13 KB、`js` class 0.06 KB）。
- 特效的 CSS 狀態類別：`html.is-resolving`（鎖捲動）、`html.is-collapsing`（CSS 塌縮）、`html.has-vt`（支援 `pageswap` 時，選中牌浮在特效層之上並命名 `tarot-card`）、`html[data-fx="0..3"]`（目前 tier）、`li.is-picked`、`li.is-gone`、`.card.is-flipped`、`html.is-drawn`（結果頁進場）。

- 主站 `257b790` 的 `astro check` 本身就有 1 個錯誤：`astro.config.mjs` 有 `// @ts-check`，又 `import ... from 'node:process'`，但沒有 `@types/node`（`ts(2591)`）。本專案移除 `// @ts-check` 以通過檢查，不新增依賴。
- 與主站同步：本專案複製的檔案不會自動跟著主站更新（`02` R7）。主站改了 `tokens.css`、`global.css`、`Button.astro`、`paths.ts`、`Icon.astro` 時需人工比對。
