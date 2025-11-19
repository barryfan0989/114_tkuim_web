# Week09 Lab – 報名 API 與前端串接

## 目標
建立最小可執行的 Node.js + Express 後端，提供報名 API（POST/GET/DELETE），並以簡單前端頁面與測試腳本驗證整體流程。

## 資料夾結構
```
Week09/
  server/
    app.js
    routes/
      signup.js
    package.json
    .env
  client/
    signup_form.html
    signup_form.js
  tests/
    api.http            # VS Code REST Client 請求
    curl_examples.txt   # curl 指令範例
  README.md
```

## 環境需求
- Node.js LTS (建議 20.x 或以上)
- npm（或可改用 yarn/pnpm）
- VS Code（建議安裝 REST Client 擴充套件）
- 瀏覽器（Chrome / Edge / Firefox）

---

## 📦 如何啟動後端

### 1. 安裝依賴
首次執行前，請先安裝所需套件：

```powershell
cd c:\Users\USER\Documents\GitHub\114_tkuim_web\Week09\server
npm install
```

這會安裝以下套件：
- `express`：Web 框架
- `cors`：跨來源資源共用
- `dotenv`：環境變數管理
- `nanoid`：產生唯一 ID
- `nodemon`（開發用）：自動重啟伺服器

### 2. 設定環境變數
確認 `server/.env` 檔案內容：

```env
PORT=3001
ALLOWED_ORIGIN=http://127.0.0.1:5500,http://localhost:5173
```

- `PORT`：後端伺服器埠號
- `ALLOWED_ORIGIN`：允許的前端來源（用逗號分隔多個網址）

### 3. 啟動開發伺服器
```powershell
npm run dev
```

看到以下訊息表示成功：
```
Server ready on http://localhost:3001
```

### 4. 驗證後端運作
在瀏覽器開啟：`http://localhost:3001/health`

應該看到：
```json
{
  "status": "ok",
  "timestamp": 1700000000000
}
```

**⚠️ 注意：**
- 執行 `npm run dev` 後終端機會被佔用，需開新終端機視窗執行其他指令
- 修改程式碼後 nodemon 會自動重啟伺服器
- 按 `Ctrl+C` 停止伺服器

---

## 🌐 如何啟動前端

### 方法一：使用 VS Code Live Server（推薦）

1. 安裝 VS Code 擴充套件：**Live Server**
2. 在 VS Code 開啟 `Week09/client/signup_form.html`
3. 右鍵點選 → **Open with Live Server**
4. 瀏覽器會自動開啟 `http://127.0.0.1:5500/client/signup_form.html`

### 方法二：直接開啟 HTML（需調整 CORS）

1. 直接雙擊 `client/signup_form.html`
2. 若遇到 CORS 錯誤，修改 `server/.env`：
   ```env
   ALLOWED_ORIGIN=*
   ```
3. 重啟後端伺服器

### 方法三：使用 Vite（進階）

若想用 Vite 開發伺服器：

```powershell
# 在 Week09/client 目錄
npm init -y
npm install -D vite
npx vite
```

預設會在 `http://localhost:5173` 啟動。

---

## 📚 API 端點文件

### 1. GET `/health`
**說明：** 健康檢查，確認服務狀態

**回應範例：**
```json
{
  "status": "ok",
  "timestamp": 1700000000000
}
```

---

### 2. POST `/api/signup`
**說明：** 建立新報名

**請求 Body：**
```json
{
  "name": "測試同學",
  "email": "test@example.com",
  "phone": "0912345678",
  "password": "abc12345",
  "confirmPassword": "abc12345",
  "interests": ["前端", "後端"],
  "terms": true
}
```

**必填欄位與驗證規則：**
- `name`：姓名（必填）
- `email`：Email（必填）
- `phone`：手機號碼，須為 `09` 開頭的 10 碼數字
- `password`：密碼，至少 8 碼
- `confirmPassword`：確認密碼，須與 password 一致
- `interests`：興趣陣列，至少選一個
- `terms`：服務條款（必須為 true）

**成功回應（201）：**
```json
{
  "message": "報名成功",
  "participant": {
    "id": "a1b2c3d4",
    "name": "測試同學",
    "email": "test@example.com",
    "phone": "0912345678",
    "interests": ["前端", "後端"],
    "createdAt": "2025-11-20T10:30:00.000Z"
  }
}
```

