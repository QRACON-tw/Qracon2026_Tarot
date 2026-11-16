# 05 — 實作前審查與建置計劃

**日期**：2026-11-16（活動 2026-12-13，剩 27 天）
**方法**：三個子代理平行掃描（文件一致性、主站沿用查證、物理與文案），再交顧問代理複審；關鍵事實已回主站 repo 抽查。
**定位**：本檔是 `02-plan.md` v2.1 的審查結果與修訂提案。**已採納並回寫 01／02／03（v2.2），以下內容以那三份為準。**

> **同日更正**（拉下主站 `origin/main@257b790` 後發現）：
>
> 1. 主站已從 Cloudflare Pages **改部署到 GitHub Pages**：`https://qracon.entangletech.tw/2026/`，`base: env.ASTRO_BASE_PATH ?? '/2026'`，並已有 `sitePath()` helper。repo 移到 `QRACON-tw/2026`。本檔 §1、§2 的 Cloudflare、「不設 base」「寫死根路徑 14 處」「分支預覽」都已過時。
> 2. GitHub Pages **沒有分支預覽**，所以改成 **11/27 軟上線**（合進 main、全部 noindex、不加入口），12/02 正式上線。
> 3. `public/_headers` 在 GitHub Pages 沒有作用。
> 4. 「第四屆」出自主站 `PRODUCT.md`，不是查無出處（§5 更正）。
> 5. 主站 DESIGN.md 禁用眉標：結果頁的「量子狀態觀測報告」改稱票頭。
> 6. K5 的 Cloudflare Web Analytics 在 GitHub Pages 上要另加 beacon script。
>
> 部署細節見 `02-plan.md` §2、§11。

---

## 0. 結論

1. **計劃方向可行，但「已核定」不能直接開工。** 部署方案 A 與主站結構不符，時程排不進活動前的宣傳期，物理文案還有 3 處錯誤。
2. **部署改走 A1**：塔羅頁直接放進主站 repo 的 `src/pages/tarot/`，不設 `base`，在 `feat/tarot` 分支用 Pages 預覽開發，上線日才 merge。
3. **上線日訂 12/02，12/06 程式凍結。** 範圍砍成 Must／Should／Later，Canvas 分享卡與碎裂動畫移出 Must。
4. **物理校稿在 11/21 前簽核**，擋的是 P3 內容與 OG/QR 圖，不擋骨架。
5. **需要主辦／你拍板的 6 件事**列在 §6，其中部署方案與報名截止日最急。

---

## 1. 主站查證（已抽查）

| 計劃說法 | 實際 | 影響 |
| --- | --- | --- |
| Astro 靜態、零框架、原生 CSS | 成立。`astro@^7.3.2`、`sharp@^0.35.4`、TS 6 strict，無 linter、無測試 | 完成定義＝`pnpm check` + `pnpm build` + 1440/375 實看 |
| tokens 名稱與值 | 全部成立 | — |
| 主視覺零色相 | 成立 | 灰階暗房方向不變 |
| `Ticket` 需抽出 `TicketShell` | **不需要**。props 只有 `slits/stamp/class/labelledby` | 直接用 `Ticket` |
| 方案 A：`apps/tarot` + `base: '/tarot'` | **不成立**。`pnpm-workspace.yaml` 沒有 `packages`；主站有 14 處 `href="/..."` 寫死根路徑 | 改 A1（§2） |
| 套件管理器 | `pnpm@12.3.4`（corepack），本機未安裝 | 第一天 `corepack enable pnpm` |
| 部署 | Cloudflare Pages Git 整合，DNS 在 GoDaddy，無 CI | 無法用 Worker 反代，兩個 Pages 專案共用 `/tarot` 做不到 |
| 規範文件 | 主站 `CLAUDE.md`、`DESIGN.md`、`PRODUCT.md`、`docs/` 皆被 gitignore | 協作者看不到 Zero Hue 等規則；塔羅規則要寫在本 repo |

