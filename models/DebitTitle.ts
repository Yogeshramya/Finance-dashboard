import mongoose from "mongoose";

const DebitTitleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

export default mongoose.models.DebitTitle ||
    mongoose.model("DebitTitle", DebitTitleSchema);
