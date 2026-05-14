"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { PendingLoanItem } from "@/types/fund";

interface DueItem {
    weekNo?: number;
    principal: number;
    interest: number;
    savings?: number;
    total: number;
    paid: boolean;
}

interface LoanShape {
    _id: string;
    customer?: { _id?: string; name?: string; phone?: string } | null;
    loanAmount: number;
    status: string;
    dues: DueItem[];
}

export default function ViewLoanPage() {
    const { id } = useParams();

    const [loan, setLoan] = useState<LoanShape | null>(null);
    const [loading, setLoading] = useState(true);
    const [closing, setClosing] = useState(false);
    const [showPreclose, setShowPreclose] = useState(false);
    const [precloseAmount, setPrecloseAmount] = useState("");

    const pendingPrincipal = loan
        ? loan.dues
            .filter((d) => !d.paid)
            .reduce((s, d) => s + d.principal, 0)
        : 0;

    const pendingInterest = loan
        ? loan.dues
            .filter((d) => !d.paid)
            .reduce((s, d) => s + d.interest, 0)
        : 0;

    const pendingAmount = pendingPrincipal + pendingInterest;

    const allPaid = loan?.dues.length
        ? loan.dues.every((d) => d.paid)
        : false;

    async function fetchLoan() {
        if (!id) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/fund/${id}`);
            const data = await res.json();

            const fetched: LoanShape | null = data?.loan
                ? {
                    _id: data.loan._id,
                    customer: data.loan.customer ?? null,
                    loanAmount: Number(data.loan.loanAmount) || 0,
                    status: data.loan.status,
                    dues: data.loan.dues.map(
                        (d: PendingLoanItem) => ({
                            weekNo: d.weekNo,
                            principal: Number(d.principal) || 0,
                            interest: Number(d.interest) || 0,
                            savings: Number(d.savings) || 0,
                            total: Number(d.total) || 0,
                            paid: Boolean(d.paid),
                        })
                    ),
                }
                : null;

            setLoan(fetched);
        } catch {
            toast.error("Failed to fetch loan");
        } finally {
            setLoading(false);
        }
    }

    async function handleRegularClose() {
        if (!id) return;

        setClosing(true);
        try {
            const res = await fetch(`/api/fund/close/${id}`, {
                method: "PUT",
            });

            const data = await res.json();

            if (!res.ok) toast.error(data.error || "Close failed");
            else {
                toast.success("Loan closed successfully");
                fetchLoan();
            }
        } finally {
            setClosing(false);
        }
    }

    async function handlePrecloseSubmit() {
        if (!id) return;

        const amount = Number(precloseAmount);

        if (!amount || amount <= 0) {
            return toast.error("Enter valid amount");
        }

        setClosing(true);
        try {
            const res = await fetch(`/api/fund/preclose/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amountPaid: amount }),
            });

            const json = await res.json();

            if (!res.ok) toast.error(json.error);
            else {
                toast.success(json.message);
                setShowPreclose(false);
                setPrecloseAmount("");
                fetchLoan();
            }
        } finally {
            setClosing(false);
        }
    }

    useEffect(() => {
        fetchLoan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) return <p className="text-center">Loading…</p>;
    if (!loan) return <p className="text-center text-red-500">Loan not found</p>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <PageHeader />

            <h1 className="text-2xl font-bold text-blue-700">
                Loan Details
            </h1>

            <div className="p-4 bg-gray-50 rounded-lg border space-y-1">
                <p><strong>Customer:</strong> {loan.customer?.name ?? "-"}</p>
                <p><strong>Phone:</strong> {loan.customer?.phone ?? "-"}</p>
                <p><strong>Loan Amount:</strong> ₹{loan.loanAmount.toLocaleString()}</p>
                <p><strong>Status:</strong> {loan.status}</p>
            </div>

            <table className="w-full text-sm border">
                <thead className="bg-blue-600 text-white">
                    <tr>
                        <th className="px-3 py-2 border">Week</th>
                        <th className="px-3 py-2 border">Principal</th>
                        <th className="px-3 py-2 border">Interest</th>
                        <th className="px-3 py-2 border">Savings</th>
                        <th className="px-3 py-2 border">Total</th>
                        <th className="px-3 py-2 border">Paid</th>
                    </tr>
                </thead>
                <tbody>
                    {loan.dues.map((due, i) => (
                        <tr key={i}>
                            <td className="border p-2 text-center">
                                {due.weekNo ?? i + 1}
                            </td>
                            <td className="border p-2 text-center">
                                ₹{due.principal.toLocaleString()}
                            </td>
                            <td className="border p-2 text-center">
                                ₹{due.interest.toLocaleString()}
                            </td>
                            <td className="border p-2 text-center">
                                ₹{(due.savings || 0).toLocaleString()}
                            </td>
                            <td className="border p-2 text-center font-semibold">
                                ₹{due.total.toLocaleString()}
                            </td>
                            <td className={`border p-2 text-center ${due.paid ? "text-green-600" : "text-red-600"
                                }`}>
                                {due.paid ? "Paid" : "Pending"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex gap-4">
                <Button
                    disabled={!allPaid || closing}
                    className="bg-green-700 text-white"
                    onClick={handleRegularClose}
                >
                    Close Loan
                </Button>

                {!allPaid && (
                    <Button
                        disabled={closing}
                        className="bg-orange-600 text-white"
                        onClick={() => setShowPreclose(true)}
                    >
                        Pre-Close Loan
                    </Button>
                )}
            </div>

            {showPreclose && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="relative p-6 w-full max-w-md space-y-4">
                        <button
                            className="absolute top-2 right-2"
                            onClick={() => setShowPreclose(false)}
                        >
                            <X />
                        </button>

                        <h3 className="font-bold text-lg text-center">
                            Enter Pre-Close Amount
                        </h3>

                        <div className="text-center space-y-1">
                            <p>
                                <strong>Principal Remaining:</strong> ₹{pendingPrincipal.toLocaleString()}
                            </p>

                            <p>
                                <strong>Interest Remaining:</strong> ₹{pendingInterest.toLocaleString()}
                            </p>

                            <p className="font-semibold text-lg">
                                Total Payable: ₹{pendingAmount.toLocaleString()}
                            </p>
                        </div>

                        <Input
                            //type="number"
                            value={precloseAmount}
                            onChange={(e) =>
                                setPrecloseAmount(e.target.value)
                            }
                            placeholder="Enter amount"
                        />

                        <Button
                            disabled={closing}
                            onClick={handlePrecloseSubmit}
                        >
                            Send for Approval
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}