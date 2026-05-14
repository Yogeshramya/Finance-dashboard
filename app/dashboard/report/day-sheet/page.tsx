"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import LoadingOverlay from "@/components/Loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { CashDenomination, DaySheetReport } from "@/types/daysheet";

type DenomKey =
    | "500"
    | "200"
    | "100"
    | "50"
    | "20"
    | "10"
    | "5"
    | "2"
    | "1";

export default function DaySheetPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<DaySheetReport | null>(null);

    // DATE STATE DEFAULT TODAY
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
    });

    const [cashDenom, setCashDenom] = useState<CashDenomination>({
        "500": 0,
        "200": 0,
        "100": 0,
        "50": 0,
        "20": 0,
        "10": 0,
        "5": 0,
        "2": 0,
        "1": 0,
    });

    const denomKeys: DenomKey[] = ["500", "200", "100", "50", "20", "10", "5", "2", "1"];

    const cashBoxStatus = report?.cashBoxStatus || null;
    const isApproved = cashBoxStatus === "APPROVED";
    const isPending = cashBoxStatus === "PENDING";
    const isRejected = cashBoxStatus === "REJECTED";

    const denomTotal = denomKeys.reduce(
        (sum, k) => sum + cashDenom[k] * Number(k),
        0
    );

    const updateDenom = (key: DenomKey, value: string) => {
        setCashDenom(prev => ({
            ...prev,
            [key]: Math.max(0, Number(value)),
        }));
    };

    const format = (v: number) => Number(v || 0).toFixed(2);

    /* ---------------- DATE CONTROLS ---------------- */

    const changeDate = (days: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().slice(0, 10));
    };

    const resetToday = () => {
        const today = new Date();
        setSelectedDate(today.toISOString().slice(0, 10));
    };

    /* ---------------- LOAD DAY SHEET ---------------- */

    useEffect(() => {
        async function loadSheet() {
            setLoading(true);

            try {
                const sheetRes = await fetch(
                    `/api/report/day-sheet?from=${selectedDate}&to=${selectedDate}`
                );

                const sheetJson = await sheetRes.json();

                if (!sheetJson.success) {
                    toast.error(sheetJson.error || "No day sheet found");
                    setReport(null);
                    return;
                }

                setReport(sheetJson.report);

                // If API gives denomination already (approved cashbox)
                if (sheetJson.report?.denomination?.length > 0) {
                    const denom: CashDenomination = {
                        "500": 0,
                        "200": 0,
                        "100": 0,
                        "50": 0,
                        "20": 0,
                        "10": 0,
                        "5": 0,
                        "2": 0,
                        "1": 0,
                    };

                    sheetJson.report.denomination.forEach(
                        (d: { note: number; count: number }) => {
                            const key = String(d.note) as DenomKey;
                            if (key in denom) denom[key] = d.count;
                        }
                    );

                    setCashDenom(denom);
                } else {
                    // reset
                    setCashDenom({
                        "500": 0,
                        "200": 0,
                        "100": 0,
                        "50": 0,
                        "20": 0,
                        "10": 0,
                        "5": 0,
                        "2": 0,
                        "1": 0,
                    });
                }
            } catch {
                toast.error("Failed to load day sheet");
            } finally {
                setLoading(false);
            }
        }

        loadSheet();
    }, [selectedDate]);

    /* ---------------- ACTIONS ---------------- */

    const handleSaveTemp = async () => {
        if (!report || isApproved || isPending) return;

        const payload = {
            date: selectedDate,
            denomination: denomKeys.map(k => ({
                note: Number(k),
                count: cashDenom[k],
                total: cashDenom[k] * Number(k),
            })),
        };

        const res = await fetch("/api/report/day-sheet/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const json = await res.json();

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        json.success
            ? toast.success("Draft saved")
            : toast.error(json.error || "Save failed");
    };

    const handleCloseDay = async () => {
        if (!report) return;

        if (denomTotal !== report.closingBalance)
            return toast.error("Denomination mismatch!");

        if (!confirm("Once sent for approval, this cannot be edited. Continue?"))
            return;

        const payload = {
            date: selectedDate,
            openingBalance: report.openingBalance,
            closingBalance: report.closingBalance,
            denomination: denomKeys.map(k => ({
                note: Number(k),
                count: cashDenom[k],
                total: cashDenom[k] * Number(k),
            })),
        };

        const res = await fetch("/api/report/day-sheet/close", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const json = await res.json();

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        json.success
            ? toast.success("Day closed successfully")
            : toast.error(json.error || "Close failed");
    };

    const totalIncome =
        report?.income.reduce((sum, i) => sum + (i.total || 0), 0) || 0;

    const totalExpense =
        report?.expenses.reduce((sum, e) => sum + (e.total || 0), 0) || 0;

    /* ---------------- RENDER ---------------- */

    return (
        <form className="p-6 w-full max-w-full mx-auto space-y-6 print-area">
            <LoadingOverlay show={loading} />
            <PageHeader />

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold text-gray-700">
                    DAY SHEET
                </h1>

                {/*<Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="no-print"
                    type="button"
                >
                    Print
                </Button>*/}
            </div>

            {/* DATE NAVIGATION */}
            <div className="flex justify-center items-center gap-3 no-print">
                <Button variant="outline" onClick={() => changeDate(-1)} type="button">
                    ⬅
                </Button>

                <p className="font-semibold text-gray-700">
                    {selectedDate}
                </p>

                <Button variant="outline" onClick={() => changeDate(1)} type="button">
                    ➡
                </Button>

                <Button variant="secondary" onClick={resetToday} type="button">
                    Today
                </Button>
            </div>

            {session?.user?.branch && (
                <p className="text-center text-sm text-gray-600">
                    Branch: {session.user.branch.name}
                </p>
            )}

            {cashBoxStatus && (
                <p className="text-center font-semibold">
                    Status:{" "}
                    <span
                        className={
                            isApproved
                                ? "text-green-600"
                                : isPending
                                    ? "text-yellow-600"
                                    : "text-red-600"
                        }
                    >
                        {cashBoxStatus}
                    </span>
                </p>
            )}

            {!report ? (
                <p className="text-center text-gray-400 py-10">
                    No day sheet available
                </p>
            ) : (
                <>
                    {/* SMALL BALANCE CARDS */}
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        <SmallBalanceCard
                            title="Opening Balance"
                            amount={report.openingBalance}
                        />
                        <SmallBalanceCard
                            title="Closing Balance"
                            amount={report.closingBalance}
                        />
                    </div>

                    {/* DAY SUMMARY */}
                    <Card>
                        <CardContent>
                            <h3 className="font-semibold text-center mb-3">
                                Day Summary
                            </h3>

                            <table className="w-full text-sm border">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2 text-left">Credits</th>
                                        <th className="border p-2 text-right">Amount</th>
                                        <th className="border p-2 text-left">Debits</th>
                                        <th className="border p-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({
                                        length: Math.max(
                                            report.income.length,
                                            report.expenses.length
                                        ),
                                    }).map((_, i) => (
                                        <tr key={i}>
                                            <td className="border p-2">
                                                {report.income[i]?._id || ""}
                                            </td>
                                            <td className="border p-2 text-right">
                                                {report.income[i]
                                                    ? `₹${format(report.income[i].total)}`
                                                    : ""}
                                            </td>
                                            <td className="border p-2">
                                                {report.expenses[i]?._id || ""}
                                            </td>
                                            <td className="border p-2 text-right">
                                                {report.expenses[i]
                                                    ? `₹${format(report.expenses[i].total)}`
                                                    : ""}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-between mt-3 border-t pt-2 text-sm font-semibold">
                                <p className="text-green-700">
                                    Total Income: ₹{format(totalIncome)}
                                </p>
                                <p className="text-red-700">
                                    Total Expense: ₹{format(totalExpense)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CASH DENOMINATION */}
                    <Card>
                        <CardContent>
                            <h3 className="font-semibold text-center mb-2">
                                Cash Denomination
                            </h3>

                            <table className="w-full text-sm border">
                                <tbody>
                                    {denomKeys.map(k => (
                                        <tr key={k} className="text-center">
                                            <td className="border p-1">
                                                ₹{k}
                                            </td>
                                            <td className="border p-1">
                                                <Input
                                                    disabled={isPending || isApproved}
                                                    value={cashDenom[k]}
                                                    onChange={e =>
                                                        updateDenom(k, e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td className="border p-1 font-medium">
                                                ₹{format(cashDenom[k] * Number(k))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <p className="text-right font-bold mt-2">
                                TOTAL CASH: ₹{format(denomTotal)}
                            </p>
                        </CardContent>
                    </Card>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-4 no-print">
                        <Button
                            variant="outline"
                            onClick={handleSaveTemp}
                            disabled={isApproved || isPending}
                            type="button"
                        >
                            Save
                        </Button>

                        {!isApproved && !isPending && (
                            <Button
                                onClick={handleCloseDay}
                                disabled={denomTotal !== report.closingBalance}
                                className="bg-green-600 text-white"
                                type="button"
                            >
                                {isRejected ? "Save & Re-Submit" : "Save & Close"}
                            </Button>
                        )}
                    </div>
                </>
            )}

            {/* PRINT STYLES */}
            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    input {
                        border: none !important;
                        background: transparent !important;
                        padding: 0 !important;
                        text-align: right;
                    }
                    .print-area {
                        padding: 0;
                        margin: 0;
                    }
                }
            `}</style>
        </form>
    );
}

/* ---------------- SMALL BALANCE CARD ---------------- */

function SmallBalanceCard({
    title,
    amount,
}: {
    title: string;
    amount: number;
}) {
    return (
        <Card className="border border-blue-400">
            <CardContent className="text-center p-3">
                <p className="text-xs font-medium text-blue-600">
                    {title}
                </p>
                <p className="text-lg font-bold">
                    ₹{Number(amount).toFixed(2)}
                </p>
            </CardContent>
        </Card>
    );
}
