# 02 — 網站設計與建置計劃

**版本**：v2.2（2026-11-16，實作前審查後修訂，並依主站 `origin/main@257b790` 實況改寫部署）
**狀態**：**基準版，待 K2–K6 拍板**（`03-open-questions.md`）。v2.1 的設計決策維持；部署、範圍、時程與規格補洞為 v2.2 新增。
**[K1=C，2026-11-16]** 部署方案定案為 C：獨立 repo。§0、§2、§5、§11、R7、R9、R12 已據此改寫；其餘章節寫「直接 import／直接共用主站」之處，一律改讀為「複製自主站 `257b790`」，`tarotPath()` 改讀為 `sitePath()`、路由前綴 `/tarot/` 改讀為 §5 的 `/`、`/deck/`、`/deck/[slug]/`。
**範圍**：只做規劃。本文件不含任何程式碼實作。
**配套**：`01-copy-deck.md`（文案）、`03-open-questions.md`（待決）、`04-asset-requirements.md`（素材需求）、`LOG.md`（變更紀錄）

### v2.2 變更摘要

| 項目 | v2.1 | v2.2 |
| --- | --- | --- |
| 部署 | 方案 A：`apps/tarot` 子專案 + `base: '/tarot'` | **A1**：主站 repo 內 `src/pages/tarot/`，沿用主站 `base` 與 `sitePath()`（§2、§11） |
| 網址 | `/tarot/`（網域未定） | `https://qracon.entangletech.tw/2026/tarot/`（§5） |
| 時程 | P0–P6 共 14 工作天，無目標日 | **12/02 上線、12/06 凍結**（§11） |
| 範圍 | 全部必做 | Must／Should／Later（§11） |
| 分享 | Canvas 9:16 分享卡 + Web Share 帶檔案 | 結果頁第一屏 9:16 可截圖 + 只分享網址；Canvas 分享卡移到 Later（§9） |
| 碎裂動畫 | 必做 | Should；Must 用淡出（§6.3） |
| 關於頁 | 獨立頁 | Must 併入 `/tarot/deck/`（§5） |
| 規格 | — | 補 S1–S12（標 `[v2.2]`） |

---

## 0. 摘要

一個手機優先的互動：七張牌背朝上的塔羅牌扇形展開，使用者點一張，其餘六張散去，被選的那張翻開，接著展開成一張「觀測報告」票券。全程 30–60 秒，最後把人帶到議程頁與報名頁。

技術上與主站同源，但**獨立成自己的 repo**（K1＝C；Astro 7 靜態輸出、零框架、原生 CSS）。字型設定、tokens、`Button`、`sitePath()` 從主站 `257b790` 複製，不再直接 import；字標、躍貓等素材需要時才複製。本站自己的是：牌組資料、扇形互動、七張結果頁、塔羅專用 layout。

### 四個設計決策

| # | 決策 | 決定 | 狀態 |
| --- | --- | --- | --- |
| D1 | 色彩方向 | **A 暗房（純灰階）**：墨黑場、紙白牌面、銀墨壓紋 | Gemini 4 核准 |
| D2 | 牌面插畫 | 設計組交付 7 張；先用「字體牌」上線 | 核准 |
| D3 | CTA 目標 | 只導向議程與報名（KKTIX），報名截止後改導向會場頁 | 定案 |
| D4 | 部署位置 | 獨立 repo（C，§11） | K1 定案（2026-11-16） |

---

## 1. 目標與非目標

### 目標

1. 讓人在 60 秒內完成一次抽牌，並記住自己抽到哪一張。
2. 抽完之後，有一個明確的下一步：看議程，或報名。
3. 七張牌各自可分享、可被搜尋索引（不是只能用一次的黑箱）。
4. 讀起來像「學生做的量子占卜」，不像企業活動的導流頁。

### 非目標

- 不做會員、登入、集點、排行榜。
- 不做心理測驗量表，也不宣稱任何預測能力。
- 不做 3D 場景、不引入 three 等 WebGL 函式庫、不移植主站 `interference.ts`。WebGL2 只當手寫、延遲載入的漸進增強層（塌縮轉場與散去粒子），失敗只少一層；翻牌用 CSS 3D。範圍、分級與看門狗見 `05-fx-plan.md`。
- 不做多語系。
- 不做後端。抽牌結果只存在瀏覽器。

---

## 2. 與主站的關係

塔羅站是主站的**附屬頁面**，不是新品牌。三條硬規則：

1. **素材不重畫**。字標、躍貓、favicon、字型、tokens 從主站複製，不重畫（§7）。複製的檔案與來源版本記在 `docs/SITEMAP.md`。
2. **元件沿用主站的設計，程式碼複製過來**（K1＝C 後不再直接 import）。`Button`、`Stamp`、`FlapText`、`Ticket`、`Words` 需要時從主站 `257b790` 複製，改動記在 `docs/SITEMAP.md`。`Button` 的 prop 是 `variant?: 'ink' | 'line'`，只新增一個值 `'on-ink'`（取代主站首頁 `:global(.board__cta)` 的局部覆寫），不新增 `tone` 這種別名。
3. **不連回主站導覽**。塔羅頁用自己的 `TarotLayout`（不含 `SiteHeader`／`SiteFooter`），頁尾加一行「QRACON 2026 官網 ↗」。主站入口另開一個主站 PR，12/02 正式上線時加（§11）。

### [v2.2] 主站實況（`origin/main@257b790`，2026-11-16）

