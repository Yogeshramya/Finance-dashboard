import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Client from "@/models/Client";
import Credit from "@/models/Credit";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function PUT(
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

        // Approve client
        const client = await Client.findByIdAndUpdate(
            id,
            {
                status: "APPROVED",
                approvedAt: new Date(),
                approvedBy: token.id,
            },
            { returnDocument: 'after' }
        );

        if (!client) {
            return NextResponse.json(
                { success: false, error: "Client not found" },
                { status: 404 }
            );
        }

        // Create Admission Fee Credit (₹150)
        await Credit.create({
            date: new Date(),
            title: "Admission Fee",
            details: `Admission fee for ${client.name}`,
            amount: 150,
            mode: "Cash",
            status: "APPROVED",
            approvedBy: token.id,
            approvedAt: new Date(),
            branch: client.branch || null,
            employee: client.employee || null,
        });

        return NextResponse.json({
            success: true,
            message: "Client approved and admission fee credited",
            client,
        });
    } catch (error) {
        console.error("Client approve error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
