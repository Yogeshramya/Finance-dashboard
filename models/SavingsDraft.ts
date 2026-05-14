import mongoose from "mongoose";

const SavingsDraftSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            index: true,
        },

        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Branch",
            index: true,
        },

        savingsAmount: {
            type: Number,
            default: 0,
        },

        entries: [
            {
                amount: { type: Number, required: true },
                note: { type: String, default: "" },
                date: { type: Date, default: Date.now },
            },
        ],

        totalSavings: {
            type: Number,
            default: 0,
        },

        refunded: {
            type: Boolean,
            default: false,
        },

        savingsRequested: {
            type: Boolean,
            default: false,
        },

        savingsReturned: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.models.SavingsDraft ||
    mongoose.model("SavingsDraft", SavingsDraftSchema);