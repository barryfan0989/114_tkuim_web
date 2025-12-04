# Week11: 從後端邏輯到持久化資料

本週課程教導如何使用 **Docker + MongoDB + Node.js** 實作完整的 CRUD API，將報名表單資料持久保存至資料庫。

## 📋 單元目標

- ✅ 理解 Docker 與容器化的概念，熟悉基本指令
- ✅ 認識 MongoDB 資料庫結構（Database、Collection、Document）
- ✅ 使用 Node.js MongoDB Driver 建立連線與資源管理
- ✅ 實作 CRUD（Create、Read、Update、Delete）完整流程
- ✅ 通過 Postman / REST Client 與 Mongo Shell 驗證 API 與資料庫

## 🚀 快速開始

### 前置需求

1. **Docker Desktop** 安裝與執行
   - Windows：[下載](https://www.docker.com/products/docker-desktop)，需啟用 WSL2
   - macOS：[下載](https://www.docker.com/products/docker-desktop)
   - Linux：使用 `apt`, `dnf`, `pacman` 等套件管理工具

2. **Node.js 與 npm**
   - 確認版本：`node -v` 與 `npm -v`

3. **VS Code REST Client 或 Postman**
   - 用於 API 測試

### 啟動步驟

#### 步驟 1：啟動 MongoDB 容器

```bash
# 進入 docker 資料夾
cd Week11/docker

# 後台啟動 MongoDB 容器
docker compose up -d

# 檢查容器是否正在運作
docker ps

# 觀察 MongoDB 啟動訊息（可選）
docker compose logs -f
```

預期輸出示例：
```
CONTAINER ID   IMAGE     COMMAND                 STATUS         PORTS
abc123de       mongo:7   "docker-entrypoint.s…"  Up 5 seconds   0.0.0.0:27017->27017/tcp
```

#### 步驟 2：驗證 MongoDB 連線

使用 Mongo Shell：
```bash
docker exec -it week11-mongo mongosh -u week11-user -p week11-pass --authenticationDatabase week11
```

執行驗證指令：
```
use week11
db.participants.find()
```

預期看到初始化插入的示範資料。

#### 步驟 3：啟動 Node.js 伺服器

```bash
# 進入伺服器資料夾
cd ../server

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

預期輸出：
```
[DB] Connected to MongoDB successfully
[Server] Running on http://localhost:3001
```

#### 步驟 4：測試 API

使用 REST Client（VS Code 內建）或 Postman：

```
GET http://localhost:3001/health
```

預期回應：
```json
{
  "status": "ok",
  "timestamp": "2024-11-20T10:00:00.000Z"
}
```

## 📊 環境變數說明

在 `server/.env` 檔案中設定：

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `PORT` | 伺服器監聽埠口 | `3001` |
| `MONGODB_URI` | MongoDB 連線字串 | `mongodb://week11-user:week11-pass@localhost:27017/week11?authSource=week11` |
| `ALLOWED_ORIGIN` | CORS 允許來源 | `http://localhost:5173` |

**安全提示**：
- `.env` 檔案不要上傳至 Git（已在 `.gitignore` 中）
- 資料庫帳密不能寫在前端程式碼內

## 🔌 API 文件

### 1. 健康檢查

```
GET /health
```

**回應 (200)**：
```json
{
  "status": "ok",
  "timestamp": "2024-11-20T10:00:00.000Z"
}
```

### 2. 建立報名

```
POST /api/signup
Content-Type: application/json
```

**請求範例**：
```json
{
  "name": "小明",
  "email": "ming@example.com",
  "phone": "0912345678",
  "interests": ["前端", "設計"],
  "status": "pending"
}
```

**成功回應 (201)**：
```json
{
  "message": "報名成功",
  "participant": {
    "id": "507f1f77bcf86cd799439011",
    "name": "小明",
    "email": "ming@example.com",
    "phone": "0912345678",
    "interests": ["前端", "設計"],
    "status": "pending",
    "createdAt": "2024-11-20T10:00:00.000Z"
  }
}
```

**錯誤回應**：
- `400`：缺少必填欄位或 Email 格式錯誤
- `409`：Email 已存在

### 3. 取得所有報名（分頁）

```
GET /api/signup?page=1&limit=10
```

**回應 (200)**：
```json
{
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "小明",
      "email": "ming@example.com",
      "phone": "0912345678",
      "createdAt": "2024-11-20T10:00:00.000Z",
      "updatedAt": "2024-11-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 4. 取得單筆報名

```
GET /api/signup/{id}
```

**成功回應 (200)**：
```json
{
  "participant": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "小明",
    "email": "ming@example.com",
    ...
  }
}
```

**錯誤回應 (404)**：報名不存在

### 5. 更新報名

```
PATCH /api/signup/{id}
Content-Type: application/json
```

**請求範例**：
```json
{
  "phone": "0988999888",
  "status": "approved"
}
```

**成功回應 (200)**：
```json
{
  "message": "更新成功",
  "updated": 1
}
```

### 6. 刪除報名

```
DELETE /api/signup/{id}
```

**成功回應 (204)**：無內容

## 🧪 測試方式

### 方法 1：VS Code REST Client

1. 開啟 `tests/api.http`
2. 點擊每個請求上方的 "Send Request" 連結
3. 查看右側 Response 面板

### 方法 2：Postman

1. 匯入 `tests/api.http`（Postman 支援此格式）
2. 或手動建立 Collection 並逐一執行請求

### 方法 3：curl

```bash
# 健康檢查
curl http://localhost:3001/health

# 建立報名
curl -X POST http://localhost:3001/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "測試",
    "email": "test@example.com",
    "phone": "0912345678"
  }'

