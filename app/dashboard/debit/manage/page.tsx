"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Debit } from "@/types/debit";

export default function ManageDebit() {
    const [debits, setDebits] = useState<Debit[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const router = useRouter();
    const limit = 10;

    // ---------------- FETCH ----------------
    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/debit?page=${page}&limit=${limit}`);
            const data = await res.json();

            if (!data.debits) return;
            setDebits(data.debits);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load debit entries");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    // ---------------- DELETE ----------------
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure to delete this entry?")) return;

        const res = await fetch(`/api/debit/${id}`, { method: "DELETE" });
        const result = await res.json();

        if (result.success) {
            toast.success("Deleted Successfully!");
            loadData();
        } else {
            toast.error(result.error || "Failed to delete!");
        }
    };

    // ---------------- STATS ----------------
    const stats = useMemo(() => {
        let approvedTotal = 0;
        let pendingTotal = 0;
        let cash = 0;
        let bank = 0;

        debits.forEach((d) => {
            if (d.status === "APPROVED") {
                approvedTotal += d.amount;
                if (d.mode === "Cash") cash += d.amount;
                if (d.mode === "Bank") bank += d.amount;
            }

            if (d.status === "PENDING") {
                pendingTotal += d.amount;
            }
        });

        return {
            count: debits.length,
            approvedTotal,
            pendingTotal,
            cash,
            bank,
        };
    }, [debits]);

    if (loading) {
        return (
            <p className="text-center mt-10">
                Loading debit entries...
            </p>
        );
    }

    return (
        <section className="max-w-7xl mx-auto space-y-8 p-4">
            <PageHeader />
            <h1 className="text-3xl font-bold text-red-600">
                MANAGE DEBITS
            </h1>

            {/* ---------------- STATS ---------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <p className="text-gray-500 text-sm">Total Entries</p>
                    <h2 className="text-xl font-bold">
                        {stats.count}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p className="text-gray-500 text-sm">Approved Total</p>
                    <h2 className="text-2xl font-bold text-green-600">
                        ₹ {stats.approvedTotal.toLocaleString()}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p className="text-gray-500 text-sm">Pending Total</p>
                    <h2 className="text-2xl font-bold text-yellow-600">
                        ₹ {stats.pendingTotal.toLocaleString()}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p className="text-gray-500 text-sm">
                        Cash / Bank (Approved)
                    </p>
                    <h2 className="font-bold text-blue-600">
                        ₹ {stats.cash.toLocaleString()}
                    </h2>
                    <p className="text-purple-600 font-medium">
                        ₹ {stats.bank.toLocaleString()}
                    </p>
                </Card>
            </div>

            {/* ---------------- TABLE ---------------- */}
            <Card className="p-6 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-2">Date</th>
                            <th className="p-2">Title</th>
                            <th className="p-2">Amount</th>
                            <th className="p-2">Mode</th>
                            <th className="p-2">Entered By</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {debits.map((item) => (
                            <tr
                                key={item._id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="p-2">
                                    {new Date(item.date).toLocaleDateString()}
                                </td>

                                <td className="p-2">{item.title}</td>

                                <td className="p-2 font-medium">
                                    ₹{item.amount.toLocaleString()}
                                </td>

                                <td className="p-2">{item.mode}</td>

                                <td className="p-2">
                                    {item.employee?.name || "N/A"}
                                </td>

                                <td className="p-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold text-white ${item.status === "APPROVED"
                                            ? "bg-green-600"
                                            : item.status === "PENDING"
                                                ? "bg-yellow-500"
                                                : "bg-red-600"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </td>

                                <td className="p-2 flex gap-2 justify-center">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/debit/${item._id}`
                                            )
                                        }
                                    >
                                        View
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        //disabled={item.status === "APPROVED"}
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/debit/edit/${item._id}`
                                            )
                                        }
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        //disabled={item.status === "APPROVED"}
                                        onClick={() =>
                                            handleDelete(item._id)
                                        }
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {debits.length === 0 && (
                    <p className="text-center py-3 text-gray-500">
                        No debit entries found
                    </p>
                )}

                {/* ---------------- PAGINATION ---------------- */}
                <div className="mt-4 flex justify-between">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </Button>

                    <Button
                        variant="outline"
                        disabled={debits.length < limit}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </Card>
        </section>
    );
}