另外三個會踩到的主站預設：

- `global.css`：`color-scheme: light`、紙灰 scrollbar、`--color-focus: var(--color-ink)`。**焦點框在墨底上看不見**，WCAG 不及格。
- `global.css` 全域開了跨文件 `@view-transition`，主站 → 塔羅會灰到黑閃一下。
- `BaseLayout.astro` 寫死 `theme-color #d9d9d9`，沒有 prop；canonical 強制補尾斜線、清掉 query。

---

## 2. 部署：A1

| 方案 | 結論 |
| --- | --- |
| **A1（採用）** 主站 `src/pages/tarot/*` + `TarotLayout` | 單一建置、元件不分叉、共用網域與 sitemap |
| A（原計劃）`apps/tarot` 子專案 | 要先改 workspace、再寫 dist 合併腳本，划不來 |
| B 雙 repo + CI 拉產物 | 主站沒有 CI，要整個換部署模式 |
| C 子網域 | 只在主辦拒絕把程式碼放進主 repo 時採用 |

A1 的做法：

- 路徑一律帶尾斜線：`/tarot/`、`/tarot/deck/`、`/tarot/deck/fool/`。寫一個 `tarotPath()`，不設 `base`。`02-plan.md` §5「掛在 `BASE_URL` 底下」改成用這個 helper。
- 把 `BaseLayout` 的 `<head>` 抽成 `SeoHead.astro`（加 `themeColor` prop），主站與 `TarotLayout` 共用。只搬結構，不改主站行為。
- `TarotLayout` 覆寫：`color-scheme: dark`、墨色背景與 scrollbar、`--color-focus: var(--color-white)`、`::selection`。
- `src/utils/seo.ts` 的 `INDEXABLE_PAGES` 加塔羅頁；`public/_headers` 沿用。
- **隔離風險**：主站 11/07–11/11 連續在同步議程。塔羅在 `feat/tarot` 開發，用 `*.pages.dev` 分支預覽（`_headers` 已對 pages.dev 加 noindex），12/02 才 merge，任何時候 build 壞掉都不擋議程更新。
- R9 改寫：覆蓋只會在「把塔羅產物 `wrangler pages deploy` 到 `qracon-web-2026` 專案」時發生；A1 沒有這個風險。

---

## 3. 範圍

| 級別 | 內容 |
| --- | --- |
| **Must（12/02 上線）** | 牌扇 + 洗位置 + 無 JS 備援 + 鍵盤 + reduced motion；被選牌翻開，其餘**淡出**；7 張結果頁（字體牌）；`/tarot/deck/`（頁尾併入「關於」）；OG ×7 + 首頁 / deck 各一；只分享網址的 Web Share（`navigator.share({ url })`）；CTA；sitemap |
| **Should（12/03–06 有餘力）** | 碎裂動畫（`clip-path` 36 片）；回訪橫幅；獨立 `/tarot/about/` |
| **Later** | Canvas 9:16 分享卡與 WebView 長按退路、4:5 版本、塵埃粒子、插畫替換、音效 |

**分享卡改法**：結果頁第一屏本身做成 9:16 可截圖構圖。這樣一次避開四個問題：Canvas 不支援直排、字族名 hash、iOS 產圖後失去 user activation、IG/LINE WebView 擋下載。

---

## 4. 規格補洞（寫進 02 v2.2）

