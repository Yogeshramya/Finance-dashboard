import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";

import Bill from "@/models/Bill";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { groupId, loans, totalCollected, weekNo } = await req.json();

        if (!groupId)
            return NextResponse.json(
                { error: "Group required" },
                { status: 400 }
            );

        if (!weekNo)
            return NextResponse.json(
                { error: "Week required" },
                { status: 400 }
            );

        if (!Array.isArray(loans) || loans.length === 0)
            return NextResponse.json(
                { error: "No members selected" },
                { status: 400 }
            );

        const billTime = new Date();

        /* -------- CREATE PRE-BILL -------- */

        const bill = await Bill.create({
            employee: token.id,
            branch: token.branch?._id,
            group: groupId,
            weekNo,
            type: "PreBill",
            status: "PENDING",
            loans,
            totalMembers: loans.length,
            totalCollected,
            collectedAt: billTime,
        });

        return NextResponse.json(
            {
                success: true,
                bill,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("PreBill save error:", error);

        return NextResponse.json(
            { error: "Failed to save pre-bill" },
            { status: 500 }
        );
    }
}