# 取得清單
curl http://localhost:3001/api/signup

# 更新
curl -X PATCH http://localhost:3001/api/signup/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"phone": "0988999888"}'

# 刪除
curl -X DELETE http://localhost:3001/api/signup/507f1f77bcf86cd799439011
```

### 方法 4：Mongo Shell 驗證資料庫

```bash
# 連線至 MongoDB
docker exec -it week11-mongo mongosh -u week11-user -p week11-pass --authenticationDatabase week11

# 在 mongosh 內執行
use week11
db.participants.find()
db.participants.countDocuments()
db.participants.find({ email: "ming@example.com" })
```

更多指令見 `tests/MONGO_COMMANDS.md`。

## 🏗️ 專案結構

```
Week11/
├── docker/
│   ├── docker-compose.yml      # Docker 服務定義
│   ├── mongo-init.js           # MongoDB 初始化腳本
│   └── mongo-data/             # MongoDB 資料目錄（自動生成）
├── server/
│   ├── app.js                  # 主應用程式
│   ├── db.js                   # MongoDB 連線管理
│   ├── package.json            # 依賴與指令
│   ├── .env                    # 環境變數
│   ├── routes/
│   │   └── signup.js           # 報名 API 路由
│   └── repositories/
│       └── participants.js     # 資料層 CRUD
├── tests/
│   ├── api.http                # REST Client 測試
│   └── MONGO_COMMANDS.md       # Mongo Shell 指令
├── client/
│   ├── signup_form.html        # 前端表單
│   └── signup_form.js          # 表單邏輯
└── README.md                   # 本檔案
```

## 🔧 常見問題與排查

### Q1: `docker compose up` 找不到指令

**原因**：Docker Desktop 未安裝或未重新啟動終端機。

**解決**：
1. 確認 Docker Desktop 正在執行
2. 重新開啟終端機或 VS Code
3. 執行 `docker -v` 確認版本

### Q2: `ECONNREFUSED` - 無法連線至 MongoDB

**原因**：MongoDB 容器未啟動或埠口被占用。

**解決**：
```bash
# 檢查容器狀態
docker ps

# 若容器未運作，啟動它
docker compose up -d

# 若埠口 27017 被占用，修改 docker-compose.yml 中的 port 映射
```

### Q3: `MongoServerError: Authentication failed`

**原因**：`.env` 或 `docker-compose.yml` 中的帳密不一致。

**解決**：
1. 確認 `docker-compose.yml` 的 `MONGO_INITDB_ROOT_PASSWORD` 
2. 確認 `server/.env` 的 `MONGODB_URI` 中的密碼
3. 兩者須相同（預設皆為 `password123`）

### Q4: `Cannot read properties of undefined (reading 'collection')`

**原因**：未等待 `connectDB()` 完成即執行 API。

**解決**：檢查 `app.js` 中 `connectDB()` 後才 `app.listen()`。

### Q5: MongoDB 資料在容器重啟後消失

**原因**：volume 未正確設定或使用了 `docker compose down -v`。

**解決**：
- 確認 `docker-compose.yml` 有 `volumes: - ./mongo-data:/data/db`
- 使用 `docker compose down` 停止容器（保留資料）
- 使用 `docker compose down -v` 清空資料

### Q6: 前端表單無法連線至後端 API

**原因**：CORS 設定不正確或 API URL 錯誤。

**解決**：
1. 確認後端 `app.js` 中 `ALLOWED_ORIGIN` 正確
2. 檢查前端 `signup_form.js` 中 `API_BASE_URL` 指向 `http://localhost:3001`
3. 檢查瀏覽器 DevTools → Network 標籤中的 CORS 錯誤

