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
            { error: "missing data" },
            { status: 400 }
        )
    }

    // 🔥 1. load schema
    const fields = await Field.find({ recordTypeId })

    // 🔥 2. validate
    const errors = validateRecord(fields, data)

    if (Object.keys(errors).length > 0) {
        return Response.json(
            { error: "validation failed", details: errors },
            { status: 400 }
        )
    }

    // 🔥 3. save record
    const record = await Record.create({
        recordTypeId,
        data,
    })

    return Response.json(record)
}

function validateRecord(fields, data) {
    const errors = {}

    for (let field of fields) {
        const value = data[field.key]

        // required check
        if (field.required && (value === undefined || value === "")) {
            errors[field.key] = `${field.label} 係必填`
        }

        // type check（簡單版）
        if (field.type === "number" && value && isNaN(value)) {
            errors[field.key] = `${field.label} 必須係數字`
        }
    }

    return errors
}