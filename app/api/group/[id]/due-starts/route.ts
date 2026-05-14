import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Loan from "@/models/Loan";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const { dueStarts } = body;

        if (!dueStarts) {
            return NextResponse.json(
                { success: false, error: "dueStarts is required" },
                { status: 400 }
            );
        }

        // Check if approved loan exists for this group
        const approvedLoan = await Loan.findOne({
            group: id,
            status: "APPROVED",
        });

        if (approvedLoan) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Cannot update Due Starts. Approved loan already exists for this group.",
                },
                { status: 400 }
            );
        }

        const updated = await Group.findByIdAndUpdate(
            id,
            { dueStarts: new Date(dueStarts) },
            { returnDocument: 'after' }
        );

        if (!updated) {
            return NextResponse.json(
                { success: false, error: "Group not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            dueStarts: updated.dueStarts,
        });
    } catch (err) {
        console.log(err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
