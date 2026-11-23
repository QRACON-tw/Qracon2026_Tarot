# 變更紀錄

## 2026-11-23（第二次）

- **死神角色名換行**（`Card.astro`、`src/data/tarot.ts`、`src/utils/tarot.ts`）：行銷組回報牌組頁的死神牌面把「退相干爆肝工程師」切成「退相干爆／肝工程師」（`text-wrap: balance` 平分成 4／4 字，「爆肝」被拆開），要求改成「退相干／爆肝工程師」。`TarotCard` 加選填欄位 `personaParts`，死神設為 `['退相干', '爆肝工程師']`；牌面遇到這個欄位就在各段之間放 `<wbr>`，並加 `word-break: keep-all`（`.card__persona--parts`），只在段落交界換行，一行放得下時照舊一行。`validateCards()` 新增檢查：各段接起來必須等於 `persona`。`<title>`、分享文字、OG 圖仍用 `persona`，不受影響。規格見 `02` §7.2（v2.7）、§8。
- 驗證（本機實際執行）：
  - `pnpm check`：0 錯誤 0 警告 0 提示（27 個檔案）。`pnpm build`：10 頁；首頁、牌組頁、死神結果頁的 HTML 都是 `退相干<wbr>爆肝工程師`；`public/og/` 沒有變動。
  - 反向測試：暫時把死神的 `personaParts` 改成接不回 `persona`，`pnpm build` 以 `[death] personaParts must join into persona "退相干爆肝工程師"` 失敗；還原後重建通過。
  - dev server＋內建瀏覽器逐字量測行位置：牌組頁 112px 牌（1024 寬、375 行動模擬）與首頁翻牌（375 寬 104px、320×640 寬 86px）的死神都是「退相干／爆肝工程師」、無溢出；死神結果頁 204px 大卡仍是一行；其餘六張在量測到的 83–112px 都是一行；`scrollWidth` 等於視窗寬。
  - 備註：dev server 又一次供應舊的 scoped CSS（新的 `.card__persona--parts` 規則沒進來，build 產物裡有），重開 dev server 後正常，與 11-22（第二次）的狀況相同。
