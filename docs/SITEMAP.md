# 站台地圖與檔案清單

牌面與 OG 素材完成（2026-11-20）；主站來源一律指 `QRACON-tw/2026` 的 `257b790`。特效設計見 `05-fx-plan.md`。

## 路由

預設 base 為 `/2026/tarot`；建置時可由 `ASTRO_BASE_PATH`、`ASTRO_SITE` 覆寫（見 `README.md`）。部署由主站 repo `QRACON-tw/2026` 的 workflow 掛載（`02` §11）。

| URL（預設 base） | 檔案 | 狀態 |
| --- | --- | --- |
| `/2026/tarot/` | `src/pages/index.astro` | 七張牌面插畫與同一張牌背。無 JS：七張牌正面的連結清單。有 JS：洗牌、翻牌、散去、塌縮轉場（`05-fx-plan.md`）；洗牌後七個 `<a>` 的 href 停在 `/deck/`、真目標存記憶體，翻牌前不破梗。副標與提示句之間有今日紀錄行「你今天抽到：〈角色名〉　再看一次」（`localStorage['qracon.tarot.today']`；預設 `hidden`，今天抽過牌才顯示）。提示句下有通往牌組頁的引導連結。版面仍是格狀，牌扇未做；OG 使用 `/og/tarot.png` |
| `/2026/tarot/deck/` | `src/pages/deck/index.astro` | 七張牌面插畫清單；「關於這副牌」未做；OG 使用 `/og/tarot-deck.png` |
| `/2026/tarot/deck/fool/`、`lovers/`、`hermit/`、`wheel/`、`death/`、`tower/`、`sun/` | `src/pages/deck/[slug].astro` | 單牌圖文結果頁，屬性為數字（屬性條、票券、狀態章在 P3）；從首頁抽到時有進場動畫，並以 `role="status"` 宣告「你抽到〔角色名〕。」；[ 重新抽一張 ] 旁有「分享限動圖」（開啟限動圖 dialog；沒有 JS 時直接開 PNG）與「分享連結」（Web Share → 複製連結退路，`reveal.ts` 內嵌）；從首頁抽到時另把今日紀錄寫進 `localStorage`；`reading.today` 有值時「量子概念」之後多一個「今日塔羅」區塊（目前七張都沒有文字，所以不顯示）；每張牌有對應 OG 圖 |
| `/2026/tarot/story/fool.png`、`lovers.png`、`hermit.png`、`wheel.png`、`death.png`、`tower.png`、`sun.png` | `public/story/*.png` | 1080 × 1920 限動圖（靜態檔，由 `scripts/build-story.mjs` 產生並 commit，不是 Astro 頁面）；結果頁的限動圖 dialog 與無 JS 時的「分享限動圖」連結都指向它；不進 sitemap |
| `/2026/tarot/404.html` | `src/pages/404.astro` | `noindex`、無 canonical |
| `/2026/tarot/sitemap.xml` | `src/pages/sitemap.xml.ts` | `TAROT_INDEXABLE = false` 時沒有任何 `<loc>` |
| `/2026/tarot/robots.txt` | `src/pages/robots.txt.ts` | 全部允許，附 sitemap 網址 |
| `/2026/tarot/lab/share-test/` | `public/lab/share-test/index.html` | 實機分享測試頁（暫時）：測 Web Share 帶圖、複製圖片、下載、長按存圖、IG 限動連結、LINE 外部瀏覽器參數；`noindex, nofollow`、不進 sitemap、站內沒有任何連結；測完即刪 |

建置產出 10 個 Astro 頁面 HTML：首頁、deck、七張牌、404；另有 `public/lab/share-test/index.html` 原樣複製進 `dist/`（靜態測試頁，不是 Astro 頁面，測完即刪），`dist/` 內共 11 個 HTML；另有 `public/story/` 的七張 PNG 原樣複製進 `dist/story/`。

## 檔案