- repo 已移到 **`QRACON-tw/2026`**（舊網址 `Twcat0503/qracon_web_2026` 會轉址）。協作者近期幾乎每天推 `main`。
- 技術棧：`astro@^7.3.2`、`sharp@^0.35.4`、`typescript@^6.0.3`（`astro/tsconfigs/strict`）、`pnpm@12.3.4`（corepack），Node ≥22.12。無 linter、無測試；完成定義是 `pnpm check`、`pnpm build` 通過，1440 與 375 寬實際看過。
- **部署**：GitHub Actions（`.github/workflows/deploy-pages.yml`），每次推 `main` 就建置並部署到 GitHub Pages。共用網域 `qracon.entangletech.tw` 由 `QRACON-tw/qracon-tw.github.io` 管理，本站在 `/2026/`。
- **base**：`astro.config.mjs` 為 `site: 'https://qracon.entangletech.tw'`、`base: env.ASTRO_BASE_PATH ?? '/2026'`。同一份程式碼可以建在 `/2026/` 或根目錄。
- **路徑 helper**：`src/utils/paths.ts` 的 `sitePath()` 會把站內路徑補上 base，外部網址原樣保留。canonical、OG、sitemap、robots 都已經走它。
- **`public/_headers` 在 GitHub Pages 沒有作用**（那是 Cloudflare Pages 的格式）。快取標頭不可控，GitHub Pages 固定 `max-age=600`。
- 主站本機的 `CLAUDE.md`、`DESIGN.md`、`PRODUCT.md`、`docs/` 大多被 gitignore。`CLAUDE.md` 仍寫「正式網域 `2026-qracon.entangletech.tw`、`_headers` 讓 pages.dev 回 noindex」，**已過時**。
- Astro 7 慣例：預設 `compressHTML: 'jsx'`，行內元素之間要空格就寫 `{' '}`；非 void 標籤一律正確閉合。

### [v2.2] 塔羅要遵守的主站規則

主站規範文件不在 git 裡，協作者看不到，所以在這裡寫全：

- **Zero Hue Rule**：全站不得出現任何色相，連焦點框、文字選取、捲軸都一樣。唯一例外是 `/team` 頭像照片。
- **Lit Sign Rule**：白是「點亮」，大面積的白只能是牌面、票券這類物件，不能是版面底色。
- **The Latin-Only Sign Rule**：`var(--font-sign)` 只給拉丁字母與數字（§4.2）。
- **One Ticket Rule**：層級靠線重、反白、字重，不靠陰影與漸層；票券是唯一有陰影的物件。
- **不用眉標、區段編號、數字大卡片**（DESIGN.md Don'ts）。結果頁的「量子狀態觀測報告」是票頭，不是眉標（`01` §7）。
- **無裸值**：元件裡不寫裸色碼、裸 px 間距、裸 `cubic-bezier()`，一律用 `tokens.css`。
- **動畫**只寫在 `@media (prefers-reduced-motion: no-preference)` 裡。
- **文案直白**：主站規定標題不用隱喻。塔羅是附屬頁例外，隱喻只在牌義內，介面標籤仍直白。
- **站內連結一律經 `sitePath()`**，不得寫死 `/2026/`、`/tarot/`，也不得寫死根路徑。

---

## 3. 設計方向（D1）

### 選項

**A. 暗房（建議，純灰階版）**

主站是一張印好的紙，塔羅站是暗房裡顯影中的底片。同一個材質系統，反相使用。

- 場：純墨 `#000`（`--color-ink`），不是深藍、不是紫。
- 牌面：紙白 `#FFF`（`--color-white`）——全頁唯一「被點亮」的表面，沿用主站的 Lit Sign Rule。
- 次要字：`#B3B3B3`（`--color-on-ink-soft`，墨上 10:1）；細線 `#4D4D4D`（`--color-on-ink-rule`，裝飾用）。
- 抬升面：`#262626`（`--color-ink-raised`），用於牌背與面板。
- **質感靠銀墨，不靠色相**：牌背的壓紋是一層 105° 的白色高光漸層（`transparent → var(--color-on-ink-sheen) → transparent`）掃過，加上 `--color-on-ink-rule` 的干涉線。這是印刷上的銀墨反光，零色相。
- 硬規則：**高光不承載資訊**。把高光關掉，頁面仍然完全可用、對比仍然合格。

**B. 印刷廠（保守備案）**

整個站放在紙灰 `#D9D9D9` 上，塔羅牌當成同一批紙印出來的另一件印刷品。零色相，與主站 100% 一致。

- 優點：不需要任何例外，設計與工程成本最低。
- 缺點：沒有暗場對比，翻牌那一刻的張力不見了。

**C. 賽博霓虹（原文）**

深宇宙藍／塔羅紫底 + 螢光綠／電光藍／暖橘。

- **不採用**。與 Zero Hue Rule 直接衝突；要維護第二套色票與對比表；最大風險是「看起來像另一場活動」，而兩場活動的受眾完全重疊。

### 為什麼不是全像箔

初稿曾建議用「全像箔」當唯一彩色，理由是主視覺上那隻貓有箔的質感。**這個理由是錯的**：實測 `art/QRACON2026主視覺形象圖.jpg` 全圖最高飽和度 0.000（零色相）；`qracon-wordmark.png` 同樣為 0；`schrodinger-cat-leaping.png` 只有極少數像素有飽和（虹膜上的一點反光，0.05%–0.27% 依門檻而定），不足以支撐一套材質。依 Zero Hue Rule，全像箔全部移除，改成灰階銀墨。

### 建議

**選 A（純灰階暗房）。** 理由：

1. 它讓「翻牌」有物理意義：亮的是被觀測到的那一張，其餘留在暗處。這是用版面說故事，不是加裝飾。
2. 只新增一個中性 token（`--color-on-ink-sheen`，§4.1），沒有任何色相。`tokens.css` 仍是唯一來源。
3. 與 B 的差別只在「場景是白天還是暗房」，不是兩套視覺語言，日後要改回 B 只需要換一個底色。

全頁墨底是主站沒用過的反相場景（主站只有局部墨色區塊），需設計組確認（`03` Q7）。

---

## 4. 設計系統

### 4.1 色彩

全部使用主站 `src/styles/tokens.css` 的變數，**只新增一個**：

| 用途 | token | 值 | 對比 |
| --- | --- | --- | --- |
| 全頁底色 | `--color-ink` | `#000` | — |
| 牌面、票券 | `--color-white` | `#FFF` | 21:1 on ink |
| 場上主要文字 | `--color-white` | `#FFF` | 21:1 |
| 場上次要文字 | `--color-on-ink-soft` | `#B3B3B3` | 10:1 |
| 場上分隔線 | `--color-on-ink-rule` | `#4D4D4D` | 約 2.5:1（裝飾） |
| 牌背、抬升面 | `--color-ink-raised` | `#262626` | 裝飾 |
| 牌面上的字 | `--color-ink` | `#000` | 21:1 |
| 牌面次要字 | `--color-ink-soft` | `#4D4D4D` | 8.5:1 |
| **[v2.2] 銀墨高光** | `--color-on-ink-sheen`（新增） | `rgb(255 255 255 / 0.9)` | 裝飾，不承載資訊 |

