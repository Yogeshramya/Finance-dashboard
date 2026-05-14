"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SavingsApproval {
    _id: string;
    savingsAmount: number;
    createdAt: string;
    status: "PENDING" | "APPROVED" | "REJECTED";

    customer: {
        _id: string;
        name: string;
        phone: string;
    };

    loan?: {
        _id: string;
        mfLoanId?: string;
        group?: {
            groupName: string;
        };
    };

    requestedBy: {
        name: string;
    };
}

export default function SavingsApprovalPage() {
    const [records, setRecords] = useState<SavingsApproval[]>([]);
    const [loading, setLoading] = useState(false);

    /* ---------- LOAD APPROVALS ---------- */
    useEffect(() => {
        loadApprovals();
    }, []);

    async function loadApprovals() {
        try {
            setLoading(true);
            const res = await fetch("/api/savings/approval");
            const data = await res.json();
            setRecords(data.records || []);
        } catch {
            toast.error("Failed to load approvals");
        } finally {
            setLoading(false);
        }
    }

    /* ---------- ACTIONS ---------- */
    async function handleApprove(id: string) {
        try {
            await fetch("/api/savings/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            toast.success("Savings approved");
            loadApprovals();
        } catch {
            toast.error("Approval failed");
        }
    }

    async function handleReject(id: string) {
        try {
            await fetch("/api/savings/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            toast.success("Savings rejected");
            loadApprovals();
        } catch {
            toast.error("Rejection failed");
        }
    }

    return (
        <section className="max-w-7xl mx-auto space-y-8">
            <PageHeader />

            <h1 className="text-3xl font-bold text-green-600">
                Savings Return Approval
            </h1>

            {loading && (
                <p className="text-center text-green-600">
                    Loading approvals...
                </p>
            )}

            {!loading && records.length === 0 && (
                <p className="text-center text-gray-500">
                    No pending approvals
                </p>
            )}

            {records.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[70vh] overflow-y-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-green-600 text-white">
                                <tr>
                                    <th className="p-3 border">Customer</th>
                                    <th className="p-3 border">Group</th>
                                    <th className="p-3 border">Requested By</th>
                                    <th className="p-3 border">Date</th>
                                    <th className="p-3 border">Amount</th>
                                    <th className="p-3 border">Status</th>
                                    <th className="p-3 border">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map((r) => (
                                    <tr key={r._id} className="hover:bg-gray-50">

                                        {/* Customer */}
                                        <td className="p-3 border">
                                            {r.customer?.name}
                                        </td>

                                        {/* Group */}
                                        <td className="p-3 border">
                                            {r.loan?.group?.groupName || "-"}
                                        </td>

                                        {/* Requested By */}
                                        <td className="p-3 border text-center">
                                            {r.requestedBy?.name}
                                        </td>

                                        {/* Date */}
                                        <td className="p-3 border text-center">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </td>

                                        {/* Amount */}
                                        <td className="p-3 border text-center font-semibold">
                                            ₹{r.savingsAmount?.toLocaleString()}
                                        </td>

                                        {/* Status */}
                                        <td className="p-3 border text-center font-semibold">
                                            {r.status === "PENDING" && (
                                                <span className="text-yellow-600">Pending</span>
                                            )}
                                            {r.status === "APPROVED" && (
                                                <span className="text-green-600">Approved</span>
                                            )}
                                            {r.status === "REJECTED" && (
                                                <span className="text-red-600">Rejected</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3 border text-center space-x-2">
                                            {r.status === "PENDING" ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprove(r._id)}
                                                    >
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleReject(r._id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
}
