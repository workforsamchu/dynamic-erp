import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import RecordType from "@/models/RecordType"
import Field from "@/models/Field"
import Record from "@/models/Record"

// 解決 404 和快取問題的關鍵配置
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        await connectDB()

        const [rtCount, fCount, rCount, recent, allTypes] = await Promise.all([
            RecordType.countDocuments(),
            Field.countDocuments(),
            Record.countDocuments(),
            Record.find().sort({ createdAt: -1 }).limit(5).populate("recordTypeId"),
            RecordType.find().lean()
        ])

        return NextResponse.json({
            summary: {
                recordTypes: rtCount,
                fields: fCount,
                records: rCount,
            },
            recentRecords: recent,
            recordTypes: allTypes,
        })
    } catch (error) {
        return NextResponse.json(
            { error: "Database Connection Failed" },
            { status: 500 }
        )
    }
}