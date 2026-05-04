import { connectDB } from "@/lib/db";
import Record from "@/models/Record";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const record = await Record.findById(id);

        if (!record) {
            return NextResponse.json({ error: "找不到該紀錄" }, { status: 404 });
        }

        return NextResponse.json(record);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}