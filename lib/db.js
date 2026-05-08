import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// 1. 檢查變數是否存在
if (!MONGODB_URI) {
    console.error("❌ 錯誤: MONGODB_URI 未定義。請檢查 Render 的 Environment 設定。");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // 增加連線嘗試時間，防止網路波動導致的失敗
            connectTimeoutMS: 20000,
            family: 4 // 強制使用 IPv4，有助於解決某些雲端環境的連線解析問題
        };

        console.log("📡 正在嘗試連線至 MongoDB...");

        cached.promise = mongoose.connect(MONGODB_URI, opts)
            .then((mongoose) => {
                console.log("✅ MongoDB 連線成功！");
                return mongoose;
            })
            .catch((err) => {
                // 這裡會印出具體的錯誤原因（例如：驗證失敗或 IP 被阻擋）
                console.error("❌ MongoDB 連線過程中發生錯誤:", err.message);
                cached.promise = null;
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;