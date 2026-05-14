import { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
    {
        action: { type: String, required: true }, // CREATED / UPDATED / DELETED
        module: { type: String, required: true }, // credit, debit, fund etc.
        recordId: { type: String, required: true },
        performedById: { type: String, required: true },
        performedByName: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default models.AuditLog || model("AuditLog", AuditLogSchema);
