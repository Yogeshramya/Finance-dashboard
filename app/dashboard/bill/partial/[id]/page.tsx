"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dues, Loan } from "@/types/fund";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

export default function PartialBillEntryPage() {
    const { id } = useParams<{ id: string }>();

    const [loan, setLoan] = useState<Loan | null>(null);

    const [selectedDue, setSelectedDue] = useState<Dues | null>(null);
    const [amount, setAmount] = useState(0);

    const [principalPay, setPrincipalPay] = useState(0);
    const [interestPay, setInterestPay] = useState(0);
    const [savingsPay, setSavingsPay] = useState(0);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/fund/${id}`)
            .then(r => r.json())
            .then(d => setLoan(d.loan));
    }, [id]);

    if (!loan) return null;

    /* ================= OPEN MODAL ================= */

    function openModal(due: Dues, weekNo: number) {
        setSelectedDue({ ...due, weekNo } as Dues);
        setAmount(0);
        setPrincipalPay(0);
        setInterestPay(0);
        setSavingsPay(0);
    }

    /* ================= LIVE CALC ================= */

    function handleAmountChange(value: number) {
        if (!selectedDue) return;

        const safe = (v: number) => Number(v) || 0;

        const principalRemaining =
            safe(selectedDue.principal) - safe(selectedDue.principalPaid);

        const interestRemaining =
            safe(selectedDue.interest) - safe(selectedDue.interestPaid);

        const savingsRemaining =
            safe(selectedDue.savings) - safe(selectedDue.savingsPaid);

        let payment = Math.max(
            0,
            Math.min(value, principalRemaining + interestRemaining + savingsRemaining)
        );

        setAmount(payment);

        // Distribution: Principal → Interest → Savings
        const pPay = Math.min(payment, principalRemaining);
        payment -= pPay;

        const iPay = Math.min(payment, interestRemaining);
        payment -= iPay;

        const sPay = Math.min(payment, savingsRemaining);

        setPrincipalPay(pPay);
        setInterestPay(iPay);
        setSavingsPay(sPay);
    }

    /* ================= SUBMIT ================= */

    async function submit() {
        if (!selectedDue || !loan) return;

        const res = await fetch("/api/bill/partial", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                loanId: loan._id,
                customerName: loan.customer?.name || "",
                weekNo: selectedDue.weekNo,
                paidAmount: amount,
            }),
        });

        if (res.ok) {
            toast.success("Partial Payment Added");
            setSelectedDue(null);
            location.reload();
        } else {
            toast.error("Failed");
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <PageHeader />
            <h1 className="text-2xl font-bold text-orange-600">
                Partial Bill Entry
            </h1>

            <Card className="p-4">
                <p><strong>Customer:</strong> {loan.customer?.name}</p>
                <p><strong>Loan ID:</strong> {loan.mfLoanId}</p>
            </Card>

            {/* ================= DUES TABLE ================= */}

            <Card className="p-4">
                <h2 className="font-semibold mb-4">All Dues</h2>

                <table className="w-full text-sm text-center border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Week</th>
                            <th className="p-2 border">Principal</th>
                            <th className="p-2 border">Interest</th>
                            <th className="p-2 border">Savings</th>
                            <th className="p-2 border">Remaining</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loan.dues.map((d, index) => {
                            const isFullyPaid = Boolean(d.paid && d.paidAt);

                            const remaining = isFullyPaid
                                ? 0
                                : (
                                    (Number(d.principal) - Number(d.principalPaid || 0)) +
                                    (Number(d.interest) - Number(d.interestPaid || 0)) +
                                    (Number(d.savings) - Number(d.savingsPaid || 0))
                                );
                            return (
                                <tr key={index}>
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2">₹{d.principal}</td>
                                    <td className="border p-2">₹{d.interest}</td>
                                    <td className="border p-2">₹{d.savings}</td>
                                    <td className="border p-2 text-red-600">
                                        ₹{remaining}
                                    </td>
                                    <td className="border p-2">
                                        {!d.paidAt && (
                                            <Button
                                                size="sm"
                                                onClick={() => openModal(d, index + 1)}
                                            >
                                                Partial
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>

            {/* ================= MODAL ================= */}

            {selectedDue && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                        <h2 className="text-lg font-semibold">
                            Partial Payment - Week {selectedDue.weekNo}
                        </h2>

                        <input
                            type="number"
                            value={amount}
                            onChange={(e) =>
                                handleAmountChange(Number(e.target.value))
                            }
                            className="w-full border p-2 rounded"
                            placeholder="Enter Amount"
                        />

                        <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                            <p>Principal: ₹{principalPay}</p>
                            <p>Interest: ₹{interestPay}</p>
                            <p>Savings: ₹{savingsPay}</p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                className="w-full"
                                onClick={submit}
                            >
                                Confirm
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setSelectedDue(null)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}