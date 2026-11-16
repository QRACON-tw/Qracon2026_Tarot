# 站台地圖與檔案清單

P1 骨架（2026-11-16）。主站來源一律指 `QRACON-tw/2026` 的 `257b790`。

## 路由

預設 base 為 `/Qracon_Tarot`；部署時由 `ASTRO_BASE_PATH`、`ASTRO_SITE` 覆寫（見 `README.md`）。

| URL（預設 base） | 檔案 | 狀態 |
| --- | --- | --- |
| `/Qracon_Tarot/` | `src/pages/index.astro` | P1：七張牌正面的靜態清單（P2 換成牌扇） |
| `/Qracon_Tarot/deck/` | `src/pages/deck/index.astro` | P1：七張牌清單；「關於這副牌」未做 |
| `/Qracon_Tarot/deck/fool/`、`lovers/`、`hermit/`、`wheel/`、`death/`、`tower/`、`sun/` | `src/pages/deck/[slug].astro` | P1：純文字結果頁，屬性為數字（屬性條、票券、狀態章在 P3） |
| `/Qracon_Tarot/404.html` | `src/pages/404.astro` | `noindex`、無 canonical |
| `/Qracon_Tarot/sitemap.xml` | `src/pages/sitemap.xml.ts` | `TAROT_INDEXABLE = false` 時沒有任何 `<loc>` |
| `/Qracon_Tarot/robots.txt` | `src/pages/robots.txt.ts` | 全部允許，附 sitemap 網址 |

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
| `astro.config.mjs` | `site` 讀 `ASTRO_SITE`、`base` 讀 `ASTRO_BASE_PATH`（預設 `/Qracon_Tarot`，空字串視為 `/`）；`fonts` 與主站相同；移除 `// @ts-check`（見下方備註） | 改寫 |
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
| `tokens.css` | 設計值唯一來源；尚無 `--color-on-ink-sheen`（牌背銀墨高光，P2 再加） | 複製 |
| `global.css` | 全域樣式；改為暗場（`color-scheme: dark`、墨底白字、白色焦點框、墨底捲軸）；移除主站專用的 `route-dot`／`route-label`／`vt-session` 轉場規則 | 改寫 |

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
| `tarot/Card.astro` | 字體牌（正面）：白面、雙框、羅馬數字（`--font-sign`）、直排角色名；4:7，字級用容器查詢單位 | 新增 |

### `src/layouts/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `TarotLayout.astro` | 暗場版型：跳到主要內容、兩個文字連結的頁首、`<main id="main">`、免責頁尾；呼叫 `validateCards()`，`noindex` 由 `TAROT_INDEXABLE` 控制 | 新增 |

### `src/pages/`

| 路徑 | 用途 | 來源 |
| --- | --- | --- |
| `index.astro` | 抽牌頁 | 新增 |
| `deck/index.astro` | 牌組頁 | 新增 |
| `deck/[slug].astro` | 單張牌結果頁，`getStaticPaths` 由牌組資料產生 | 新增 |
| `404.astro` | 找不到頁面 | 改寫 |
| `sitemap.xml.ts` | 依 `getIndexablePaths()` 產生 sitemap | 改寫 |
| `robots.txt.ts` | robots | 複製 |

## 刻意沒有複製的主站檔案

`seo.ts`、`data/site.ts` 的完整版、`SiteHeader`、`SiteFooter`、`hero/*`、`interference.ts`、`public/_headers`、`og-image.png`、`Stamp`、`Ticket`、`Words`、`FlapText`。後面的階段需要時再複製，並在本表登記來源。

## 備註

- 主站 `257b790` 的 `astro check` 本身就有 1 個錯誤：`astro.config.mjs` 有 `// @ts-check`，又 `import ... from 'node:process'`，但沒有 `@types/node`（`ts(2591)`）。本專案移除 `// @ts-check` 以通過檢查，不新增依賴。
- 與主站同步：本專案複製的檔案不會自動跟著主站更新（`02` R7）。主站改了 `tokens.css`、`global.css`、`Button.astro`、`paths.ts`、`Icon.astro` 時需人工比對。