| # | 問題 | 規格 |
| --- | --- | --- |
| S1 | `?draw=1` 跟著分享出去 | 結果頁讀到後 `history.replaceState` 拿掉；canonical 本來就清 query；「你剛剛抽到」章預留高度，避免 CLS |
| S2 | localStorage 在任何牌頁都寫 | 只在 `?draw=1` 時寫；`try/catch`；`at` 超過 7 天不顯示回訪 |
| S3 | bfcache 回到鎖死的 `resolving` | `pageshow` 且 `persisted` 時重設狀態、重洗 |
| S4 | 動畫出錯卡住 | 點擊後 1600ms 未導頁就直接 `location.assign` |
| S5 | View Transition 未定 | 沿用主站跨文件 `@view-transition`；塔羅頁內用 `view-transition-name: card` 對應牌面；主站 ↔ 塔羅之間關掉 root 動畫 |
| S6 | 屬性條白色填充放在白票券裡會消失 | 屬性區放票券內時改用 `--color-ink` 填充、`--color-ink-soft` 軌道 |
| S7 | 銀墨高光是裸色值 | `tokens.css` 新增 `--color-on-ink-sheen`（前例：`--color-backdrop`） |
| S8 | 牌扇與字體牌仍有裸 px | 改 `clamp()` 搭 token；「1.5px 外框」改 `var(--rule-thin)` |
| S9 | CTA 寫死 | 接 `site.registration.status`，截止後改「看議程／當天見」 |
| S10 | 缺文案 | `/deck/` 頁、導覽、頁尾、各頁 title/description、aria-label 與 aria-live 句子、結果頁的「重新抽一張」 |
| S11 | 分析 | Cloudflare Web Analytics（無 cookie），只看 pageview；要量現場 QR 就做 noindex 入口 `/tarot/s/`，canonical 指回首頁 |
| S12 | QR 指向 | 印刷品與分享都指向 `/tarot/`（或 `/tarot/s/`），邀人來抽，不指單張牌；網址印出去就不再改 |

接受不改：牌是 `<a href>`，hover 或長按會看到網址。這正是無 JS 備援，代價低。

---

## 5. 文案修正（cards.ts 定稿前）

**錯誤（必改）**

| 位置 | 原文 | 改為 |
| --- | --- | --- |
| `01:174` 太陽 | 每個光子的相位一致 | 雷射是相干光：整束光波的相位整齊、步調一致；燈泡的光相位雜亂，不相干 |
| `01:129` 命運之輪 | 能量不是連續的 | 原子這類束縛系統的能量不是連續的 |
| `01:128` 命運之輪 | 跳到下一個能階 | 吸收一顆能量剛好的光子，跳上更高的能階 |

**數值矛盾**：愚者「疊加 95／相干 25」卻說會干涉；太陽「糾纏 80」，但相干態接近古典、不糾纏。重填這兩張。若七張無法用一套規則一致推導，屬性條改成質性描述（例如「高／中／低」不帶分數）。

**誤導（建議改）**：首頁把載入時就洗好的古典隨機說成疊加態（加「比喻」或改說法）；隱士「被看見」改「被測量」；`−273.15 °C` 改「接近絕對零度」；命運之輪「能量存夠了」是古典圖像；激發態掉回是弛豫不是退相干；戀人↔太陽的契合理由把糾纏寫成通訊管道；死神「一接觸就消失」改成漸進；塔的「高能」「劇烈」過度、「閃電打中冷凍機」會被讀成磁體失超。逐條位置見本次物理掃描（`01:27–180`）。

**對應**：隱士 ↔ 測量最弱，且 `01:116`「一個在降溫」是改名前殘留。顧問建議改成「隱士＝與環境隔離＝保護相干性」，需物理校稿者判斷。

**其他**：

- 頁尾「物理名詞都有正確解釋」在簽核前改成「附有科普說明」。
- ~~「第四屆 QRACON」（`01:318`）查無出處~~：已確認出自主站 `PRODUCT.md`，保留。
- 「坍縮／塌縮」統一為「塌縮」；`01:147`「新的 code」改「新的程式」；斜線統一全形。
- `01:102`「距離從來不是問題」仍是 P0-9 要改的抬價句。

---

## 6. 需要拍板

