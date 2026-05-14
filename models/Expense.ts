import mongoose, { Schema, models } from "mongoose";

const ExpenseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: String,
    amount: Number,
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
}, { timestamps: true });

export default models.Expense || mongoose.model("Expense", ExpenseSchema);
