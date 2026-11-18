# 變更紀錄

## 2026-11-18（第二次）

- **commit**：上一筆的修正拆成 `427c7b9`（fix）與 `50fe950`（docs）。
- **字型冷載入**：每頁 1.06–1.21 MB（Noto Sans TC 111 個 unicode-range 分片命中 18–20 個）降到 192 KB（3 個檔）。`astro.config.mjs` 用 unifont Google provider 的 `options.experimental.glyphs`，只抓 `src/` 出現過的 554 個字元（非 ASCII 459 個），可變字重 400–900 子集為單一 woff2 約 163 KB，全站共用，並在 `SeoHead.astro` 加 `preload`。`dist/_astro/fonts` 從 107 個檔、4.4 MB 降到 3 個檔、192 KB。
- **字型載入前英數字放大兩倍**：Astro 預設替 Noto Sans TC 產生 `local("Arial")` 備援並設 `size-adjust: 197%`（依中文字寬計算），Arial 沒有中文，結果只有英數字被放大，Slow 4G 下約 2–6 秒內頁首「QRACON 2026」是兩倍大。改為 `optimizedFallbacks: false`，載入前直接用 PingFang TC／Microsoft JhengHei／sans-serif。
- **點擊範圍**：頁首「牌組」32×44 → 48×44（`TarotLayout.astro` 連結左右 `padding` ＋等量負 `margin`，文字位置不變）；契合度連結加 `min-width: 2.75rem`（原本 36–40 寬，指向「塔」時只剩一個字寬）。頁首連結的焦點框改為內縮 3px：原本 3px 外框＋3px 偏移在畫面頂端被切掉上緣（改動前就存在）。
- **橫向手機**：`orientation: landscape` 且高度 ≤ 30rem 時，首頁改為左文右牌兩欄，牌寬 `clamp(4rem, (100svh − 3rem − 2rem − 0.75rem) × 2/7, 8.25rem)`，4＋3 兩列填滿首屏；`h1` 降為 `--text-2xl`；提示句 `word-break: keep-all` 讓窄欄在逗號處換行。結果頁同條件下牌寬上限 `55svh × 4/7`，整張牌在首屏內。
- 驗證（本機實際執行；`astro preview`＋無頭 Chrome 157 CDP，同上一筆的方法）：
  - `pnpm check` 0 錯誤 0 警告 0 提示；`pnpm build` 10 頁；impeccable 偵測器 0 項。
  - 版面：320／375／393 直向、852×393、667×375、915×360 橫向、1180×820 平板、1440 桌機，首頁、結果頁、牌組頁都沒有水平捲軸，也沒有小於 44×44 的連結。橫向首屏完整可見的牌：852×393 0 → 7、667×375 0 → 7、915×360 0 → 7；直向數值不變（iPhone 15 仍是 6 張）。
  - 抽牌：852×393、667×375 橫向與 iPhone 15 直向各抽一次，跨頁 VT `ready`／`finished` 都成功、散牌時 `innerWidth` 不變、`role="status"` 宣告正常、console 零錯誤。翻開的牌面直排在 3 倍截圖下字距正常。
  - Slow 4G＋4×CPU（Pixel 7）：首頁總重約 215 KB（預算 300 KB），FCP／LCP 1.47 秒；結果頁 LCP 1.87 秒（原 2.01）；字型 2.5 秒載完（原 5.9 秒仍在載）；CLS 0；`draw.ts` 1.81 秒執行，與首次繪製同時（preload 沒有拖慢）。Fast 3G 全頁載完約 4.2 秒（原約 15 秒）。
  - 鍵盤：桌機 Tab 到頁首「牌組」，焦點框四邊完整。
- **未驗證**：真機 iOS Safari／WebKit 的 `svh` 與網址列伸縮、IG 與 LINE 內建瀏覽器、Android 實機的系統中文字型（備援只在載入前短暫出現）。
- **注意**：`glyphs` 在建置時讀 `src/`，新增文案後重新建置就會自動涵蓋；若日後有不在 `src/` 的文字（例如外部資料），那些字會逐字退回系統字型，不會缺字。

## 2026-11-18

