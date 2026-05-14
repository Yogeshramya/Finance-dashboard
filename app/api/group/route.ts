import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";

const secret = process.env.NEXTAUTH_SECRET!;

// Strong filter interface
interface Filter {
    branch: string;
    employee?: string;
    status?: string;
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token || !token.branch) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = req.nextUrl.searchParams;
        const employeeId = searchParams.get("employeeId");
        const status = searchParams.get("status");

        const query: Filter = { branch: token.branch?._id };

        if (employeeId) query.employee = employeeId;
        if (status) query.status = status;

        const groups = await Group.find(query)
            .select(
                "groupId groupName totalMembers employee branch dueOn collectionDay collectionTime createdBy"
            )
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        return NextResponse.json({ success: true, groups });
    } catch (error) {
        console.error("Groups fetch error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch groups",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });

        if (!token || !token.id || !token.branch) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const {
            groupId,
            groupName,
            totalMembers,
            dueOn,
            collectionDay,
            collectionTime,
            employee,
            createdBy,
        } = body;

        // Mandatory field check
        if (
            !groupId ||
            !groupName ||
            !dueOn ||
            !collectionDay ||
            !collectionTime ||
            !employee ||
            !createdBy
        ) {
            return NextResponse.json(
                { error: "All mandatory fields must be filled!" },
                { status: 400 }
            );
        }

        // Check duplicate within branch
        const exists = await Group.findOne({
            groupId,
            branch: token.branch,
        }).lean();

        if (exists) {
            return NextResponse.json(
                { error: "Group ID already exists in this branch" },
                { status: 409 }
            );
        }

        const group = await Group.create({
            groupId,
            groupName,
            totalMembers: Number(totalMembers) || 0,
            dueOn,
            dueStarts: new Date(),
            collectionDay,
            collectionTime,
            employee,
            createdBy,
            branch: token.branch,
        });

        return NextResponse.json({ success: true, group }, { status: 201 });
    } catch (error) {
        console.error("Group create error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create group",
            },
            { status: 500 }
        );
    }
}