「來源」欄：**複製**＝與主站 `257b790` 內容相同（行尾統一為 LF）；**改寫**＝複製後調整；**新增**＝本專案自己寫的。

### 根目錄

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `package.json` | 套件與指令；名稱 `qracon-tarot-2026`，依賴與主站相同；`build:story` 指令產生七張限動圖（`scripts/build-story.mjs`，需 Google Chrome） | 改寫 |
| `pnpm-lock.yaml` | 鎖檔，解析結果與主站一致 | 複製 |
| `pnpm-workspace.yaml` | pnpm 12 的 `allowBuilds`（esbuild） | 複製 |
| `tsconfig.json` | `astro/tsconfigs/strict` | 複製 |
| `astro.config.mjs` | `site` 讀 `ASTRO_SITE`、`base` 讀 `ASTRO_BASE_PATH`（預設 `/2026/tarot`，空字串視為 `/`）；`fonts` 的字族與字重與主站相同，但 Noto Sans TC 另外設定：`options.experimental.glyphs` 只抓 `src/` 內 `.astro`／`.ts`／`.css` 出現過的字（加上 ASCII 可列印字元），全站共用單一 woff2（Google Fonts `text=`）；`optimizedFallbacks: false`（Astro 產生的 Arial 備援會依中文字寬放大約 197%，字型載入前英數字變成兩倍大）；移除 `// @ts-check`（見下方備註） | 改寫 |
| `PRODUCT.md` | 產品脈絡（impeccable `init` 產生）：使用者、目的、定位、使用情境、硬限制、品牌承諾、現有素材、產品原則、無障礙；給 impeccable 與之後的設計工作讀，細節仍以 `docs/` 為準 | 新增 |
| `.gitignore` | 忽略 `dist/`、`.astro/`、`node_modules/`、`.env*` 等；不忽略 `docs/` | 新增 |
| `.gitattributes` | `* text=auto`；`yml`／`yaml`／`mjs`／`sh` 固定 LF；圖檔標為 binary | 新增 |
| `.github/workflows/ci.yml` | push／PR 跑 `pnpm check`＋`pnpm build`。部署改由主站 repo `QRACON-tw/2026` 的 `deploy-pages.yml` 掛載（`02` §11）；原 `deploy-pages.yml`（本 repo 自己的 Pages 部署）已移除 | 改寫 |

### `public/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `favicon.ico`、`favicon-96x96.png`、`apple-touch-icon.png` | 網站圖示 | 複製 |
| `og/tarot.png`、`og/tarot-deck.png`、`og/{fool,lovers,hermit,wheel,death,tower,sun}.png` | 1200 × 630 PNG 分享圖；墨底、字標、頁面文案與相應牌面／牌背，由 `scripts/build-og.mjs` 產生 | 生成 |
| `story/{fool,lovers,hermit,wheel,death,tower,sun}.png` | 1080 × 1920 限動圖；8-bit 調色盤（256 階灰）PNG，每張 70.0–95.8 KB；內容只在安全帶 y 250–1670、左右各留 96 px；由 `scripts/build-story.mjs` 產生，本機執行後 commit | 生成 |
| `lab/share-test/index.html` | 實機分享測試頁（暫時）：單一檔案、行內樣式與腳本、不載入外部資源；瀏覽器以 canvas 產生 1080 × 1920 測試圖（引用 `og/fool.png`），測 Web Share 帶圖、剪貼簿圖片、下載、長按存圖、IG 限動連結、LINE 外部瀏覽器參數；結果存該手機的 `localStorage`，可複製成純文字回報；測完即刪 | 新增 |

### `src/assets/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `brand/qracon-wordmark.png` | 官網字標，供 OG 分享圖使用 | 主站素材 |
| `tarot/tarot-{fool,lovers,hermit,wheel,death,tower,sun}.png` | 七張 1440 × 2520 灰階牌面插畫；單張 ≤ 400 KB | imagegen |
| `tarot/tarot-back.png` | 同一張 1440 × 2520 牌背；以官網預設黑貓團隊頭像為視覺參考 | imagegen |

