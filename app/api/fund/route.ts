import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import Loan from "@/models/Loan";
import User from "@/models/User";
import Client from "@/models/Client";
import Scheme from "@/models/Scheme";
import Group from "@/models/Group";

const secret = process.env.NEXTAUTH_SECRET!;

interface Filter {
    branch: string;
    createdAt?: { $gte?: Date; $lt?: Date };
    status?: string;
}

/* -----------------------------------------------
   Populate Fields
------------------------------------------------ */
const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "customer", select: "customerCode name phone", model: Client },
    { path: "scheme", select: "schemeName", model: Scheme },
    { path: "group", select: "groupName", model: Group },
];

/* -----------------------------------------------
   GET — Fetch Loans (optional month filter)
------------------------------------------------ */
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const token = await getToken({ req, secret });

        if (!token?.branch)
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month");
        const status = searchParams.get("status");

        const filter: Filter = {
            branch: token.branch?._id,
        };

        /* Month filter (YYYY-MM) */
        if (month) {
            const start = new Date(`${month}-01`);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);

            filter.createdAt = {
                $gte: start,
                $lt: end,
            };
        }

        if (status === "ACTIVE") {
            filter.status = "APPROVED";
        }

        const loans = await Loan.find(filter)
            .populate(populateFields)
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            loans,
            count: loans.length,
        });

    } catch (err) {
        console.error("Loan GET error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to fetch loans" },
            { status: 500 }
        );
    }
}

/* -----------------------------------------------
   POST — Create Loan (First-loan fee logic)
------------------------------------------------ */

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const token = await getToken({ req, secret });
        if (!token)
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        const {
            customer,
            scheme,
            employee,
            group,
            phone,
            dues,
            loanDate,
            firstDueDate,
            maturedDate,
            loanType,
            loanPurpose,
            loanAmount,
        } = body;

        /* ---------------- VALIDATION ---------------- */
        if (!customer || !scheme || !employee || !loanAmount || !firstDueDate)
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );

        /* ---------------- CUSTOMER ---------------- */
        const client = await Client.findById(customer).lean();
        if (!client)
            return NextResponse.json(
                { success: false, error: "Customer not found" },
                { status: 404 }
            );

        /* ---------------- ACTIVE LOAN CHECK ---------------- */
        const activeLoan = await Loan.findOne({
            customer,
            status: { $nin: ["REPAID", "REJECTED", "MISSING"] },
        });

        if (activeLoan) {
            return NextResponse.json(
                { success: false, error: "Customer already has an active loan" },
                { status: 400 }
            );
        }

        /* ---------------- FIRST LOAN CHECK ---------------- */
        /*const previousLoan = await Loan.findOne({ customer }).lean();
        const isFirstLoan = !previousLoan;*/

        /* ---------------- MF LOAN ID ---------------- */
        const PREFIX = "MF-";
        const branchId = token.branch?._id;
        const lastLoan = await Loan.findOne({ branch: branchId })
            .sort({ createdAt: -1 })
            .lean() as { mfLoanId?: string };

        let nextNo = 1;
        if (lastLoan?.mfLoanId) {
            const n = parseInt(lastLoan.mfLoanId.replace(PREFIX, ""), 10);
            if (!isNaN(n)) nextNo = n + 1;
        }

        const mfLoanId = PREFIX + String(nextNo).padStart(6, "0");

        /* ---------------- CREATE LOAN ---------------- */
        const loan = await Loan.create({
            mfLoanId,
            customer,
            scheme,
            employee,
            group,
            phone,

            loanDate,
            firstDueDate,
            maturedDate,

            loanType,
            loanPurpose,
            loanAmount,

            dues,
            status: "PENDING",

            branch: token.branch?._id,
        });

        /* ---------------- FIRST LOAN FEES ---------------- */
        /*if (isFirstLoan) {
            const schemeDoc = await Scheme.findById(scheme).lean();

            const admissionFee = Number(schemeDoc?.applicationFees || 0);
            const insuranceFee = Number(schemeDoc?.insuranceFees || 0);

            const creditBase = {
                date: new Date(),
                mode: "Cash",
                status: "APPROVED",
                approvedBy: token.id,
                approvedAt: new Date(),
                branch: token.branch?._id,
                employee: token.id,
            };

            if (admissionFee > 0) {
                await Credit.create({
                    ...creditBase,
                    title: "Admission Fees",
                    details: `Admission fee for ${client.name} (${client.customerCode})`,
                    amount: admissionFee,
                });
            }

            if (insuranceFee > 0) {
                await Credit.create({
                    ...creditBase,
                    title: "Insurance Fees",
                    details: `Insurance fee for ${client.name} (${client.customerCode})`,
                    amount: insuranceFee,
                });
            }
        }*/

        return NextResponse.json(
            { success: true, loan },
            { status: 201 }
        );

    } catch (error) {
        console.error("Provide Loan Error:", error);
        return NextResponse.json(
            { success: false, error: "Loan creation failed" },
            { status: 500 }
        );
    }
}