**錯誤回應（400）：**
```json
{
  "error": "手機需為 09 開頭 10 碼"
}
```

---

### 3. GET `/api/signup`
**說明：** 取得所有報名清單

**回應範例：**
```json
{
  "total": 2,
  "data": [
    {
      "id": "a1b2c3d4",
      "name": "測試同學",
      "email": "test@example.com",
      "phone": "0912345678",
      "interests": ["前端", "後端"],
      "createdAt": "2025-11-20T10:30:00.000Z"
    },
    {
      "id": "e5f6g7h8",
      "name": "第二位同學",
      "email": "second@example.com",
      "phone": "0987654321",
      "interests": ["資料庫"],
      "createdAt": "2025-11-20T11:00:00.000Z"
    }
  ]
}
```

---

### 4. DELETE `/api/signup/:id`
**說明：** 取消報名（刪除指定參與者）

**請求範例：**
```
DELETE /api/signup/a1b2c3d4
```

**成功回應（200）：**
```json
{
  "message": "已取消報名",
  "participant": {
    "id": "a1b2c3d4",
    "name": "測試同學",
    "email": "test@example.com",
    "phone": "0912345678",
    "interests": ["前端", "後端"],
    "createdAt": "2025-11-20T10:30:00.000Z"
  }
}
```

**錯誤回應（404）：**
```json
{
  "error": "找不到這位參與者"
}
```

---

## 🧪 API 測試方式

### 方法一：VS Code REST Client（推薦）

1. 安裝 VS Code 擴充套件：**REST Client**
2. 開啟 `tests/api.http`
3. 點擊每段請求上方的 **Send Request** 按鈕

**範例操作：**
```http
### 健康檢查
GET http://localhost:3001/health

### 建立報名
POST http://localhost:3001/api/signup
Content-Type: application/json

{
  "name": "REST Client",
  "email": "rest@example.com",
  "phone": "0912345678",
  "password": "restPass88",
  "confirmPassword": "restPass88",
  "interests": ["全端"],
  "terms": true
}

### 查看清單
GET http://localhost:3001/api/signup

### 刪除（替換 :id）
DELETE http://localhost:3001/api/signup/a1b2c3d4
```

---

### 方法二：curl 指令（PowerShell）

參考 `tests/curl_examples.txt` 或直接執行：

**取得清單：**
```powershell
curl http://localhost:3001/api/signup
```

**建立報名：**
```powershell
curl -X POST http://localhost:3001/api/signup `
  -H "Content-Type: application/json" `
  -d '{
    "name": "CLI User",
    "email": "cli@example.com",
    "phone": "0911222333",
    "password": "cliPass88",
    "confirmPassword": "cliPass88",
    "interests": ["資料庫"],
    "terms": true
  }'
```

**刪除報名：**
```powershell
# 先取得清單，複製某個 id，再執行：
curl -X DELETE http://localhost:3001/api/signup/a1b2c3d4
```

---

### 方法三：前端測試頁面

1. 啟動後端伺服器（`npm run dev`）
2. 開啟 `client/signup_form.html`（使用 Live Server）
3. 填寫表單送出，觀察結果
4. 點擊「查看報名清單」按鈕

---

### 方法四：Postman / Thunder Client

1. 建立新 Collection：`Week09 Signup`
2. 設定環境變數：`{{baseUrl}} = http://localhost:3001`
3. 新增請求：
   - GET `{{baseUrl}}/health`
   - POST `{{baseUrl}}/api/signup`（Body → raw → JSON）
   - GET `{{baseUrl}}/api/signup`
   - DELETE `{{baseUrl}}/api/signup/:id`

---

## 🔍 測試流程建議

### 完整測試步驟：

1. **啟動後端**
   ```powershell
   cd server
   npm run dev
   ```

2. **健康檢查**
   ```powershell
   curl http://localhost:3001/health
   ```
   預期：`{"status":"ok",...}`

3. **建立第一筆報名**（使用 REST Client 或 curl）
   
4. **查看清單**
   ```powershell
   curl http://localhost:3001/api/signup
   ```
   預期：`{"total":1,"data":[...]}`

5. **測試前端頁面**
   - 開啟 `client/signup_form.html`
   - 送出表單
   - 點擊「查看報名清單」

6. **測試刪除功能**
   - 從清單取得某個 `id`
   - 執行 DELETE 請求