### `src/styles/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `tokens.css` | 設計值唯一來源；新增 `--color-on-ink-sheen`（牌背銀墨高光）、`--dur-flip`（600ms）、`--z-fx`（60，高於頁首與選單，低於 skip link），其餘與主站相同 | 改寫 |
| `global.css` | 全域樣式；改為暗場（`color-scheme: dark`、墨底白字、白色焦點框、墨底捲軸）；移除主站專用的 `route-dot`／`route-label`／`vt-session` 轉場規則；新增 `::view-transition-group(tarot-card)` 的時長與緩動，`prefers-reduced-motion` 下 root 的 View Transition 也歸零 | 改寫 |

### `src/utils/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `paths.ts` | `sitePath()`：站內路徑補 base，外部網址原樣保留 | 複製 |
| `tarot.ts` | `TAROT_INDEXABLE`、`cardPath()`、`cardById()`、`getIndexablePaths()`、`validateCards()`（含 `reading.today` 的檢查：有設定時非空、≤ 80 字，`TODAY_MAX`） | 新增 |

### `src/data/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `site.ts` | `MAIN_SITE`／`mainSite()`、`RegistrationStatus`、塔羅站名稱與描述、活動日期、報名狀態與網址（取自主站 `src/data/site.ts`） | 新增 |
| `tarot.ts` | `CARD_IDS`、`TarotCard` 型別（`02` §8；`reading.today?` 為行銷組提供的今日塔羅文字，目前七張都沒有）、七張牌文案（逐字取自 `01` §5、§6）；不含驗證邏輯 | 新增 |

### `src/components/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `Button.astro` | 按鈕；新增 `variant="on-ink"`（透明底白框白字，hover／焦點反白） | 改寫 |
| `Icon.astro` | 只留 Button、頁尾與 404 用到的三個箭頭 | 改寫 |
| `SeoHead.astro` | `<head>` 內的 meta、canonical、icon、OG／Twitter、字型（兩個字族都 `preload`）；沒有 `image` 時不輸出 OG 圖標籤 | 新增（結構取自主站 `BaseLayout.astro`） |
| `tarot/Card.astro` | 插畫牌面：灰階牌面圖（`astro:assets` AVIF，縮放 88% 讓上下留白約 20%）、4:7、雙框；上方羅馬數字，下方白底文字帶放英文牌名（全大寫 `--font-sign`）與橫排角色名（`text-wrap: balance`），文字都收在髮絲內框內、落在插畫上下留白；字級用容器查詢單位。沒有牌面圖時以 `TarotGlyph` 線稿作備援。`flip` prop 使用同一張牌背圖與 `rotateY` 翻面；`data-fx="0"`（reduced motion）下翻面改交叉淡化 | 新增 |
| `tarot/TarotGlyph.astro` | 七張量子概念的 40 × 40 線稿字體牌符號，作為無牌面圖時的備援 | 新增 |
| `fx/FxCanvas.astro` | 只放首頁：`<canvas data-fx-canvas aria-hidden>`（`position: fixed; height: 100lvh; pointer-events: none`，z-index `--z-fx`）與 CSS 塌縮用的墨色 `<div data-fx-veil>`（`clip-path: circle()` 從點擊點擴張） | 新增 |

### `src/layouts/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `TarotLayout.astro` | 暗場版型：跳到主要內容、兩個文字連結的頁首（連結左右 `padding` 加等量負 `margin`，點擊範圍至少 44×44 而文字位置不變；焦點框內縮 3px，避免在畫面頂端被切掉）、`<main id="main">`、免責頁尾；呼叫 `validateCards()`，`noindex` 由 `TAROT_INDEXABLE` 控制；`<head>` 內有 `name="head"` slot（結果頁用來放進場判斷的行內腳本） | 新增 |

