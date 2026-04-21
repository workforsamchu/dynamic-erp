import { connectDB } from "@/lib/db"
import Field from "@/models/Field"

// GET：攞某個 record type 的 fields
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

    const fields = await Field.find({ recordTypeId }).sort({ order: 1 })

    return Response.json(fields)
}

export async function POST(req) {

    try {
        await connectDB()

        const body = await req.json()
        console.log('body', body);

        const {
            recordTypeId,
            key,
            label,
            type,
            required,
            options,
            order,
        } = body

        console.log('recordTypeId', recordTypeId);
        if (!recordTypeId || !key) {
            return Response.json(
                { error: "recordTypeId and key are required" },
                { status: 400 }
            )
        }

        const exists = await Field.findOne({
            recordTypeId,
            key,
        })

        if (exists) {
            return Response.json(
                { error: "field already exists" },
                { status: 400 }
            )
        }

        const field = await Field.create({
            recordTypeId,
            key,
            label,
            type: type || "string",
            required: required || false,
            options: options || [],
            order: order || 0,
        })

        return Response.json(field)
    } catch (error) {
        console.log('error', error);

    }
}