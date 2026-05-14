"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function ArrearDetailPage() {
    const { id } = useParams();
    const [arrear, setArrear] = useState<ArrearRow | null>(null);
    const [amount, setAmount] = useState("");
    async function load() {
        const res = await fetch(`/api/arrear/${id}`);
        const data = await res.json();
        setArrear(data.arrear);
    }
    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function pay() {
        if (!amount) return;

        const res = await fetch("/api/arrear/pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                arrearLoanId: id,
                amount: Number(amount),
            }),
        });

        const data = await res.json();
        if (data.success) {
            toast.success("Payment recorded");
            setAmount("");
            load();
        } else {
            toast.error("Payment failed");
        }
    }

    if (!arrear) return <p>Loading…</p>;

    return (
        <section className="max-w-3xl mx-auto p-6 space-y-6">
            <PageHeader />
            <h1 className="text-2xl font-bold text-red-600">
                Arrear Loan – {arrear.mfLoanId}
            </h1>

            {/* SUMMARY */}
            <Card className="p-4 grid grid-cols-2 gap-4">
                <Info label="Total Amount" value={arrear.totalAmount} />
                <Info label="Remaining Amount" value={arrear.remainingAmount} />
                <Info label="Weeks" value={`${arrear.arrearFromWeek}–${arrear.arrearTillWeek}`} />
                <Info label="Status" value={arrear.status} />
            </Card>

            {/* PARTIAL PAYMENTS */}
            <Card className="p-4">
                <h2 className="font-semibold mb-2">Payment History</h2>

                {arrear.partialPayments.length ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Amount</th>
                                <th className="border p-2">Date</th>
                                <th className="border p-2">Collected By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {arrear.partialPayments.map((p: PartialPayment, i: number) => (
                                <tr key={i} className="text-center">
                                    <td className="border p-2">₹{p.amount}</td>
                                    <td className="border p-2">
                                        {new Date(p.paidAt).toLocaleDateString()}
                                    </td>
                                    <td className="border p-2">
                                        {p.collectedBy?.name || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500">No payments yet</p>
                )}
            </Card>

            {/* PAY */}
            {arrear.status === "OPEN" && (
                <Card className="p-4 flex gap-4">
                    <Input
                        //type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                    <Button onClick={pay} className="bg-red-600">
                        Pay
                    </Button>
                </Card>
            )}
        </section>
    );
}

function Info({ label, value }: { label: string; value: number | string }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-bold">₹{value}</p>
        </div>
    );
}