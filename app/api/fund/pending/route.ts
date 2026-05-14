import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import { getToken } from "next-auth/jwt";
import { Dues } from "@/types/fund";

const secret = process.env.NEXTAUTH_SECRET!;

interface Query {
    branch: string;
    group: string;
    status: string;
    employee?: string;
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await getToken({ req, secret });

        if (!token?.branch) {
            return NextResponse.json(
                { error: "No branch found in session" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get("groupId");
        const employeeId = searchParams.get("employeeId");

        if (!groupId) {
            return NextResponse.json(
                { error: "groupId is required" },
                { status: 400 }
            );
        }

        const query: Query = {
            branch: token.branch._id,
            group: groupId,
            status: "APPROVED",
        };

        if (employeeId) query.employee = employeeId;

        const loans = await Loan.find(query)
            .populate({ path: "customer", select: "name phone" })
            .lean();

        const pendingList = loans
            .map((loan) => {
                if (!loan.dues || loan.dues.length === 0) return null;

                // sort dues by weekNo
                const duesSorted = [...loan.dues].sort(
                    (a: Dues, b: Dues) => a.weekNo - b.weekNo
                );

                let consecutiveUnpaid = 0;
                let maxConsecutiveUnpaid = 0;

                for (const d of duesSorted) {
                    if (!d.paid) {
                        consecutiveUnpaid++;
                        maxConsecutiveUnpaid = Math.max(
                            maxConsecutiveUnpaid,
                            consecutiveUnpaid
                        );
                    } else {
                        consecutiveUnpaid = 0;
                    }
                }

                const pendingDues = duesSorted.filter((d: Dues) => !d.paid);
                const pendingAmount = pendingDues.reduce(
                    (sum: number, d: Dues) => sum + d.total,
                    0
                );

                if (pendingAmount <= 0) return null;

                return {
                    customerId: loan.customer?._id,
                    customerName: loan.customer?.name,
                    phone: loan.customer?.phone,
                    loanId: loan._id,
                    pendingAmount,
                    arrear2Weeks: maxConsecutiveUnpaid >= 2, // ✅ CORE FLAG
                };
            })
            .filter(Boolean);

        return NextResponse.json({
            success: true,
            pending: pendingList,
        });
    } catch (error) {
        console.error("Pending API Error:", error);
        return NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
        );
    }
}