- **上線**：塔羅 `main` 推到 `eec3c22`（CI 通過），手動觸發主站 `deploy-pages.yml`（[run 45166507611](https://github.com/QRACON-tw/2026/actions/runs/45166507611)；主站 `main` 維持 `d271d0f`，與上次部署相同，所以只多出這次修改），build、deploy 皆 success。
- 線上驗證（實際執行）：塔羅首頁、牌組頁、死神結果頁 200，`Last-Modified` 2026-11-23 11:35:47–48 GMT（原為 07:51:43），HTML 與本機 `dist/` 逐位元相同、都含 `退相干<wbr>爆肝工程師`；`Card.De_GyWwO.css` 含 `.card__persona--parts{word-break:keep-all}`；`og/death.png` 與 repo 相同；`deck/fool/`、`lab/share-test/`、主站 `/2026/` 皆 200；塔羅首頁仍 `noindex, follow`、`sitemap.xml` 無 `<loc>`。內建瀏覽器開正式網址（375 行動模擬）：死神牌面「退相干／爆肝工程師」、`word-break: keep-all`，其餘六張都是一行，七張插畫都載入，無水平溢出。

## 2026-11-23

- **實機分享測試頁（暫時）**：行銷組要求結果頁能把 9:16 圖分享到 IG 限時動態。網頁沒有直接發佈到 IG 限動的做法，能做到哪一步取決於各 App 在真機上的行為，而這些目前都沒有實測資料：Web Share 帶圖片時面板有沒有 IG 限動、帶文字與網址時 IG 是否只收到文字（有人回報 iOS 會）、剪貼簿圖片能不能貼進限動、下載與長按存圖的落點、`instagram.com/create/story` 從網頁點開會落到哪、LINE 的 `?openExternalBrowser=1` 有沒有跳出內建瀏覽器。先收真機資料，再決定分享鈕怎麼做。
- **測什麼**：T1 只分享圖片、T2 圖片加文字與網址、T3 只分享網址（現行結果頁做法）、T4 複製圖片、T5／T6 下載（產生的圖／網址圖片）、T7／T8 長按存圖（產生的圖／網址圖片）、T9 開 IG 限動相機連結、T10 LINE 外部瀏覽器參數；環境涵蓋 iOS Safari、Android Chrome 與 IG、LINE、Facebook 內建瀏覽器。測試者逐項點擊並勾選看到的結果，按「複製結果」貼回純文字報告；沒有後端，紀錄只存在該手機的 `localStorage`。
- **放哪裡、怎麼收**：`public/lab/share-test/index.html`，單一檔案（行內 CSS 與一段 `<script type="module">`，不載入外部資源；測試圖由瀏覽器用 canvas 產生，只引用站內 `og/fool.png`），建置時原樣複製，網址 `/2026/tarot/lab/share-test/`。暫時性質：`noindex, nofollow`、不進 sitemap、站內沒有任何連結；測完即刪（連同 `SITEMAP.md` 的兩列）。未動 `src/`、`scripts/`、`astro.config.mjs`、依賴與 CI。
- 驗證（本機實際執行）：
  - `pnpm check`：0 錯誤 0 警告 0 提示（27 個檔案）。
  - `pnpm build`：10 頁；`dist/lab/share-test/index.html` 存在，與 `public/` 來源逐位元相同；`dist/` 內共 11 個 HTML。
  - 把行內 module script 抽成 `.mjs`，`node --check`：通過。
  - 對新檔案 grep：沒有 emoji；十六進位色除 canvas 專用的五個色（`#08090a`、`#141516`、`#5a5c5a`、`#8a8c88`、`#d4d5d2`）外皆為灰階；`await` 只在產圖函式 `generateImage()` 內，呼叫 `navigator.share()`／`clipboard.write()` 的路徑上沒有任何 `await`；沒有 `confirm(`、`-webkit-touch-callout`、`user-select`、`pointer-events`；沒有 `/2026/` 絕對路徑；沒有 `fetch`／XHR／動態 `import()`，唯一的絕對網址是 T9 的 IG 連結。
  - 暫存 Node 腳本（未進 repo）把頁面的純邏輯抽出來跑：25 組 UA 的系統與瀏覽器判斷（含 IG、LINE、Facebook、Messenger、Threads、Samsung、iPadOS 桌面版 UA）、時區標籤、測試編號字元集、報告逐行比對、損毀或型別錯誤的 `localStorage` 內容、會丟例外的 storage，全部通過。審核時另補未列名 App 的 WebView 判斷（Android `; wv)`、iOS 缺 `Safari/` token），10 組 UA 重跑通過。
  - dev server＋內建瀏覽器（375×812 行動模擬，Android Chrome UA）：測試圖 1080×1920、約 260 KB、25–40 ms 產生，安全區帶、標題、`og/fool.png`、測試編號都在；網路請求只有本頁、`og/fool.png` 與 blob。T1 點擊記錄「不支援（navigator.share 不存在）」；T4 以替身剪貼簿（避免覆寫系統剪貼簿）記錄「完成」並寫入 `image/png`；勾選與備註即時進報告、寫入 `localStorage`，重新整理後全部還原；「複製結果」寫入完整報告並顯示「已複製。」；「清除這台的紀錄」第一下變「再按一次確認清除」、3 秒內第二下清空後重載。320×640：`scrollWidth = 320` 無溢出，71 個可點目標（展開 `<details>`）皆 ≥ 44px。console 無本頁錯誤。
  - 注意：Astro dev server 不會把 `public/` 的目錄網址對到 `index.html`（`/2026/tarot/lab/share-test/` 回 404），本機要開 `…/share-test/index.html`；正式站 GitHub Pages 用目錄網址即可。
- **上線**：塔羅 `main` 推到 `a5ca654`（CI 通過），手動觸發主站 `deploy-pages.yml`（[run 45134049338](https://github.com/QRACON-tw/2026/actions/runs/45134049338)；主站 `main` 維持 `d271d0f`，與上次部署相同，所以只多出這一頁），build、deploy 皆 success。
- 線上驗證（實際執行）：`/2026/tarot/lab/share-test/` 200、`Last-Modified` 2026-11-23 07:51:43 GMT、內容與 repo 檔案逐位元相同、`noindex, nofollow`；不帶斜線的網址 301 到帶斜線版本，相對路徑因此成立；`og/fool.png`、`favicon.ico`、塔羅首頁、牌組、`deck/fool/` 與主站 `/2026/` 皆 200；塔羅首頁仍 `noindex, follow`、`sitemap.xml` 無 `<loc>`。內建瀏覽器開正式網址：安全連線「是」，測試圖以線上 `og/fool.png` 產生（261 KB），T5／T6／T9／T10 的連結解析正確，`localStorage` 可用，console 無錯誤。
- 未驗證：真機與各 App 內建瀏覽器（這頁就是要拿去測的）；`navigator.share` 帶檔案的實際呼叫（內建瀏覽器沒有 `navigator.share`）。

## 2026-11-22（第四次）

- **線上驗收**：主站 `QRACON-tw/2026` 的 `main` 推到 `d271d0f`（PR #13、#14 等 8 個 commit）觸發部署，塔羅 `main` 為 `4eadc3e`。`/2026/tarot/` 的 Last-Modified 為 2026-11-22 14:59:14 GMT（原為 11-20 06:45）。
- 驗證（實際執行）：
  - 本機以主站 workflow 相同的 `ASTRO_SITE`／`ASTRO_BASE_PATH=/2026/tarot` 建置後逐檔比對線上：78 檔全部 200；10 個 HTML 與 JS、CSS、字型、9 張 OG 圖逐位元相同。43 個 AVIF 檔名相同、位元不同，以 sharp 解碼比對尺寸一致、平均像素差 0.96–1.64／255，判斷為 Windows 與 Linux 的 AVIF 編碼器差異，不是版本不同。
  - 全站 `noindex, follow`、canonical 皆為 `/2026/tarot/…`、`robots.txt` 允許、`sitemap.xml` 無 `<loc>`（軟上線狀態不變）。主站 `/2026/` 200，首頁 16 個站內連結全 200，主站沒有塔羅入口。
  - 內建瀏覽器 375×812 行動模擬：首頁七個 href 皆停在 `/2026/tarot/deck/`、引導連結在、無水平溢出；點第 1 張導到洗牌對應的 `/deck/lovers/`，`role="status"`「你抽到糾纏態純愛戰士。」，兩顆按鈕同列、間距 16px、無 `navigator.share` 時顯示「複製連結」；牌組頁七張、無溢出、無小於 44px 的點擊目標；牌面為新版插畫橫排。
  - 跨文件 VT：內建瀏覽器那次出現 `InvalidStateError: … Page already revealed`，當時瀏覽器窗格是隱藏狀態（背景分頁節流渲染）。改用無頭 Chrome 157（CDP、真 GPU、375 mobile、前景渲染）在線上抽三次：`pageswap` 帶 VT、`pagereveal` 的 `viewTransition.ready` 都成功、0 個 console 錯誤。**正式建置於 https 上的跨文件 VT morph 已驗證**（11-16 列為未驗證）。另重載首頁 8 次，排列皆不同，洗牌正常。
- 已知、不影響本站：`/2026/tarot/` 底下不存在的路徑顯示主站 404（GitHub Pages 只用根目錄的 404）；網域根目錄鏡像（`QRACON-tw.github.io` 排程建置主站）不含塔羅，`/tarot/` 為 404，塔羅只在 `/2026/tarot/`。
- 未驗證：真機 iOS Safari／Android、IG 與 LINE 內建瀏覽器。

## 2026-11-22（第三次）

- **合併 `origin/main`**（遠端 4 個 commit：插畫素材 PR #1、改掛主站 `/2026/tarot/`、文件；本地 8 個 commit 自 `db8be62` 分岔）。衝突 4 檔，處理方式：
  - `Card.astro`：使用者選「插畫＋行銷回饋」。以遠端插畫牌為底（`astro:assets` AVIF 牌面、牌背圖、`TarotGlyph` 備援），文字改橫排：上方羅馬數字收在髮絲內框內（遠端版 `5cqw` 貼頂壓到內框線，已修）、下方白底文字帶放英文牌名＋角色名；插畫 `scale: 0.88` 讓上下留白約 20%。本地 v2.5 淺灰底字隨字體牌移除（插畫已填滿牌面）。規格見 `02` §7.2（v2.6）。
  - `draw.ts`：兩邊都留——prefetch 走本地 `targets` Map（翻牌前不揭曉），再呼叫遠端的 `preloadCardArt`。
  - `SITEMAP.md`：路由改 `/2026/tarot/`，各列合併兩邊內容（引導連結、href 停在 `/deck/`、分享按鈕＋插畫、OG）；`Card.astro` 列改寫，`TarotGlyph`、`build-og.mjs` 列沿用遠端。
  - `LOG.md`：兩邊紀錄都保留，依日期排列。
  - 自動合併：`[slug].astro`（本地按鈕間距＋遠端 OG）、`index.astro`（本地引導連結＋遠端 OG）、`02-plan.md`（本地 v2.4／v2.5＋遠端 K1 修訂）。
- 驗證（本機實際執行，dev server 重開後，base `/2026/tarot/`）：七張插畫非白像素範圍以 sharp 量測（上緣 15.9–31.4%、下緣 68.9–84.2%）；DOM 量測文字與線稿間距——牌組頁 112px 全為正值（塔最小 0.7px）、結果頁 204px 塔 7.7px、首頁 98px 只有塔 −1px（白底帶切掉約 1px 線稿）；英文牌名七張都一行，角色名只有死神兩行。375 行動模擬抽牌一次：導到洗牌對應結果頁、`role="status"`「你抽到淬火災難大師。」、按鈕「複製連結」；首頁七個 href 皆停在 `/2026/tarot/deck/`；375／1440 無水平溢出。`pnpm check` 0／0／0、`pnpm build` 10 頁（OG 絕對網址 `/2026/tarot/og/…`、無 JS 備援 href 正確）；impeccable 偵測器 0 項。dev 的 console 只有已知的跨文件 VT `InvalidStateError`（dev 外部 script 造成，正式建置沒有）。
- 未驗證：真機 iOS Safari／Android、IG 與 LINE 內建瀏覽器上的插畫牌面；正式建置的 preview 與 CDP 真 375 量測這輪沒跑。

## 2026-11-22（第二次）

- **牌面底字**（`Card.astro`）：使用者提議「文字當背景、淺灰、大字半填滿」。先在暫時的比較頁並排四案（現行／A 大數字出血／B 英文牌名字紋／C 外框半填滿數字），桌機與 375 手機、14rem 與 7rem 都看過，使用者選 A。實作：`.card__face` 第一個子元素 `.card__ghost`（`aria-hidden`、`user-select: none`），絕對定位在髮絲內框內緣（`inset: space-2 + rule-hair`，第一版貼齊 `space-2` 會蓋掉髮絲框，已修），淺灰 `--color-dim-surface-strong`、118cqw、下緣出血 14%、水平置中對稱裁切；三個文字元素加 `position: relative` 疊在上面。比較頁已刪除，未進 repo。規格見 `02` §7.2（v2.5）。
- 驗證（本機實際執行，dev server＋內建瀏覽器）：結果頁大卡數字中心偏差 0、髮絲框四邊可見、角色名位置 `elementFromPoint` 命中文字；首頁翻牌結構（`card--flip`）牌面正確、牌背不受影響；375 行動模擬抽牌一次正常（導頁、`is-drawn`、`role="status"`）；牌組頁桌機與手機正常；320／375／1440 首頁、牌組頁、結果頁無水平溢出。`pnpm check` 0／0／0、`pnpm build` 10 頁（dist 含 `card__ghost`、無 lab 頁）；impeccable 偵測器 0 項。
- 備註：dev server 改 `Card.astro` 後一度供應舊的 scoped CSS（新規則沒進來），重開 dev server 後正常。日後改元件樣式看不到效果時，先確認 `?astro&type=style` 模組內容再除錯。
- **結果頁按鈕間距**（`[slug].astro`）：`.report__again` 原本是 block，「重新抽一張」（`<a>`）與「分享／複製連結」（`<button>`）兩顆 inline-flex 按鈕間距 0、垂直差 3px（`09b33b2` 帶入）。改為 flex＋`gap: var(--space-4)`＋`align-items: center`，網址退路連結 `flex-basis: 100%` 自成一行。
- 驗證（本機實際執行，dev server＋內建瀏覽器 375×812 行動模擬）：兩顆按鈕同列 y 相同、間距 16px；模擬剪貼簿不可用時網址退路換到下一行，`scrollWidth = 375` 無溢出。`pnpm check` 0／0／0、`pnpm build` 通過；impeccable 偵測器 0 項。
- RWD 複查（dev，iframe 量測）：320×568、375×812、393×852、667×375、852×393、915×360、768×1024、1180×820、1440×900 五個頁面（首頁、牌組、兩張結果頁、404）皆無水平溢出、無小於 44px 的連結或按鈕。首屏完整可見牌數：320×568 2 張、直向手機 6 張、橫向手機 7 張、1180×820 與 1440×900 只有 4 張（桌機第二列在首屏外）。375 手機實測抽牌一次：導到洗牌對應結果頁、`role="status"` 宣告正常、無 `navigator.share` 時按鈕顯示「複製連結」。

## 2026-11-22

- **行銷組四項回饋落地**（規劃與查證經過見當日對話；文案凍結後的增補都已在 docs 標注）：
  1. **首頁引導句**（`index.astro`）：提示句下方新增整行連結「想快速看完七張牌？點「牌組」。」，通往 `/deck/`（經 `sitePath()`），`min-height: 2.75rem` 點擊範圍。文案回寫 `01` §3（註明行銷組要求）。
  2. **翻牌前不揭曉**（`draw.ts`）：`shuffleCards()` 洗完後把七個 `<a>` 的 `href` 停在 `/deck/`，真目標存 `Map`；`prefetch` 與 `go()` 改從 `Map` 取目標。懸停狀態列、長按預覽、中鍵／Ctrl 開新分頁只會看到牌組頁；報讀器連結清單顯示「第 N 張牌 → /deck/」。無 JS 備援不變（建置產物仍含七個真實 href）。規格同步 `02` §6.1、§6.2（v2.4：翻牌前不揭曉）。
  3. **結果頁分享**（`[slug].astro`、`reveal.ts`）：[ 重新抽一張 ] 旁新增「分享」按鈕，`navigator.share({ title, text, url })`，text 為「我抽到〔角色名〕。QRACON 2026 量子塔羅」；無 `navigator.share` 時按鈕改「複製連結」；取消（`AbortError`）靜默；其他錯誤退複製連結，成功以 `role="status"` 宣告「連結已複製。」；剪貼簿也被擋時顯示網址連結供長按複製。`reveal.ts` 維持 import-free，建置後結果頁仍是零外部 JS。
  4. **牌面橫排改版**（`Card.astro`）：移除 `writing-mode: vertical-rl`；牌面改為羅馬數字 → 英文牌名（全大寫、Barlow 800、10.5cqw）→ 角色名（Noto 900、11cqw、`text-wrap: balance`），flex `space-evenly` 置中分布，letter-spacing 尾隙以等量 `padding-inline-start` 補償。英文照資料庫 `nameEn`（The Lovers 等；行銷組清單的 THE LOVER／THE WORLD 屬出入，已回報確認）。規格同步 `02` §4.2、§7.2。
- **「文字歪」查證結論**：行銷組實機回報牌面文字微歪。deepseek v4.1 flash 子代理判讀四張桌機截圖（字型正確載入）：直排無歪斜、置中在數像素內、8 字不裁切；根因推測為手機字型未載入時 fallback 直排度量差異＋小卡縮放錯覺。**改橫排把這個風險類別整個移除**（判讀同時發現的真實版面問題：內容偏上、下方留白過多，已隨 `space-evenly` 修掉；大卡整塊右偏數 px 為 letter-spacing 尾隙，已補償）。
- **角色名字級 12 → 11.5 → 11cqw**：兩輪視覺判讀都指出 7 字角色名（糾纏態純愛戰士）在 7rem 小卡上貼髮絲內框；DOM 實測依序為 1.5 → 3.5 → 5px 餘裕，定案 11cqw（8 字死神在 7rem 小卡仍為 4+4 平衡換行 49+49，在結果頁大卡為 104+104）。
- 驗證（本機實際執行）：
  - `pnpm check` 0 錯誤 0 警告；`pnpm build` 10 頁。dist 檢查：結果頁 `<script>` 全內嵌（無 src）、分享文案與按鈕都在 HTML／內嵌 JS 裡；首頁入口 chunk 6729 bytes raw；無 JS 備援的七個 `deck/<id>/` href 仍在。
  - 瀏覽器實測（dev 與 preview 各一輪）：七個連結 href 全為 `/Qracon2026_Tarot/deck/`、`aria-label`「第 N 張牌」、`data-card` 保留；點牌後正確導到洗牌對應的結果頁、`is-drawn` 進場、`role="status"` 宣告（實測抽中躍遷幸運星與疊加態混亂人）；無 `navigator.share` 的環境按鈕自動變「複製連結」，剪貼簿被擋時顯示網址退路（兩層退路都實測）。
  - DOM 量測（preview、pane 1000px）：七張牌數字／英文／角色名 `centerDelta` 全 0；`docScrollWidth` 985 < 1000；WHEEL OF FORTUNE 換行 55+50 無孤字。
  - **CDP 真 375 驗證**（`Emulation.setDeviceMetricsOverride`，正式建置）：首頁／結果頁／牌組頁 `scrollWidth = innerWidth = 375` 零溢出；牌寬 98px；結果頁大卡中心偏差 1px；頁尾右緣 358 < 375 完整。
  - impeccable 偵測器（v4.9.1）對三個改動的 UI 檔案：0 項發現。
- **截圖工具教訓**：無頭 Chrome `--screenshot --window-size=375` 在 Windows 會被**最小視窗寬度 500px** clamp（CDP 實測 `innerWidth=500`），而 `--screenshot` 又只擷取左側 375px——產出「版面按 500 排、右緣被裁」的假破版截圖，deepseek 兩輪的 P0 判讀皆源於此（2× 版本另有判讀端量測不一致）。日後手機版面驗證一律用 CDP device metrics（本 repo 既有做法），不要用 `--screenshot` CLI。
- **未驗證**：真機 iOS Safari／Android、IG 與 LINE 內建瀏覽器（軟上線前補）；行銷組手機截圖覆核（已邀請提供，用 deepseek 再判讀一次）。

## 2026-11-20（第二次）

- **K1 修訂：部署改「主站掛載」**（取代 11-16 定案的 C：獨立 Pages 專案）。主站 repo `QRACON-tw/2026` 的 deploy workflow 另 checkout 本 repo `main`（公開 repo，免 token）建置後掛到主站 `dist/tarot/`，兩站同一個 GitHub Pages artifact；正式網址改為 `https://qracon.entangletech.tw/2026/tarot/`（[QRACON-tw/2026#12](https://github.com/QRACON-tw/2026/pull/12)，含做法與驗證說明）。
- `astro.config.mjs`：預設 `ASTRO_BASE_PATH` `/Qracon2026_Tarot` → `/2026/tarot`；`pnpm dev` 網址同步改。
- 移除 `.github/workflows/deploy-pages.yml`（本 repo 不再有自己獲 Pages 部署）；新增 `.github/workflows/ci.yml`：push／PR 跑 `pnpm check`＋`pnpm build`，避免壞建置進 `main` 後擋住主站部署（R9 回來了）。
- 文件同步：`README`（部署段、網址、狀態）、`02` §0 D4、§5、§11（部署架構表新增 D、軟上線改為合併主站 PR、協作風險與 R9）、驗收清單、`03`（K1／K6 已定案列、最後更新日期）、`SITEMAP`（base、路由表、workflow 列）、`PRODUCT`、`handoff`（印刷 QR 網址）。
- 驗證（本機實際執行）：`pnpm check` 0 錯誤 0 警告 0 提示；`pnpm build` 10 頁，預設 base 下 canonical、OG、sitemap、robots 全為 `/2026/tarot/`；`ASTRO_BASE_PATH=/2026/tarot` 明確覆寫亦同；`src/` 無殘留舊 base 引用。
- 注意：本 repo 推 `main` 後不會自動上線，要等主站 repo 下一次部署（推 `main` 或手動 `workflow_dispatch`）。
- 線上驗收（2026-11-20 合併 [QRACON-tw/2026#12](https://github.com/QRACON-tw/2026/pull/12) 後自動部署，[run 44689960183](https://github.com/QRACON-tw/2026/actions/runs/44689960183)）`https://qracon.entangletech.tw/2026/tarot/`：10 頁全 200（首頁、牌組、七張單牌、404）、OG ×9 與字型、AVIF 資產全 200；canonical／OG 絕對網址正確；`robots.txt` 允許、sitemap 空集合、全站 `noindex, follow`（軟上線狀態）；主站 `/2026/` 未受影響。**軟上線（原定 11/27）提前於 11-20 生效**。

## 2026-11-20

- 使用 imagegen 完成七張灰階牌面插畫（1440 × 2520、單張 ≤ 400 KB）與同版型牌背；牌背參考官網給未設定頭像的團隊成員使用的黑貓預設圖。牌面已接入抽牌頁、牌組頁及結果頁，保留七款 40 × 40 線稿字體牌作為備援。
- `draw.ts` 點牌時預載該張牌面圖；各路由加入 OG 圖片中繼資料。新增 `scripts/build-og.mjs` 與 `pnpm build:og`，產生首頁、牌組及七張單牌共九張 1200 × 630 PNG 分享圖，包含主站字標及牌面素材。
- 素材清單與 `SITEMAP.md` 同步記錄交付狀態。

## 2026-11-18（第三次）

- **新增 `PRODUCT.md`**（impeccable v4.9.1 `init`）：產品脈絡摘要，內容取自 `docs/01`–`04` 與訪談。訪談確認三件事：兩群使用者並重（還沒報名的學生從 IG／LINE 進來；已報名的參加者在會前或會場玩）；成功的主要標準是抽完去看議程或報名（截止後改會場）；定位與硬限制照 `docs/` 整理。待決事項沿用 `03-open-questions.md`（2026-11-16 狀態），沒有重新確認 K2、K3 是否已拍板。
- 不寫 `DESIGN.md`，也沒有設定 impeccable 的 live 模式或 hook。
- 本機工具：impeccable skill 從 v4.3.1 更新到 v4.9.1（全域安裝，`--no-hooks`），engine v0.1.24；另外裝了 4 個 `~/.claude/agents/impeccable-*` subagent。不影響本 repo。

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
