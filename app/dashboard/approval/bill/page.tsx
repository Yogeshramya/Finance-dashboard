"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";
import { Bill } from "@/types/bill";

export default function BillApprovalPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await fetch("/api/bill/pending");
            const data = await res.json();

            if (!data.success) {
                toast.error("Failed to load bills");
                return;
            }

            setBills(data.bills || []);
        } catch {
            toast.error("Failed to load bills");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <p className="text-center mt-10">
                Loading pending bill approvals...
            </p>
        );
    }

    return (
        <section className="max-w-7xl mx-auto space-y-6 p-4">
            <PageHeader />

            <h1 className="text-2xl font-bold text-orange-600">
                Bill Approvals
            </h1>

            <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[70vh] overflow-y-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-orange-600 text-white">
                            <tr>
                                <th className="p-3 border">Date</th>
                                <th className="p-3 border">Type</th>
                                <th className="p-3 border">Group</th>
                                <th className="p-3 border">Week</th>
                                <th className="p-3 border">Members</th>
                                <th className="p-3 border">Collected</th>
                                <th className="p-3 border">Entered By</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bills.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="p-6 text-center text-gray-500"
                                    >
                                        No bills awaiting approval
                                    </td>
                                </tr>
                            )}

                            {bills.map((b) => (
                                <tr key={b._id} className="hover:bg-gray-50">
                                    <td className="p-3 border text-center">
                                        {new Date(
                                            b.collectedAt
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="p-3 border text-center">
                                        {b.type === "Normal"
                                            ? "Normal"
                                            : "Prebill"}
                                    </td>

                                    <td className="p-3 border text-center">
                                        {typeof b.group === "object" ? b.group?.groupName : b.group}
                                    </td>

                                    <td className="p-3 border text-center">
                                        {b.weekNo}
                                    </td>

                                    <td className="p-3 border text-center">
                                        {b.totalMembers}
                                    </td>

                                    <td className="p-3 border text-center font-bold">
                                        ₹{b.totalCollected}
                                    </td>

                                    <td className="p-3 border">
                                        {typeof b.employee === "object" ? b.employee?.name : b.employee}
                                    </td>

                                    <td className="p-3 border text-center">
                                        <span className="px-3 py-1 rounded bg-yellow-500 text-white">
                                            PENDING
                                        </span>
                                    </td>

                                    <td className="p-3 border text-center">
                                        <Button
                                            className="bg-orange-600 hover:bg-orange-700"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/approval/bill/${b._id}`
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
        </section>
    );
}