import mongoose from "mongoose";

const BranchSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        code: { type: String, required: true },
        address: { type: String },
        manager: { type: String },
        phone: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.Branch ||
    mongoose.model("Branch", BranchSchema);