新增 token 的前例：主站已有 `--color-backdrop: rgb(0 0 0 / 0.55)`。

**銀墨規則**：牌背與塌縮瞬間的高光，只能是 `--color-on-ink-sheen` 的透明漸層或明度變化。不得出現任何 `hue` 值、不得寫 `--color-accent`、不得用 `conic-gradient` 做彩虹。

**[v2.2] 暗場覆寫**（寫在 `TarotLayout`，不改主站全域）：

| 主站預設（`global.css`） | 塔羅覆寫 |
| --- | --- |
| `color-scheme: light` | `color-scheme: dark` |
| 紙灰背景、`scrollbar-color: ink paper` | 墨背景、`scrollbar-color: var(--color-on-ink-rule) var(--color-ink)` |
| `--color-focus: var(--color-ink)`（**在墨底上看不見**） | `--color-focus: var(--color-white)` |
| 選取：細線灰底、墨字 | 維持（細線灰底墨字在墨場上仍可讀，且零色相） |
| `theme-color #d9d9d9`（寫死） | `#000`（需先抽出 `SeoHead`，§11） |

### 4.2 字型

不新增字族。Noto Sans TC（400–900）+ Barlow Condensed（600/800），設定沿用主站 `astro.config.mjs` 的 Astro Fonts API。

塔羅感用**排法**做，不用字型做：

- 牌名**直排**（`writing-mode: vertical-rl`），像牌面兩側的標題帶。
- 羅馬數字用 Barlow Condensed 800，字距 `0.08em`，大小是牌寬的 18%。
- 中文標題 900 字重、`letter-spacing: 0.02em`；不用書法體、不用襯線體。

**The Latin-Only Sign Rule（沿用主站）**：`var(--font-sign)` 只給拉丁字母與數字（羅馬數字、日期數字、屬性數值）。出現中文或全形括號就切回 `var(--font-sans)`——例如「2026.12.13（日）」的「（日）」。

### 4.3 版面

- 12 欄格線，`--page-max: 88rem`，`--gutter` 沿用主站。
- 斷點沿用：72rem / 48rem / 34rem。
- 首頁：牌扇置中，垂直居中偏上；提示文字在牌扇上方 `--space-5`。
- 結果頁：單欄，最大 `46rem`；票券滿寬（手機 bleed 到 gutter）。
- **[v2.2]** 結果頁第一屏（狀態章到一句定義）在 375×667 以上的手機要能完整截進一張 9:16 截圖（§9）。

### 4.4 牌面規格

| 項目 | 值 |
| --- | --- |
| 比例 | 4 : 7（約 70×122.5mm；標準塔羅 70×120mm 是 2:3.43，取整數比方便 `aspect-ratio`） |
| 圓角 | `--radius-chip`（4px） |
| 外框 | `var(--rule-thin)` 墨線 |
| 內框 | `var(--rule-hair)` 墨線，內縮 `var(--space-2)` |
| 牌背 | `--color-ink-raised` 底 + 銀墨掃光 + `--color-on-ink-rule` 干涉線 + 主視覺紋樣（`03` Q7） |
| 牌面底 | `--color-white` |
| 陰影 | 無。牌靠白面本身發亮（One Ticket Rule） |

**[v2.2] 牌扇尺寸**（取代 v2.1 的裸 px，實作時把數值收進塔羅元件的 custom properties）：

| 寬度 | 牌寬 | 角度 | 水平偏移 |
| --- | --- | --- | --- |
| 手機（< 48rem） | `clamp(5.5rem, 26vw, 8.25rem)` | ±21° | `6vw` |
| 桌機（≥ 48rem） | `12.5rem` | ±18° | `4.5rem` |

垂直位移依 `sin` 排成弧。

### 4.5 元件

| 元件 | 來源 | 改動 |
| --- | --- | --- |
| `Button` | 主站 | `variant` 新增 `'on-ink'`（白框白字），不新增 `tone` |
| `Stamp` | 主站 | 直接用於「你剛剛抽到」 |
| `FlapText` | 主站 | 結果頁的羅馬數字用 `mode="view"` 翻一次 |
| `Ticket` | 主站 | **直接用**。props 只有 `slits`／`stamp`／`class`／`labelledby`，沒有場次依賴，不需要抽 `TicketShell` |
| `Words` | 主站 | 牌義長句斷行 |
| `Card`（新） | — | 牌面／牌背，含焦點與 reduced-motion |
| `AttributeBar`（新） | — | `var(--rule-heavy)` 線條進度條，四軸 |

屬性**不用雷達圖**。雷達圖是企業儀表板語彙，四軸的菱形在手機上讀不出數值。用四條線，右側接數字（Barlow，tabular-nums）。

**[v2.2] 屬性條配色依位置**（S6）：

| 位置 | 軌道 | 填充 |
| --- | --- | --- |
| 白色票券內（預設） | `--color-rule-fine` | `--color-ink` |
| 墨底上 | `--color-on-ink-rule` | `--color-white` |

### 4.6 屬性四軸

| 軸 | 意思 |
| --- | --- |
| 疊加 | 同時保有幾種可能 |
| 糾纏 | 跟別人的狀態綁得多緊 |
| 相干 | 狀態多整齊、能不能干涉 |
| 能階 | 處在多大的能量上 |

初稿的第四軸是「退相干」，與「相干」在定義上反相關（退相干就是相干性的消逝），兩軸並列會出現「相干 60／退相干 95」這種自相矛盾的數字。改成「能階」後四軸互相獨立。

七張牌的數值見 `01-copy-deck.md` §5（v2.2 改了愚者相干、太陽糾纏）。數值是角色描述、不是物理量；介面不得用「高分／低分」暗示優劣。若物理校稿判斷無法一致解釋，改成「高／中／低」質性描述，`AttributeBar` 改成三段刻度（`03` K4）。

---

## 5. 資訊架構

**[K1=C]** 塔羅站是獨立專案，路由直接放在站根。所有站內連結經 `src/utils/paths.ts` 的 `sitePath()`（複製自主站），不再有 `tarotPath()`；牌頁連結用 `cardPath()`：

