import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SavingsDraft from "@/models/SavingsDraft";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });

        const match: { branch?: mongoose.Types.ObjectId; refunded: boolean } = {
            refunded: false
        };

        if (token?.branch?._id) {
            match.branch = new mongoose.Types.ObjectId(token.branch._id);
        }

        const result = await SavingsDraft.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalSavings" }
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            total: result[0]?.total || 0
        });

    } catch (err) {
        console.log("Total SavingsDraft error:", err);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}