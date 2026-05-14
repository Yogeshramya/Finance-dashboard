"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import { PendingDuesResponse, PendingLoanItem } from "@/types/fund";

export default function PendingDuesPage() {
    const params = useParams();
    const customerId = params?.customerId as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PendingDuesResponse | null>(null);

    /* ---------------- Fetch Pending Dues ---------------- */
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(
                    `/api/fund/pending/items?customerId=${customerId}`,
                    { cache: "no-store" }
                );

                const json = await res.json();

                if (!json.success) {
                    toast.error(json.error || "Failed to load dues");
                } else {
                    setData(json.data);
                }
            } catch {
                toast.error("Error fetching dues");
            } finally {
                setLoading(false);
            }
        }

        if (customerId) load();
    }, [customerId]);

    /* ---------------- UI States ---------------- */
    if (loading) {
        return <p className="text-center mt-10">Loading dues...</p>;
    }

    if (!data) {
        return <p className="text-center mt-10">No dues found</p>;
    }

    /* ---------------- Render ---------------- */
    return (
        <section className="max-w-6xl mx-auto space-y-6 p-6">
            <PageHeader />

            <h1 className="text-2xl font-bold text-blue-700">
                Loan Dues Details
            </h1>

            {/* -------- Customer Info -------- */}
            <Card>
                <CardContent className="space-y-1 p-4">
                    <p><strong>Name:</strong> {data.customer.name}</p>
                    <p><strong>Phone:</strong> {data.customer.phone}</p>
                    <p><strong>Loan ID:</strong> {data.loan.mfLoanId}</p>
                </CardContent>
            </Card>

            {/* -------- Dues Table -------- */}
            <Card>
                <CardContent className="overflow-x-auto p-0">
                    <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2 border text-left">Week</th>
                                <th className="p-2 border text-right">Principal</th>
                                <th className="p-2 border text-right">Interest</th>
                                <th className="p-2 border text-right">Savings</th>
                                <th className="p-2 border text-right">Total</th>
                                <th className="p-2 border text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.pendingDues.map((d: PendingLoanItem) => (
                                <tr
                                    key={d._id}
                                    className={
                                        d.paid
                                            ? "bg-green-50 text-gray-600"
                                            : "hover:bg-blue-50"
                                    }
                                >
                                    <td className="p-2 border font-medium">
                                        Week {d.weekNo}
                                    </td>
                                    <td className="p-2 border text-right">
                                        ₹{d.principal}
                                    </td>
                                    <td className="p-2 border text-right">
                                        ₹{d.interest}
                                    </td>
                                    <td className="p-2 border text-right">
                                        ₹{d.savings}
                                    </td>
                                    <td className="p-2 border text-right font-semibold">
                                        ₹{d.total}
                                    </td>
                                    <td className="p-2 border text-center">
                                        {d.paid ? (
                                            <span className="text-green-600 font-semibold">
                                                PAID
                                            </span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">
                                                PENDING
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </section>
    );
}
