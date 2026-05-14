import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Scheme from "@/models/Scheme";

const secret = process.env.NEXTAUTH_SECRET!;

/* ================= UPDATE SCHEME ================= */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const token = await getToken({ req, secret });

        if (!token || token.role !== "MANAGER") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        const body = await req.json();

        const updatedScheme = await Scheme.findOneAndUpdate(
            { schemeId: id },
            body,
            { returnDocument: 'after' }
        );

        if (!updatedScheme) {
            return NextResponse.json(
                { success: false, error: "Scheme not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            scheme: updatedScheme,
        });
    } catch (error) {
        console.error("Scheme update error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update scheme" },
            { status: 500 }
        );
    }
}

/* ================= DELETE SCHEME ================= */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const token = await getToken({ req, secret });

        if (!token || token.role !== "MANAGER") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            );
        }

        const deleted = await Scheme.findOneAndDelete({
            schemeId: id,
        });

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Scheme not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Scheme deleted successfully",
        });
    } catch (error) {
        console.error("Scheme delete error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete scheme" },
            { status: 500 }
        );
    }
}
