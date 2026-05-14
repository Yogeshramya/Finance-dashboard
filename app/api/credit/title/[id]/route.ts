import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CreditTitle from "@/models/CreditTitle";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const body = await req.json();
        const { id } = await params;

        const updated = await CreditTitle.findByIdAndUpdate(
            id,
            { title: body.title },
            { returnDocument: 'after' }
        );

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.log("Error updating credit title:", error);
        return NextResponse.json({ success: false, error: "Failed to update title" });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        await CreditTitle.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("Error deleting credit title:", error);
        return NextResponse.json({ success: false, error: "Failed to delete title" });
    }
}
