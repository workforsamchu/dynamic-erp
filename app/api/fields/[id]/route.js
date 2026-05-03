import { connectDB } from "@/lib/db";
import Field from "@/models/Field";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        await connectDB();

        // 1. 在 Next.js 14/15 中，建議 await params
        const { id } = await params;

        // 2. 解析請求主體
        const body = await req.json();
        console.log(`正在更新欄位 ID: ${id}`, body);

        // 3. 安全性過濾：確保不會意外更改 ID 或 RecordType 歸屬
        // 如果你希望禁止更改 key，也可以將其從解構中移除
        const { _id, recordTypeId, ...updateData } = body;

        // 4. 執行更新
        const updatedField = await Field.findByIdAndUpdate(
            id,
            { $set: updateData }, // 只更新過濾後的資料
            {
                new: true,           // 回傳更新後的物件
                runValidators: true  // 確保更新的資料符合 Schema 定義 (如 enum)
            }
        );

        // 5. 檢查結果
        if (!updatedField) {
            return NextResponse.json(
                { error: "找不到該欄位，無法更新" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedField);

    } catch (error) {
        console.error("更新欄位失敗:", error);
        return NextResponse.json(
            { error: "伺服器錯誤", details: error.message },
            { status: 500 }
        );
    }
}

// 選擇性實作：如果你需要刪除功能，可以放在同一個檔案
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const deletedField = await Field.findByIdAndDelete(id);

        if (!deletedField) {
            return NextResponse.json({ error: "找不到該欄位" }, { status: 404 });
        }

        return NextResponse.json({ message: "欄位已成功刪除" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}