```ts
// src/utils/tarot.ts
export const cardPath = (id: CardId) => sitePath(`/deck/${id}/`);
```

路由與正式網址（`<base>` 為 `/Qracon2026_Tarot`（repo `QRACON-tw/Qracon2026_Tarot`），由 `ASTRO_BASE_PATH` 決定）：

```
https://qracon.entangletech.tw<base>/                抽牌
https://qracon.entangletech.tw<base>/deck/           七張牌總覽（Must 含「關於」）
https://qracon.entangletech.tw<base>/deck/[slug]/    單張牌＝結果頁（?draw=1 顯示「你剛剛抽到」）
https://qracon.entangletech.tw<base>/about/          Should：獨立關於頁
```

文件裡其他處（§6、§9、`01`）的 `tarotPath()` 與 `/tarot/…` 路徑，一律以本節為準。

- 路徑一律帶尾斜線（主站 canonical 會補尾斜線、清 query）。
- 七個 slug：`fool`、`lovers`、`hermit`、`wheel`、`death`、`tower`、`sun`。
- 不做 `/result/[slug]`：結果頁就是牌義頁，避免兩份同樣的內容稀釋 SEO。
- `pnpm build` 產出：Must 9 頁（首頁、deck、7 張牌）加 `404.html`，共 10 個 HTML；Should 再加 about。

### 導覽

只有一條：左上「QRACON 2026 量子塔羅」（回塔羅首頁）、右上「牌組」。手機同樣兩個文字連結，不做漢堡選單。Should 做出 about 後再加「關於」。

### SEO

- 每張牌頁有獨立 `<title>`、description、OG 圖（文案見 `01` §2）。首頁與 deck 也各有一張 OG（共 9 張）。
- 結構化資料：每張牌頁加 `Article`（不用 `Quiz`，這不是測驗）。`seo.ts` 沒有複製，P4 再做。
- sitemap：`src/utils/tarot.ts` 的 `getIndexablePaths()` 在 `TAROT_INDEXABLE` 為 `true` 時回傳首頁、deck 與七張牌，`sitemap.xml.ts` 經 `sitePath()` 產生完整網址。
- 上線前（軟上線期間）塔羅頁全部 `noindex`，且不加入 sitemap（§11）；由 `TAROT_INDEXABLE = false` 控制，上線時改為 `true`。

---

## 6. 互動規格

### 6.1 狀態機

```
idle ──pointerenter──▶ hover（牌抬起 4px、轉正 60%）
idle ──activate─────▶ resolving（鎖輸入，prefetch 同時開始，啟動 1600ms 保底計時）
                        ├ 0–520ms 其餘 6 張散去（CSS translate／rotate／opacity；tier 3 加 WebGL2 粒子；Should：碎裂）
                        ├ 0–240ms 被選的牌放大 1.08；240–840ms 翻牌（rotateY 180°，`--dur-flip` 600ms）
                        └ 960–1480ms 塌縮轉場（tier ≥ 2：WebGL2 干涉環；否則 CSS clip-path 墨色擴張）
resolving ──end─────▶ navigating（導頁到 `<a>` 既有 href，不帶 `?draw=1`；狀態用 `sessionStorage('tarot-draw')` 交棒；有 View Transition 時牌 morph）
resolving ──1600ms──▶ navigating（保底：直接 location.assign，S4）
result ──重新抽一張──▶ 載入 tarotPath()（重新洗牌）
```

`resolving` 期間：`aria-busy="true"`、`inert` 套在牌扇容器上。

**預取（R11）**：點擊的 0ms 就對目標頁插 `<link rel="prefetch">`，並預載該張牌面圖。prefetch 的網址必須和實際導頁的網址**完全一致**（含尾斜線與 `?draw=1`），否則快取不會命中。

**[v2.2] 上一頁（S3）**：監聽 `pageshow`，`event.persisted` 為真（從 bfcache 還原）時，把牌扇重設回 `idle`、拿掉 `inert`／`aria-busy`、重新洗牌。否則按上一頁會回到鎖死的 `resolving` 畫面。

### 6.2 選牌：洗位置，不是抽亂數

七張牌背是同一張圖，牌的位置才是隨機來源。

1. 頁面載入時，用 `crypto.getRandomValues` 對七個 slug 做 Fisher–Yates 洗牌。
2. 把洗好的 slug 寫回七個 `<a>` 的 `href`（DOM 順序固定，內容隨機）。
3. 使用者點哪一張，就開那一張的 `href`。**沒有另外的亂數**——使用者的選擇就是唯一的隨機。
4. 「重新抽一張」＝重新載入頁面，重新洗一次。

**無 JS 時**：`<a href>` 維持建置時的固定順序（fool → sun），仍然七張都能開，只是位置不隨機。無 JS 的連結不帶 `?draw=1`。

不做 `sessionStorage` 鎖定：結果頁本身就是 URL，按上一頁回來看到的是同一頁；抽牌頁重洗不影響已抽到的結果。

**接受的取捨**：牌是 `<a href>`，桌機 hover 時狀態列、手機長按預覽會露出目標網址。這正是無 JS 備援的代價，不改成 `<button>`。

### 6.3 散去

**Must：CSS 散去。** 六張牌依與被選牌的相對位置往外飛，`translate`／`rotate`／`opacity` 520ms，`--ease-out`；向量由 JS 算好寫進 `--fx-dx／--fx-dy／--fx-rot`。

**Should：碎裂。** 不用 WebGL。六張牌各自切成 6 片 `clip-path` 多邊形（共 36 個元素），每片給不同的 `--tx/--ty/--rot`，`transform: translate3d() rotate()` + `opacity` 520ms，`--ease-out`。

**漸進增強（tier 3）：WebGL2 粒子。** 與塌縮轉場共用同一個 `<canvas>`，`gl.POINTS` ≤ 600 點，從六張牌的 rect 出發、菱形、單色，只播一次；沒有緩衝區，位置與壽命全由頂點 shader 的雜湊產生。tier 0–2 不載入。

