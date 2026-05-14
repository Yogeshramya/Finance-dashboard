"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

interface LoanProps {
    loanId: string;
    customerName: string;
    principal: number;
    interest?: number;
    savings?: number;
    paidAmount?: number;
}

interface Bill {
    _id: string;
    group?: { groupName: string };
    loans: LoanProps[];
    totalCollected: number;
    collectedAt: string;
    employee?: { name: string };
    branch?: { name: string };
}

export default function PreCloseApprovalList() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    /* ---------------- FETCH PENDING PRECLOSE BILLS ---------------- */

    useEffect(() => {
        fetch("/api/bill/preclose/pending")
            .then((r) => r.json())
            .then((res) => {
                if (res.success) {
                    setBills(res.bills);
                } else {
                    toast.error("Failed to load approvals");
                }
            })
            .catch(() => toast.error("Server error"));
    }, []);

    /* ---------------- APPROVE ---------------- */

    async function approve(id: string) {
        setLoadingId(id);

        const res = await fetch(`/api/bill/preclose/${id}/approve`, {
            method: "POST",
        });

        const data = await res.json();
        setLoadingId(null);

        if (data.success) {
            toast.success("Pre-close approved");
            setBills((prev) => prev.filter((b) => b._id !== id));
        } else {
            toast.error(data.error || "Approval failed");
        }
    }

    /* ---------------- REJECT ---------------- */

    async function reject(id: string) {
        setLoadingId(id);

        const res = await fetch(`/api/bill/preclose/${id}/reject`, {
            method: "POST",
        });

        const data = await res.json();
        setLoadingId(null);

        if (data.success) {
            toast.success("Pre-close rejected");
            setBills((prev) => prev.filter((b) => b._id !== id));
        } else {
            toast.error(data.error || "Rejection failed");
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-6">
            <PageHeader />

            <h1 className="text-2xl font-bold">Pre-Close Approvals</h1>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <Th>Loan ID</Th>
                                <Th>Customer</Th>
                                <Th>Group</Th>
                                <Th>Collected By</Th>
                                <Th>Branch</Th>
                                <Th>Date</Th>
                                <Th align="right">Amount</Th>
                                <Th align="center">Actions</Th>
                            </tr>
                        </thead>

                        <tbody>
                            {bills.length ? (
                                bills.map((b) => {
                                    const loan = b.loans?.[0];

                                    return (
                                        <tr
                                            key={b._id}
                                            className="border-b last:border-none hover:bg-gray-50"
                                        >
                                            <Td>{loan?.loanId || "—"}</Td>

                                            <Td>{loan?.customerName || "—"}</Td>

                                            <Td>{b.group?.groupName || "—"}</Td>

                                            <Td>{b.employee?.name || "—"}</Td>

                                            <Td>{b.branch?.name || "—"}</Td>

                                            <Td>
                                                {new Date(
                                                    b.collectedAt
                                                ).toLocaleDateString()}
                                            </Td>

                                            <Td
                                                align="right"
                                                className="font-semibold"
                                            >
                                                ₹
                                                {b.totalCollected.toLocaleString()}
                                            </Td>

                                            <Td align="center">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            approve(b._id)
                                                        }
                                                        disabled={
                                                            loadingId === b._id
                                                        }
                                                    >
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            reject(b._id)
                                                        }
                                                        disabled={
                                                            loadingId === b._id
                                                        }
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </Td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="py-10 text-center text-gray-500"
                                    >
                                        No pending pre-close approvals
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}

/* ---------------- TABLE UTILS ---------------- */

function Th({
    children,
    align = "left",
}: {
    children: React.ReactNode;
    align?: "left" | "right" | "center";
}) {
    return (
        <th
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 text-${align}`}
        >
            {children}
        </th>
    );
}

function Td({
    children,
    align = "left",
    className = "",
}: {
    children: React.ReactNode;
    align?: "left" | "right" | "center";
    className?: string;
}) {
    return (
        <td className={`px-4 py-3 text-${align} ${className}`}>{children}</td>
    );
}