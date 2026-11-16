# QRACON 2026 量子塔羅

QRACON 2026 學生量子電腦年會（2026-12-13，中央研究院南部院區）的互動網頁：七張塔羅牌對應七種量子態，抽一張，展開成一張觀測報告。

本 repo **只有規劃文件，沒有程式碼**。實作預計直接寫在主站 repo（`QRACON-tw/2026`，本機 `C:\Project\qracon_web_2026`）的 `src/pages/tarot/`，見 `docs/02-plan.md` §11。

---

## 文件

| 檔案 | 內容 | 給誰看 |
| --- | --- | --- |
| [`docs/01-copy-deck.md`](docs/01-copy-deck.md) | 定稿文案：七張牌、各頁文字、按鈕、錯誤訊息、文案規則 | 設計、工程 |
| [`docs/02-plan.md`](docs/02-plan.md) | 網站設計與建置計劃：部署、設計系統、互動、範圍、時程、驗收、風險 | 全體 |
| [`docs/03-open-questions.md`](docs/03-open-questions.md) | 待決事項：擋上線（K1–K6）、影響設計、可延後 | 主辦 |
| [`docs/04-asset-requirements.md`](docs/04-asset-requirements.md) | 素材需求：設計組與主辦要交什麼、規格、期限、驗收；沿用與不需要的素材 | 設計組、主辦 |
| [Google Doc：插畫與牌背素材需求](https://docs.google.com/document/d/1MAt50h1XGtFqNq2o1_Ztlnq8tcBbG7MjjKy7EZtJNpo/edit) | `04` 給設計組的獨立版本，附參考圖與安全區底圖 [`docs/assets/tarot-card-template.png`](docs/assets/tarot-card-template.png) | 設計組 |
| [`docs/LOG.md`](docs/LOG.md) | 文件變更紀錄 | 全體 |

原始需求是行銷組的 Google Doc〈QUACON量子塔羅〉，僅供參考（有多處物理錯誤與怪異用語），文案已全部改寫進 `01`。

`docs/` 只放網站本身。原文裡不歸網站管的事項（獎勵、會場任務、印刷品等）另外打包在 [`handoff/non-website-items.md`](handoff/non-website-items.md)，交給其他負責人。

---

## 一頁摘要

**是什麼**：手機優先的互動。七張牌背朝上的塔羅牌扇形展開，點一張，其餘六張散去，被選的那張翻開，接著展開成一張票券狀的「量子狀態觀測報告」。30–60 秒完成，最後導向議程與報名。

**網址**：`https://qracon.entangletech.tw/2026/tarot/`（主站 GitHub Pages 部署的子路徑，待 K6 確認）。

**技術**：寫在主站 repo 裡，Astro 7 靜態輸出、零框架、原生 CSS。字標、躍貓、字型、tokens、`Ticket` 等元件直接共用，連結走主站的 `sitePath()`。沒有 WebGL、沒有動畫函式庫。

**視覺**：暗房（墨黑場 + 紙白牌面 + 銀墨高光，零色相）。見 `02-plan.md` §3。

**時程**：11/27 軟上線（noindex、無入口）→ **12/02 正式上線** → 12/06 程式凍結 → 12/13 活動日。範圍分 Must／Should／Later，Canvas 分享卡與碎裂動畫不在 Must。

---

## 狀態

| 項目 | 狀態 |
| --- | --- |
| 文案 v2.2 | 完成，**待物理校稿**（11/21 凍結） |
| 網站計劃 v2.2 | 完成，**待 K1–K6 拍板** |
| 素材需求 | 完成，**待設計組 11/18 確認墨底方向（A3）** |
| 實作 | 未開始 |

擋上線的決策見 `docs/03-open-questions.md`：K1 部署方案、K2 報名截止日、K3 上線日、K4 物理校稿者、K6 正式網址。插畫排程不擋上線（預設字體牌）。
