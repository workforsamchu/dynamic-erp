import { connectDB } from "@/lib/db"
import RecordType from "@/models/RecordType"

// GET：攞所有 record types
export async function GET() {
    await connectDB()

    const types = await RecordType.find().sort({ createdAt: -1 })

    return Response.json(types)
}

// POST：建立 new record type
export async function POST(req) {
    await connectDB()

    const body = await req.json()

    const { key, name, description } = body

    if (!key || !name) {
        return Response.json(
            { error: "key and name are required" },
            { status: 400 }
        )
    }

    const exists = await RecordType.findOne({ key })

    if (exists) {
        return Response.json(
            { error: "record type already exists" },
            { status: 400 }
        )
    }

    const newType = await RecordType.create({
        key,
        name,
        description,
    })

    return Response.json(newType)
}