理由：不移植主站 `interference.ts`（全螢幕 shader 對六張小卡殺雞用牛刀）。塔羅自己手寫約 3 KB gzip 的 shader，延遲載入，並以分級、DPR 上限 1.5、看門狗（每 20 幀或累計 400ms 取平均，> 24ms 就把解析度乘 0.66 並把 tier 降一級寫入 `sessionStorage`；再超過一次就跳到最後一幀）、單一 context、只播一次來對應「低階手機掉幀」的顧慮。`webglcontextlost` 時隱藏 canvas，轉場中遇到就立刻導頁。

### 6.4 鍵盤與螢幕閱讀器

- 七張牌是 `<a>`，包在 `<ol aria-label="七張牌，選一張翻開">` 裡，每張 `aria-label="第 1 張牌"`（文字見 `01` §3）。
- 點擊時 `preventDefault()` 播動畫；**沒有 JS 就正常跳頁**（漸進增強，也是 SEO 的底）。
- Tab 順序 = 牌序；焦點框 `var(--rule-heavy)` 白框外推 3px（需 §4.1 的 `--color-focus` 覆寫）。
- 結果頁 `?draw=1` 時，`<h1>` 是角色名，並用 `aria-live="polite"` 宣告「你抽到觀測者冷酷貓。」

### 6.5 Reduced motion

| 關閉的 | 改成 |
| --- | --- |
| 牌扇進場與展開 | 直接顯示最終位置 |
| 散去／碎裂 | 六張 `--dur-fast` 淡出（無位移） |
| 翻牌 | 交叉淡化（`--dur-fast`） |
| 塌縮轉場（GL 或 CSS） | 不播，約 200ms 後導頁 |
| 粒子 | 不載入 WebGL、不取得 context |
| 結果頁進場 | 不播 |
| View Transition | 關閉，直接跳頁 |
| 銀墨掃光 | 不播 |

`prefers-reduced-motion: reduce` 下整段流程 ≤ 300ms。

### 6.6 重抽

- 結果頁有「重新抽一張」，回到塔羅首頁重洗。
- 同一 session 內允許無限重抽（沒有集點，沒有理由限制）。
- 不做「今天已經抽過」的鎖——那會讓分享連結進來的人卡住。

### 6.7 回訪（Should）

**[v2.2] 只在 `?draw=1` 時寫入**（S2），單純瀏覽牌頁或從分享連結進來都不寫：

```ts
try {
  localStorage.setItem('qracon.tarot.last', JSON.stringify({ slug, at: Date.now() }));
} catch {}
```

首頁讀取時同樣 `try/catch`；`at` 超過 7 天不顯示。顯示文案見 `01` §3：「再看一次」連到該牌頁（不帶 `?draw=1`），牌扇照常顯示。

### 6.8 [v2.2] `?draw=1` 的處理（S1）

> **[v2.3] 實作改用 `sessionStorage('tarot-draw')` 交棒**（`05-fx-plan.md`）：首頁點擊時寫入 `{ id, at }`，結果頁讀到且與本頁牌 id 相符、15 秒內才進場並以 `role="status"` 宣告「你抽到〔角色名〕。」，讀完即刪。導頁網址不帶 `?draw=1`，所以不需要 `replaceState`，分享網址天然乾淨；下列 1–4 只在日後要恢復狀態章時參考。

1. 結果頁讀到 `?draw=1`：顯示「你剛剛抽到」狀態章、`aria-live` 宣告。
2. 宣告後 `history.replaceState(null, '', location.pathname)` 拿掉參數。分享出去的網址不帶狀態章。
3. 狀態章的位置**永遠預留高度**（沒有 `?draw=1` 時 `visibility: hidden`），避免 JS 插入造成 CLS。
4. canonical 由主站 `BaseLayout` 處理，本來就會清掉 query。

### 6.9 [v2.2] View Transition（S5）

- 沿用主站 `global.css` 的跨文件 `@view-transition { navigation: auto }`，不用 Astro ClientRouter。
- 抽牌頁被選的牌與結果頁的牌面設同一個 `view-transition-name: tarot-card`。同一頁同時只能有一個同名元素，所以抽牌頁要在點擊後才把名稱加到被選的那張（主站 `vt-session` 用同樣做法）。
- 主站 ↔ 塔羅之間的 root 轉場會從紙灰閃到墨黑：塔羅頁在 `pagereveal`／`pageswap` 判斷來源或目的地不是 `/tarot/` 時，`skipTransition()`。
- 不支援的瀏覽器（Firefox）直接跳頁，不另做退路。

---

## 7. 牌面資產（D2）

### 7.1 設計組交付規格

| 項目 | 規格 |
| --- | --- |
| 張數 | 7 |
| 尺寸 | 1440×2520 px（4:7） |
| 格式 | **滿版**灰階 PNG（含牌面白底），另附 SVG 線稿（可選） |
| 交付檔上限 | 單張 400 KB（PNG，設計組交付） |
| 上線檔上限 | 單張 90 KB（AVIF，由 `astro:assets` 轉出） |
| 安全區 | 上下各 14%（網頁排羅馬數字與牌名）、左右各 8%（內框）不放主體 |
| 圖內文字 | 不放牌名、羅馬數字、角色名，一律由網頁排字 |
| 風格 | 與 `art/QRACON2026主視覺形象圖.jpg` 同一支筆：手繪黑貓、墨線、**純灰階** |
| 禁止 | 漸層背景、寫實 3D、彩色寶石、傳統偉特牌構圖直接挪用 |

完整交付規格、七張內容、期限與驗收見 `04-asset-requirements.md` §2.1。

原文提到「傳統塔羅牌面會放旁邊」——那是給插畫師的參考，**網站不顯示傳統牌面**（著作權與風格衝突）。

### 7.2 字體牌（插畫未到位時）

插畫是設計組的交付物，網站不能等它。先用「字體牌」上線，插畫到了只換圖，不動版面：

```
┌──────────────────┐
│  rule-thin 外框   │
│  ┌────────────┐  │
│  │    IX      │  │  ← Barlow 800，牌寬 18%
│  │  ┌──────┐  │  │
│  │  │ 圖示 │  │  │  ← 2.5rem SVG 線稿
│  │  └──────┘  │  │
│  │   觀      │  │  ← 直排牌名，Noto 900
│  │   測      │  │
│  │   者      │  │
│  └────────────┘  │
└──────────────────┘
```

