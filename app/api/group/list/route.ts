import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import { getToken } from "next-auth/jwt";

interface Filter {
    branch: string;
    employee?: string;
    status?: string;
}
export async function GET(req: Request) {
    try {
        await connectDB();

        const token = await getToken({ req: req as NextRequest });

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const branchId = token.branch?._id; // From session
        if (!branchId) {
            return NextResponse.json({
                success: true,
                groups: []
            });
        }

        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get("employee");
        const status = searchParams.get("status");

        const filter: Filter = {
            branch: branchId,
        };

        if (employeeId) {
            filter.employee = employeeId;
        }
        if (status) {
            filter.status = status;
        }

        const groups = await Group.find(filter)
            .populate("branch")
            .populate("employee");

        return NextResponse.json({
            success: true,
            groups,
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error },
            { status: 400 }
        );
    }
}
