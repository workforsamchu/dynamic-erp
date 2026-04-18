import mongoose from "mongoose"

const FieldSchema = new mongoose.Schema(
    {
        recordTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RecordType",
            required: true,
        },

        key: { type: String, required: true },
        label: String,

        type: {
            type: String,
            enum: ["string", "number", "date", "boolean", "select"],
            default: "string",
        },

        required: { type: Boolean, default: false },

        options: [String],
        order: Number,
    },
    { timestamps: true }
)

export default mongoose.models.Field ||
    mongoose.model("Field", FieldSchema)