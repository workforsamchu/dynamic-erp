import mongoose from "mongoose"

const RecordTypeSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        description: String,
        status: { type: String, default: "active" },
    },
    { timestamps: true }
)

export default mongoose.models.RecordType ||
    mongoose.model("RecordType", RecordTypeSchema)