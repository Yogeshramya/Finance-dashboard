import { connectDB } from "@/lib/db";
import Loan from "@/models/Loan";
import User from "@/models/User";
import Scheme from "@/models/Scheme";
import Client from "@/models/Client";
import Group from "@/models/Group";

const populateFields = [
    { path: "employee", select: "name", model: User },
    { path: "scheme", select: "schemeName", model: Scheme },
    { path: "customer", select: "customerCode name phone nominee.name nominee.phone nominee.relation", model: Client },
    { path: "group", select: "_id groupName employee.name", model: Group },
];

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get("groupId");

        if (!groupId) {
            return new Response(JSON.stringify({ error: "groupId is required" }), {
                status: 400
            });
        }

        const loans = await Loan.find({
            group: groupId,
            status: "APPROVED"
        }).populate(populateFields).lean();

        if (!loans.length) {
            return new Response(JSON.stringify({ error: "No loans found!" }), {
                status: 404
            });
        }

        return new Response(JSON.stringify({ loans }), { status: 200 });
    } catch (err) {
        console.error("Loans API Error:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500
        });
    }
}