### Q7: 如何清空所有資料重新開始？

**選項 A**：清空 MongoDB 資料（保留容器）
```bash
docker exec -it week11-mongo mongosh -u week11-user -p week11-pass --authenticationDatabase week11
# 在 mongosh 內執行
use week11
db.participants.deleteMany({})
```

**選項 B**：完全重置（刪除所有資料與容器）
```bash
docker compose down -v
docker compose up -d
```

## 📝 CRUD 操作範例

### Create（新增）

```javascript
// 前端表單送出
const response = await fetch('http://localhost:3001/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '小明',
    email: 'ming@example.com',
    phone: '0912345678',
    interests: ['前端']
  })
});
```

### Read（讀取）

```javascript
// 取得全部
const response = await fetch('http://localhost:3001/api/signup');

// 取得單筆
const response = await fetch('http://localhost:3001/api/signup/507f1f77bcf86cd799439011');
```

### Update（更新）

```javascript
const response = await fetch('http://localhost:3001/api/signup/507f1f77bcf86cd799439011', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '0988999888',
    status: 'approved'
  })
});
```

### Delete（刪除）

```javascript
const response = await fetch('http://localhost:3001/api/signup/507f1f77bcf86cd799439011', {
  method: 'DELETE'
});
```

## 🔒 安全考量

1. **資料庫帳密管理**
   - 使用 `.env` 管理敏感資訊
   - `.env` 不上傳至 Git

2. **輸入驗證**
   - 伺服器端必須驗證所有輸入
   - Email 格式驗證、電話號碼長度等

3. **唯一性約束**
   - 在 MongoDB 建立 email 唯一索引（已在 `mongo-init.js` 中設定）
   - 防止重複報名

4. **錯誤訊息**
   - 不暴露詳細的系統錯誤給前端
   - 返回友善的錯誤提示

## 📚 進階主題

### 添加分頁功能

```javascript
// 前端
const response = await fetch('http://localhost:3001/api/signup?page=2&limit=5');
```

```javascript
// 後端（已實作）
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;
```

### 建立更多索引

```bash
docker exec -it week11-mongo mongosh -u week11-user -p week11-pass --authenticationDatabase week11

# 在 mongosh 內
use week11

# 複合索引
db.participants.createIndex({ status: 1, createdAt: -1 })

# 文字搜尋索引
db.participants.createIndex({ name: "text", email: "text" })

# 查詢
db.participants.find({ $text: { $search: "小" } })
```

### 事務（Transaction）

若需跨多個操作的資料一致性，可使用 MongoDB 事務（需要副本集，超出本週範圍）。

## 📖 參考資料

- [MongoDB 官方文件](https://docs.mongodb.com/)
- [Express.js 官方文件](https://expressjs.com/)
- [Node.js MongoDB Driver](https://www.mongodb.com/docs/drivers/node/)
- [Docker 官方文件](https://docs.docker.com/)
- [Docker Compose 文件](https://docs.docker.com/compose/)

## ✅ 繳交清單

- [ ] GitHub Repo 包含 `docker/`, `server/`, `client/`, `tests/` 資料夾
- [ ] `README.md` 完整說明啟動步驟與測試方法
- [ ] `docker-compose.yml` 與 `mongo-init.js` 正確配置
- [ ] `server/.env.example` 提供環境變數範本
- [ ] `tests/api.http` 提供完整的 REST Client 測試腳本
- [ ] `tests/MONGO_COMMANDS.md` 包含常用 Mongo Shell 指令
- [ ] 前端表單能成功連線後端 API 並新增資料
- [ ] MongoDB Compass 或 mongosh 驗證資料確實寫入資料庫
- [ ] 截圖：`docker ps` 顯示容器執行狀態
- [ ] 截圖：mongosh 查詢結果顯示報名資料
- [ ] 截圖：前端表單送出成功訊息

## 🎓 學習重點總結

| 概念 | 說明 |
|------|------|
| **Docker** | 容器化技術，一致的開發環境 |
| **MongoDB** | NoSQL 資料庫，JSON 文件儲存 |
| **CRUD** | Create、Read、Update、Delete 四種基本操作 |
| **Repository Pattern** | 資料存取層抽象，便於測試與維護 |
| **環境變數** | 敏感資訊管理，不同環境不同配置 |
| **錯誤處理** | 完善的錯誤提示與日誌 |
| **CORS** | 跨域資源共享，前後端分離開發 |

祝你學習愉快！🚀
