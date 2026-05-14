import mongoose, { Schema, models } from "mongoose";

const SavingsApprovalSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index: true,
        },

        branch: {
            type: Schema.Types.ObjectId,
            ref: "Branch",
            required: true,
        },

        savingsAmount: {
            type: Number,
            required: true,
            default: 0,
        },

        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        requestedAt: {
            type: Date,
            default: Date.now,
        },

        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },

        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        approvedAt: Date,

        remarks: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export default models.SavingsApproval ||
    mongoose.model("SavingsApproval", SavingsApprovalSchema);