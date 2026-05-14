import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
    mfLoanId: String,
    loanDate: Date,
    firstDueDate: String,
    maturedDate: String,
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    scheme: { type: mongoose.Schema.Types.ObjectId, ref: "Schema", default: null },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    loanType: String,
    loanPurpose: String,
    loanAmount: Number,
    dues: [
        {
            principal: Number,
            interest: Number,
            savings: Number,
            total: Number,
            paid: { type: Boolean, default: false },
            paidAt: Date,
            present: { type: Boolean, default: false },
            paidAmount: { type: Number, default: 0 },
            remainingAmount: { type: Number, default: 0 },
            isPartial: { type: Boolean, default: false },
            principalPaid: { type: Number, default: 0 },
            interestPaid: { type: Number, default: 0 },
            savingsPaid: { type: Number, default: 0 },
        }
    ],
    savingsRefunded: Boolean,

    collections: [
        {
            weekNo: Number,
            amount: Number,
            collectedAt: { type: Date, default: Date.now },
            principalPaid: { type: Number, default: 0 },
            interestPaid: { type: Number, default: 0 },
            savingsPaid: { type: Number, default: 0 },
        }
    ],
    applicationFee: Number,
    insuranceFee: Number,

    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Client", default: null },
    phone: String,
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },

    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED", "ARREAR", "REPAID", "CLOSED"],
        default: "PENDING"
    },
    approvalRemarks: String,
    approvedAt: Date,
    rejectedAt: Date,
}, { timestamps: true });

export default mongoose.models.Loan || mongoose.model("Loan", LoanSchema);