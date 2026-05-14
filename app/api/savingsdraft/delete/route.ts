import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SavingsDraft from "@/models/SavingsDraft";
import Debit from "@/models/Debit";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

const secret = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {

    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const token = await getToken({ req, secret });

        if (!token) {
            await session.abortTransaction();
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { customerId, entryIndex } = await req.json();

        /* ================= VALIDATION ================= */

        if (!customerId) {
            await session.abortTransaction();
            return NextResponse.json({
                success: false,
                error: "Customer ID required",
            });
        }

        if (entryIndex === undefined || entryIndex === null) {
            await session.abortTransaction();
            return NextResponse.json({
                success: false,
                error: "Entry index required",
            });
        }

        /* ================= FIND DRAFT ================= */

        const draft = await SavingsDraft.findOne({ customerId }).session(session);

        if (!draft) {
            await session.abortTransaction();
            return NextResponse.json({
                success: false,
                error: "Savings draft not found",
            });
        }

        if (draft.refunded) {
            await session.abortTransaction();
            return NextResponse.json({
                success: false,
                error: "Savings already refunded",
            });
        }

        if (draft.savingsRequested) {
            await session.abortTransaction();
            return NextResponse.json({
                success: false,
                error: "Cannot modify. Savings return already requested",
            });
        }

        if (!draft.entries || draft.entries.length === 0) {
            await session.abortTransaction();
            return NextResponse.json({
                success: false,
                error: "No entries to delete",
            });
        }

        if (entryIndex < 0 || entryIndex >= draft.entries.length) {
            await session.abortTransaction();
            return NextResponse.json({
                success: false,
                error: "Invalid entry index",
            });
        }

        /* ================= DELETE ENTRY ================= */

        const deletedEntry = draft.entries[entryIndex];
        const deletedAmount = Number(deletedEntry.amount || 0);

        draft.entries.splice(entryIndex, 1);

        /* ================= RECALCULATE TOTAL ================= */

        draft.totalSavings = draft.entries.reduce(
            (sum: number, e: { amount: number }) =>
                sum + Number(e.amount || 0),
            0
        );

        await draft.save({ session });

        /* ================= CREATE DEBIT ================= */

        const debit = await Debit.create(
            [
                {
                    date: new Date(),
                    title: "Savings Draft Deleted",
                    details: `Savings entry deleted for customer ${customerId} (Deleted Amount: ₹${deletedAmount})`,
                    amount: deletedAmount,
                    mode: "Cash",
                    status: "APPROVED",
                    branch: token.branch?._id || null,
                    employee: token.id,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return NextResponse.json({
            success: true,
            draft,
            debitId: debit[0]._id,
        });

    } catch (err) {

        await session.abortTransaction();
        session.endSession();

        console.log("SavingsDraft DELETE error:", err);

        return NextResponse.json({
            success: false,
            error: "Server error",
        });

    }
}