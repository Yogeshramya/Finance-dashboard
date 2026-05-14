import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import mongoose, { Query } from "mongoose";
import { Group as GroupType } from "@/types/group";

const secret = process.env.NEXTAUTH_SECRET!;
interface Filter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    branch: any;
    employee?: string;
    status?: string;
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const query = req.nextUrl.searchParams.get("query");
        const status = req.nextUrl.searchParams.get("status"); // optional

        const branchFilter = { branch: token.branch?._id };

        const populateFields = (
            cursor: Query<GroupType[], GroupType>
        ): Query<GroupType[], GroupType> =>
            cursor
                .populate("employee", "name")
                .populate("createdBy", "name")
                .populate("branch", "name");

        // IF NO QUERY, RETURN ALL GROUPS (FILTER BY STATUS IF GIVEN)
        if (!query) {
            const filter: Filter = { ...branchFilter };

            if (status) {
                filter.status = status;
            }

            const groups = await populateFields(
                Group.find(filter) as Query<GroupType[], GroupType>
            );

            return NextResponse.json(groups);
        }

        let groups: GroupType[] = [];

        // groupId exact
        groups = await populateFields(
            Group.find({ ...branchFilter, groupId: query, ...(status ? { status } : {}) }) as Query<
                GroupType[],
                GroupType
            >
        );
        if (groups.length > 0) return NextResponse.json(groups);

        // employee id
        if (mongoose.Types.ObjectId.isValid(query)) {
            groups = await populateFields(
                Group.find({
                    ...branchFilter,
                    employee: query,
                    ...(status ? { status } : {}),
                }) as Query<GroupType[], GroupType>
            );
            if (groups.length > 0) return NextResponse.json(groups);
        }

        // groupName startsWith
        groups = await populateFields(
            Group.find({
                ...branchFilter,
                groupName: { $regex: "^" + query, $options: "i" },
                ...(status ? { status } : {}),
            }) as Query<GroupType[], GroupType>
        );
        if (groups.length > 0) return NextResponse.json(groups);

        // groupName contains
        groups = await populateFields(
            Group.find({
                ...branchFilter,
                groupName: { $regex: query, $options: "i" },
                ...(status ? { status } : {}),
            }) as Query<GroupType[], GroupType>
        );

        return NextResponse.json(groups);
    } catch (error) {
        console.error("Group search error:", error);
        return NextResponse.json(
            {
                message: "Error searching groups",
                detail: error,
            },
            { status: 500 }
        );
    }
}
