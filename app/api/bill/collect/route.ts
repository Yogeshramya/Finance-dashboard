import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";

import Bill from "@/models/Bill";
import Groupdb from "@/models/Group";

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

        if (!groupId) {
            return NextResponse.json(
                { error: "Group required" },
                { status: 400 }
            );
        }

        if (!Array.isArray(loans) || loans.length === 0) {
            return NextResponse.json(
                { error: "No members selected" },
                { status: 400 }
            );
        }

        const group = await Groupdb.findById(groupId);

        if (!group) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        const billTime = new Date();

        /* ================= CREATE BILL ================= */

        const bill = await Bill.create({
            employee: token.id,
            branch: token.branch?._id,
            group: groupId,
            weekNo,
            type: "Normal",
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
        console.error("Bill collect error:", error);

        return NextResponse.json(
            { error: "Failed to create bill" },
            { status: 500 }
        );
    }
}