"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LoanEntry {
    loanId: string;
    customerName: string;
    weekNo: number;
    paidAmount: number;
    principal: number;
    interest: number;
    savings: number;
    present: boolean;
}

interface Bill {
    _id: string;
    weekNo: number;
    totalCollected: number;
    collectedAt: string;
    employee?: { name: string };
    group?: { groupName: string };
    loans: LoanEntry[];
}

export default function BillReviewPage() {
    const { id } = useParams();
    const router = useRouter();

    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBill();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchBill = async () => {
        try {
            const res = await fetch(`/api/bill/${id}`);
            const data = await res.json();

            if (!data.success) {
                toast.error("Failed to load bill");
                return;
            }

            setBill(data.bill);
        } catch {
            toast.error("Failed to load bill");
        } finally {
            setLoading(false);
        }
    };

    async function approveBill() {
        const res = await fetch(`/api/bill/${id}/approve`, {
            method: "POST",
        });

        if (res.ok) {
            toast.success("Bill approved successfully");
            router.push("/dashboard/approval/bill");
        } else {
            toast.error("Failed to approve bill");
        }
    }

    async function rejectBill() {
        const res = await fetch(`/api/bill/${id}/reject`, {
            method: "POST",
        });

        if (res.ok) {
            toast.success("Bill rejected");
            router.push("/dashboard/approval/bill");
        } else {
            toast.error("Failed to reject bill");
        }
    }

    if (loading) {
        return <p className="text-center mt-10">Loading bill...</p>;
    }

    if (!bill) {
        return <p className="text-center mt-10">Bill not found</p>;
    }

    return (
        <section className="max-w-7xl mx-auto p-6 space-y-6">
            <PageHeader />

            <h1 className="text-2xl font-bold text-orange-600">
                Bill Review
            </h1>

            {/* Bill Info */}
            <Card className="p-6 grid md:grid-cols-4 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Group</p>
                    <p className="font-semibold">{bill.group?.groupName}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Week No</p>
                    <p className="font-semibold">{bill.weekNo}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Entered By</p>
                    <p className="font-semibold">{bill.employee?.name}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold">
                        {new Date(bill.collectedAt).toLocaleDateString()}
                    </p>
                </div>
            </Card>

            {/* Members Table */}
            <Card className="p-6">
                <div className="overflow-auto border rounded">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="p-2 border">Customer</th>
                                <th className="p-2 border">Loan ID</th>
                                <th className="p-2 border">Week</th>
                                <th className="p-2 border">Principal</th>
                                <th className="p-2 border">Interest</th>
                                <th className="p-2 border">Savings</th>
                                <th className="p-2 border">Paid</th>
                                <th className="p-2 border">Present</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bill.loans.map((l, i) => (
                                <tr key={i} className="text-center">
                                    <td className="border p-2">
                                        {l.customerName}
                                    </td>

                                    <td className="border p-2">
                                        {l.loanId}
                                    </td>

                                    <td className="border p-2">
                                        {bill.weekNo}
                                    </td>

                                    <td className="border p-2">
                                        ₹{l.principal}
                                    </td>

                                    <td className="border p-2">
                                        ₹{l.interest}
                                    </td>

                                    <td className="border p-2">
                                        ₹{l.savings}
                                    </td>

                                    <td className="border p-2 font-bold text-green-700">
                                        ₹{l.paidAmount}
                                    </td>

                                    <td className="border p-2">
                                        {l.present ? "YES" : "NO"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Summary */}
            <Card className="p-6 flex justify-between items-center">
                <div className="text-lg font-bold">
                    Total Collected: ₹{bill.totalCollected}
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="destructive"
                        onClick={rejectBill}
                    >
                        Reject
                    </Button>

                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={approveBill}
                    >
                        Approve Bill
                    </Button>
                </div>
            </Card>
        </section>
    );
}