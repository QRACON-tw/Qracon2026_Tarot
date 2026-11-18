# QRACON 2026 量子塔羅

QRACON 2026 學生量子電腦年會（2026-12-13，中央研究院南部院區）的互動網頁：七張塔羅牌對應七種量子態，抽一張，展開成一張觀測報告。

本 repo 是獨立的 Astro 站（K1 定案為 C，見 `docs/02-plan.md` §11），加上規劃文件。主站 `QRACON-tw/2026` 的 tokens、元件與工具鏈複製過來，來源與差異見 `docs/SITEMAP.md`。目前是 P1 骨架加上抽牌特效（洗牌、牌背、翻牌、散去、塌縮轉場、結果頁進場）。

---

## 文件

| 檔案 | 內容 | 給誰看 |
| --- | --- | --- |
| [`docs/01-copy-deck.md`](docs/01-copy-deck.md) | 定稿文案：七張牌、各頁文字、按鈕、錯誤訊息、文案規則 | 設計、工程 |
| [`docs/02-plan.md`](docs/02-plan.md) | 網站設計與建置計劃：部署、設計系統、互動、範圍、時程、驗收、風險 | 全體 |
| [`docs/03-open-questions.md`](docs/03-open-questions.md) | 待決事項：擋上線（K1–K6）、影響設計、可延後 | 主辦 |
| [`docs/04-asset-requirements.md`](docs/04-asset-requirements.md) | 素材需求：設計組與主辦要交什麼、規格、期限、驗收；沿用與不需要的素材 | 設計組、主辦 |
| [Google Doc：插畫與牌背素材需求](https://docs.google.com/document/d/1MAt50h1XGtFqNq2o1_Ztlnq8tcBbG7MjjKy7EZtJNpo/edit) | `04` 給設計組的獨立版本，附參考圖與安全區底圖 [`docs/assets/tarot-card-template.png`](docs/assets/tarot-card-template.png) | 設計組 |
| [`docs/05-fx-plan.md`](docs/05-fx-plan.md) | 視覺特效計畫：WebGL2 漸進增強、分級、看門狗、時間軸、檔案架構 | 工程 |
| [`docs/SITEMAP.md`](docs/SITEMAP.md) | 路由表與檔案清單（用途、複製自主站或新增） | 工程 |
| [`docs/LOG.md`](docs/LOG.md) | 文件與程式變更紀錄 | 全體 |
| [`PRODUCT.md`](PRODUCT.md) | 產品脈絡摘要：使用者、目的、定位、硬限制、產品原則（impeccable 設計工具會讀） | 設計、工程 |

原始需求是行銷組的 Google Doc〈QUACON量子塔羅〉，僅供參考（有多處物理錯誤與怪異用語），文案已全部改寫進 `01`。

`docs/` 只放網站本身。原文裡不歸網站管的事項（獎勵、會場任務、印刷品等）另外打包在 [`handoff/non-website-items.md`](handoff/non-website-items.md)，交給其他負責人。

---

## Astro 站

需要 Node >=22.12 與 pnpm 12.3.4（`packageManager` 已固定）。

| 指令 | 用途 |
| --- | --- |
| `pnpm install` | 安裝依賴 |
| `pnpm dev` | 開發伺服器，預設網址 <http://localhost:4321/Qracon2026_Tarot/> |
| `pnpm check` | `astro check`，型別檢查 |
| `pnpm build` | 靜態輸出到 `dist/` |

環境變數（建置時讀取，沒設就用預設值）：

| 變數 | 預設 | 用途 |
| --- | --- | --- |
| `ASTRO_BASE_PATH` | `/Qracon2026_Tarot` | 網站的子路徑；空字串或 `/` 代表根目錄 |
| `ASTRO_SITE` | `https://qracon.entangletech.tw` | 網站來源，用於 canonical 與 sitemap |

PowerShell 建在根目錄：`$env:ASTRO_BASE_PATH = '/'; pnpm build`，用完 `Remove-Item Env:ASTRO_BASE_PATH`。GitHub Actions 的部署流程會把 `configure-pages` 的 `origin` 與 `base_path` 帶進這兩個變數。部署目前只能手動觸發（`workflow_dispatch`），推 `main` 不會部署；軟上線前再把 `push` 觸發加回去。

七張牌是否進 sitemap、是否 `noindex`，由 `src/utils/tarot.ts` 的 `TAROT_INDEXABLE` 控制，目前為 `false`。

---

## 一頁摘要

**是什麼**：手機優先的互動。七張牌背朝上的塔羅牌扇形展開，點一張，其餘六張散去，被選的那張翻開，接著展開成一張票券狀的「量子狀態觀測報告」。30–60 秒完成，最後導向議程與報名。

**網址**：`https://qracon.entangletech.tw/Qracon2026_Tarot/`（repo `QRACON-tw/Qracon2026_Tarot` 的 GitHub Pages 專案頁；尚未部署）。

**技術**：獨立 repo，Astro 7 靜態輸出、零框架、原生 CSS。tokens、`Button` 等從主站複製，連結走 `sitePath()`。沒有 WebGL 函式庫、沒有動畫函式庫；WebGL2 是手寫、延遲載入的漸進增強層（塌縮轉場、散去粒子），分級與看門狗見 `docs/05-fx-plan.md`，失敗只少一層。

**視覺**：暗房（墨黑場 + 紙白牌面 + 銀墨高光，零色相）。見 `02-plan.md` §3。

**時程**：11/27 軟上線（noindex、無入口）→ **12/02 正式上線** → 12/06 程式凍結 → 12/13 活動日。範圍分 Must／Should／Later，Canvas 分享卡與碎裂動畫不在 Must；WebGL2 塌縮與粒子是 Must 特效之上的增強層，不擋上線。

---

## 狀態

| 項目 | 狀態 |
| --- | --- |
| 文案 v2.2 | 完成，**待物理校稿**（11/21 凍結） |
| 網站計劃 v2.2 | 完成，**待 K1–K6 拍板** |
| 素材需求 | 完成，**待設計組 11/18 確認墨底方向（A3）** |
| 實作 | P1 骨架完成（路由、牌組資料與驗證、暗場版型）；抽牌特效完成（`05-fx-plan.md`，瀏覽器與真機驗證見 `LOG.md`）；牌扇版面、結果頁票券、OG 圖尚未做 |

擋上線的決策見 `docs/03-open-questions.md`：K2 報名截止日、K3 上線日、K4 物理校稿者（K1、K6 已定案：獨立 repo `QRACON-tw/Qracon2026_Tarot`）。插畫排程不擋上線（預設字體牌）。
