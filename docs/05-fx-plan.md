# 05 · 視覺特效計畫（WebGL2 漸進增強）

2026-11-16 規劃。WebGL2 只當手寫、延遲載入的最上層加值層；翻牌與換頁骨架用 CSS 3D 加 View Transitions。零新 runtime 依賴。

## 已決定

- 範圍：Must（a–f）＋ GL 塌縮轉場（e-GL）＋ 散去粒子（g）。環境干涉場（h）不做。
- 牌背：設計稿到之前用 CSS 占位（墨黑底、白細框、菱格紋），含 11/27 軟上線。設計稿到了只換 `background-image`。
- 塌縮 shader：塔羅自己寫，不移植主站 `interference.ts`。

## 評估

- 函式庫都不划算：手寫全螢幕三角形＋一支 fragment shader＋`gl.POINTS` 約 5–7 KB gzip；three 直接超出首頁 35 KB 預算。
- 翻牌不用 WebGL：牌面是 DOM 文字，搬進 GL 會丟掉無障礙、字型與 container query。CSS `rotateY` 走合成器。
- WebGL2 有價值的地方：從點擊點擴散的塌縮干涉波轉場、六張牌散去時的粒子。
- `02-plan.md` 原本「低階手機掉幀」的顧慮仍成立，以分級、DPR 上限、看門狗、單一 context、只播一次來對應。
- 每個特效先有 CSS 版，WebGL 疊在上面；WebGL 任何失敗都只是少一層。

## 行動優先策略

### 分級（`src/scripts/fx/tier.ts`）

| tier | 條件 | 內容 |
| --- | --- | --- |
| 0 | `prefers-reduced-motion: reduce` | 交叉淡化、300ms 內導頁 |
| 1 | save-data、無 WebGL2（`failIfMajorPerformanceCaveat`）、cores ≤ 2 或 deviceMemory ≤ 2 | 只有 CSS |
| 2 | 其他 | ＋ GL 塌縮轉場 |
| 3 | cores ≥ 6 且 deviceMemory ≥ 4 | ＋ 粒子 |

- `sessionStorage('fx-tier')` 存看門狗降級結果，讀寫都包 `try/catch`。
- 只在 `import.meta.env.DEV` 支援 `?fx=0..3` 覆寫。
- 不用 Battery API。

### 渲染規則

- DPR 取 `min(devicePixelRatio, 1.5)`。
- context：`alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false`。
- 看門狗：連續 20 幀平均 > 24ms，解析度乘 0.66；再超過一次，粒子停、轉場跳到 `progress = 1`，降級 tier 寫入 `sessionStorage`。
- `visibilitychange` 隱藏時停迴圈。
- `webglcontextlost`：`preventDefault()`、停迴圈、隱藏 canvas；轉場中遇到就立刻導頁。
- 單一 `<canvas>` 共用（iOS WebView 對 context 數量敏感）。

### In-app 與 iOS

- 跨文件 View Transition 要 Safari 18.2+ / Chrome 126+，iOS 16–18.1 沒有。轉場不依賴 VT：首頁把畫面收成全黑再導頁，結果頁用 CSS 進場；VT 有支援時只是多一段牌的 morph。
- bfcache：`pageshow` 且 `event.persisted` 時重置首頁（移除 overlay、解鎖、重新洗牌）。

### 觸控與版面

- 整張牌 `<a>` 就是點擊目標；`touch-action: manipulation`。
- hover 抬起包在 `@media (hover: hover)`。不做滑動選牌。
- canvas：`position: fixed; inset: 0; width: 100%; height: 100lvh; pointer-events: none; aria-hidden="true"`，不進文件流。
- viewport meta 不加 `viewport-fit=cover`。
- 洗牌只重排 DOM 順序；JS 啟用時七張都是牌背，重排不可見。

## 特效清單

時間軸（`resolving`，總長 1600ms 保底）：0–520 六張散去；0–240 選中牌轉正放大 1.08；240–840 翻牌；960–1480 塌縮轉場；結束即導頁。

| # | 特效 | 做法 | reduced-motion | 無 JS／無 WebGL2 |
| --- | --- | --- | --- | --- |
| a | 洗牌與牌背 | `crypto.getRandomValues` Fisher–Yates 重排；`.js` 下顯示牌背，`aria-label="第 N 張牌"` | 相同 | 無 JS：維持正面連結清單 |
| b | 進場發牌 | CSS stagger，每張延遲 40ms | 直接到位 | 無動畫 |
| c | 點擊翻牌 | CSS 3D `rotateY(180deg)`，`--dur-flip: 600ms` | 交叉淡化 `--dur-fast` | 無 JS：直接跳頁 |
| d | 六張散去 | CSS `translate3d`、`rotate`、`opacity` | 120ms 淡出 | 同 CSS 版 |
| e | 塌縮轉場 | CSS：墨色 overlay 以 `clip-path: circle()` 從點擊點擴張。GL（tier ≥ 2）：同心干涉環 shader，硬邊，收束成全黑 | 不播 | tier 1 播 CSS 版 |
| f | 結果頁進場 | `sessionStorage('tarot-draw')` 交棒；牌 `scale(1.08→1)` 加內容 stagger；有 VT 時 `view-transition-name: tarot-card`（點擊後才加） | 無 | 靜態頁 |
| g | 散去粒子 | 同一 canvas，`gl.POINTS` ≤ 600 點，從六張牌的 rect 出發，只在 tier 3 | 不建立 | 沒有 |

GL 轉場最後一幀必須與結果頁底色相接。

## 架構

| 檔案 | 職責 | 估計 gzip |
| --- | --- | --- |
| `src/scripts/fx/tier.ts` | 分級與 DEV 覆寫 | 0.4 KB |
| `src/scripts/draw.ts` | 首頁狀態機：洗牌、鎖輸入、prefetch、時間軸、保底、bfcache、交棒 | 1.5 KB |
| `src/scripts/fx/gl.ts` | `createGL`、`compile`、全螢幕三角形、resize/DPR、`loop` 含看門狗、可見性、context lost | 1.3 KB |
| `src/scripts/fx/collapse.ts` | 塌縮 shader 與 `play(origin): Promise<void>` | 1.2 KB |
| `src/scripts/fx/particles.ts` | 粒子 | 1 KB |
| `src/scripts/reveal.ts` | 結果頁：讀交棒、加 `.is-drawn`、`aria-live` | 0.3 KB |
| `src/components/fx/FxCanvas.astro` | canvas 與 CSS overlay，只放首頁 | — |

- 延遲載入：tier ≥ 2 時於 `requestIdleCallback`（無則 `setTimeout 1200`）或第一次 `pointerdown`/`focusin` 動態 `import()` GL 模組並預編譯 shader。點擊當下 import 未完成就播 CSS 版，不等待。
- 導頁一律用 `<a>` 既有 `href`，JS 不自己組 URL。
- 結果頁不載入任何 WebGL。

## 驗證

- `pnpm check`、`pnpm build`；`dist/_astro/*.js` 逐一 gzip 量大小；結果頁 HTML 不引用 GL chunk。
- 預覽 375×812 與 1440：進場、點牌、翻牌、轉場、結果頁、返回、重新抽一張；無水平捲軸；console 零錯誤；鍵盤走完。
- `?fx=0..3` 各跑一次；手動觸發 context lost 流程不能卡住。
- 真機 iOS 16 Safari、IG、LINE 列入 11/27 前人工檢查。
