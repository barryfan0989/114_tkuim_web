# 個人任務管理系統 (Task Management System)

這是一個基於前後端分離架構開發的個人任務管理系統，具備完整的 CRUD 功能與使用者認證機制。本專案為 **114（上）網路程式設計** 期末專題。

## 專題資訊

- **課程名稱**：114（上）網路程式設計
- **學生姓名**：范植翔
- **學號**：413637454
- **班級**：資管 3C
- **Demo 影片連結**：https://youtu.be/3lVsO8hujhQ

## 專題特色

### 核心功能 (CRUD)

- **Create (新增)**：建立新任務，設定標題、描述、優先級、狀態、截止日期。
- **Read (讀取)**：查看任務列表，支援分頁與詳細資訊檢視。
- **Update (更新)**：修改任務內容、拖曳改變狀態、調整優先級。
- **Delete (刪除)**：刪除單一任務或批次刪除已完成任務。

### 進階功能

- **JWT 認證**：實作註冊、登入功能，API 請求皆需通過 Token 驗證。
- **搜尋與過濾**：可依狀態（待辦/進行中/已完成）、優先級篩選，或關鍵字搜尋。
- **視覺化統計**：即時顯示各狀態的任務數量統計。
- **RWD 響應式設計**：適配桌機與行動裝置介面。

## 技術選型

| 層級 | 技術 | 說明 |
|------|------|------|
| **前端** | HTML5, CSS3, JavaScript (Vanilla) | 原生 JS 實作 DOM 操作與 Fetch API，無依賴龐大框架。 |
| **後端** | Node.js + Express.js | 輕量級 Web 框架，採用 RESTful API 設計。 |
| **資料庫** | MongoDB | NoSQL 文件型資料庫，適合彈性資料結構。 |
| **認證** | JWT (JSON Web Token) | 無狀態認證機制，適合前後端分離架構。 |
| **架構模式** | Repository Pattern, Singleton | 提升程式碼維護性與資料庫連線效率。 |

## 系統架構

本系統採用標準的三層式架構 (Three-Tier Architecture)：

1. **Presentation Layer**：前端 SPA 頁面。
2. **Application Layer**：Node.js/Express 商業邏輯與 API 路由。
3. **Data Layer**：MongoDB 資料儲存。

## 快速開始

### 步驟 1：啟動資料庫

確保 MongoDB 服務已在預設連接埠 `27017` 運行。若使用 Docker 可執行：

```bash
docker-compose up -d
```

### 步驟 2：啟動後端伺服器

進入 backend 目錄，安裝依賴套件並啟動服務：

```bash
cd backend
npm install
npm start
```

啟動成功後，終端機將顯示資料庫連線成功訊息。

### 步驟 3：啟動前端頁面

使用任意靜態 Web 伺服器啟動前端頁面。

**使用 VS Code Live Server**：
- 右鍵點擊 `frontend/login.html`
- 選擇 "Open with Live Server"

**使用 Python 內建伺服器**：

```bash
cd frontend
python -m http.server 5500
```

**瀏覽器訪問**：http://localhost:5500/login.html 即可開始使用。



