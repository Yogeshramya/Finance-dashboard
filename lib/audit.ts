import AuditLog from "@/models/AuditLog";
import { connectDB } from "@/lib/db";

interface AuditParams {
    action: string;
    module: string;
    recordId: string;
    performedById: string;
    performedByName: string;
}

export async function logAudit({
    action,
    module,
    recordId,
    performedById,
    performedByName,
}: AuditParams) {
    await connectDB();
    await AuditLog.create({
        action,
        module,
        recordId,
        performedById,
        performedByName,
    });
}
