# Week11: Docker + MongoDB + Node.js CRUD API

**CRUD** 是四種基本的資料操作：
- **C**reate（新增）、**R**ead（讀取）、**U**pdate（更新）、**D**elete（刪除）

本週使用 Docker + MongoDB + Express 實作完整的 CRUD API。

## 🚀 啟動步驟

### 前置需求
- Docker Desktop
- Node.js v20+
- VS Code REST Client 或 Postman

### 1. 啟動 MongoDB 容器
```bash
cd Week11/docker
docker compose up -d
docker ps  # 確認容器運行
```

### 2. 啟動 Node.js 伺服器
```bash
cd ../server
npm install
npm run dev
```

### 3. 測試 API
開啟 `tests/api.http`，使用 REST Client 測試所有端點。

## 📂 專案結構
```
Week11/
├── docker/
│   ├── docker-compose.yml
│   └── mongo-init.js
├── server/
│   ├── app.js
│   ├── db.js
│   ├── package.json
│   ├── .env.example
│   ├── routes/signup.js
│   └── repositories/participants.js
├── tests/
│   ├── api.http
│   └── MONGO_COMMANDS.md
└── screenshots/
```

## 🔧 環境變數 (.env)
```env
PORT=3001
MONGODB_URI=mongodb://week11-user:week11-pass@localhost:27017/week11?authSource=week11
ALLOWED_ORIGIN=http://localhost:5173
```
