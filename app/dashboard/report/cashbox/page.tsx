"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import LoadingOverlay from "@/components/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Denomination {
    note: number;
    count: number;
    total: number;
}

interface CashBox {
    _id: string;
    date: string;
    openingBalance: number;
    closingBalance: number;
    denomination: Denomination[];
    createdAt: string;
}

export default function ApprovedCashBoxReport() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [cashboxes, setCashboxes] = useState<CashBox[]>([]);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/cashbox/last");
                const json = await res.json();

                if (!json.success || !json.cashboxes?.length) {
                    toast.error("No approved cashbox found");
                    setCashboxes([]);
                    return;
                }

                setCashboxes(json.cashboxes);
            } catch (err) {
                toast.error("Failed to load approved cashboxes");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const format = (n: number) => Number(n || 0).toFixed(2);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <LoadingOverlay show={loading} />
            <PageHeader />

            <h1 className="text-xl font-bold text-center text-gray-700">
                APPROVED CASHBOX REPORT (LAST 5)
            </h1>

            {session?.user?.branch && (
                <p className="text-center text-sm text-gray-600">
                    Branch: {session.user.branch.name}
                </p>
            )}

            {cashboxes.length === 0 ? (
                <p className="text-center text-gray-400 py-10">
                    No approved cashbox available
                </p>
            ) : (
                cashboxes.map((cashbox, idx) => (
                    <Card key={cashbox._id} className="border">
                        <CardContent className="space-y-4">
                            <p className="text-center text-xs text-gray-500">
                                #{idx + 1} | Approved Date:{" "}
                                {new Date(cashbox.date)
                                    .toISOString()
                                    .split("T")[0]}
                            </p>

                            {/* Balances */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <BalanceCard
                                    title="Opening Balance"
                                    amount={cashbox.openingBalance}
                                />
                                <BalanceCard
                                    title="Closing Balance"
                                    amount={cashbox.closingBalance}
                                />
                            </div>

                            {/* Denomination */}
                            <Card>
                                <CardContent>
                                    <h3 className="font-semibold text-center mb-2">
                                        Cash Denomination
                                    </h3>

                                    <table className="w-full text-sm border">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="border p-1">Note</th>
                                                <th className="border p-1">Count</th>
                                                <th className="border p-1">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cashbox.denomination.map((d, i) => (
                                                <tr key={i} className="text-center">
                                                    <td className="border p-1">
                                                        {d.note === 1
                                                            ? "Coins"
                                                            : `₹${d.note}`}
                                                    </td>
                                                    <td className="border p-1">
                                                        {d.count}
                                                    </td>
                                                    <td className="border p-1 font-medium">
                                                        ₹{format(d.total)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <p className="text-right font-bold mt-2 text-blue-700">
                                        TOTAL CASH: ₹
                                        {format(cashbox.closingBalance)}
                                    </p>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

/* ---------------- Components ---------------- */

function BalanceCard({
    title,
    amount,
}: {
    title: string;
    amount: number;
}) {
    return (
        <Card className="border-2 border-blue-500">
            <CardContent className="text-center p-4">
                <p className="font-medium text-blue-600">{title}</p>
                <p className="text-xl font-bold">
                    ₹{Number(amount).toFixed(2)}
                </p>
            </CardContent>
        </Card>
    );
}
