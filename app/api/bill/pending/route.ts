import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bill from "@/models/Bill";
import { getToken } from "next-auth/jwt";
import User from "@/models/User";   // required for populate employee
import Group from "@/models/Group";  // required for populate group

const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "group", select: "groupName", model: Group },
];

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    await connectDB();

    const token = await getToken({ req, secret });

    const bills = await Bill.find({ status: "PENDING", branch: token?.branch?._id })
        .populate(populateFields)
        .sort({ createdAt: -1 });

    return NextResponse.json({
        success: true,
        bills
    });
}