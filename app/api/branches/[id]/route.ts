import Branch from "@/models/Branch";
import { connectDB } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;
    const branch = await Branch.findById(id);
    return Response.json(branch);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const data = await req.json();
    const { id } = await params;

    const branch = await Branch.findByIdAndUpdate(id, data, { returnDocument: 'after' });

    await logAudit({
        action: "UPDATED",
        module: "BRANCH",
        recordId: id,
        performedById: data.updatedBy ?? "UNKNOWN",
        performedByName: data.updatedByName ?? "UNKNOWN",
    });

    return Response.json(branch);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;

    const deleted = await Branch.findById(id);

    await Branch.findByIdAndDelete(id);

    await logAudit({
        action: "DELETED",
        module: "BRANCH",
        recordId: id,
        performedById: deleted?.createdBy ?? "UNKNOWN",
        performedByName: deleted?.createdByName ?? "UNKNOWN",
    });

    return Response.json({ message: "Deleted" });
}