- **行動裝置測試**：正式建置（`astro preview`，http）＋無頭 Chrome 157（CDP、實體 GPU）模擬 iPhone SE／15、Pixel 7、Galaxy A、320 寬、橫向，送真的觸控事件（`hover: none`、`pointer: coarse` 生效），逐格錄影檢查動畫。找到四個問題並修正：
  1. **跨頁 VT 在第一次抽牌必定失效**，console 有未捕捉的 `InvalidStateError: … ViewTransition opt-in disabled`。新頁首次繪製時若還有外部 script 在下載，Chrome 157 就放棄跨頁 VT（最小重現頁在有視窗與無頭模式都重現；查無官方說明）。結果頁的 `reveal.ts` 因為 import 了與首頁共用的 `store.ts` 而被拆成外部檔＋共用 chunk。修正：`reveal.ts` 自帶交棒讀取，不 import 任何模組，Astro 改為內嵌；`store.ts` 拿掉 `drawStore.take` 與 15 秒時效。
  2. **散牌撐大手機 layout viewport**：牌飛出畫面造成水平溢出，手機 Chrome 把 layout viewport 從 393 撐到 871×1889；`position: fixed` 的 canvas 像素量約 2.2 倍、塌縮的鏡射波源跑到畫面外（放射狀雜線），VT 也以 `Viewport size changed` 中止。修正：`index.astro` 在 `html.is-resolving` 時對 `body` 設 `overflow-x: clip`。1 與 2 要一起改，只改 1 仍會中止。
  3. **慢速網路下 `draw.ts` 晚 4.7 秒才執行**：首頁入口要再抓 `store` 共用 chunk（0.9 KB），被 16 個 VeryHigh 字型檔擠到 6.4 秒才完成（Slow 4G＋4×CPU）。這段時間牌背已顯示、可點但沒洗牌，三次點第一張都是「愚者」。修正同 1：`store.ts` 不再共用，併進首頁入口檔。
  4. **看門狗把穩定 30fps 誤判為掉幀**：門檻是絕對 24ms，30Hz 上限的裝置（iOS 低耗電模式）每幀 33ms 必然觸發，抽一次就降到 tier 1；之後 `collapse()` 只看 GL 有沒有載入，不看 tier，加上「跳到最後一幀」的旗標在 bfcache 復原後仍在，再抽時塌縮直接跳黑。修正：`gl.ts` 建立舞台時先量 8 幀閒置 rAF 間隔取中位數，門檻改為 `max(24ms, 基準 × 1.4)`；`draw.ts` 只在 tier ≥ 2 用 GL 塌縮。
- 文件：`SITEMAP.md`（`index.astro`、`[slug].astro`、`store.ts`、`reveal.ts`、`gl.ts`、`src/scripts/` 的 import 限制、體積）、`05-fx-plan.md`（渲染規則、In-app 與 iOS、架構表）、`02-plan.md` §10 看門狗描述。
- 驗證（本機實際執行，修正後回歸）：
  - `pnpm check` 0 錯誤 0 警告 0 提示；`pnpm build` 10 頁。結果頁只剩內嵌 script（無外部 JS）；首頁入口沒有靜態 import。gzip：首頁初始 JS 約 3.0 KB、GL chunk 合計約 3.4 KB、結果頁 JS 約 0.55 KB。
  - iPhone 15 觸控全流程：首次抽牌 VT `ready` 成功、`role="status"` 宣告；上一頁從 bfcache 還原後 tier 維持 3、可再抽；「重新抽一張」正常；console 零錯誤。散牌期間 `innerWidth` 與 canvas 寬維持 393；塌縮為乾淨的同心環。
  - 看門狗：30fps 穩定與模擬 15Hz 都不再寫入 `fx-tier`；不限幀率每幀 +40ms → 降到 tier 1，之後再抽改播 CSS 塌縮（約 1.58 秒導頁）；30fps 下每幀 +70ms → 降到 tier 2；不限幀率 +12ms 或無負載不觸發。
  - 減少動態效果（真的 media 模擬）269ms 導頁、牌不位移；2 核＋4×CPU 走 CSS 塌縮；6×CPU 點擊事件 120ms。
  - 邊界 8 項全過：連點兩張、同一張雙擊、從牌上滑動、捲動後點第 7 張、發牌中點牌、動畫中轉橫向、動畫中點頁首、無 JS。320／360／375／393／412 寬與橫向，首頁、結果頁、牌組頁、404 都沒有水平捲軸。桌機 1440 滑鼠與純鍵盤（焦點框 3px 白）各走一次，VT 成功。
  - Slow 4G＋4×CPU：`draw.ts` 於 1.91 秒執行（修正前 6.4 秒），與首次繪製同時；早點的三次分別抽到 fool、hermit、tower，有動畫；首頁→結果頁 VT 成功。
- **已知限制**：首頁入口檔有動態 `import()`，無法內嵌。冷快取且慢速網路時，從結果頁（例如分享連結進站）按「重新抽一張」第一次進首頁，root 淡入會被丟掉並留一條 console 例外；本機網路下未發生。
- **未修，待決定**：每頁冷載入字型 1.06–1.21 MB（Noto Sans TC 111 個子集命中 18–20 個），Slow 4G 下結果頁 LCP 2.01 秒、Fast 3G 全頁載完約 15 秒；頁首「牌組」32×44 與契合度連結 36×44 未達 44×44 建議值（AA 24×24 通過）；橫向手機（852×393）因寬度 ≥ 48rem 套用桌機牌寬，首屏看不到牌。
- **未驗證**：真機 iOS Safari／WebKit、IG 與 LINE 內建瀏覽器、實機 GPU 與發熱、網址列伸縮時的 `100lvh`、120Hz 裝置。

## 2026-11-16（第九次）

- **repo 名稱更正為 `QRACON-tw/Qracon2026_Tarot`**：`QRACON-tw/Qracon_Tarot` 不存在，`git push`／`fetch` 回 `Repository not found`。本機 `origin` 改指 `https://github.com/QRACON-tw/Qracon2026_Tarot.git`，遠端 `main` 停在 `6679170`，本地可快轉推上。
- GitHub Pages 子路徑跟 repo 名稱走：`astro.config.mjs` 預設 base 改為 `/Qracon2026_Tarot`，正式網址 `https://qracon.entangletech.tw/Qracon2026_Tarot/`；`README.md`、`02`、`03`、`SITEMAP.md`、`handoff` 的 QR 網址同步更新。第七次紀錄保留原樣。

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
