// models/Group.ts
import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
    groupId: { type: String, required: true, unique: true }, // NP36 etc
    groupName: { type: String, required: true },
    totalMembers: { type: Number, default: 0 },
    dueOn: { type: String, enum: ["MONTHLY", "WEEKLY"], default: "MONTHLY" },
    collectionDay: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], default: "Monday" },
    collectionTime: { type: String, default: "" },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    status: { type: String, enum: ["ACTIVE", "CLOSED"], default: "ACTIVE" },
    closedAt: { type: Date, default: null },
    dueStarts: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
