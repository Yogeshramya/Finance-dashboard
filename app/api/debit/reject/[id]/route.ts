import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Debit from "@/models/Debit";
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
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { remarks } = await req.json();

        if (!remarks)
            return NextResponse.json({ error: "Remarks required" }, { status: 400 });

        const debit = await Debit.findByIdAndUpdate(
            id,
            {
                status: "REJECTED",
                approvedBy: token.id,
                approvedAt: new Date(),
                remarks,
            },
            { returnDocument: 'after' }
        );

        if (!debit)
            return NextResponse.json({ error: "Debit not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Rejection failed" }, { status: 500 });
    }
}
