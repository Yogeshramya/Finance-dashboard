import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import { Dues } from "@/types/fund";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const loan = await Loan.findById(id);
        if (!loan) {
            return new Response(
                JSON.stringify({ error: "Loan not found" }),
                { status: 404 }
            );
        }

        const allPaid = loan.dues.every((d: Dues) => d.paid === true);

        if (!allPaid) {
            return new Response(
                JSON.stringify({ error: "Not all dues are paid. Cannot close loan." }),
                { status: 400 }
            );
        }

        loan.status = "REPAID";
        await loan.save();

        return new Response(
            JSON.stringify({ success: true, message: "Loan closed successfully" }),
            { status: 200 }
        );
    } catch (err) {
        console.error("Close Loan Error:", err);
        return new Response(
            JSON.stringify({ error: "Server error" }),
            { status: 500 }
        );
    }
}
