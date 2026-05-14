import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Credit from "@/models/Credit";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Branch from "@/models/Branch";
import mongoose from "mongoose";

const secret = process.env.NEXTAUTH_SECRET!;

const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "branch", select: "name code", model: Branch },
];

interface Filter {
    branch: mongoose.Types.ObjectId;
    date?: { $gte?: Date; $lte?: Date };
    title?: string; // TITLE = TYPE
    status?: string;
}

/* ================= CREATE CREDIT ================= */
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const token = await getToken({ req, secret });

        if (!token)
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );

        const body = await req.json();

        const credit = await Credit.create({
            ...body,
            employee: token.id,
            branch: token.branch?._id,
        });

        return NextResponse.json(
            { success: true, credit },
            { status: 201 }
        );
    } catch (error) {
        console.error("Credit POST error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create credit" },
            { status: 500 }
        );
    }
}

/* ================= GET CREDIT REPORT ================= */
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await getToken({ req, secret });

        if (!token || !token.branch?._id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const branchId = new mongoose.Types.ObjectId(token.branch._id);

        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 10;
        const skip = (page - 1) * limit;

        const start = searchParams.get("start");
        const end = searchParams.get("end");
        const title = searchParams.get("title");

        /* ================= FIND FILTER ================= */
        const findFilter: Filter = { branch: branchId };

        if (start || end) {
            findFilter.date = {};
            if (start) {
                const d = new Date(start);
                d.setUTCHours(0, 0, 0, 0);
                findFilter.date.$gte = d;
            }
            if (end) {
                const d = new Date(end);
                d.setUTCHours(23, 59, 59, 999);
                findFilter.date.$lte = d;
            }
        }

        if (title && title !== "ALL") {
            findFilter.title = title;
        }

        /* ================= PAGINATED DATA ================= */
        const credits = await Credit.find(findFilter)
            .populate(populateFields)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        /* ================= SUMMARY (ALL PAGES) ================= */
        const matchStage: Filter = {
            branch: branchId,
            status: "APPROVED",
        };

        if (findFilter.date) matchStage.date = findFilter.date;
        if (findFilter.title) matchStage.title = findFilter.title;

        const summaryAgg = await Credit.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    cashAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$mode", "Cash"] }, "$amount", 0],
                        },
                    },
                    bankAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$mode", "Bank"] }, "$amount", 0],
                        },
                    },
                    count: { $sum: 1 },
                },
            },
        ]);

        const summary = summaryAgg[0] || {
            totalAmount: 0,
            cashAmount: 0,
            bankAmount: 0,
            count: 0,
        };

        return NextResponse.json({
            success: true,
            credits,
            summary,
        });
    } catch (error) {
        console.error("Credit GET error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch credits" },
            { status: 500 }
        );
    }
}