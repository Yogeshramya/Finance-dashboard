"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Debit } from "@/types/debit";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function DebitApprovalPage() {
    const [debits, setDebits] = useState<Debit[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDebits();
    }, []);

    const fetchDebits = async () => {
        try {
            const res = await fetch("/api/debit/pending");
            const data = await res.json();
            setDebits(data.debits || []);
        } catch {
            toast.error("Failed to load debit approvals");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p className="text-center mt-10">Loading pending debits...</p>;
    }

    return (
        <section className="max-w-7xl mx-auto space-y-6 p-4">
            <PageHeader />
            <h1 className="text-2xl font-bold text-red-600">
                Debit Approvals
            </h1>

            <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[70vh] overflow-y-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-red-600 text-white">
                            <tr>
                                <th className="p-3 border">Date</th>
                                <th className="p-3 border">Title</th>
                                <th className="p-3 border">Amount</th>
                                <th className="p-3 border">Mode</th>
                                <th className="p-3 border">Entered By</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {debits.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-gray-500">
                                        No debits awaiting approval
                                    </td>
                                </tr>
                            )}

                            {debits.map((d) => (
                                <tr key={d._id} className="hover:bg-gray-50">
                                    <td className="p-3 border text-center">
                                        {new Date(d.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 border">{d.title}</td>
                                    <td className="p-3 border text-center font-semibold">
                                        ₹ {d.amount.toLocaleString()}
                                    </td>
                                    <td className="p-3 border text-center">{d.mode}</td>
                                    <td className="p-3 border">
                                        {d.employee?.name || "—"}
                                    </td>

                                    <td className="p-3 border text-center">
                                        <span className="px-3 py-1 rounded bg-yellow-500 text-white font-medium">
                                            PENDING
                                        </span>
                                    </td>

                                    <td className="p-3 border text-center">
                                        <Button
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/approval/debit/${d._id}`
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