### `src/pages/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `index.astro` | 抽牌頁：七張圖像牌、發牌 stagger、散牌與塌縮狀態；點牌時預載該牌插畫及結果頁；橫向矮螢幕兩列（4＋3）都在首屏內；`<FxCanvas />`；首頁 OG 分享圖；副標後的今日紀錄行（`[data-today]`，預設 `hidden`；緊接其後的 `is:inline` script 在首次繪製前讀 `localStorage['qracon.tarot.today']` 填入，角色名與牌頁網址由建置時的 `data-cards` 帶入；日期不是今天就移除該鍵，`pageshow` persisted 時再填一次） | 新增 |
| `deck/index.astro` | 牌組頁 | 新增 |
| `deck/[slug].astro` | 單張牌結果頁，`getStaticPaths` 由牌組資料產生；`head` slot 內的行內腳本在 `sessionStorage('tarot-draw')` 存在時先加 `html.is-drawn`（避免首幀閃爍）；`role="status"` 宣告區；`.is-drawn` 下的進場動畫與 `view-transition-name: tarot-card`；橫向矮螢幕時牌寬上限 `55svh × 4/7`，整張牌在首屏內（跨頁 VT 的落點）；契合度連結 `min-width: 2.75rem`（牌名「塔」只有一個字）；`<script>` 載入 `scripts/reveal.ts`（建置後內嵌為 `<script type="module">`，頁面沒有外部 JS）；不載入任何 WebGL；`reading.today` 有值才渲染的「今日塔羅」區塊（在「量子概念」之後）；`.report__again` 為 [重新抽一張] [分享限動圖] [分享連結]；限動圖 `<dialog data-story-dialog>`（9:16 圖片 `loading="lazy"`、提示、`role="status"` 狀態列、按鈕；`:root:has(.story[open])` 鎖住背景捲動） | 新增 |
| `404.astro` | 找不到頁面 | 改寫 |
| `sitemap.xml.ts` | 依 `getIndexablePaths()` 產生 sitemap | 改寫 |
| `robots.txt.ts` | robots | 複製 |

### `src/scripts/`

全部是手寫 vanilla TypeScript（strict），零新依賴。`fx/gl.ts`、`fx/collapse.ts`、`fx/particles.ts` 只由 `draw.ts` 動態 `import()`，各自是獨立 chunk，結果頁不會載入。

