import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";

import type { NextRequest } from "next/server";
import Branch from "@/models/Branch";

const populateFields = [
    { path: "branch", select: "name code", model: Branch },
    { path: "branches", select: "name code", model: Branch },
];

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req });

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const branchId = (token.branch)?._id;

        if (!branchId) {
            return NextResponse.json({
                success: true,
                employees: []
            });
        }

        const employees = await User.find({
            branch: branchId
        })
            .populate(populateFields)
            .lean();

        return NextResponse.json({
            success: true,
            employees
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error },
            { status: 400 }
        );
    }
}
