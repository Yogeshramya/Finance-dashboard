import mongoose from "mongoose";

const CashBoxSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    closingBalance: {
        type: Number,
        default: 0
    },
    denomination: [
        {
            note: Number,
            count: Number,
            total: Number
        }
    ],
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    approvedAt: Date,
    remarks: String,
}, { timestamps: true });

export default mongoose.models.CashBox || mongoose.model("CashBox", CashBoxSchema);
