import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            default: null,
        },
        weekNo: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ["Normal", "PreClose", "PreBill", "Partial"],
            default: "Normal",
        },

        loans: [
            {
                loanId: {
                    type: String,
                    required: true,
                },
                customerName: {
                    type: String,
                    required: true,
                },
                present: {
                    type: Boolean,
                    default: false,
                },
                weekNo: {
                    type: Number,
                    //required: true,
                },
                paidAmount: {
                    type: Number,
                    required: true,
                },
                principal: {
                    type: Number,
                    default: 0,
                },
                interest: {
                    type: Number,
                    default: 0,
                },
                savings: {
                    type: Number,
                    default: 0,
                },
            },
        ],

        status: {
            type: String,
            enum: ["APPROVAL", "APPROVED", "REJECTED", "PENDING"],
            default: "APPROVED",
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

        rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        rejectedAt: { type: Date, default: null, },

        rejectionReason: {
            type: String,
            default: null,
        },

        totalMembers: {
            type: Number,
            default: 0,
        },
        totalCollected: {
            type: Number,
            default: 0,
        },
        collectedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Bill ||
    mongoose.model("Bill", BillSchema);
