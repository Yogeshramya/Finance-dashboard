"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Credit } from "@/types/credit";

export default function ManageCredit() {
    const router = useRouter();

    const [credits, setCredits] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    const limit = 10;

    // ---------------- FETCH ----------------
    const fetchCredits = async () => {
        try {
            let url = `/api/credit?page=${page}&limit=${limit}`;
            if (start) url += `&start=${start}`;
            if (end) url += `&end=${end}`;

            const res = await fetch(url, { cache: "no-store" });
            const data = await res.json();

            setCredits(data.credits || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load credits");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchCredits();
    };

    // ---------------- DELETE ----------------
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;

        const res = await fetch(`/api/credit/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.success) {
            toast.success("Credit deleted!");
            fetchCredits();
        } else {
            toast.error(data.error || "Delete failed");
        }
    };

    // ---------------- STATS ----------------
    const stats = useMemo(() => {
        let approvedTotal = 0;
        let pendingTotal = 0;
        let cash = 0;
        let bank = 0;

        credits.forEach((c) => {
            if (c.status === "APPROVED") {
                approvedTotal += c.amount || 0;
                if (c.mode === "Cash") cash += c.amount;
                if (c.mode === "Bank") bank += c.amount;
            }

            if (c.status === "PENDING") {
                pendingTotal += c.amount || 0;
            }
        });

        return {
            count: credits.length,
            approvedTotal,
            pendingTotal,
            cash,
            bank,
        };
    }, [credits]);

    if (loading) {
        return <p className="text-center mt-10">Loading credits...</p>;
    }

    return (
        <section className="max-w-7xl mx-auto space-y-6 p-4">
            <PageHeader />
            <h1 className="text-2xl font-bold text-blue-600">
                Manage Credits
            </h1>

            {/* ---------------- FILTERS ---------------- */}
            <Card className="p-4 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col">
                    <label className="text-sm font-semibold">From</label>
                    <input
                        type="date"
                        className="border p-2 rounded"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-semibold">To</label>
                    <input
                        type="date"
                        className="border p-2 rounded"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                    />
                </div>

                <Button onClick={handleSearch} className="bg-blue-600">
                    Filter
                </Button>
            </Card>

            {/* ---------------- STATS ---------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                    <p>Total Entries</p>
                    <h2 className="text-xl font-bold">{stats.count}</h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Approved Total</p>
                    <h2 className="text-2xl font-bold text-green-600">
                        ₹{stats.approvedTotal.toLocaleString()}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Pending Total</p>
                    <h2 className="text-2xl font-bold text-yellow-600">
                        ₹{stats.pendingTotal.toLocaleString()}
                    </h2>
                </Card>

                <Card className="p-4 text-center">
                    <p>Cash / Bank (Approved)</p>
                    <h2 className="font-bold text-blue-600">
                        ₹{stats.cash.toLocaleString()}
                    </h2>
                    <span className="font-medium text-purple-600">
                        ₹{stats.bank.toLocaleString()}
                    </span>
                </Card>
            </div>

            {/* ---------------- TABLE ---------------- */}
            <Card className="p-4 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr className="border-b">
                            <th className="p-2">Date</th>
                            <th className="p-2">Title</th>
                            <th className="p-2">Amount</th>
                            <th className="p-2">Mode</th>
                            <th className="p-2">Employee</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {credits.map((item) => (
                            <tr
                                key={item._id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="p-2">
                                    {new Date(item.date).toLocaleDateString()}
                                </td>

                                <td className="p-2">{item.title}</td>

                                <td className="p-2 font-bold text-blue-700">
                                    ₹{item.amount.toLocaleString()}
                                </td>

                                <td className="p-2">{item.mode}</td>

                                <td className="p-2">
                                    {item.employee?.name || "—"}
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
                                        //disabled={item.status === "APPROVED"}
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/credit/${item._id}`
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
                                                `/dashboard/credit/edit/${item._id}`
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

                {!credits.length && (
                    <p className="text-center mt-3 text-gray-500">
                        No credits found
                    </p>
                )}
            </Card>

            {/* ---------------- PAGINATION ---------------- */}
            <div className="flex justify-between items-center mt-4">
                <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </Button>

                <span className="font-semibold">Page {page}</span>

                <Button
                    disabled={credits.length < limit}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>
            </div>
        </section>
    );
}