| # | 事項 | 建議 | 期限 |
| --- | --- | --- | --- |
| K1 | 部署方案 | A1（主站 repo 內 `src/pages/tarot/`） | 11/17 |
| K2 | KKTIX 報名截止日 | — 決定 CTA 與整個工具的效期 | 11/17 |
| K3 | 上線日 | 12/02 上線、12/06 凍結 | 11/17 |
| K4 | 物理校稿者 | 指定一人，11/21 前簽核 | 11/18 |
| K5 | 分析工具 | Cloudflare Web Analytics | 不擋上線 |
| K6 | 印刷品 QR 截稿日 | 12/01 交檔 | 11/17 |

既有 Q1 獎勵制度、Q3 插畫排程**不擋上線**（預設：不寫獎勵、字體牌上線）。Q9、Q10 已有答案，從 03 移除。

---

## 7. 時程

| 日期 | 工作 | 完成定義 |
| --- | --- | --- |
| 11/17（二） | P0：拍板 K1–K6；`corepack enable pnpm`；開 `feat/tarot`；確認分支預覽網址；文案送物理校稿 | 預覽網址可開 |
| 11/18–19 | P1：`SeoHead` 抽出、`TarotLayout` 與覆寫、`tarotPath()`、`cards.ts` + `validateCards()`、四個路由、sitemap | `pnpm check`、`pnpm build` 通過，主站頁面不變 |
| 11/20–24 | P2：牌扇、洗位置、狀態機（S3、S4）、淡出、S1、S2、鍵盤、無 JS、reduced motion。**11/21 文案凍結** | 鍵盤與無 JS 都能完成抽牌 |
| 11/25–27 | P3：結果頁（9:16 首屏）、Ticket、屬性條（S6）、CTA（S9）、重新抽一張、aria 文字 | 七張牌頁皆可讀 |
| 11/28–29 | 真機緩衝：iOS Safari、Android Chrome、IG／LINE WebView | 各跑一次完整流程 |
| 11/30–12/01 | P4：OG ×9、Web Share、QR。**12/01 交印刷 QR**，打樣後多支手機實掃，QR 下方印短網址 | OG 在 FB / LINE 預覽過 |
| **12/02** | merge 上線；主站加入口（Q9） | 正式網域可開，Lighthouse a11y ≥95、perf ≥90 |
| 12/03–06 | 修 bug；有餘力做 Should。**12/06 程式凍結** | — |
| 12/07–11 | 只改文案；12/11 後只接 hotfix；12/11 或 12/12 到場地測 Wi-Fi 與 4G，現場掃印刷品 | — |
| **12/13** | 活動日 | 見下 |

**活動當天**

- 純靜態站在 Cloudflare 邊緣，容量不是問題；瓶頸是場地網路，首次載入守在 300 KB 內。
- 指定一位不上台的人值守：筆電預先登入 Cloudflare Pages，熟悉「回滾到上一個部署」，看 Analytics。
- 活動期間不部署。
- 準備印有短網址的牌卡，掃不到 QR 的人可以手打。

---

## 8. 文件整理（v2.2 一併處理）

- 各文件對「什麼擋 P1」說法不一（README:50、02:506、03:24、04:203）。統一為本檔 §6。
- `04` 件數算錯：實際 P0 是 8 全接受、1 部分接受；P1 第 3 項是部分接受。
- 改名張數三種說法（00:16 四張、B1–B3 三張、03 Q4 五張）；README 的「約 7,000 bytes」與實際不符；`00` 說保留 7 個感嘆號，`01` 實際 0 個。
- 小數值：70×120mm 是 2:3.43 不是 2:3.5；`#4D4D4D` 在墨上約 2.5:1；§4.5「七邊形雷達圖」應為四軸。
- 插畫規格：「PNG 去背或滿版」二選一；400 KB 是交付 PNG、90 KB 是上線 AVIF，寫明是兩種檔。
- 驗收清單補：結果頁 JS ≤20 KB、LCP / CLS / INP、支援瀏覽器範圍。
- 主站規範被 gitignore：塔羅要遵守的規則（Zero Hue、Lit Sign、Latin-Only Sign、無裸色碼）在 02 v2.2 內文寫全，不只引用 `DESIGN.md`。
- `04:43`「看图」為簡體字。
