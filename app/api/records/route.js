import { connectDB } from "@/lib/db"
import Record from "@/models/Record"
import Field from "@/models/Field"

export async function GET(req) {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const recordTypeId = searchParams.get("recordTypeId")

    if (!recordTypeId) {
        return Response.json(
            { error: "recordTypeId is required" },
            { status: 400 }
        )
    }

    const records = await Record.find({ recordTypeId }).sort({
        createdAt: -1,
    })

    return Response.json(records)
}

export async function POST(req) {
    await connectDB()

    const body = await req.json()

    const { recordTypeId, data } = body

    if (!recordTypeId || !data) {
        return Response.json(
            { error: "recordTypeId and data are required" },
            { status: 400 }
        )
    }

    // 1️⃣ load schema (fields)
    const fields = await Field.find({ recordTypeId })

    // 2️⃣ basic validation
    for (let field of fields) {
        if (field.required && !data[field.key]) {
            return Response.json(
                { error: `${field.key} is required` },
                { status: 400 }
            )
        }
    }

    // 3️⃣ create record
    const record = await Record.create({
        recordTypeId,
        data,
    })

    return Response.json(record)
}