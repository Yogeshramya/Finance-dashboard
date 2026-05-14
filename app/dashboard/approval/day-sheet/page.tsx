"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import LoadingOverlay from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CashBox {
    _id: string;
    date: string;
    openingBalance: number;
    closingBalance: number;
    branch?: { name: string };
    employee?: { name: string };
    status: "PENDING" | "APPROVED" | "REJECTED";
    approvedBy?: { name: string };
    approvedAt?: string;
    remarks?: string;
}

export default function DaySheetApprovalPage() {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<CashBox[]>([]);

    /* ---------------- LOAD CASHBOXES ---------------- */

    useEffect(() => {
        loadRecords();
    }, []);

    async function loadRecords() {
        try {
            setLoading(true);
            const res = await fetch("/api/cashbox/approval");
            const json = await res.json();

            if (!json.success) {
                toast.error("Failed to load approvals");
                return;
            }

            setRecords(json.records || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load approvals");
        } finally {
            setLoading(false);
        }
    }

    /* ---------------- ACTIONS ---------------- */

    async function handleApprove(id: string) {
        if (!confirm("Approve this day sheet?")) return;

        try {
            setLoading(true);
            const res = await fetch("/api/cashbox/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const json = await res.json();
            if (json.success) {
                toast.success("DaySheet approved");
                loadRecords();
            } else {
                toast.error(json.error || "Approval failed");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleReject(id: string) {
        const remarks = prompt("Reason for rejection?");
        if (!remarks) return;

        try {
            setLoading(true);
            const res = await fetch("/api/cashbox/reject", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, remarks }),
            });

            const json = await res.json();
            if (json.success) {
                toast.success("DaySheet rejected");
                loadRecords();
            } else {
                toast.error(json.error || "Rejection failed");
            }
        } finally {
            setLoading(false);
        }
    }

    /* ---------------- RENDER ---------------- */

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <LoadingOverlay show={loading} />
            <PageHeader />

            <h1 className="text-2xl font-bold text-center text-gray-700">
                DAY SHEET APPROVAL
            </h1>

            {records.length === 0 ? (
                <p className="text-center text-gray-400 py-10">
                    No day sheets found
                </p>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[70vh] overflow-y-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="p-3 border">Date</th>
                                    <th className="p-3 border">Branch</th>
                                    <th className="p-3 border">Employee</th>
                                    <th className="p-3 border">Opening</th>
                                    <th className="p-3 border">Closing</th>
                                    <th className="p-3 border">Status</th>
                                    <th className="p-3 border">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map(r => (
                                    <tr key={r._id} className="hover:bg-gray-50">
                                        <td className="p-3 border text-center">
                                            {new Date(r.date).toISOString().split("T")[0]}
                                        </td>

                                        <td className="p-3 border text-center">
                                            {r.branch?.name || "-"}
                                        </td>

                                        <td className="p-3 border text-center">
                                            {r.employee?.name || "-"}
                                        </td>

                                        <td className="p-3 border text-right">
                                            ₹{r.openingBalance.toFixed(2)}
                                        </td>

                                        <td className="p-3 border text-right">
                                            ₹{r.closingBalance.toFixed(2)}
                                        </td>

                                        <td className="p-3 border text-center font-semibold">
                                            {r.status === "PENDING" && (
                                                <span className="text-yellow-600">
                                                    Pending
                                                </span>
                                            )}
                                            {r.status === "APPROVED" && (
                                                <span className="text-green-600">
                                                    Approved
                                                </span>
                                            )}
                                            {r.status === "REJECTED" && (
                                                <span className="text-red-600">
                                                    Rejected
                                                </span>
                                            )}
                                        </td>

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
        </div>
    );
}
