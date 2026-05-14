// app/api/employees/[id]/route.ts
import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await connectDB();
    const { id } = await params;

    const employee = await User.findById(id)
        .populate("branch", "name code")
        .lean();

    return NextResponse.json(employee);
}
