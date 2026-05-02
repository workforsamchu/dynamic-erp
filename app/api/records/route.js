import { connectDB } from "@/lib/db";
import Record from "@/models/Record";
import Field from "@/models/Field";

// 封裝統一的錯誤回應
const errorResponse = (message, status = 500, details = null) => {
    return Response.json({ error: message, details }, { status });
};

export async function GET(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const recordTypeId = searchParams.get("recordTypeId");

        if (!recordTypeId) {
            return errorResponse("recordTypeId is required", 400);
        }

        const records = await Record.find({ recordTypeId }).sort({
            createdAt: -1,
        });

        return Response.json(records);
    } catch (error) {
        return errorResponse(error.message);
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { recordTypeId, data } = body;

        if (!recordTypeId || !data) {
            return errorResponse("missing data", 400);
        }

        // 獲取欄位定義並驗證資料
        const fields = await Field.find({ recordTypeId });
        const errors = validateRecord(fields, data);

        if (Object.keys(errors).length > 0) {
            return errorResponse("validation failed", 400, errors);
        }

        const record = await Record.create({ recordTypeId, data });
        return Response.json(record, { status: 201 });
    } catch (error) {
        return errorResponse(error.message);
    }
}

export async function PUT(req) {
    try {
        await connectDB();
        const body = await req.json();
        const { id, data } = body;

        if (!id || !data) {
            return errorResponse("Missing ID or data", 400);
        }

        // 找到該紀錄以獲取 recordTypeId，進而驗證新資料
        const existingRecord = await Record.findById(id);
        if (!existingRecord) {
            return errorResponse("Record not found", 404);
        }

        const fields = await Field.find({ recordTypeId: existingRecord.recordTypeId });
        const errors = validateRecord(fields, data);

        if (Object.keys(errors).length > 0) {
            return errorResponse("validation failed", 400, errors);
        }

        const updated = await Record.findByIdAndUpdate(
            id,
            { data },
            { new: true, runValidators: true }
        );

        return Response.json(updated);
    } catch (error) {
        return errorResponse(error.message);
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return errorResponse("ID is required", 400);
        }

        const deleted = await Record.findByIdAndDelete(id);
        if (!deleted) {
            return errorResponse("Record not found", 404);
        }

        return Response.json({ message: "Record deleted successfully" });
    } catch (error) {
        return errorResponse(error.message);
    }
}

// 驗證邏輯保持不變，但確保其強健性
function validateRecord(fields, data) {
    const errors = {};

    for (let field of fields) {
        const value = data[field.key];

        // 必填檢查
        if (field.required && (value === undefined || value === null || value === "")) {
            errors[field.key] = `${field.label} 係必填`;
        }

        // 數字格式檢查
        if (field.type === "number" && value !== undefined && value !== "") {
            if (isNaN(Number(value))) {
                errors[field.key] = `${field.label} 必須係數字`;
            }
        }
    }

    return errors;
}