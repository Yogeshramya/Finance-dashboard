import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import Client from "@/models/Client";
import User from "@/models/User";
import Group from "@/models/Group";

const secret = process.env.NEXTAUTH_SECRET!;

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const branchId =
            typeof token.branch === "string"
                ? token.branch
                : token.branch?._id;

        if (!branchId) {
            return NextResponse.json(
                { success: false, error: "Branch not found" },
                { status: 401 }
            );
        }

        const clients = await Client.find({
            status: "PENDING",
            branch: branchId,
        })
            .populate({
                path: "employee",
                select: "name",
                model: User,
            })
            .populate({
                path: "group",
                select: "groupName",
                model: Group,
            })
            //.sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            count: clients.length,
            clients,
        });
    } catch (error) {
        console.error("Client Pending API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch pending clients" },
            { status: 500 }
        );
    }
}
