import mongoose from "mongoose";

/* ================= PARTIAL PAYMENTS ================= */
const PartialPaymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    paidAt: {
      type: Date,
      default: Date.now
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { _id: false }
);

/* ================= ARREAR LOAN ================= */
const ArrearLoanSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true
    },

    mfLoanId: {
      type: String,
      index: true
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      index: true
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      index: true
    },

    arrearFromWeek: {
      type: Number,
      required: true,
      min: 1
    },

    arrearTillWeek: {
      type: Number,
      required: true,
      min: 1
    },

    principal: { type: Number, default: 0 },
    interest: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    remainingAmount: {
      type: Number,
      required: true,
      min: 0
    },

    partialPayments: {
      type: [PartialPaymentSchema],
      default: []
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.ArrearLoan ||
  mongoose.model("ArrearLoan", ArrearLoanSchema);
