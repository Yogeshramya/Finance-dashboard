import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Credit from "@/models/Credit";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";

const secret = process.env.NEXTAUTH_SECRET!;
const populateFields = [
    { path: "employee", select: "name", model: User },
];
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const credits = await Credit.find({
            status: "PENDING",
            branch: token.branch,
        })
            .populate(populateFields)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ credits });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
    }
}
