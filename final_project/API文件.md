# API 規格文件 (API Specification)

本文件說明個人任務管理系統之後端 RESTful API 介面規格。前端應用程式透過 HTTP 請求與後端進行資料互動。

**基本資訊：**
* **基礎位址 (Base URL)**: `http://localhost:3001`
* **內容類型 (Content-Type)**: 請求與回應 Body 皆使用 `application/json` 格式。

## 身份認證 (Authentication)

此區塊 API 負責處理使用者註冊、登入與 Token 驗證。

| HTTP 方法 | 路徑 (Endpoint) | 功能描述 | 請求內容 (Body/Header) | 回應範例 (Success) |
| :---: | :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | **註冊新帳號**<br>建立新的使用者資料。 | `{ "username": "user1", "email": "test@example.com", "password": "password123" }` | `{ "user": { "id": "...", "username": "user1"... }, "token": "eyJhbG..." }`<br>*(註冊成功即回傳 Token)* |
| **POST** | `/auth/login` | **使用者登入**<br>驗證憑證並簽發 JWT Token。 | `{ "email": "test@example.com", "password": "password123" }` | `{ "user": {...}, "token": "eyJhbG..." }`<br>*(後續請求需使用此 Token)* |
| **GET** | `/auth/verify` | **驗證 Token**<br>檢查目前 Token 是否有效。 | **Header**: `Authorization: Bearer <Token字串>` | `{ "valid": true, "user": {...} }` |

## 任務管理 (Tasks)

此區塊 API 提供任務的 CRUD 操作功能。

**注意**：以下所有 API 端點皆為受保護路由，必須在 HTTP 請求 Header 中包含有效的 JWT Token 進行身份驗證，否則將拒絕存取。

**Header 格式：**
`Authorization: Bearer <你的 JWT Token>`

| HTTP 方法 | 路徑 (Endpoint) | 功能描述 | 請求參數與內容 |
| :---: | :--- | :--- | :--- |
| **GET** | `/api/tasks` | **取得任務列表**<br>獲取當前使用者的所有任務，支援篩選參數。 | **Query 參數 (可選)**:<br>如 `?status=todo&priority=high` |
| **GET** | `/api/tasks/:id` | **取得單一任務**<br>獲取指定 ID 的任務詳細資料。 | **URL 參數**: `:id` (任務 ID) |
| **POST** | `/api/tasks` | **新增任務**<br>建立新的任務資料。 | **Body (JSON)**:<br>`{ "title": "任務標題", "description": "描述", "status": "todo", "priority": "medium", "dueDate": "2023-12-31" }` |
| **PUT** | `/api/tasks/:id` | **更新任務**<br>更新指定任務的內容或狀態。 | **URL 參數**: `:id` (任務 ID)<br>**Body (JSON)**: 欲更新之欄位，如 `{ "status": "done" }` |
| **DELETE** | `/api/tasks/:id` | **刪除任務**<br>永久刪除指定任務。 | **URL 參數**: `:id` (任務 ID) |

## HTTP 狀態碼說明

本系統 API 使用標準 HTTP 狀態碼表示請求處理結果：

* **200 OK / 201 Created**: 請求成功或資源建立成功。
* **400 Bad Request**: 請求格式錯誤或缺少必要參數。
* **401 Unauthorized**: 身份驗證失敗 (Token 缺失、無效或過期)。
* **403 Forbidden**: 禁止存取 (無權限操作該資源)。
* **404 Not Found**: 請求的資源不存在。
* **500 Internal Server Error**: 伺服器內部錯誤。