**首頁牌扇的牌面只放三件事**：羅馬數字、圖示、直排牌名。牌寬最小 5.5rem，塞不下一句定義——13px 的中文在這個尺寸低於主站 `--text-xs` 的可讀下限。「一句定義」只出現在結果頁的大尺寸牌面。

七個 SVG 圖示（全部 `var(--rule-thin)` 線稿，墨色）：

| 牌 | 圖示 |
| --- | --- |
| 愚者 | 兩條相位不同的正弦波重疊 |
| 戀人 | 兩個點，中間一條來回震盪的線 |
| 隱士 | 一條波被垂直線切斷，右側只剩一個點 |
| 命運之輪 | 三條水平能階 + 一支向上的箭頭 |
| 死神 | 干涉條紋的明暗對比逐漸衰減，最後變成均勻灰階 |
| 塔 | 一條線突然階梯上升，接著震盪 |
| 太陽 | 兩條同相位正弦波疊成加粗的一條 |

字體牌是**成品**，不是灰塊佔位——它本身就符合品牌（純黑白、印刷感、直排）。插畫是加分，不是前提。

---

## 8. 資料模型

```ts
export type CardId = 'fool' | 'lovers' | 'hermit' | 'wheel' | 'death' | 'tower' | 'sun';

export interface TarotCard {
  id: CardId;
  arcana: number;            // 0, 6, 9, 10, 13, 16, 19
  numeral: string;           // '0' | 'VI' | ...
  name: string;              // 愚者
  nameEn: string;            // The Fool
  persona: string;           // 疊加態混亂人
  personaEn: string;         // Superposition Chaos
  concept: {
    zh: string;              // 疊加態
    en: string;              // Superposition
    line: string;            // 一句定義（≤ 24 字）
    note: string;            // 科普註（≤ 70 字）
  };
  art: ImageMetadata | null; // 插畫 import；null → 字體牌
  reading: {
    fortune: string;         // 最近的運勢
    quote: string;           // 牌義引言
    traits: [string, string]; // 兩條行為
  };
  partner: { id: CardId; why: string };
  rival: { id: CardId; why: string };
  stats: { superposition: number; entanglement: number; coherence: number; energy: number };
}
```

`src/data/tarot.ts`（放在主站 `src/data/`，與 `site.ts` 同層）是唯一來源；結果頁、`/deck/`、OG 產生腳本都從它推導。文案改動只改這個檔。

驗證（`astro check` 抓不到的）：

- `id` 七個齊全、不重複。
- `partner` / `rival` 的 `id` 必須存在，且不等於自己。
- `stats` 四項 0–100。
- `numeral` 與 `arcana` 對應。
- `concept.note` ≤ 70 字、`concept.line` ≤ 24 字。
- **[v2.2]** 文案不含 emoji、不含「坍縮」、不含 `SSS`／`NFC`／`QXP`／`冒險者`。

寫成 `validateCards()`，在 build 時跑，錯就讓 build 失敗。

---

## 9. 分享與 OG

### 9.1 OG 圖（9 張）

1200×630，每張一個檔案：`public/og/tarot.png`、`tarot-deck.png`、`fool.png` … `sun.png`。

產生方式：`scripts/build-og.mjs`，用 **sharp**（主站已是直接依賴）把一段 SVG 轉 PNG。SVG 裡是：墨底 + 字標 + 羅馬數字 + 角色名 + 一句定義。

- 字型：SVG 內指定 `Noto Sans TC, Microsoft JhengHei, sans-serif`。**在本機執行一次，把 PNG commit 進 repo**，不在 CI 產生（CI 沒有這些字型，輸出會不一致）。
- OG 圖的網址經 `sitePath()`，`BaseLayout` 已會轉成絕對網址。
- 重跑條件：`tarot.ts` 文案或牌面插畫變更時。**文案凍結（11/21）與物理簽核之後才產生正式版。**

### 9.2 站內分享

**[v2.2] Must：只分享網址。**

- 「分享」按鈕：`navigator.share` 存在就呼叫 `navigator.share({ title, text, url })`（文案見 `01` §8）。只帶網址，不需要等待產圖，不會失去 user activation。
- 不支援時，按鈕改成「複製連結」，用 `navigator.clipboard.writeText`。
- 使用者取消（`AbortError`）不顯示任何訊息；其他錯誤退回複製連結。

**[v2.2] 截圖分享**：結果頁第一屏本身就是 9:16 構圖（§4.3）。學生習慣直接截圖貼 IG 限時動態，這條路不需要任何 JS。

**Later：Canvas 分享卡**（v2.1 規格保留備查）：

- Canvas 2D 產 1080×1920 PNG，`<a download>`；上下各留 15% 安全區。
- 字型：先用 `getComputedStyle(document.documentElement).getPropertyValue('--font-sans')` 取實際字族名，再 `document.fonts.load()`。
- Canvas 不支援直排，牌名要逐字定位繪製。
- 要用 Web Share 帶檔案，PNG 必須在使用者按下之前就產好，否則 iOS 會失去 user activation。

### 9.3 In-App WebView（R10）

受眾從 IG 限時動態或 LINE 點進來。Must 版只分享網址、不下載檔案，所以 IG／LINE 擋 `blob:` 下載的問題不存在；`navigator.share` 不存在時自動退到複製連結。

Canvas 分享卡（Later）若要做，才需要「偵測 UA 含 `Instagram`／`Line` 時彈出 `<img>` 預覽層，提示長按存圖」的退路。

### 9.4 結果頁 QR（Should）

原文結果頁底部有「掃描 QR 測你的量子狀態」。網站版的用途是：在現場把手機螢幕給旁邊的人掃，讓他也來抽一張。

- **指向（S12）**：塔羅首頁 `tarotPath()` 的完整網址，邀人來抽，不指向單張牌。
- **產生**：`sharp` 只會把 SVG 點陣化，沒有 QR 編碼器。用一次性腳本（devDependency `qrcode`，只給 `scripts/` 用，不進 bundle）產生一張 SVG，commit 進 repo。
- **顯示**：黑碼白底、靜區 4 格，放在白色票券內，畫面上 ≥ 7.5rem。不放在墨底上反白（部分掃碼器讀不到反白碼）。
- 網址取自 B4 確認的正式網址；網域若再變，重跑腳本即可。文案見 `01` §7。

---

## 10. 效能與無障礙

### 預算

