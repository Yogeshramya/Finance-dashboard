import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Loan from "@/models/Loan";
import { Dues } from "@/types/fund";
import mongoose from "mongoose";

interface CloseGroupParams {
    id: string;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const id = await params;
        const groupId =
            typeof id === "string"
                ? id
                : (id as CloseGroupParams)?.id;

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return NextResponse.json(
                { error: "Invalid group ID" },
                { status: 400 }
            );
        }

        // Fetch all loans for this group
        const groupObjectId = new mongoose.Types.ObjectId(groupId);
        const loans = await Loan.find({ group: groupObjectId });

        if (!loans.length) {
            return NextResponse.json(
                { error: "No loans found in this group" },
                { status: 400 }
            );
        }

        // Check dues for every loan
        const hasPendingDues = loans.some((loan) =>
            loan.dues?.some((due: Dues) => due.paid !== true)
        );

        if (hasPendingDues) {
            return NextResponse.json(
                { error: "Some dues are still unpaid. Group cannot be closed." },
                { status: 400 }
            );
        }

        // Close the group
        await Group.findByIdAndUpdate(groupId, {
            status: "CLOSED",
            closedAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: "Group closed successfully",
        });
    } catch (err) {
        console.error("Close Group Error:", err);
        return NextResponse.json(
            { error: "Failed to close group" },
            { status: 500 }
        );
    }
}