`reveal.ts` 不可 import 任何模組（包括 `store.ts`）：只要和首頁共用模組，Rollup 就會拆出共用 chunk，結果是（1）Astro 不內嵌結果頁的 script（`astro/dist/core/build/plugins/plugin-scripts.js` 只內嵌沒有 import、小於 4 KB 的 script；這個 4 KB 就是 Vite 的 `assetsInlineLimit`，即 4096 bytes，建置後的 `reveal.ts` 目前 3359 bytes，再加功能前先量），新頁首次繪製時外部 script 還在下載，Chrome 157 就放棄跨頁 View Transition；（2）首頁入口多一跳，慢速網路下被字型擠到很晚才執行。

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `store.ts` | `sessionStorage` 的 `try/catch` 包裝，只給首頁用：`fx-tier`（看門狗降級結果）的讀寫、`tarot-draw`（首頁到結果頁的交棒）的寫入與清除；建置時併入首頁入口檔 | 新增 |
| `draw.ts` | 首頁狀態機（`idle → resolving → navigating`）：`crypto.getRandomValues` Fisher–Yates 洗牌（重排七個 `<a>` 在格子裡的位置，並寫 `aria-label="第 N 張牌"`；洗完把 href 停在 `/deck/`、真目標存 `Map`，點擊才導頁，翻牌前不破梗）、鎖輸入（`inert`、`aria-busy`）、prefetch 結果頁並預載所選牌面圖（`preloadCardArt`）、時間軸、1600ms 保底導頁、bfcache（`pageshow` persisted 時重置）、GL 預載（idle 或第一次 `pointerdown`／`focusin`）、tier 0 的 200ms 交叉淡化導頁 | 新增 |
| `scripts/build-og.mjs` | 從 `src/data/tarot.ts` 讀取牌名與定義，以 sharp 產生首頁、牌組及七張單牌共 9 張 OG 分享圖 | 新增 |
| `scripts/build-story.mjs` | 產生 `public/story/` 的七張限動圖（`pnpm build:story`）：以正規表示式讀 `src/data/tarot.ts`（與 `build-og.mjs` 同風格），每張牌渲染一頁 HTML，用無頭 Google Chrome（`--headless=new`、1080 × 1920）截圖，再以 sharp 寫成調色盤 PNG；用 Chrome 是因為 sharp 的 FreeType 讀不了網站的 WOFF2 字型（`.astro/fonts`）。護欄：圖上每個字都要在 `src/` 與 Noto 檔的 cmap 裡、全圖中性灰、安全帶外純黑、截圖 1080 × 1920、七張全過才寫入。需要 Google Chrome（或 `CHROME_PATH`）與先跑過 `pnpm build`；只在 macOS 跑過 | 新增 |
| `reveal.ts` | 結果頁：讀取並清除交棒（自帶 `tarot-draw` 鍵名與 15 秒時效，不 import `store.ts`）、核對牌 id、確認 `.is-drawn`、0.5 秒後在 `role="status"` 寫入宣告；「分享連結」按鈕（`navigator.share({ title, text, url })`，無 share 時按鈕改「複製連結」，取消靜默，其他錯誤退複製連結，剪貼簿也被擋時顯示網址連結供長按複製）；今日紀錄（只在交棒成功時把 `{ id, day }` 寫進 `localStorage['qracon.tarot.today']`，鍵名與形狀要和 `index.astro` 的 inline script 同步）；限動圖 dialog（連結點擊開 `<dialog>`、開啟時 `fetch` PNG 成 `File`、同步呼叫 `navigator.share({ files })`、依 `canShare` 與 UA 決定按鈕顯示、關閉時還原焦點）；建置後 3359 bytes，上限 4096 | 新增 |
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

- 特效層體積（gzip，2026-11-18 實測）：首頁初始 JS 約 3.0 KB（單一入口檔，`draw.ts` ＋ `tier.ts` ＋ `store.ts`，沒有靜態 import，含行內 59 B）；GL 三個 chunk 合計約 3.4 KB（`gl` 1.5、`collapse` 0.9、`particles` 0.9），tier ≥ 2 才在 idle 載入；結果頁 JS 約 0.55 KB，全部內嵌（`reveal.ts` 0.36 KB、`<head>` 判斷 0.13 KB、`js` class 0.06 KB）。這組數字是 11-18 的量測；2026-11-23 起 `reveal.ts` 多了今日紀錄與限動圖 dialog，建置後為 3359 bytes（未壓縮，gzip 未重量）。
- 特效的 CSS 狀態類別：`html.is-resolving`（鎖捲動）、`html.is-collapsing`（CSS 塌縮）、`html.has-vt`（支援 `pageswap` 時，選中牌浮在特效層之上並命名 `tarot-card`）、`html[data-fx="0..3"]`（目前 tier）、`li.is-picked`、`li.is-gone`、`.card.is-flipped`、`html.is-drawn`（結果頁進場）。

- 主站 `257b790` 的 `astro check` 本身就有 1 個錯誤：`astro.config.mjs` 有 `// @ts-check`，又 `import ... from 'node:process'`，但沒有 `@types/node`（`ts(2591)`）。本專案移除 `// @ts-check` 以通過檢查，不新增依賴。
- 與主站同步：本專案複製的檔案不會自動跟著主站更新（`02` R7）。主站改了 `tokens.css`、`global.css`、`Button.astro`、`paths.ts`、`Icon.astro` 時需人工比對。
