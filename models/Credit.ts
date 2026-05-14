import mongoose, { Schema, model, models } from "mongoose";

const CreditSchema = new Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        mode: {
            type: String,
            enum: ["Cash", "Bank"],
            default: "Cash",
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
            index: true,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        approvedAt: {
            type: Date,
            default: null,
        },
        branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

const Credit = models.Credit || model("Credit", CreditSchema);
export default Credit;
