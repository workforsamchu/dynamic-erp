import mongoose from "mongoose"

const RecordSchema = new mongoose.Schema(
    {
        recordTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RecordType",
            required: true,
        },

        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        isActive: { type: Boolean, default: true }

    },
    { timestamps: true }
)

export default mongoose.models.Record ||
    mongoose.model("Record", RecordSchema)