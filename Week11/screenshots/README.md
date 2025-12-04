# 截圖說明

請在此資料夾放入以下四張截圖：

## 1. docker-ps.png
執行 `docker ps` 的截圖，必須顯示：
- 容器名稱：`week11-mongo`
- 狀態：`Up`
- 端口：`0.0.0.0:27017->27017/tcp`

## 2. mongosh-query.png
執行 `db.participants.find().pretty()` 的截圖，必須顯示：
- 至少一筆報名資料
- 包含 `_id`, `name`, `email`, `phone`, `interests`, `status`, `createdAt` 欄位

## 3. mongodb-compass.png
MongoDB Compass 的截圖，必須顯示：
- 左側資料庫列表有 `week11` 資料庫
- `participants` 集合
- 至少一筆文檔展開顯示完整欄位結構

連線字串：
```
mongodb://week11-user:week11-pass@localhost:27017/week11?authSource=week11
```

## 4. api-test.png
Postman 或 REST Client 的截圖，必須顯示：
- 至少測試 `POST /api/signup` 和 `GET /api/signup`
- 狀態碼：201 (POST) 和 200 (GET)
- 完整的 JSON 回應內容

---

**注意**：截圖檔案名稱必須完全一致，否則 README.md 中的圖片連結會失效。
