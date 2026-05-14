import PageHeader from "@/components/PageHeader";
import ApprovalTable from "@/components/Funds/ApprovalTable";

export default function ApprovalPage() {
    return (
        <div className="max-w-6xl mx-auto py-10">
            <PageHeader />
            <h1 className="text-3xl font-bold text-blue-700 mb-8">
                Loan Approvals
            </h1>

            <ApprovalTable />
        </div>
    );
}
