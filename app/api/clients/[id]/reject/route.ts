import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";

const secret = process.env.NEXTAUTH_SECRET!;

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        /* ---------- AUTH ---------- */
        const token = await getToken({ req, secret });
        if (!token || !token.branch?._id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        /* ---------- FETCH CLIENT (BRANCH SAFE) ---------- */
        const client = await Client.findOne({
            _id: id,
            branch: token.branch._id,
        });

        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404 }
            );
        }

        /* ---------- DELETE CLIENT ---------- */
        await Client.deleteOne({ _id: client._id });

        return NextResponse.json({
            success: true,
            message: "Client rejected and deleted successfully",
        });

    } catch (error) {
        console.error("Client delete error:", error);
        return NextResponse.json(
            { error: "Failed to reject client" },
            { status: 500 }
        );
    }
}
