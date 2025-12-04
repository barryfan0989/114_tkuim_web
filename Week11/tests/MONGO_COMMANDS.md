# MongoDB 常用指令

## 連線 Mongo Shell
```bash
docker exec -it week11-mongo mongosh -u week11-user -p week11-pass --authenticationDatabase week11
```

## 基本操作

### 查看資料庫清單
```
show dbs
```

### 切換至 week11 資料庫
```
use week11
```

### 查看集合清單
```
show collections
```

### 查看 participants 集合內的所有文件
```
db.participants.find()
```

### 美化輸出
```
db.participants.find().pretty()
```

### 統計 participants 集合中的文件數量
```
db.participants.countDocuments()
```

### 查看索引
```
db.participants.getIndexes()
```

### 新增單筆文件
```
db.participants.insertOne({
  name: "測試新增",
  email: "manual@example.com",
  phone: "0912345678",
  interests: ["後端", "資料庫"],
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 新增多筆文件
```
db.participants.insertMany([
  { name: "A", email: "a@ex.com", phone: "123", createdAt: new Date() },
  { name: "B", email: "b@ex.com", phone: "456", createdAt: new Date() }
])
```

### 查詢（帶條件）
```
db.participants.find({ status: "approved" })
```

### 投影（只顯示特定欄位）
```
db.participants.find({}, { name: 1, email: 1, _id: 0 })
```

### 排序（1 升序，-1 降序）
```
db.participants.find().sort({ createdAt: -1 }).limit(5)
```

### 更新單筆
```
db.participants.updateOne(
  { email: "manual@example.com" },
  { $set: { status: "approved", phone: "0988999888" } }
)
```

### 更新多筆
```
db.participants.updateMany(
  { status: "pending" },
  { $set: { status: "reviewed" } }
)
```

### 刪除單筆
```
db.participants.deleteOne({ email: "manual@example.com" })
```

### 刪除多筆
```
db.participants.deleteMany({ status: "rejected" })
```

### 聚合（group by status，統計各狀態人數）
```
db.participants.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### 分頁（跳過前 10 筆，再取 5 筆）
```
db.participants.find().skip(10).limit(5).toArray()
```

## 高級操作

### 建立文字索引（用於搜尋）
```
db.participants.createIndex({ name: "text", email: "text" })
db.participants.find({ $text: { $search: "小明" } })
```

### 刪除索引
```
db.participants.dropIndex("email_1")
```

### 檢查 email 唯一性是否已設定
```
db.participants.getIndexes()
# 應該可看到 { "email": 1 } 且 unique: true
```

### 清空集合（保留集合定義）
```
db.participants.deleteMany({})
```

### 刪除集合
```
db.participants.drop()
```

### 刪除資料庫
```
db.dropDatabase()
```

## 檢查連線設定

### 查看目前認証用戶
```
db.currentUser()
```

### 查看資料庫狀態
```
db.stats()
```

### 查看集合統計
```
db.participants.stats()
```

## 導出與導入資料

### 導出 JSON（須從 bash 執行，不在 mongosh 內）
```bash
docker exec week11-mongo mongodump --uri="mongodb://week11-user:week11-pass@localhost:27017/week11?authSource=week11" --out=/tmp/backup
```

### 導入 JSON
```bash
docker exec -i week11-mongo mongorestore --uri="mongodb://week11-user:week11-pass@localhost:27017/week11?authSource=week11" --archive < backup.archive
```