| 項目 | 上限 |
| --- | --- |
| 首頁 JS（gzip） | 35 KB |
| 結果頁 JS（gzip） | 20 KB |
| 單張牌面插畫（AVIF） | 90 KB |
| 首頁總重（首次載入） | 300 KB |
| LCP（4G，中階 Android） | 2.0s |
| CLS | < 0.05 |
| INP | < 200ms |

主站預算是首屏 JS ≤ 50 KB、LCP ≤ 2.5s，塔羅較嚴，相容。沒有 Three.js、沒有動畫函式庫。WebGL2 是手寫、延遲載入的漸進增強層：塌縮 shader、粒子與 context 管理合計約 3 KB gzip，各自是獨立 chunk，首頁初始 JS 與結果頁都不含，也不計入首頁預算；分級、DPR 上限、看門狗與 context lost 備援見 `05-fx-plan.md`。字型走 Astro Fonts API 的 unicode-range 切片。

**[v2.2]** 首頁總重從 350 KB 降到 300 KB：活動當天場地網路擁塞是主要瓶頸。

### 支援範圍

iOS Safari 16+、Android Chrome 最近兩版、IG 與 LINE 內建瀏覽器（iOS／Android 各一）。View Transition 只在支援的瀏覽器播放。

### 無障礙（WCAG 2.2 AA）

- 所有牌可 Tab 到、可 Enter 開啟；焦點框 `var(--rule-heavy)`、外推 3px，墨底上為白色（§4.1）。
- 顏色不承載狀態（主站規則沿用）。
- 動畫全部可被 `prefers-reduced-motion` 關閉。
- 牌扇的旋轉是裝飾：螢幕閱讀器讀 `<ol>` 順序，不讀視覺角度。
- 結果頁的「你抽到 X」用 `aria-live`。
- 對比：白／墨 21:1、`#B3B3B3`／墨 10:1、`#4D4D4D`／白 8.5:1。

---

## 11. 分期、部署與驗收

### [v2.2] 部署架構

| 方案 | 做法 | 評價 |
| --- | --- | --- |
| A1（原建議，K1 未採用） | 在主站 repo 加 `src/pages/tarot/*` + `TarotLayout`，沿用主站 `base` 與 `sitePath()` | 單一建置、元件不分叉、共用網域與 sitemap。不需要改部署 |
| A（v2.1） | `apps/tarot` 獨立 Astro 專案 | 主站不是 workspace，還要合併兩份 dist，放棄 |
| B | 兩個 repo，主站 CI 拉塔羅產物 | 要改主站 workflow 與 cross-repo token，放棄 |
| **C（K1 定案，2026-11-16）** | 共用網域下另一個 GitHub Pages 專案，獨立 repo、複製元件 | **採用**。程式碼不進主站 repo；元件分叉風險見 R7 |

以下是 A1 要動到的主站檔案（未採用，僅供備查）：

| 檔案 | 改動 | 影響主站？ |
| --- | --- | --- |
| `src/layouts/BaseLayout.astro` | `<head>` 抽成 `SeoHead.astro`，加 `themeColor` prop | 否，只搬結構 |
| `src/layouts/TarotLayout.astro`（新） | 用 `SeoHead`，不含 `SiteHeader`／`SiteFooter`，加 §4.1 暗場覆寫 | — |
| `src/components/Button.astro` | `variant` 加 `'on-ink'` | 否，舊值不變 |
| `src/styles/tokens.css` | 加 `--color-on-ink-sheen` | 否 |
| `src/utils/seo.ts` | 上線時把塔羅頁加進 `INDEXABLE_PAGES` | sitemap 多 9 筆 |
| `src/pages/tarot/**`、`src/data/tarot.ts`、`src/utils/tarot.ts`、`src/components/tarot/**`、`public/og/`（新） | 塔羅本體 | — |

**[v2.2] 沒有分支預覽**：GitHub Pages 只部署 `main`，不像 Cloudflare Pages 有分支預覽網址。所以：

1. **開發**在本 repo 的功能分支，本機 `pnpm build` + `pnpm preview`；真機用同一個區網連開發機（`pnpm dev --host`）。
2. **軟上線**（11/27）：合併進 `main`，但塔羅頁全部 `noindex`、不進 sitemap、主站不加入口。這樣才能在正式網址上測 IG／LINE WebView 與 OG 預覽。
3. **正式上線**（12/02）：拿掉 `noindex`、加進 sitemap、主站加入口。

**協作風險**：K1＝C 後塔羅 repo 與主站互不影響，不需要 rebase 主站，也不改主站共用檔。取而代之的是複製檔漂移（R7）：主站改了 `tokens.css`、`global.css`、`Button.astro`、`paths.ts`、`Icon.astro` 時，人工比對並同步。push 與開 PR 由你手動做。

R9 改寫：K1＝C 後塔羅有自己的 workflow 與 Pages 專案，build 失敗只影響本站，不會擋住主站部署。合進 `main` 前本機仍須 `pnpm check`、`pnpm build` 都過。

### 範圍

| 級別 | 內容 |
| --- | --- |
| **Must（12/02）** | 牌扇 + 洗位置 + 無 JS + 鍵盤 + reduced motion；被選牌翻開、其餘散去、塌縮轉場與結果頁進場（CSS 版；WebGL2 塌縮與粒子為漸進增強層，見 `05-fx-plan.md`）；7 張結果頁（字體牌、9:16 第一屏）；`/tarot/deck/`（含關於）；OG ×9；只分享網址 + 複製連結；CTA 接報名狀態；S1–S6、S9、S10 |
| **Should（12/03–06 有餘力）** | 碎裂動畫；回訪橫幅；獨立 `/tarot/about/`；結果頁 QR（§9.4） |
| **Later** | Canvas 9:16 分享卡與 WebView 長按退路、4:5 版本、插畫替換、音效（塵埃粒子已改為 tier 3 的 WebGL2 粒子，不再列在 Later） |

### 時程

