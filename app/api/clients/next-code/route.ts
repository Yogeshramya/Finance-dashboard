import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";

const secret = process.env.NEXTAUTH_SECRET!;

interface LastClient {
    customerCode?: string;
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        /* -------- AUTH -------- */
        const token = await getToken({ req, secret });
        if (!token || !token.branch?._id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const branchId = token.branch._id;

        /* -------- FIND LAST CLIENT IN BRANCH -------- */
        const lastClient = await Client.findOne(
            { branch: branchId },
            { customerCode: 1 }
        )
            .sort({ createdAt: -1 })
            .lean<LastClient | null>();

        let nextNumber = 1;

        if (lastClient?.customerCode) {
            const numeric = parseInt(lastClient.customerCode, 10);
            if (!isNaN(numeric)) {
                nextNumber = numeric + 1;
            }
        }

        const nextCode = String(nextNumber).padStart(3, "0");

        return NextResponse.json({
            success: true,
            nextCode,
        });
    } catch (err) {
        console.error("Next customer code error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to generate next code" },
            { status: 500 }
        );
    }
}
