"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";

/* ================= TYPES ================= */

interface DueItem {
    weekNo?: number;
    savingsPaid?: number;
    savings?: number;
    paid: boolean;
}

interface LoanShape {
    _id: string;
    loanAmount?: number;
    status?: string;
    customer?: {
        _id?: string;
        name?: string;
        phone?: string;
    };
    dues?: DueItem[];
}

interface SavingsDraftEntry {
    amount: number;
    note?: string;
    date: string;
}

interface SavingsDraftShape {
    _id: string;
    customerId: string;
    totalSavings: number;
    entries?: SavingsDraftEntry[];
    refunded?: boolean;
}

interface SavingsApproval {
    status?: "PENDING" | "APPROVED" | null;
}

/* ================= PAGE ================= */

export default function SavingsRefundPage() {

    const params = useParams();
    const customerId = params?.id as string;

    const [loan, setLoan] = useState<LoanShape | null>(null);
    const [draft, setDraft] = useState<SavingsDraftShape | null>(null);
    const [approval, setApproval] = useState<SavingsApproval | null>(null);

    const [loanSavings, setLoanSavings] = useState(0);
    const [draftSavings, setDraftSavings] = useState(0);
    const [totalRefundAmount, setTotalRefundAmount] = useState(0);

    const [loading, setLoading] = useState(true);
    const [addingSavings, setAddingSavings] = useState(false);
    const [requesting, setRequesting] = useState(false);

    const [savingsAmount, setSavingsAmount] = useState("");
    const [savingsNote, setSavingsNote] = useState("");

    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

    /* ================= FETCH DATA ================= */

    async function fetchData() {

        try {

            const res = await fetch(`/api/fund/customer?customerId=${customerId}`);

            if (!res.ok) throw new Error();

            const data = await res.json();

            setLoan(data.loan || null);
            setDraft(data.draft || null);

            setLoanSavings(data.loanSavings || 0);
            setDraftSavings(data.draftSavings || 0);
            setTotalRefundAmount(data.totalSavings || 0);

            setApproval({ status: data.approvalStatus || null });

        } catch {
            toast.error("Failed to load savings data");
        }

    }

    /* ================= ADD SAVINGS ================= */

    async function handleAddSavings() {

        const amount = Number(savingsAmount);

        if (!amount || amount <= 0)
            return toast.error("Enter valid savings amount");

        if (draft?.refunded || approval?.status === "APPROVED")
            return toast.error("Savings already finalized");

        setAddingSavings(true);

        try {

            const res = await fetch("/api/savingsdraft/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId,
                    amount,
                    note: savingsNote,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Failed to add savings");
                return;
            }

            setSavingsAmount("");
            setSavingsNote("");

            await fetchData();

            toast.success("Savings added successfully!");

        } catch {

            toast.error("Failed to add savings");

        } finally {

            setAddingSavings(false);

        }
    }

    /* ================= DELETE ENTRY ================= */

    async function handleDeleteEntry(entryIndex: number) {

        if (!draft) return;

        if (draft.refunded || approval?.status === "APPROVED")
            return toast.error("Savings already finalized");

        if (!confirm("Delete this savings entry?")) return;

        setDeletingIndex(entryIndex);

        try {

            const res = await fetch("/api/savingsdraft/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId,
                    entryIndex,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Delete failed");
                return;
            }

            await fetchData();

            toast.success("Entry deleted successfully!");

        } catch {

            toast.error("Delete failed");

        } finally {

            setDeletingIndex(null);

        }
    }

    /* ================= REQUEST SAVINGS RETURN ================= */

    async function handleRequestSavings() {

        if (!loan)
            return toast.error("Loan not found");

        if (loan.status !== "REPAID")
            return toast.error("Savings return allowed only after loan repaid");

        if (totalRefundAmount <= 0)
            return toast.error("No savings available");

        if (approval?.status === "PENDING")
            return toast.error("Request already pending");

        if (approval?.status === "APPROVED")
            return toast.error("Savings already paid");

        setRequesting(true);

        try {

            const res = await fetch("/api/savings/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId,
                    savings: totalRefundAmount,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                toast.error(data.error || "Request failed");
                return;
            }

            toast.success("Savings return request sent");

            await fetchData();

        } catch {

            toast.error("Request failed");

        } finally {

            setRequesting(false);

        }
    }

    /* ================= LOAD ================= */

    useEffect(() => {

        async function load() {
            setLoading(true);
            await fetchData();
            setLoading(false);
        }

        if (customerId) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    if (loading)
        return <p className="text-center">Loading...</p>;

    if (!loan)
        return <p className="text-center text-red-600">Loan not found</p>;

    /* ================= UI ================= */

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-6">

            <PageHeader />

            <h1 className="text-2xl font-bold text-green-700">
                Savings Refund (Customer Based)
            </h1>

            {/* Customer Info */}

            <Card className="p-4 space-y-2">

                <p><b>Customer:</b> {loan.customer?.name}</p>
                <p><b>Phone:</b> {loan.customer?.phone}</p>
                <p><b>Loan Status:</b> {loan.status}</p>

                <p>
                    <b>Savings Status:</b>{" "}
                    {approval?.status === "APPROVED" ? (
                        <span className="text-green-600 font-semibold">
                            Paid
                        </span>
                    ) : approval?.status === "PENDING" ? (
                        <span className="text-yellow-600 font-semibold">
                            Requested
                        </span>
                    ) : (
                        <span className="text-blue-600 font-semibold">
                            Available
                        </span>
                    )}
                </p>

            </Card>

            {/* Breakdown */}

            <Card className="p-6 space-y-3">

                <div className="flex justify-between">
                    <span>Loan Savings</span>
                    <span>₹{loanSavings.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                    <span>Draft Savings</span>
                    <span>₹{draftSavings.toLocaleString()}</span>
                </div>

                <hr />

                <div className="flex justify-between font-bold text-lg">
                    <span>Total Refund</span>
                    <span>₹{totalRefundAmount.toLocaleString()}</span>
                </div>

            </Card>

            {/* Add Savings */}

            <Card className="p-6 space-y-4">

                <Input
                    placeholder="Savings Amount"
                    value={savingsAmount}
                    onChange={(e) => setSavingsAmount(e.target.value)}
                    disabled={approval?.status === "APPROVED"}
                />

                <Input
                    placeholder="Note (optional)"
                    value={savingsNote}
                    onChange={(e) => setSavingsNote(e.target.value)}
                    disabled={approval?.status === "APPROVED"}
                />

                <Button
                    onClick={handleAddSavings}
                    disabled={addingSavings || approval?.status === "APPROVED"}
                >
                    {addingSavings ? "Adding..." : "Add Savings"}
                </Button>

            </Card>

            {/* Draft History */}

            <Card className="p-6 space-y-4">

                {draft?.entries?.length ? (

                    draft.entries.map((entry, index) => (

                        <div
                            key={index}
                            className="flex justify-between border-b pb-2"
                        >

                            <div>
                                <p>
                                    ₹{entry.amount} - {new Date(entry.date).toLocaleDateString()}
                                </p>
                                {entry.note && (
                                    <p className="text-xs text-gray-500">
                                        {entry.note}
                                    </p>
                                )}
                            </div>

                            <Button
                                size="sm"
                                variant="destructive"
                                disabled={
                                    approval?.status === "APPROVED" ||
                                    deletingIndex === index
                                }
                                onClick={() => handleDeleteEntry(index)}
                            >
                                Delete
                            </Button>

                        </div>

                    ))

                ) : (

                    <p>No draft entries</p>

                )}

            </Card>

            {/* Request Savings */}

            <Card className="p-6">

                <Button
                    className="bg-green-600 hover:bg-green-700"
                    disabled={
                        requesting ||
                        totalRefundAmount <= 0 ||
                        loan.status !== "REPAID" ||
                        approval?.status === "PENDING" ||
                        approval?.status === "APPROVED"
                    }
                    onClick={handleRequestSavings}
                >

                    {approval?.status === "APPROVED"
                        ? "Savings Paid"
                        : approval?.status === "PENDING"
                            ? "Request Pending Approval"
                            : requesting
                                ? "Sending Request..."
                                : `Request Savings Return ₹${totalRefundAmount.toLocaleString()}`}

                </Button>

            </Card>

        </div>
    );
}