# 變更紀錄

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
