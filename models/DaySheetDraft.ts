import mongoose from "mongoose";

const DaySheetDraftSchema = new mongoose.Schema(
    {
        date: { type: String, required: true },
        branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        denomination: [
            {
                note: Number,
                count: Number,
                total: Number,
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.models.DaySheetDraft ||
    mongoose.model("DaySheetDraft", DaySheetDraftSchema);
