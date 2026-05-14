import mongoose from "mongoose";

const CreditTitleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

export default mongoose.models.CreditTitle ||
    mongoose.model("CreditTitle", CreditTitleSchema);
