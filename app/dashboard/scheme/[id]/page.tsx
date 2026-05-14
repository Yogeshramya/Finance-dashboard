"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SchemeViewPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: session } = useSession();

    const [scheme, setScheme] = useState<Scheme | null>(null);
    const [loading, setLoading] = useState(true);
    const isManager = session?.user?.role === "MANAGER";

    /* ================= LOAD SCHEME ================= */
    useEffect(() => {
        async function loadScheme() {
            try {
                const res = await fetch(`/api/scheme/${id}`);
                const json = await res.json();

                if (!json.success) {
                    toast.error(json.error || "Failed to load scheme");
                    return;
                }

                setScheme(json.scheme);
            } catch {
                toast.error("Failed to load scheme");
            } finally {
                setLoading(false);
            }
        }

        loadScheme();
    }, [id]);

    /* ================= DELETE ================= */
    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this scheme?")) return;

        try {
            const res = await fetch(`/api/scheme/edit/${id}`, {
                method: "DELETE",
            });

            const json = await res.json();

            if (!json.success) {
                toast.error(json.error || "Delete failed");
                return;
            }

            toast.success("Scheme deleted");
            router.push("/dashboard/scheme/manage");
        } catch {
            toast.error("Delete failed");
        }
    }

    if (loading)
        return <p className="p-6 text-center text-gray-500">Loading…</p>;

    if (!scheme)
        return <p className="p-6 text-center text-red-600">Scheme not found</p>;

    return (
        <section className="max-w-4xl mx-auto space-y-6 p-6">
            <PageHeader />

            <h1 className="text-3xl font-bold text-blue-700">
                Scheme Details
            </h1>

            <Card className="p-6 space-y-3">
                <Detail label="Scheme ID" value={scheme.schemeId} />
                <Detail label="Scheme Name" value={scheme.schemeName} />
                <Detail label="Loan Type" value={scheme.loanType} />
                <Detail
                    label="Total Amount"
                    value={`₹${scheme.totalAmount.toLocaleString()}`}
                />
                <Detail label="Total Dues" value={scheme.dues} />

                {scheme.createdAt && (
                    <Detail
                        label="Created At"
                        value={new Date(scheme.createdAt).toLocaleDateString()}
                    />
                )}
            </Card>

            {/* ================= ROWS TABLE ================= */}
            {scheme.rows && scheme.rows.length > 0 && (
                <Card className="p-6 overflow-x-auto">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Scheme Breakdown
                    </h2>

                    <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">S.No</th>
                                <th className="border p-2">Principal</th>
                                <th className="border p-2">Interest</th>
                                <th className="border p-2">Savings</th>
                                <th className="border p-2">Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {scheme.rows.map((row, index) => (
                                <tr
                                    key={index}
                                    className="text-center hover:bg-gray-50"
                                >
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2">₹{row.principal}</td>
                                    <td className="border p-2">₹{row.interest}</td>
                                    <td className="border p-2">₹{row.savings}</td>
                                    <td className="border p-2 font-semibold">
                                        ₹{row.total}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* ================= ACTIONS ================= */}
            {isManager && (
                <div className="flex gap-4">
                    <Button
                        className="bg-blue-600"
                        onClick={() =>
                            router.push(
                                `/dashboard/scheme/edit/${scheme.schemeId}`
                            )
                        }
                    >
                        Edit
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </div>
            )}
        </section>
    );
}

/* ================= SMALL COMPONENT ================= */

function Detail({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
