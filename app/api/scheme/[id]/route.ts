import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Scheme from "@/models/Scheme";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

/* ================= GET SCHEME DETAILS ================= */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const scheme = await Scheme.findOne({
            schemeId: id,
        }).lean();

        if (!scheme) {
            return NextResponse.json(
                { success: false, error: "Scheme not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            scheme,
        });
    } catch (error) {
        console.error("Scheme view error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to load scheme" },
            { status: 500 }
        );
    }
}