| 日期 | 階段 | 內容 | 完成定義 |
| --- | --- | --- | --- |
| 11/17（二） | P0 | 拍板 K2–K6（K1 已定案）；`pnpm install`；文案送物理校稿 | 本機 `pnpm build` 過 |
| 11/18–19 | P1 | 建立獨立專案（複製主站工具鏈、tokens、`Button`、`sitePath()`）、`SeoHead`、`TarotLayout` 與暗場覆寫、`tarot.ts` + `validateCards()`、路由 `/`、`/deck/`、`/deck/[slug]/` | `pnpm check`、`pnpm build` 通過（骨架已於 2026-11-16 完成，見 `LOG.md`） |
| 11/20–24 | P2 | 牌扇、洗位置、狀態機（S3、S4）、淡出、S1、S2、S5、鍵盤、無 JS、reduced motion。**11/21 文案凍結** | 鍵盤與無 JS 都能完成抽牌 |
| 11/25–26 | P3 | 結果頁（9:16 第一屏）、`Ticket`、屬性條（S6）、CTA（S9）、重新抽一張、aria 文字 | 七張牌頁皆可讀 |
| **11/27** | 軟上線 | 合進 `main`，全部 `noindex`，不加入口 | 正式網址可開 |
| 11/28–29 | 真機 | iOS Safari、Android Chrome、IG／LINE WebView 跑完整流程 | 各跑一次 |
| 11/30–12/01 | P4 | OG ×9、分享與複製連結 | OG 在 FB／LINE 預覽過 |
| **12/02** | 正式上線 | 拿掉 `noindex`、進 sitemap、主站加入口 | Lighthouse a11y ≥95、perf ≥90 |
| 12/03–06 | P5 | 修 bug；有餘力做 Should。**12/06 程式凍結** | — |
| 12/07–11 | — | 只改文案；12/11 後只接 hotfix | — |
| **12/13** | 活動日 | 見下 | — |

### 活動當天

網站只需要兩件事：

- 活動期間不推 `main`（主站議程若要改，先和協作者約好）。
- 有一人能回滾：預先登入 GitHub，熟悉「revert 上一個 commit 觸發重新部署」與 Actions 頁面。

純靜態站在 GitHub Pages CDN 上，容量不是問題。

### 驗收清單

- [ ] `pnpm check`、`pnpm build` 通過
- [ ] `ASTRO_BASE_PATH=/` 與預設 `/Qracon2026_Tarot` 兩種 base 都能建置、連結都正確
- [ ] 1440 / 375 兩個寬度實際看過（牌扇、結果頁）
- [ ] 關掉 JS 仍能點牌進結果頁
- [ ] 只用鍵盤完成一次抽牌；焦點框在墨底上看得見
- [ ] 按上一頁回到抽牌頁不會鎖死
- [ ] `prefers-reduced-motion: reduce` 全程 ≤ 300ms 且無位移
- [ ] 首頁 JS ≤ 35 KB gzip、結果頁 JS ≤ 20 KB gzip
- [ ] LCP ≤ 2.0s、CLS < 0.05、INP < 200ms（手機模擬）
- [ ] Lighthouse：Accessibility ≥ 95、Performance ≥ 90（手機模擬）
- [ ] 九張 OG 圖在 Facebook / X / LINE 各預覽一次
- [ ] IG 與 LINE 內建瀏覽器各開一次，分享或複製連結可用
- [ ] 分享出去的網址不帶 `?draw=1`
- [ ] `01-copy-deck.md` 的文案 100% 上線，沒有殘留 emoji
- [ ] 物理名詞由校稿者簽過
- [ ] 全站掃過：沒有裸色碼、沒有 `hue`、沒有 `conic-gradient`、沒有寫死的 `/2026/` 或 `/tarot/`

---

## 12. 風險

| # | 風險 | 影響 | 對策 |
| --- | --- | --- | --- |
| R1 | 七張插畫延遲 | 上線卡住 | 字體牌先上，插畫後補（§7.2） |
| R2 | 主視覺印的是 12/5，實際是 12/13 | 對外資訊錯誤 | 塔羅站不裁用主視覺的日期區；日期只從 `site.ts` 取 |
| R3 | 新牌名未經行銷組認可 | 上線後要改名，OG 圖重做 | `03` Q4 在 11/21 文案凍結前確認 |
| R4 | 「占卜」被讀成偽科學 | 觀感 | 免責 + 每個名詞一句正確解釋 + 不談吉凶 |
| R5 | 色彩方向與主站衝突 | 品牌分裂 | D1 已改為純灰階，衝突解除 |
| R6 | OG 圖字型在 CI 不一致 | 圖壞掉 | 本機產生、commit PNG |
| R7 | 元件分叉（K1＝C 後成真） | 複製的 tokens、`Button`、`paths.ts` 與主站漂移，兩站不一致 | `docs/SITEMAP.md` 標註複製自 `257b790`；主站改動共用檔時人工比對並同步 |
| R8 | 塔羅在台灣的宗教聯想 | 受眾排斥 | 定位「娛樂 + 科普」，不做吉凶斷言 |
| R9（K1＝C 後不適用） | 塔羅 build 失敗擋住主站部署（同一個 workflow） | 主站議程無法更新 | 合進 `main` 前本機 check + build 必過；軟上線提早到 11/27 |
| R10 | IG／LINE WebView 擋下載與 Web Share | 分享失效 | Must 只分享網址，退回複製連結（§9.3） |
| R11 | 1300ms 動畫結束才請求目標頁，4G 下卡住 | 轉場失敗 | 點擊 0ms 就 prefetch；1600ms 保底直接跳頁 |
| **R12**（K1＝C 後不適用） | **協作者頻繁推 `main`，`feat/tarot` 衝突** | **合併延誤** | 每兩天 rebase；共用檔改動拆小 PR 先合（§11） |
| **R13** | **GitHub Pages 沒有分支預覽** | **WebView、OG 只能在正式網址測** | 11/27 軟上線（noindex、無入口） |
| **R14** | **報名截止後 CTA 失效** | **導流到已關閉的報名頁** | CTA 接 `site.registration.status`（S9） |
| **R15** | **主站網域或 base 再變** | **canonical、OG、已分享的連結失效** | 上線前確認網址（K6）；連結全走 `sitePath()`，改網域只需重建 |

---

## 13. 待決事項

見 `03-open-questions.md`。擋上線的是 K2（報名截止日）、K3（上線日）、K4（物理校稿者）、K6（repo 擁有者與名稱 → 正式網址）；K1（部署方案）已於 2026-11-16 定案為 C。插畫排程**不擋上線**。
