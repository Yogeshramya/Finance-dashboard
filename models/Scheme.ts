import mongoose from "mongoose";

const SchemeSchema = new mongoose.Schema({
    schemeId: String,
    schemeName: String,
    loanType: String,
    totalAmount: Number,
    interest: Number,
    applicationFees: Number,
    insuranceFees: Number,
    upfrontFees: Number,
    dues: Number,
    rows: [
        {
            principal: String,
            interest: String,
            savings: String,
            total: String
        }
    ]
});

export default mongoose.models.Scheme || mongoose.model("Scheme", SchemeSchema);
