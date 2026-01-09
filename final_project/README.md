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

## 專案結構

```
final_project/
├── backend/
│   ├── app.js                 # Express 應用程式主檔案
│   ├── db.js                  # MongoDB 連線管理
│   ├── package.json           # 依賴套件配置
│   ├── .env.example           # 環境變數範例
│   ├── middleware/
│   │   └── auth.js            # JWT 認證中介層
│   ├── repositories/
│   │   ├── userRepository.js  # 使用者資料存取層
│   │   └── taskRepository.js  # 任務資料存取層
│   └── routes/
│       ├── auth.js            # 認證路由 (登入、註冊、驗證)
│       └── tasks.js           # 任務路由 (CRUD)
├── frontend/
│   ├── login.html             # 登入頁面
│   ├── register.html          # 註冊頁面
│   ├── index.html             # 任務管理主頁
│   ├── auth.js                # 認證邏輯
│   ├── app.js                 # 任務管理應用邏輯
│   └── styles.css             # 樣式表
├── docker/
│   ├── docker-compose.yml     # Docker 編排配置
│   └── mongo-init.js          # MongoDB 初始化腳本
├── docs/
│   ├── API_SPEC.md            # API 詳細規格
│   ├── ARCHITECTURE.md        # 系統架構說明
│   ├── FLOWCHART.md           # 功能流程圖
│   └── api_test.http          # HTTP 測試檔案
├── README.md                  # 本檔案
├── QUICKSTART.md              # 快速開始指南
├── CHECKLIST.md               # 提交檢查清單
└── .gitignore                 # Git 忽略配置
```

## API 端點概覽

### 認證相關

| 方法 | 路由 | 描述 |
|------|------|------|
| POST | `/auth/register` | 使用者註冊 |
| POST | `/auth/login` | 使用者登入 |
| GET | `/auth/verify` | 驗證 Token 有效性 |

### 任務相關

| 方法 | 路由 | 描述 |
|------|------|------|
| POST | `/api/tasks` | 新增任務 |
| GET | `/api/tasks` | 取得任務列表 |
| GET | `/api/tasks/statistics` | 取得任務統計 |
| GET | `/api/tasks/:id` | 取得單一任務 |
| PUT | `/api/tasks/:id` | 更新任務 |
| DELETE | `/api/tasks/:id` | 刪除任務 |
| DELETE | `/api/tasks` | 批次刪除任務 |

詳見 [docs/API_SPEC.md](docs/API_SPEC.md) 了解完整的 API 規格與使用範例。

## 功能演示

### 使用者認證流程

1. **註冊**：輸入使用者名稱、Email 和密碼，系統檢驗後建立帳戶。
2. **登入**：輸入 Email 和密碼，登入成功後取得 JWT Token。
3. **驗證**：每個 API 請求都需在標頭中附上 Token 進行驗證。

### 任務管理流程

1. **新增**：點擊「新增任務」按鈕，填寫任務資訊後建立。
2. **查看**：主頁面顯示所有任務列表，包含統計資訊。
3. **編輯**：點擊任務卡片上的編輯按鈕修改內容。
4. **刪除**：點擊刪除按鈕，確認後移除任務。
5. **篩選**：使用過濾器按狀態與優先級篩選任務。
6. **搜尋**：輸入關鍵字搜尋相關任務。

## 技術亮點

### 後端設計

- **Repository Pattern**：分離資料存取邏輯，提升程式碼可維護性。
- **Singleton Pattern**：確保資料庫連線唯一，提升效率。
- **中介層認證**：使用 JWT 中介層統一驗證所有受保護路由。
- **索引優化**：在 MongoDB 中建立索引加速查詢。
- **錯誤處理**：統一的錯誤處理機制與回應格式。

### 前端設計

- **無框架開發**：使用原生 JavaScript，減少依賴、提升學習效益。
- **模組化架構**：分離認證邏輯和應用邏輯。
- **非同步操作**：使用 Fetch API 與 async/await 進行 HTTP 請求。
- **狀態管理**：簡單的全域狀態管理機制。
- **RWD 設計**：使用 CSS Grid 與 Flexbox 實現響應式介面。

## 環境變數配置

複製 `backend/.env.example` 為 `.env`，並設定以下變數：

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/task_management
DB_NAME=task_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
ALLOWED_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

## 安全考量

- **密碼加密**：使用 bcryptjs 對密碼進行雜湊處理。
- **JWT 驗證**：每個 API 請求都需驗證有效的 JWT Token。
- **CORS 設置**：配置允許的跨域來源，防止未授權存取。
- **輸入驗證**：後端對所有輸入進行驗證，防止注入攻擊。
- **權限驗證**：確保使用者只能存取自己的任務。

## 測試

使用 [docs/api_test.http](docs/api_test.http) 檔案進行 API 測試，搭配 VS Code REST Client 擴充功能。

## 常見問題

### Q：如何重設資料庫？
A：刪除 MongoDB 資料夾並重新啟動 Docker，系統會自動初始化索引。

### Q：前端連不到後端？
A：確認後端是否在 `localhost:3001` 運行，檢查防火牆設置。

### Q：為什麼登入失敗？
A：檢查帳號密碼是否正確，或確認資料庫連線狀態。

### Q：如何查看 API 詳細文檔？
A：參考 [docs/API_SPEC.md](docs/API_SPEC.md) 及 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 版本歷史

- **v1.0** (2026-01-09)：初始版本，完整實作 CRUD 功能、使用者認證、任務統計。

## 致謝

感謝課程講師與教學助教的指導，以及各項技術文件與開源社群的支持。

## 授權

本專案僅供學習用途，版權屬於作者。

---

**最後更新**：2026 年 1 月 9 日

