import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SavingsDraft from "@/models/SavingsDraft";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {
    try {

        await connectDB();

        const token = await getToken({ req, secret });

        if (!token) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized",
            });
        }

        const { customerId, amount, note } = await req.json();

        /* ================= VALIDATION ================= */

        if (!customerId) {
            return NextResponse.json({
                success: false,
                error: "Customer ID required",
            });
        }

        if (!amount || Number(amount) <= 0) {
            return NextResponse.json({
                success: false,
                error: "Invalid savings amount",
            });
        }

        /* ================= FIND OR CREATE DRAFT ================= */

        let draft = await SavingsDraft.findOne({ customerId });

        if (!draft) {

            draft = await SavingsDraft.create({
                customerId,
                branch: token.branch?._id,
                savingsAmount: 0,
                totalSavings: 0,
                refunded: false,
                entries: [],
            });

        }

        if (draft.refunded) {
            return NextResponse.json({
                success: false,
                error: "Savings already refunded",
            });
        }

        /* ================= ADD ENTRY ================= */

        const entry = {
            amount: Number(amount),
            note: note || "",
            date: new Date(),
        };

        draft.entries.push(entry);

        /* ================= RECALCULATE TOTAL ================= */

        const entriesTotal = draft.entries.reduce(
            (sum: number, e: { amount: number }) => sum + Number(e.amount || 0),
            0
        );

        draft.totalSavings =
            (draft.savingsAmount || 0) + entriesTotal;

        await draft.save();

        return NextResponse.json({
            success: true,
            draft,
        });

    } catch (err) {

        console.log("SavingsDraft ADD error:", err);

        return NextResponse.json({
            success: false,
            error: "Server error",
        });

    }
}