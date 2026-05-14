"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loan } from "@/types/fund";
import { toast } from "sonner";

export default function ApprovalTable() {
    const router = useRouter();

    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPendingLoans() {
            try {
                const res = await fetch("/api/fund/approvals", {
                    cache: "no-store",
                });

                const data = await res.json();

                if (!data.success) {
                    throw new Error("Failed to fetch");
                }

                setLoans(data.loans);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load pending approvals");
            } finally {
                setLoading(false);
            }
        }

        fetchPendingLoans();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-500">
                Loading pending approvals...
            </div>
        );
    }

    return (
        <div className="border rounded-lg shadow-sm bg-white">

            {/* SCROLL CONTAINER */}
            <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">

                <table className="w-full min-w-[900px] border-collapse">
                    <thead className="bg-blue-600 text-white sticky top-0 z-10">
                        <tr>
                            <th className="p-3 border">MF Loan ID</th>
                            <th className="p-3 border">Customer Name</th>
                            <th className="p-3 border">Loan Amount</th>
                            <th className="p-3 border">Group</th>
                            <th className="p-3 border">Scheme</th>
                            <th className="p-3 border">Date</th>
                            <th className="p-3 border">Status</th>
                            <th className="p-3 border">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loans.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="p-6 text-center text-gray-500"
                                >
                                    No loans awaiting approval
                                </td>
                            </tr>
                        )}

                        {loans.map((loan) => (
                            <tr
                                key={loan._id}
                                className="hover:bg-gray-100 transition"
                            >
                                <td className="p-3 border text-center">
                                    {loan.mfLoanId}
                                </td>

                                <td className="p-3 border">
                                    {loan.customer?.name || "-"}
                                </td>

                                <td className="p-3 border text-center">
                                    ₹ {loan.loanAmount?.toLocaleString()}
                                </td>

                                <td className="p-3 border text-center">
                                    {loan.group?.groupName || "-"}
                                </td>

                                <td className="p-3 border text-center">
                                    {loan.scheme?.schemeName || "-"}
                                </td>

                                <td className="p-3 border text-center">
                                    {loan.loanDate
                                        ? new Date(loan.loanDate).toLocaleDateString()
                                        : "-"}
                                </td>

                                <td className="p-3 border text-center">
                                    <span className="px-3 py-1 rounded bg-yellow-500 text-white text-xs font-semibold">
                                        PENDING
                                    </span>
                                </td>

                                <td className="p-3 border text-center">
                                    <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/approval/fund/${loan._id}`
                                            )
                                        }
                                    >
                                        Review
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}
