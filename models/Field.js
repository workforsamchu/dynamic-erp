import mongoose from "mongoose"

const FieldSchema = new mongoose.Schema(
    {
        // 所屬的紀錄類型 ID
        recordTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RecordType",
            required: true,
        },

        // 欄位的程式鍵值 (例如: country_code)
        key: { type: String, required: true },

        // 欄位的顯示名稱 (例如: 國家名稱)
        label: { type: String, required: true },

        // 欄位類型
        type: {
            type: String,
            // 擴展 enum 以支援關聯與結構化選單
            enum: ["string", "number", "date", "boolean", "codelist", "reference", "array"],
            default: "string",
        },

        // 是否為必填
        required: { type: Boolean, default: false },

        // 針對 'codelist' 類型使用的結構化選項
        // 格式如: [{ code: "hk", label: "Hong Kong" }]
        options: [
            {
                code: String,
                label: String,
            }
        ],

        // 針對 'reference' 類型，指向另一個 RecordType 的 ID
        referenceTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RecordType",
            default: null
        },
        sourceRecordTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RecordType"
        },
        // 排序使用
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
)

// 確保不會重複定義 Model
export default mongoose.models.Field ||
    mongoose.model("Field", FieldSchema)